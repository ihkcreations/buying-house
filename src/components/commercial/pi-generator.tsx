"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Save, Printer, Building2, MapPin } from "lucide-react";
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

  // --- DEFAULTS ---
  const defaultSupplierInfo = settings 
    ? `${settings.companyName}\n${settings.companyAddress}\n${settings.contactPhone || ""}`
    : "P.I. OCEAN TEX\nDhaka, Bangladesh";

  const defaultBankDetails = settings
    ? `${settings.bankName}\n${settings.bankAddress || ""}\nSWIFT: ${settings.swiftCode}\nA/C Name: ${settings.accountName}\nA/C No: ${settings.accountNumber}`
    : "TRUST BANK PLC\nDilkusha Corp Branch\nSWIFT: TBLBDDH";

  // Existing terms from DB or defaults
  const t = existingPI || {};

  // Item Defaults
  const defaultItems = existingPI?.items?.[0] || {
      styleOrder: `${order.styleNo} / ${order.orderNo}`,
      article: "", 
      description: `Men's 100% Cotton Knitted ${order.styleNo}`, 
      hsCode: "6109.10",
      shippingDate: format(new Date(new Date().setDate(new Date().getDate() + 45)), "yyyy-MM-dd"), 
      qty: order.orderQty,
      rate: order.unitPrice,
      amount: order.totalValue
  };

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    const result = await savePI(order.id, formData);
    if (result?.error) toast.error(result.error);
    else toast.success(result.success);
    setIsLoading(false);
  };

  return (
    <form action={handleSubmit} className="space-y-8 pb-32">
      
      {/* 1. HEADER INFO (Same as before) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Proforma Invoice Details</CardTitle>
            <div className="flex gap-4">
                <div className="flex flex-col">
                    <Label className="text-xs text-slate-500 mb-1">PI Number</Label>
                    <Input name="piNumber" defaultValue={existingPI?.piNumber || `PI-${order.orderNo}`} className="w-40 font-mono font-bold text-blue-700" required />
                </div>
                <div className="flex flex-col">
                    <Label className="text-xs text-slate-500 mb-1">Issue Date</Label>
                    <Input name="date" type="date" defaultValue={existingPI?.date ? format(new Date(existingPI.date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")} className="w-40" />
                </div>
            </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border rounded bg-slate-50 h-full">
                <Label className="text-xs text-slate-500 uppercase flex items-center gap-1 mb-2"><MapPin className="w-3 h-3" /> Beneficiary / Supplier</Label>
                <div className="text-sm text-slate-700 whitespace-pre-wrap font-medium">{defaultSupplierInfo}</div>
            </div>
            <div className="p-4 border rounded bg-slate-50 h-full">
                <Label className="text-xs text-slate-500 uppercase flex items-center gap-1 mb-2"><Building2 className="w-3 h-3" /> Applicant / Buyer</Label>
                <div className="font-bold text-slate-900">{order.buyer.name}</div>
                <div className="text-sm text-slate-600 mt-1">{order.buyer.country}</div>
            </div>
            <div className="p-4 border rounded bg-yellow-50/50 border-yellow-100 h-full">
                <Label className="text-xs text-yellow-700 uppercase flex items-center gap-1 mb-2"><Building2 className="w-3 h-3" /> Advising Bank</Label>
                <Textarea name="bankDetails" defaultValue={existingPI?.bankDetails || defaultBankDetails} className="mt-1 h-[120px] text-sm bg-white resize-none font-mono" />
            </div>
        </CardContent>
      </Card>

      {/* 2. GOODS TABLE (Same as before) */}
      <Card>
          <CardHeader><CardTitle>Description of Goods</CardTitle></CardHeader>
          <CardContent className="p-0 overflow-x-auto">
              <Table className="min-w-[1000px]">
                  <TableHeader>
                      <TableRow className="bg-slate-50">
                          <TableHead className="w-[50px]">Sl.</TableHead>
                          <TableHead className="w-[150px]">Style / Order</TableHead>
                          <TableHead className="w-[120px]">Article</TableHead>
                          <TableHead className="w-[250px]">Description & HS Code</TableHead>
                          <TableHead className="w-[130px]">Shipping Date</TableHead>
                          <TableHead className="w-[100px] text-right">Qty</TableHead>
                          <TableHead className="w-[100px] text-right">Price</TableHead>
                          <TableHead className="w-[120px] text-right">Amount</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      <TableRow>
                          <TableCell className="text-center">01</TableCell>
                          <TableCell><Input name="item_style" defaultValue={defaultItems.styleOrder} className="bg-slate-50" /></TableCell>
                          <TableCell><Input name="item_article" defaultValue={defaultItems.article} placeholder="e.g. ART-001" /></TableCell>
                          <TableCell>
                              <div className="space-y-2">
                                <Textarea name="item_desc" defaultValue={defaultItems.description} className="min-h-[60px] resize-none" />
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] uppercase">HS Code:</span>
                                    <Input name="item_hs" defaultValue={defaultItems.hsCode} className="h-7 text-xs" />
                                </div>
                              </div>
                          </TableCell>
                          <TableCell><Input type="date" name="item_shipdate" defaultValue={defaultItems.shippingDate} className="text-xs" /></TableCell>
                          <TableCell><Input name="item_qty" defaultValue={defaultItems.qty} className="text-right bg-slate-50" readOnly /></TableCell>
                          <TableCell><Input name="item_rate" defaultValue={defaultItems.rate} className="text-right bg-slate-50" readOnly /></TableCell>
                          <TableCell className="text-right"><Input name="item_amount" defaultValue={defaultItems.amount} className="text-right font-bold border-none shadow-none bg-transparent" readOnly /></TableCell>
                      </TableRow>
                  </TableBody>
              </Table>
          </CardContent>
      </Card>

      {/* 3. TERMS & CONDITIONS (Updated to Exact 12 Fields) */}
      <Card>
          <CardHeader><CardTitle>Terms & Conditions</CardTitle></CardHeader>
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
                    <TableRow>
                        <TableCell>01</TableCell>
                        <TableCell className="font-medium">Payment</TableCell>
                        <TableCell><Input name="term_payment" defaultValue={t.payment || settings?.defaultPaymentTerms || "Irrevocable L/C at sight"} /></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>02</TableCell>
                        <TableCell className="font-medium">B/L Clause</TableCell>
                        <TableCell><Input name="term_bl" defaultValue={t.blClause || "Negotiable against documents"} /></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>03</TableCell>
                        <TableCell className="font-medium">Tolerance</TableCell>
                        <TableCell><Input name="term_tolerance" defaultValue={t.tolerance || "+/- 5% in Quantity and Amount"} /></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>04</TableCell>
                        <TableCell className="font-medium">Freight Term</TableCell>
                        <TableCell><Input name="term_freight" defaultValue={t.freightTerm || "Freight Collect"} /></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>05</TableCell>
                        <TableCell className="font-medium">Port of Loading</TableCell>
                        <TableCell><Input name="term_pol" defaultValue={t.portLoading || settings?.defaultPort || "Chittagong, Bangladesh"} /></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>06</TableCell>
                        <TableCell className="font-medium">Partial Shipment</TableCell>
                        <TableCell><Input name="term_partial" defaultValue={t.partialShipment || "Allowed"} /></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>07</TableCell>
                        <TableCell className="font-medium">Charges</TableCell>
                        <TableCell><Input name="term_charges" defaultValue={t.charges || "Outside Bangladesh on Applicant's account"} /></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>08</TableCell>
                        <TableCell className="font-medium">Insurance</TableCell>
                        <TableCell><Input name="term_insurance" defaultValue={t.insurance || "Covered by Applicant"} /></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>09</TableCell>
                        <TableCell className="font-medium">L/C Term 1</TableCell>
                        <TableCell><Input name="term_lc1" defaultValue={t.lcTerm1 || ""} placeholder="Specific LC Condition..." /></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>10</TableCell>
                        <TableCell className="font-medium">L/C Term 2</TableCell>
                        <TableCell><Input name="term_lc2" defaultValue={t.lcTerm2 || ""} placeholder="Additional LC Condition..." /></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>11</TableCell>
                        <TableCell className="font-medium">Port of Discharge</TableCell>
                        <TableCell><Input name="term_pod" defaultValue={t.portDischarge || ""} placeholder="e.g. Hamburg" /></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>12</TableCell>
                        <TableCell className="font-medium">Documents</TableCell>
                        <TableCell><Input name="term_docs" defaultValue={t.documents || "Comm. Invoice, Packing List, B/L, CO, GSP"} /></TableCell>
                    </TableRow>
                </TableBody>
             </Table>
          </CardContent>
      </Card>

      {/* 4. FOOTER & SIGNATURE */}
      <div className="grid grid-cols-2 gap-12 mt-12 px-6">
            <div className="mt-8">
                <div className="border-t border-slate-300 w-2/3 pt-2">
                    <p className="font-bold text-sm">ACCEPTED BY (BUYER)</p>
                    <p className="text-xs text-slate-500">Signature & Seal</p>
                </div>
            </div>
            <div className="mt-8 text-right flex flex-col items-end">
                <div className="border-t border-slate-900 w-2/3 pt-2">
                    <p className="font-bold text-sm">P.I. OCEAN TEX</p>
                    <p className="text-xs text-slate-500">Authorized Signature</p>
                </div>
            </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 md:left-64 p-4 bg-white border-t flex items-center justify-between z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
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