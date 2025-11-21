
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Scissors, Shirt, Package } from "lucide-react";
import { format } from "date-fns";
import { saveProductionLog, deleteProductionLog } from "@/app/actions/production";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

export function ProductionLog({ 
    orderId, 
    orderQty, 
    logs 
}: { 
    orderId: string, 
    orderQty: number, 
    logs: any[] 
}) {
  const [isLoading, setIsLoading] = useState(false);

  // --- 1. CALCULATE TOTALS ---
  const totalCut = logs.reduce((acc, log) => acc + log.cutQty, 0);
  const totalSew = logs.reduce((acc, log) => acc + log.sewQty, 0);
  const totalPack = logs.reduce((acc, log) => acc + log.packQty, 0);

  const cutPercent = Math.min((totalCut / orderQty) * 100, 100);
  const sewPercent = Math.min((totalSew / orderQty) * 100, 100);
  const packPercent = Math.min((totalPack / orderQty) * 100, 100);

  // --- HANDLERS ---
  const handleAdd = async (formData: FormData) => {
    setIsLoading(true);
    const result = await saveProductionLog(orderId, formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
      // Reset form manually if needed, relying on server revalidation for now
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
      if(confirm("Delete this entry?")) {
          await deleteProductionLog(id, orderId);
          toast.success("Deleted");
      }
  }

  return (
    <div className="space-y-8">
      
      {/* 1. PROGRESS DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cutting Card */}
          <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Cutting Progress</CardTitle>
                  <Scissors className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{totalCut.toLocaleString()} / {orderQty.toLocaleString()}</div>
                  <Progress value={cutPercent} className="h-2 mt-2 bg-orange-100" indicatorClassName="bg-orange-500" />
                  <p className="text-xs text-slate-500 mt-2">{cutPercent.toFixed(1)}% Completed</p>
              </CardContent>
          </Card>

          {/* Sewing Card */}
          <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Sewing Output</CardTitle>
                  <Shirt className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{totalSew.toLocaleString()} / {orderQty.toLocaleString()}</div>
                  <Progress value={sewPercent} className="h-2 mt-2 bg-blue-100" indicatorClassName="bg-blue-500" />
                  <p className="text-xs text-slate-500 mt-2">{sewPercent.toFixed(1)}% Completed</p>
              </CardContent>
          </Card>

          {/* Packing Card */}
          <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Packing & Finishing</CardTitle>
                  <Package className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{totalPack.toLocaleString()} / {orderQty.toLocaleString()}</div>
                  <Progress value={packPercent} className="h-2 mt-2 bg-green-100" indicatorClassName="bg-green-500" />
                  <p className="text-xs text-slate-500 mt-2">{packPercent.toFixed(1)}% Completed</p>
              </CardContent>
          </Card>
      </div>

      {/* 2. DAILY INPUT FORM */}
      <Card className="border-slate-200 bg-slate-50">
          <CardHeader>
              <CardTitle>Add Daily Output</CardTitle>
          </CardHeader>
          <CardContent>
              <form action={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="space-y-2 flex-1">
                      <Label>Date</Label>
                      <Input type="date" name="date" required className="bg-white" />
                  </div>
                  <div className="space-y-2 flex-1">
                      <Label>Cut Qty</Label>
                      <Input type="number" name="cutQty" placeholder="0" className="bg-white" />
                  </div>
                  <div className="space-y-2 flex-1">
                      <Label>Sew Qty</Label>
                      <Input type="number" name="sewQty" placeholder="0" className="bg-white" />
                  </div>
                  <div className="space-y-2 flex-1">
                      <Label>Pack Qty</Label>
                      <Input type="number" name="packQty" placeholder="0" className="bg-white" />
                  </div>
                  <Button type="submit" disabled={isLoading} className="bg-slate-900 hover:bg-slate-800">
                      <Plus className="w-4 h-4 mr-2" /> Add Log
                  </Button>
              </form>
          </CardContent>
      </Card>

      {/* 3. HISTORY TABLE */}
      <Card>
          <CardHeader><CardTitle>Production History</CardTitle></CardHeader>
          <CardContent className="p-0">
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Cutting</TableHead>
                          <TableHead className="text-right">Sewing</TableHead>
                          <TableHead className="text-right">Packing</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {logs.length === 0 ? (
                          <TableRow>
                              <TableCell colSpan={5} className="text-center py-8 text-slate-500">No production logs yet.</TableCell>
                          </TableRow>
                      ) : (
                          // Sort by date descending (newest first)
                          [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((log) => (
                              <TableRow key={log.id}>
                                  <TableCell className="font-medium">
                                      {format(new Date(log.date), "dd MMM yyyy")}
                                  </TableCell>
                                  <TableCell className="text-right text-orange-600 font-medium">+{log.cutQty}</TableCell>
                                  <TableCell className="text-right text-blue-600 font-medium">+{log.sewQty}</TableCell>
                                  <TableCell className="text-right text-green-600 font-medium">+{log.packQty}</TableCell>
                                  <TableCell>
                                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600" onClick={() => handleDelete(log.id)}>
                                          <Trash2 className="w-4 h-4" />
                                      </Button>
                                  </TableCell>
                              </TableRow>
                          ))
                      )}
                  </TableBody>
              </Table>
          </CardContent>
      </Card>
    </div>
  );
}