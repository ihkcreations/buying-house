"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Save, Package } from "lucide-react";
import { savePackingList } from "@/app/actions/packing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function PackingGenerator({ order, pl }: { order: any, pl: any }) {
  const [isLoading, setIsLoading] = useState(false);

  // Auto-Calc CBM Helper
  // (L x W x H in cm) / 1,000,000 * Total Cartons
  const [dims, setDims] = useState({ l:60, w:40, h:30 });
  const [cartons, setCartons] = useState(pl?.totalCartons || 0);
  
  const cbm = ((dims.l * dims.w * dims.h) / 1000000) * cartons;

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    formData.append("cbm", cbm.toFixed(3)); // Save calculated CBM
    const result = await savePackingList(order.id, formData);
    if(result?.success) toast.success(result.success);
    else toast.error(result?.error);
    setIsLoading(false);
  };

  return (
    <form action={handleSubmit} className="space-y-6 max-w-4xl">
        <Card>
            <CardHeader className="flex flex-row items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <CardTitle>Packing List Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Header */}
                <div className="space-y-2"><Label>Invoice No</Label><Input name="invoiceNo" defaultValue={pl?.invoiceNo || `INV-${order.orderNo}`} /></div>
                <div className="space-y-2"><Label>Date</Label><Input name="date" type="date" defaultValue={pl?.date ? new Date(pl.date).toISOString().split('T')[0] : ""} /></div>

                {/* Carton Specs */}
                <div className="space-y-2">
                    <Label>Total Cartons</Label>
                    <Input name="totalCartons" type="number" value={cartons} onChange={(e) => setCartons(parseInt(e.target.value)||0)} />
                </div>
                <div className="space-y-2">
                    <Label>Carton Size (L x W x H)</Label>
                    <div className="flex gap-2 items-center">
                        <Input type="number" placeholder="L" value={dims.l} onChange={(e) => setDims({...dims, l:parseFloat(e.target.value)})} className="w-20" />
                        <span>x</span>
                        <Input type="number" placeholder="W" value={dims.w} onChange={(e) => setDims({...dims, w:parseFloat(e.target.value)})} className="w-20" />
                        <span>x</span>
                        <Input type="number" placeholder="H" value={dims.h} onChange={(e) => setDims({...dims, h:parseFloat(e.target.value)})} className="w-20" />
                        <span className="text-xs text-slate-500">cm</span>
                    </div>
                    {/* Hidden field to save string format */}
                    <input type="hidden" name="cartonSize" value={`${dims.l}x${dims.w}x${dims.h} cm`} />
                </div>

                {/* Weights */}
                <div className="space-y-2"><Label>Net Weight (KGS)</Label><Input name="netWeight" type="number" step="0.01" defaultValue={pl?.netWeight} /></div>
                <div className="space-y-2"><Label>Gross Weight (KGS)</Label><Input name="grossWeight" type="number" step="0.01" defaultValue={pl?.grossWeight} /></div>

                {/* CBM Display */}
                <div className="p-4 bg-slate-50 rounded border flex justify-between items-center col-span-2">
                    <span className="text-sm font-bold text-slate-500">TOTAL VOLUME</span>
                    <span className="text-xl font-bold text-slate-900">{cbm.toFixed(3)} CBM</span>
                </div>

                {/* Desc */}
                <div className="col-span-2 space-y-2">
                    <Label>Description of Goods</Label>
                    <Textarea name="description" defaultValue={pl?.description || `Men's 100% Cotton T-Shirt\nStyle: ${order.styleNo}`} />
                </div>

            </CardContent>
        </Card>

        <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} className="bg-slate-900 w-40">
                <Save className="w-4 h-4 mr-2" /> Save PL
            </Button>
        </div>
    </form>
  );
}