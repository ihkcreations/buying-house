"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Save, PenTool } from "lucide-react";
import { format } from "date-fns";
import { saveSC } from "@/app/actions/commercial";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function SCGenerator({ order, pi, sc }: { order: any, pi?: any, sc?: any }) {
  const [isLoading, setIsLoading] = useState(false);

  // Use PI data to populate the table (SC mirrors PI)
  const items = pi?.items?.[0] || {
      description: `${order.styleNo} - ${order.season}`,
      qty: order.orderQty,
      rate: order.unitPrice,
      amount: order.totalValue
  };

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    const result = await saveSC(order.id, formData);
    if (result?.error) toast.error(result.error);
    else toast.success(result.success);
    setIsLoading(false);
  };

  if (!pi) {
    return <div className="p-6 text-center text-slate-500 border-2 border-dashed rounded-lg">Please generate the Proforma Invoice (PI) first.</div>;
  }

  return (
    <form action={handleSubmit} className="space-y-8 pb-20">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between bg-slate-50/50 border-b">
            <CardTitle>Sales Contract</CardTitle>
            <div className="flex gap-2">
                <div className="flex flex-col">
                    <Label className="text-xs text-slate-500 mb-1">Contract No</Label>
                    <Input name="scNumber" defaultValue={sc?.scNumber || `SC-${order.orderNo}`} className="w-40 font-mono font-bold" />
                </div>
                <div className="flex flex-col">
                    <Label className="text-xs text-slate-500 mb-1">Date</Label>
                    <Input name="scDate" type="date" defaultValue={sc?.scDate ? format(new Date(sc.scDate), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")} className="w-40" />
                </div>
            </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
            {/* Parties */}
            <div className="grid grid-cols-2 gap-6">
                <div className="p-4 border rounded">
                    <Label className="uppercase text-xs text-slate-500">Seller (Exporter)</Label>
                    <div className="font-bold">P.I. OCEAN TEX</div>
                    <div className="text-sm text-slate-600">Dhaka, Bangladesh</div>
                </div>
                <div className="p-4 border rounded">
                    <Label className="uppercase text-xs text-slate-500">Buyer (Importer)</Label>
                    <div className="font-bold">{order.buyer.name}</div>
                    <div className="text-sm text-slate-600">{order.buyer.country}</div>
                </div>
            </div>

            {/* Read-Only Table (Mirrors PI) */}
            <div className="border rounded-md overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-100">
                        <TableRow>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="text-right">Rate</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>{items.description}</TableCell>
                            <TableCell className="text-right">{items.qty.toLocaleString()}</TableCell>
                            <TableCell className="text-right">${items.rate}</TableCell>
                            <TableCell className="text-right font-bold">${items.amount.toLocaleString()}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            {/* Signatures Area */}
            <div className="grid grid-cols-2 gap-12 mt-12 pt-8 border-t">
                <div className="text-center space-y-4">
                    <div className="h-24 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 bg-slate-50 hover:bg-white cursor-pointer transition-colors">
                        <PenTool className="w-6 h-6 mb-2" />
                        <span className="text-xs">Upload Buyer Signature</span>
                    </div>
                    <div className="border-t border-slate-900 pt-2 font-bold text-sm">BUYER SIGNATURE</div>
                </div>
                <div className="text-center space-y-4">
                    <div className="h-24 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 bg-slate-50 hover:bg-white cursor-pointer transition-colors">
                        <PenTool className="w-6 h-6 mb-2" />
                        <span className="text-xs">Upload Seller Signature</span>
                    </div>
                    <div className="border-t border-slate-900 pt-2 font-bold text-sm">SELLER SIGNATURE</div>
                </div>
            </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} className="bg-slate-900 hover:bg-slate-800">
            <Save className="w-4 h-4 mr-2" /> Save Contract
        </Button>
      </div>
    </form>
  );
}