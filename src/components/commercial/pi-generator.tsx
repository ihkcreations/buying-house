"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Save, Printer, Building2, MapPin, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { savePI } from "@/app/actions/commercial";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Import Select
import { PDFDownloadLink } from "@react-pdf/renderer";
import { PIDocument } from "@/components/pdf/pi-template";
import { logDocumentGeneration } from "@/app/actions/commercial";

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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  // --- ADDRESS LOGIC ---
  const addresses = settings?.addresses || [];
  
  // Helper to format the full string
  const buildAddressString = (addrText: string) => {
      // If the address text already contains company name, don't double add it.
      // But usually settings.companyName is separate.
      return `${settings?.companyName || "P.I. OCEAN TEX"}\n${addrText}\n${settings?.contactPhone || ""}`;
  };

  // 1. Determine Initial Value
  // Priority: Saved PI Value > Default from Settings > Hardcoded Fallback
  const getInitialAddress = () => {
      if (existingPI?.supplierAddress) return existingPI.supplierAddress;
      
      const defaultAddr = addresses.find((a: any) => a.isDefault) || addresses[0];
      if (defaultAddr) return buildAddressString(defaultAddr.addressText);
      
      return "P.I. OCEAN TEX\nDhaka, Bangladesh";
  };

  const [supplierAddress, setSupplierAddress] = useState(getInitialAddress());

  // 2. Handle Dropdown Change
  const handleAddressChange = (addressId: string) => {
      const selected = addresses.find((a: any) => a.id === addressId);
      if (selected) {
          setSupplierAddress(buildAddressString(selected.addressText));
      }
  };

  // --- ROW LOGIC (Same as before) ---
  const initialRow = {
      styleOrder: `${order.styleNo} / ${order.orderNo}`,
      article: "", 
      description: `Men's 100% Cotton Knitted ${order.styleNo}`, 
      shippingDate: format(new Date(new Date().setDate(new Date().getDate() + 45)), "yyyy-MM-dd"), 
      qty: order.orderQty,
      rate: order.unitPrice,
      amount: order.totalValue
  };

  const [rows, setRows] = useState<any[]>(
      existingPI?.items && existingPI.items.length > 0 ? existingPI.items : [initialRow]
  );

  const addRow = () => setRows([...rows, { ...initialRow, qty: 0, amount: 0, article: "" }]);
  
  const removeRow = (index: number) => {
      if (rows.length === 1) return toast.error("At least one item required");
      const newRows = [...rows];
      newRows.splice(index, 1);
      setRows(newRows);
  };

  const handleRowChange = (index: number, field: string, value: string) => {
      const newRows = [...rows];
      newRows[index] = { ...newRows[index], [field]: value };
      if (field === "qty" || field === "rate") {
          const q = parseFloat(newRows[index].qty) || 0;
          const r = parseFloat(newRows[index].rate) || 0;
          newRows[index].amount = q * r;
      }
      setRows(newRows);
  };

  const grandTotal = rows.reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0);

  // --- BANK DEFAULTS ---
  const defaultBankDetails = settings
    ? `${settings.bankName}\n${settings.bankAddress || ""}\nSWIFT: ${settings.swiftCode}\nA/C Name: ${settings.accountName}\nA/C No: ${settings.accountNumber}`
    : "TRUST BANK PLC\nDilkusha Corp Branch\nSWIFT: TBLBDDH";

  const t = existingPI || {}; 

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    const result = await savePI(order.id, formData);
    if (result?.error) toast.error(result.error);
    else toast.success(result.success);
    setIsLoading(false);
  };

  const handleDownloadLog = async () => {
      // Fire and forget (don't block the download)
      await logDocumentGeneration(order.id, "PI");
      toast.success("Download Logged");
  };

  return (
    <form action={handleSubmit} className="space-y-8 pb-32">
      
      {/* 1. HEADER INFO */}
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
            
            {/* BOX 1: SUPPLIER (With Dropdown) */}
            <div className="p-4 border rounded bg-slate-50 h-full relative">
                <div className="flex justify-between items-center mb-2">
                    <Label className="text-xs text-slate-500 uppercase flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Beneficiary / Supplier
                    </Label>
                    {/* Address Selector */}
                    {addresses.length > 0 && (
                        <Select onValueChange={handleAddressChange}>
                            <SelectTrigger className="h-6 text-[10px] w-[130px] bg-white border-slate-200">
                                <SelectValue placeholder="Change Office" />
                            </SelectTrigger>
                            <SelectContent>
                                {addresses.map((a: any) => (
                                    <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
                
                {/* Editable Text Area */}
                <Textarea 
                    name="vendorAddress" // Server reads this
                    value={supplierAddress}
                    onChange={(e) => setSupplierAddress(e.target.value)}
                    className="text-sm bg-transparent border-none shadow-none resize-none p-0 h-[100px] focus-visible:ring-0 leading-relaxed font-medium"
                />
            </div>

            {/* BOX 2: BUYER */}
            <div className="p-4 border rounded bg-slate-50 h-full">
                <Label className="text-xs text-slate-500 uppercase flex items-center gap-1 mb-2"><Building2 className="w-3 h-3" /> Applicant / Buyer</Label>
                <div className="font-bold text-slate-900">{order.buyer.name}</div>
                <div className="text-sm text-slate-600 mt-1">{order.buyer.country}</div>
            </div>

            {/* BOX 3: BANK */}
            <div className="p-4 border rounded bg-yellow-50/50 border-yellow-100 h-full">
                <Label className="text-xs text-yellow-700 uppercase flex items-center gap-1 mb-2"><Building2 className="w-3 h-3" /> Advising Bank</Label>
                <Textarea name="bankDetails" defaultValue={existingPI?.bankDetails || defaultBankDetails} className="mt-1 h-[120px] text-sm bg-white resize-none font-mono" />
            </div>
        </CardContent>
      </Card>

      {/* 2. DYNAMIC GOODS TABLE (Same as previous) */}
      <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Description of Goods</CardTitle>
              <Button type="button" size="sm" variant="outline" onClick={addRow} className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100">
                  <Plus className="w-4 h-4 mr-2" /> Add Item Row
              </Button>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
              <Table className="min-w-[1000px]">
                  <TableHeader>
                      <TableRow className="bg-slate-50">
                          <TableHead className="w-[50px] text-center">Sl.</TableHead>
                          <TableHead className="w-[150px]">Style / Order</TableHead>
                          <TableHead className="w-[120px]">Article</TableHead>
                          <TableHead className="w-[300px]">Description</TableHead> 
                          <TableHead className="w-[130px]">Shipping Date</TableHead>
                          <TableHead className="w-[100px] text-right">Qty</TableHead>
                          <TableHead className="w-[100px] text-right">Rate</TableHead>
                          <TableHead className="w-[120px] text-right">Total</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {rows.map((row, index) => (
                          <TableRow key={index}>
                              <TableCell className="font-medium text-center">{index + 1}</TableCell>
                              <TableCell><Input name="item_style" value={row.styleOrder} onChange={(e) => handleRowChange(index, 'styleOrder', e.target.value)} className="bg-slate-50/50" /></TableCell>
                              <TableCell><Input name="item_article" value={row.article} onChange={(e) => handleRowChange(index, 'article', e.target.value)} placeholder="ART..." /></TableCell>
                              <TableCell><Textarea name="item_desc" value={row.description} onChange={(e) => handleRowChange(index, 'description', e.target.value)} className="min-h-[50px] resize-none text-xs" /></TableCell>
                              <TableCell><Input type="date" name="item_shipdate" value={row.shippingDate} onChange={(e) => handleRowChange(index, 'shippingDate', e.target.value)} className="text-xs" /></TableCell>
                              <TableCell><Input type="number" name="item_qty" value={row.qty} onChange={(e) => handleRowChange(index, 'qty', e.target.value)} className="text-right" /></TableCell>
                              <TableCell><Input type="number" name="item_rate" value={row.rate} onChange={(e) => handleRowChange(index, 'rate', e.target.value)} className="text-right" /></TableCell>
                              <TableCell className="text-right font-bold"><Input name="item_amount" value={row.amount} readOnly className="text-right font-bold border-none shadow-none bg-transparent" /></TableCell>
                              <TableCell><Button type="button" variant="ghost" size="icon" onClick={() => removeRow(index)} className="text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></Button></TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
          </CardContent>
      </Card>

      {/* 3. TERMS (Same as previous) */}
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
                    <TableRow><TableCell>01</TableCell><TableCell className="font-medium">Payment</TableCell><TableCell><Input name="term_payment" defaultValue={t.payment || settings?.defaultPaymentTerms || "Irrevocable L/C at sight"} /></TableCell></TableRow>
                    {/* ... other rows ... */}
                    <TableRow><TableCell>02</TableCell><TableCell className="font-medium">B/L Clause</TableCell><TableCell><Input name="term_bl" defaultValue={t.blClause || "Negotiable against documents"} /></TableCell></TableRow>
                    <TableRow><TableCell>03</TableCell><TableCell className="font-medium">Tolerance</TableCell><TableCell><Input name="term_tolerance" defaultValue={t.tolerance || "+/- 5% in Quantity and Amount"} /></TableCell></TableRow>
                    <TableRow><TableCell>04</TableCell><TableCell className="font-medium">Freight Term</TableCell><TableCell><Input name="term_freight" defaultValue={t.freightTerm || "Freight Collect"} /></TableCell></TableRow>
                    <TableRow><TableCell>05</TableCell><TableCell className="font-medium">Port of Loading</TableCell><TableCell><Input name="term_pol" defaultValue={t.portLoading || settings?.defaultPort || "Chittagong, Bangladesh"} /></TableCell></TableRow>
                    <TableRow><TableCell>06</TableCell><TableCell className="font-medium">Partial Shipment</TableCell><TableCell><Input name="term_partial" defaultValue={t.partialShipment || "Allowed"} /></TableCell></TableRow>
                    <TableRow><TableCell>07</TableCell><TableCell className="font-medium">Charges</TableCell><TableCell><Input name="term_charges" defaultValue={t.charges || "Outside Bangladesh on Applicant's account"} /></TableCell></TableRow>
                    <TableRow><TableCell>08</TableCell><TableCell className="font-medium">Insurance</TableCell><TableCell><Input name="term_insurance" defaultValue={t.insurance || "Covered by Applicant"} /></TableCell></TableRow>
                    <TableRow><TableCell>09</TableCell><TableCell className="font-medium">L/C Term 1</TableCell><TableCell><Input name="term_lc1" defaultValue={t.lcTerm1 || ""} placeholder="Specific LC Condition..." /></TableCell></TableRow>
                    <TableRow><TableCell>10</TableCell><TableCell className="font-medium">L/C Term 2</TableCell><TableCell><Input name="term_lc2" defaultValue={t.lcTerm2 || ""} placeholder="Additional LC Condition..." /></TableCell></TableRow>
                    <TableRow><TableCell>11</TableCell><TableCell className="font-medium">Port of Discharge</TableCell><TableCell><Input name="term_pod" defaultValue={t.portDischarge || ""} placeholder="e.g. Hamburg" /></TableCell></TableRow>
                    <TableRow><TableCell>12</TableCell><TableCell className="font-medium">Documents</TableCell><TableCell><Input name="term_docs" defaultValue={t.documents || "Comm. Invoice, Packing List, B/L, CO, GSP"} /></TableCell></TableRow>
                </TableBody>
             </Table>
          </CardContent>
      </Card>

      {/* 4. FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 p-4 bg-white border-t flex items-center justify-between z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="text-sm text-slate-500 pl-4">
              Total Value: <span className="font-bold text-slate-900 text-lg">${grandTotal.toLocaleString()}</span>
          </div>
          <div className="flex gap-3 pr-4">
              {isClient && existingPI ? (
                <div onClick={handleDownloadLog}>
                    <PDFDownloadLink
                        document={<PIDocument order={order} pi={existingPI} settings={settings} />}
                        fileName={`${existingPI.piNumber}.pdf`}
                    >
                        {({ loading }) => (
                            <Button type="button" variant="outline" disabled={loading}>
                                <Printer className="w-4 h-4 mr-2" /> {loading ? "Generating..." : "Download PDF"}
                            </Button>
                        )}
                    </PDFDownloadLink>
                </div>
              ) : (
                <Button type="button" variant="outline" disabled><Printer className="w-4 h-4 mr-2" /> Save to Print</Button>
              )}
              <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 min-w-[150px]">
                  <Save className="w-4 h-4 mr-2" /> {isLoading ? "Saving..." : "Save PI"}
              </Button>
          </div>
      </div>

    </form>
  );
}