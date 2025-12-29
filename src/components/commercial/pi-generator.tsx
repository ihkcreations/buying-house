"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Save, Printer, Building2, MapPin, Phone } from "lucide-react";
import { format } from "date-fns";
import { savePI } from "@/app/actions/commercial";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function PIGenerator({ 
  order, 
  existingPI, 
  settings 
}: { 
  order: any, 
  existingPI?: any, 
  settings?: any 
}) {
  const [isLoading, setIsLoading] = useState(false);

  // --- 1. CONSTRUCT DYNAMIC DEFAULTS ---
  // If settings exist, use them. Otherwise, fall back to hardcoded defaults.
  
  const defaultSupplierInfo = settings 
    ? `${settings.companyName}\n${settings.companyAddress}\n${settings.contactPhone || ""}\n${settings.contactEmail || ""}`
    : "P.I. OCEAN TEX\nDhaka, Bangladesh\n(Please configure settings)";

  const defaultBankDetails = settings
    ? `${settings.bankName}\n${settings.bankAddress || ""}\nSWIFT: ${settings.swiftCode}\nA/C Name: ${settings.accountName}\nA/C No: ${settings.accountNumber}`
    : "TRUST BANK PLC\nDilkusha Corp Branch\nSWIFT: TBLBDDH";

  const defaultPaymentTerm = settings?.defaultPaymentTerms || "Irrevocable L/C at sight";
  const defaultPort = settings?.defaultPort || "Chittagong, Bangladesh";

  // Item Defaults (From Order)
  const defaultItems = existingPI?.items?.[0] || {
      description: `${order.styleNo} - ${order.season}`,
      hsCode: "", 
      qty: order.orderQty,
      rate: order.unitPrice,
      amount: order.totalValue
  };

  // --- HANDLER ---
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
    <form action={handleSubmit} className="space-y-8 pb-32">
      
      {/* 1. HEADER INFO */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Proforma Invoice Details</CardTitle>
            <div className="flex gap-2">
                <div className="flex flex-col">
                    <Label className="text-xs text-slate-500 mb-1">PI Number</Label>
                    <Input 
                        name="piNumber" 
                        defaultValue={existingPI?.piNumber || `PI-${order.orderNo}`} 
                        className="w-40 font-mono font-bold text-blue-700"
                        placeholder="PI Number"
                        required
                    />
                </div>
                <div className="flex flex-col">
                    <Label className="text-xs text-slate-500 mb-1">Issue Date</Label>
                    <Input 
                        name="date" 
                        type="date" 
                        defaultValue={existingPI?.date ? format(new Date(existingPI.date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")}
                        className="w-40"
                        required
                    />
                </div>
            </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Box 1: Supplier (Read-Only View of Settings) */}
            <div className="p-4 border rounded bg-slate-50 h-full">
                <Label className="text-xs text-slate-500 uppercase flex items-center gap-1 mb-2">
                    <MapPin className="w-3 h-3" /> Beneficiary / Supplier
                </Label>
                <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">
                    {defaultSupplierInfo}
                </div>
            </div>

            {/* Box 2: Buyer (From Master Data) */}
            <div className="p-4 border rounded bg-slate-50 h-full">
                <Label className="text-xs text-slate-500 uppercase flex items-center gap-1 mb-2">
                    <Building2 className="w-3 h-3" /> Applicant / Buyer
                </Label>
                <div className="font-bold text-slate-900">{order.buyer.name}</div>
                <div className="text-sm text-slate-600 mt-1">
                    {order.buyer.country}
                </div>
            </div>

            {/* Box 3: Bank (Editable Textarea) */}
            <div className="p-4 border rounded bg-yellow-50/50 border-yellow-100 h-full">
                <Label className="text-xs text-yellow-700 uppercase flex items-center gap-1 mb-2">
                    <Building2 className="w-3 h-3" /> Advising Bank Details
                </Label>
                <Textarea 
                    name="bankDetails"
                    defaultValue={existingPI?.bankDetails || defaultBankDetails}
                    className="mt-1 h-[120px] text-sm bg-white resize-none font-mono"
                    placeholder="Enter Bank Name, Address, Swift Code..."
                />
            </div>
        </CardContent>
      </Card>

      {/* 2. ITEMS TABLE */}
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
                          <TableCell className="font-medium">01</TableCell>
                          <TableCell>
                              <Input name="item_desc" defaultValue={defaultItems.description} />
                          </TableCell>
                          <TableCell>
                              <Input name="item_hs" defaultValue={defaultItems.hsCode} placeholder="6109.10" />
                          </TableCell>
                          <TableCell>
                              <Input name="item_qty" defaultValue={defaultItems.qty} className="text-right bg-slate-50" readOnly />
                          </TableCell>
                          <TableCell>
                              <Input name="item_rate" defaultValue={defaultItems.rate} className="text-right bg-slate-50" readOnly />
                          </TableCell>
                          <TableCell className="text-right font-bold">
                              <Input 
                                name="item_amount" 
                                defaultValue={defaultItems.amount} 
                                className="text-right font-bold border-none shadow-none bg-transparent" 
                                readOnly 
                              />
                          </TableCell>
                      </TableRow>
                  </TableBody>
              </Table>
          </CardContent>
      </Card>

      {/* 3. TERMS & CONDITIONS */}
      <Card>
          <CardHeader><CardTitle>Terms & Conditions</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="space-y-2">
                  <Label>1. Payment Method</Label>
                  <Input name="term_payment" defaultValue={defaultPaymentTerm} />
              </div>
              <div className="space-y-2">
                  <Label>2. Shipment Date</Label>
                  <Input name="term_shipment" defaultValue="45 Days from L/C receipt" />
              </div>
              <div className="space-y-2">
                  <Label>3. Port of Loading</Label>
                  <Input name="term_port" defaultValue={defaultPort} />
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
              <div className="space-y-2">
                  <Label>7. Country of Origin</Label>
                  <Input defaultValue="Bangladesh" />
              </div>
              <div className="space-y-2">
                  <Label>8. Packing</Label>
                  <Input defaultValue="Export Standard Carton Packing" />
              </div>
          </CardContent>
      </Card>

      {/* 4. ACTION BAR (Sticky Footer) */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 p-4 bg-white border-t flex items-center justify-between z-40">
          <div className="text-sm text-slate-500 pl-4">
              Total Value: <span className="font-bold text-slate-900 text-lg">${order.totalValue.toLocaleString()}</span>
          </div>
          <div className="flex gap-3 pr-4">
              <Button type="button" variant="outline">
                  <Printer className="w-4 h-4 mr-2" /> Print PDF
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 min-w-[150px]">
                  <Save className="w-4 h-4 mr-2" /> 
                  {isLoading ? "Saving..." : "Save PI"}
              </Button>
          </div>
      </div>

    </form>
  );
}