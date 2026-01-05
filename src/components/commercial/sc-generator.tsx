"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Save, Printer, Building2, MapPin, Handshake } from "lucide-react";
import { format } from "date-fns";
import { saveSC } from "@/app/actions/commercial";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "../ui/textarea";

export function SCGenerator({ 
    order, 
    pi, 
    sc,
    settings 
}: { 
    order: any, 
    pi?: any, 
    sc?: any,
    settings?: any
}) {
  const [isLoading, setIsLoading] = useState(false);

  // --- 1. DYNAMIC DEFAULTS ---
  const defaultSupplierInfo = settings 
    ? `${settings.companyName}\n${settings.companyAddress}\n${settings.contactPhone || ""}`
    : "P.I. OCEAN TEX\nDhaka, Bangladesh";

  // Terms: Use SC if exists, otherwise fallback to PI, otherwise defaults
  // This allows the SC to start as a copy of PI, but evolve independently
  const t = sc || pi || {}; 

  // Items comes from PI (Read Only for SC usually)
  // If PI items exist, map them. Otherwise default.
  const items = pi?.items && Array.isArray(pi.items) ? pi.items : [{
      styleOrder: `${order.styleNo}`,
      article: "",
      description: `Men's 100% Cotton Knitted ${order.styleNo}`,
      shippingDate: format(new Date(), "yyyy-MM-dd"),
      qty: order.orderQty,
      rate: order.unitPrice,
      amount: order.totalValue
  }];

  const totalAmount = items.reduce((sum: number, i: any) => sum + (i.amount || 0), 0);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    const result = await saveSC(order.id, formData);
    if (result?.error) toast.error(result.error);
    else toast.success(result.success);
    setIsLoading(false);
  };

  if (!pi) {
    return (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-slate-50 text-slate-500">
            <Handshake className="w-12 h-12 mb-4 text-slate-300" />
            <h3 className="text-lg font-medium">Proforma Invoice Required</h3>
            <p>Please generate the PI first. The Sales Contract will be based on the PI details.</p>
        </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-8 pb-32">
      
      {/* 1. HEADER */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-black">
                <Handshake className="w-5 h-5 text-blue-400" /> 
                Sales Contract
            </CardTitle>
            <div className="flex gap-4 text-slate-900">
                <div className="flex flex-col">
                    <Input 
                        name="scNumber" 
                        defaultValue={sc?.scNumber || `SC-${order.orderNo}`} 
                        className="w-40 font-mono font-bold bg-white" 
                        placeholder="SC Number"
                    />
                </div>
                <div className="flex flex-col">
                    <Input 
                        name="scDate" 
                        type="date" 
                        defaultValue={sc?.scDate ? format(new Date(sc.scDate), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")} 
                        className="w-40 bg-white" 
                    />
                </div>
            </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
            {/* TOP ROW: SELLER & BUYER */}
            <div className="grid grid-cols-2 gap-6">
                <div className="p-4 border rounded bg-slate-50 h-full">
                    <Label className="text-xs text-slate-500 uppercase flex items-center gap-1 mb-2">
                        <MapPin className="w-3 h-3" /> Exporter / Seller
                    </Label>
                    <div className="text-sm text-slate-700 whitespace-pre-wrap font-medium leading-relaxed">
                        {defaultSupplierInfo}
                    </div>
                </div>
                <div className="p-4 border rounded bg-slate-50 h-full">
                    <Label className="text-xs text-slate-500 uppercase flex items-center gap-1 mb-2">
                        <Building2 className="w-3 h-3" /> Importer / Buyer (Bill To)
                    </Label>
                    <div className="font-bold text-slate-900">{order.buyer.name}</div>
                    <div className="text-sm text-slate-600 mt-1">{order.buyer.country}</div>
                </div>
            </div>

            {/* NEW ROW: CONSIGNEE & NOTIFY PARTY */}
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Consignee (Ship To)</Label>
                    <Textarea 
                        name="consignee" 
                        defaultValue={sc?.consignee || "Same as Buyer"} 
                        placeholder="Warehouse Address..." 
                        className="h-20 text-xs resize-none"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Notify Party</Label>
                    <Textarea 
                        name="notifyParty" 
                        defaultValue={sc?.notifyParty || "Same as Consignee"} 
                        placeholder="Forwarder / Agent Details..." 
                        className="h-20 text-xs resize-none"
                    />
                </div>
            </div>
        </CardContent>
      </Card>

      {/* 2. ORDER DETAILS (READ ONLY FROM PI) */}
      <Card>
          <CardHeader><CardTitle>Contract Details</CardTitle></CardHeader>
          <CardContent className="p-0 overflow-x-auto">
              <Table className="min-w-[800px]">
                  <TableHeader>
                      <TableRow className="bg-slate-100">
                          <TableHead>Style / Article</TableHead>
                          <TableHead className="w-[300px]">Description</TableHead>
                          <TableHead>Ship Date</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Rate</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {items.map((item: any, idx: number) => (
                          <TableRow key={idx}>
                              <TableCell className="font-medium">
                                  {item.styleOrder} <br/> 
                                  <span className="text-xs text-slate-500">{item.article}</span>
                              </TableCell>
                              <TableCell className="text-sm">{item.description}</TableCell>
                              <TableCell className="text-xs">{item.shippingDate}</TableCell>
                              <TableCell className="text-right">{item.qty}</TableCell>
                              <TableCell className="text-right">${item.rate}</TableCell>
                              <TableCell className="text-right font-bold">${item.amount}</TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
          </CardContent>
      </Card>

      {/* 3. CONTRACT TERMS (Editable & Independent) */}
      <Card>
          <CardHeader><CardTitle>Contract Terms & Conditions</CardTitle></CardHeader>
          <CardContent className="p-0">
             <Table>
                <TableHeader>
                    <TableRow className="bg-slate-100">
                        <TableHead className="w-[60px]">No.</TableHead>
                        <TableHead className="w-[200px]">Type</TableHead>
                        <TableHead>Description</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow><TableCell>01</TableCell><TableCell className="font-medium">Payment</TableCell><TableCell><Input name="term_payment" defaultValue={t.payment || "Irrevocable L/C at sight"} /></TableCell></TableRow>
                    <TableRow><TableCell>02</TableCell><TableCell className="font-medium">B/L Clause</TableCell><TableCell><Input name="term_bl" defaultValue={t.blClause || "Negotiable against documents"} /></TableCell></TableRow>
                    <TableRow><TableCell>03</TableCell><TableCell className="font-medium">Tolerance</TableCell><TableCell><Input name="term_tolerance" defaultValue={t.tolerance || "+/- 5% in Quantity and Amount"} /></TableCell></TableRow>
                    <TableRow><TableCell>04</TableCell><TableCell className="font-medium">Freight Term</TableCell><TableCell><Input name="term_freight" defaultValue={t.freightTerm || "Freight Collect"} /></TableCell></TableRow>
                    <TableRow><TableCell>05</TableCell><TableCell className="font-medium">Port of Loading</TableCell><TableCell><Input name="term_pol" defaultValue={t.portLoading || settings?.defaultPort || "Chittagong, Bangladesh"} /></TableCell></TableRow>
                    <TableRow><TableCell>06</TableCell><TableCell className="font-medium">Partial Shipment</TableCell><TableCell><Input name="term_partial" defaultValue={t.partialShipment || "Allowed"} /></TableCell></TableRow>
                    <TableRow><TableCell>07</TableCell><TableCell className="font-medium">Charges</TableCell><TableCell><Input name="term_charges" defaultValue={t.charges || "Outside Bangladesh on Applicant's account"} /></TableCell></TableRow>
                    <TableRow><TableCell>08</TableCell><TableCell className="font-medium">Insurance</TableCell><TableCell><Input name="term_insurance" defaultValue={t.insurance || "Covered by Applicant"} /></TableCell></TableRow>
                    <TableRow><TableCell>09</TableCell><TableCell className="font-medium">L/C Term 1</TableCell><TableCell><Input name="term_lc1" defaultValue={t.lcTerm1 || ""} placeholder="Special Condition 1" /></TableCell></TableRow>
                    <TableRow><TableCell>10</TableCell><TableCell className="font-medium">L/C Term 2</TableCell><TableCell><Input name="term_lc2" defaultValue={t.lcTerm2 || ""} placeholder="Special Condition 2" /></TableCell></TableRow>
                    <TableRow><TableCell>11</TableCell><TableCell className="font-medium">Port of Discharge</TableCell><TableCell><Input name="term_pod" defaultValue={t.portDischarge || ""} placeholder="Destination Port" /></TableCell></TableRow>
                    <TableRow><TableCell>12</TableCell><TableCell className="font-medium">Documents</TableCell><TableCell><Input name="term_docs" defaultValue={t.documents || "Comm. Invoice, Packing List, B/L, CO, GSP"} /></TableCell></TableRow>
                </TableBody>
             </Table>
          </CardContent>
      </Card>

      {/* 4. DUAL SIGNATURE BLOCK (Buyer & Seller) */}
      <div className="grid grid-cols-2 gap-12 mt-12 px-6">
            <div className="mt-8">
                <div className="border-t border-slate-300 w-2/3 pt-2">
                    <p className="font-bold text-sm">AGREED & ACCEPTED (BUYER)</p>
                    <p className="text-xs text-slate-500">Name / Seal / Date</p>
                </div>
            </div>
            <div className="mt-8 text-right flex flex-col items-end">
                <div className="border-t border-slate-900 w-2/3 pt-2">
                    <p className="font-bold text-sm">P.I. OCEAN TEX (SELLER)</p>
                    <p className="text-xs text-slate-500">Authorized Signature</p>
                </div>
            </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 md:left-64 p-4 bg-white border-t flex items-center justify-between z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="text-sm text-slate-500 pl-4">
              Contract Value: <span className="font-bold text-slate-900 text-lg">${totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex gap-3 pr-4">
              <Button type="button" variant="outline">
                  <Printer className="w-4 h-4 mr-2" /> Print PDF
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-slate-900 hover:bg-slate-800 min-w-[150px]">
                  <Save className="w-4 h-4 mr-2" /> 
                  {isLoading ? "Saving..." : "Save Contract"}
              </Button>
          </div>
      </div>

    </form>
  );
}