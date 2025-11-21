"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Factory } from "lucide-react";
import { createFabricBooking, deleteFabricBooking } from "@/app/actions/booking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function FabricBooking({ 
    orderId, 
    orderQty, 
    bookings, 
    factories 
}: { 
    orderId: string, 
    orderQty: number, 
    bookings: any[], 
    factories: any[] 
}) {
  const [isLoading, setIsLoading] = useState(false);
  
  // --- FORM STATE ---
  const [cons, setCons] = useState(0);
  const [wastage, setWastage] = useState(5); 
  const [reqQty, setReqQty] = useState(0);

  useEffect(() => {
    if (cons > 0) {
        // (Order Qty / 12) * Consumption * (1 + Wastage%)
        const dozens = orderQty / 12;
        const base = dozens * cons;
        const total = base * (1 + wastage / 100);
        setReqQty(parseFloat(total.toFixed(2)));
    } else {
        setReqQty(0);
    }
  }, [cons, wastage, orderQty]);

  const handleAdd = async (formData: FormData) => {
    setIsLoading(true);
    // Append the calculated quantity explicitly
    formData.append("requiredQty", reqQty.toString());
    
    const result = await createFabricBooking(orderId, formData);
    
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
      // Reset calculator visual state
      setCons(0);
      setReqQty(0);
      // Note: We can't easily reset the uncontrolled inputs without a ref or reset(), 
      // but React Server Components will re-render the list below instantly.
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
      if(confirm("Delete this booking?")) {
          await deleteFabricBooking(id, orderId);
          toast.success("Deleted");
      }
  }

  const totalBookedKg = bookings.reduce((sum, item) => sum + item.requiredQty, 0);

  return (
    <div className="space-y-8">
      
      {/* 1. SUMMARY CARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-indigo-900 text-white border-none">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-400">Total Fabric Required</CardTitle></CardHeader>
              <CardContent>
                  <div className="text-3xl font-bold">{totalBookedKg.toLocaleString()} <span className="text-sm font-normal text-slate-400">kg</span></div>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Order Quantity</CardTitle></CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{orderQty.toLocaleString()} <span className="text-sm font-normal text-slate-500">pcs</span></div>
              </CardContent>
          </Card>
      </div>

      {/* 2. ADD NEW FABRIC FORM */}
      <Card className="border-blue-100 bg-blue-50/30">
          <CardHeader>
              <CardTitle className="text-blue-800">Add Fabric Booking</CardTitle>
              <CardDescription>Calculate and book fabric for this order.</CardDescription>
          </CardHeader>
          <CardContent>
              <form action={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                  <div className="lg:col-span-2 space-y-2">
                      <Label>Fabric Name / Composition</Label>
                      <Input name="fabricName" placeholder="e.g. 100% Cotton Single Jersey" required />
                  </div>
                  <div className="space-y-2">
                      <Label>Yarn Count</Label>
                      <Input name="yarnCount" placeholder="e.g. 26/1" />
                  </div>
                  <div className="space-y-2">
                      <Label>Cons. (kg/dzn)</Label>
                      <Input 
                        name="consumption" // <--- FIXED: Added Name
                        type="number" step="any" placeholder="0.00" 
                        onChange={(e) => setCons(parseFloat(e.target.value))}
                        required
                      />
                  </div>
                  <div className="space-y-2">
                      <Label>Wastage (%)</Label>
                      <Input 
                        name="wastage" // <--- FIXED: Added Name
                        type="number" step="any" defaultValue={5}
                        onChange={(e) => setWastage(parseFloat(e.target.value))} 
                      />
                  </div>
                  <div className="space-y-2">
                      <Label>Supplier</Label>
                      <Select name="supplier">
                        <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select Factory" />
                        </SelectTrigger>
                        <SelectContent>
                            {factories.map(f => (
                                <SelectItem key={f.id} value={f.name}>{f.name}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                  </div>
                  
                  {/* Calculated Result Field */}
                  <div className="lg:col-span-6 bg-white p-4 rounded-md border flex items-center justify-between mt-2">
                      <div className="flex flex-col">
                          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Auto-Calculated Requirement</span>
                          <span className="text-2xl font-bold text-slate-900">{reqQty.toFixed(2)} <span className="text-sm font-normal text-slate-500">kg</span></span>
                      </div>
                      <Button type="submit" disabled={isLoading || reqQty <= 0} className="bg-blue-600 hover:bg-blue-700">
                          <Plus className="w-4 h-4 mr-2" /> 
                          {isLoading ? "Booking..." : "Add Booking"}
                      </Button>
                  </div>
              </form>
          </CardContent>
      </Card>

      {/* 3. BOOKING LIST */}
      <Card>
          <CardHeader><CardTitle>Booking List</CardTitle></CardHeader>
          <CardContent className="p-0">
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Fabric Name</TableHead>
                          <TableHead>Yarn</TableHead>
                          <TableHead>Supplier</TableHead>
                          <TableHead className="text-right">Cons. (dzn)</TableHead>
                          <TableHead className="text-right">Total Kg</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {bookings.length === 0 ? (
                          <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-slate-500">No fabric booked yet.</TableCell>
                          </TableRow>
                      ) : (
                          bookings.map((item) => (
                              <TableRow key={item.id}>
                                  <TableCell className="font-medium">{item.fabricName}</TableCell>
                                  <TableCell>{item.yarnCount}</TableCell>
                                  <TableCell>
                                      <div className="flex items-center gap-2">
                                          <Factory className="w-3 h-3 text-slate-400" />
                                          {item.supplier || "N/A"}
                                      </div>
                                  </TableCell>
                                  <TableCell className="text-right">{item.consumption} kg</TableCell>
                                  <TableCell className="text-right font-bold">{item.requiredQty.toFixed(2)} kg</TableCell>
                                  <TableCell>
                                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600" onClick={() => handleDelete(item.id)}>
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