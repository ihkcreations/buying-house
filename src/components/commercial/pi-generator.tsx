"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Save, Printer, Building2 } from "lucide-react";
import { format } from "date-fns";
import { savePI } from "@/app/actions/commercial";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

export function PIGenerator({ order, existingPI }: { order: any, existingPI?: any }) {
  const [isLoading, setIsLoading] = useState(false);

  // --- DEFAULTS ---
  // If PI exists, use its data. If not, auto-fill from Order.
  const defaultItems = existingPI?.items?.[0] || {
      description: `${order.styleNo} - ${order.season}`,
      hsCode: "", // Commercial needs to fill this
      qty: order.orderQty,
      rate: order.unitPrice,
      amount: order.totalValue
  };

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    const result = await savePI(order.id, formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
    }
    setIsLoading(false);
  };

  return (
    <form action={handleSubmit} className="space-y-8 pb-20">
      
      {/* 1. HEADER INFO */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Proforma Invoice Details</CardTitle>
            <div className="flex gap-2">
                <Input 
                    name="piNumber" 
                    defaultValue={existingPI?.piNumber || `PI-${order.orderNo}`} 
                    className="w-40 font-mono font-bold text-blue-700"
                    placeholder="PI Number"
                />
                <Input 
                    name="date" 
                    type="date" 
                    defaultValue={existingPI?.date ? format(new Date(existingPI.date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")}
                    className="w-40"
                />
            </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Box 1: Supplier (Static) */}
            <div className="p-4 border rounded bg-slate-50">
                <Label className="text-xs text-slate-500 uppercase">Beneficiary / Supplier</Label>
                <div className="font-bold mt-1">P.I. OCEAN TEX</div>
                <div className="text-sm text-slate-600">
                    Suite# 801, Level-8, 218 Sahara Tropical Centre,<br/>
                    Elephant Road, Dhaka - 1205.<br/>
                    +8801671-000001
                </div>
            </div>

            {/* Box 2: Buyer (From DB) */}
            <div className="p-4 border rounded bg-slate-50">
                <Label className="text-xs text-slate-500 uppercase">Applicant / Buyer</Label>
                <div className="font-bold mt-1">{order.buyer.name}</div>
                <div className="text-sm text-slate-600">
                    {order.buyer.country}<br/>
                    (Address to be updated in Master Data)
                </div>
            </div>

            {/* Box 3: Bank (Editable) */}
            <div className="p-4 border rounded bg-yellow-50/50 border-yellow-100">
                <Label className="text-xs text-yellow-700 uppercase flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> Advising Bank
                </Label>
                <Textarea 
                    name="bankDetails"
                    defaultValue={existingPI?.bankDetails || "TRUST BANK PLC\nDilkusha Corp Branch\nSWIFT: TBLBDDH"}
                    className="mt-1 h-20 text-sm bg-white"
                    placeholder="Enter Bank Name, Address, Swift Code..."
                />
            </div>
        </CardContent>
      </Card>

      {/* 2. ITEMS TABLE (With HS Code) */}
      <Card>
          <CardHeader><CardTitle>Items & Description</CardTitle></CardHeader>
          <CardContent className="p-0">
              <Table>
                  <TableHeader>
                      <TableRow className="bg-slate-50">
                          <TableHead className="w-[10%]">Serial</TableHead>
                          <TableHead className="w-[40%]">Description of Goods</TableHead>
                          <TableHead className="w-[15%]">HS Code</TableHead>
                          <TableHead className="w-[10%] text-right">Qty (Pcs)</TableHead>
                          <TableHead className="w-[10%] text-right">Unit Price</TableHead>
                          <TableHead className="w-[15%] text-right">Amount</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      <TableRow>
                          <TableCell>01</TableCell>
                          <TableCell>
                              <Input name="item_desc" defaultValue={defaultItems.description} />
                          </TableCell>
                          <TableCell>
                              <Input name="item_hs" defaultValue={defaultItems.hsCode} placeholder="6109.10" />
                          </TableCell>
                          <TableCell>
                              <Input name="item_qty" defaultValue={defaultItems.qty} className="text-right" readOnly />
                          </TableCell>
                          <TableCell>
                              <Input name="item_rate" defaultValue={defaultItems.rate} className="text-right" readOnly />
                          </TableCell>
                          <TableCell className="text-right font-bold">
                              <Input name="item_amount" defaultValue={defaultItems.amount} className="text-right font-bold border-none shadow-none bg-transparent" readOnly />
                          </TableCell>
                      </TableRow>
                  </TableBody>
              </Table>
          </CardContent>
      </Card>

      {/* 3. TERMS & CONDITIONS (The 12 Points) */}
      <Card>
          <CardHeader><CardTitle>Terms & Conditions</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="space-y-2">
                  <Label>1. Payment Method</Label>
                  <Input name="term_payment" defaultValue="Irrevocable L/C at sight" />
              </div>
              <div className="space-y-2">
                  <Label>2. Shipment Date</Label>
                  <Input name="term_shipment" defaultValue="45 Days from L/C receipt" />
              </div>
              <div className="space-y-2">
                  <Label>3. Port of Loading</Label>
                  <Input name="term_port" defaultValue="Chittagong, Bangladesh" />
              </div>
              <div className="space-y-2">
                  <Label>4. Tolerance</Label>
                  <Input name="term_tolerance" defaultValue="+/- 5% in Quantity and Amount" />
              </div>
              <div className="space-y-2">
                  <Label>5. Partial Shipment</Label>
                  <Input defaultValue="Allowed" />
              </div>
              <div className="space-y-2">
                  <Label>6. Transhipment</Label>
                  <Input defaultValue="Allowed" />
              </div>
              {/* Add more terms as needed... */}
          </CardContent>
      </Card>

      {/* 4. ACTION BAR */}
      <div className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm fixed bottom-6 left-64 right-6 z-10">
          <div className="text-sm text-slate-500">
              Total Value: <span className="font-bold text-slate-900">${order.totalValue.toLocaleString()}</span>
          </div>
          <div className="flex gap-3">
              <Button type="button" variant="outline">
                  <Printer className="w-4 h-4 mr-2" /> Print PDF
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" /> 
                  {isLoading ? "Saving..." : "Save Proforma Invoice"}
              </Button>
          </div>
      </div>

    </form>
  );
}