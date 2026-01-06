"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Save,
  Printer,
  Building2,
  MapPin,
  Handshake,
  Landmark,
} from "lucide-react";
import { format } from "date-fns";
import { saveSC } from "@/app/actions/commercial";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // New Import
import { PDFDownloadLink } from "@react-pdf/renderer";
import { SCDocument } from "@/components/pdf/sc-template";
import { logDocumentGeneration } from "@/app/actions/commercial";

export function SCGenerator({
  order,
  pi,
  sc,
  settings,
}: {
  order: any;
  pi?: any;
  sc?: any;
  settings?: any;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // --- 1. ADDRESS LOGIC (Same as PI) ---
  const addresses = settings?.addresses || [];

  const buildAddressString = (addrText: string) => {
    return `${settings?.companyName || "P.I. OCEAN TRADE"}\n${addrText}\n${
      settings?.contactPhone || ""
    }`;
  };

  const getInitialAddress = () => {
    if (sc?.vendorAddress) return sc.vendorAddress;
    const defaultAddr = addresses.find((a: any) => a.isDefault) || addresses[0];
    if (defaultAddr) return buildAddressString(defaultAddr.addressText);
    return "P.I. OCEAN TRADE CO.\nDHAKA, BANGLADESH.";
  };

  const [vendorAddress, setVendorAddress] = useState(getInitialAddress());

  const handleAddressChange = (addressId: string) => {
    const selected = addresses.find((a: any) => a.id === addressId);
    if (selected) {
      setVendorAddress(buildAddressString(selected.addressText));
    }
  };

  // --- 2. BANK LOGIC ---
  // Construct Bank String from Settings parts
  const settingsBankString = settings
    ? `${settings.bankName}\n${settings.bankAddress || ""}\nSWIFT: ${
        settings.swiftCode
      }\nA/C Name: ${settings.accountName}\nA/C No: ${settings.accountNumber}`
    : "";

  const defaultVendorBank =
    sc?.vendorBank || settingsBankString || "TRUST BANK LTD...";

  // --- 3. BUYER DEFAULTS ---
  const defaultBuyerInfo = `${order.buyer.name}\n${order.buyer.country}`;

  // Default Late Clause
  const defaultLateClause = `For the purposes of this document, “late” is determined from the P.O. Requested Ship Date/ETD Origin Date listed on the Purchase Order.
It is the vendor’s responsibility to ensure that the goods are available to ship by this date listed on the Purchase Order. Vessel rotation changes
beyond the below prescribed timelines will not be considered. All charges quoted below are in U.S. dollars.

DIRECT OCEAN SHIPMENTS
1. If a shipment is up to 6 days late no penalty will be taken
2. If a shipment is 7-14 days late Bluestem will allow the vendor to ship via regular vessel with 1-week late penalty.
3. If a shipment is between 15-21 days late, The shipment will be aired 100% prepaid. Late penalty will be waived.
4. If a shipment is more than 21 days late, The shipment will be aired 100% prepaid. Applicable late penalties will be assessed based
on the total number of weeks from the shipment date listed on the PO to the date the shipment actually occurred.

DIRECT AIR SHIPMENTS
It is the vendor’s responsibility to ensure that the goods are available to ship by the date listed on the Purchase Order.
For air shipments only “available to ship” is defined as the cargo and documents receipt date. Vendor should ensure that the forwarder states" cargo
and documents received DATE” on the AWB. This applies to Purchase Orders placed as air as well as partial quantities requested to be air collect.
1. If a shipment is 4 to 8 days late,The vendor will air the shipment 50% prepaid 50% collect with 1-week late penalty.
2. If a shipment will be 9 or more days late, The vendor will air the shipment 100% prepaid. Plus, the number of weeks’ late penalty will be taken.
`;

  // Items from PI
  const items =
    pi?.items && Array.isArray(pi.items)
      ? pi.items
      : [
          {
            styleOrder: `${order.styleNo}`,
            description: `Men's 100% Cotton Knitted ${order.styleNo}`,
            shippingDate: format(new Date(), "yyyy-MM-dd"),
            qty: order.orderQty,
            rate: order.unitPrice,
            amount: order.totalValue,
          },
        ];

  const totalAmount = items.reduce(
    (sum: number, i: any) => sum + (i.amount || 0),
    0
  );

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    const result = await saveSC(order.id, formData);
    if (result?.error) toast.error(result.error);
    else toast.success(result.success);
    setIsLoading(false);
  };

  const handleDownloadLog = async () => {
      // Fire and forget (don't block the download)
      await logDocumentGeneration(order.id, "SC");
      toast.success("Download Logged");
  };

  if (!pi) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-slate-50 text-slate-500">
        <Handshake className="w-12 h-12 mb-4 text-slate-300" />
        <h3 className="text-lg font-medium">Proforma Invoice Required</h3>
        <p>
          Please generate the PI first. The Sales Contract will be based on the
          PI details.
        </p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-8 pb-32">
      {/* 1. HEADER */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between text-black rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Handshake className="w-5 h-5 text-blue-400" /> Sales Contract
          </CardTitle>
          <div className="flex gap-4 text-slate-900">
            <div className="flex flex-col">
              <Input
                name="scNumber"
                defaultValue={sc?.scNumber || `INO/PIO/${order.orderNo}`}
                className="w-48 font-mono font-bold bg-white"
                placeholder="SC Number"
              />
            </div>
            <div className="flex flex-col">
              <Input
                name="scDate"
                type="date"
                defaultValue={
                  sc?.scDate
                    ? format(new Date(sc.scDate), "yyyy-MM-dd")
                    : format(new Date(), "yyyy-MM-dd")
                }
                className="w-40 bg-white"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* VENDOR ADDRESS (With Dropdown) */}
          <div className="space-y-2 relative group">
            <div className="flex justify-between items-center">
              <Label className="text-xs uppercase text-slate-500 font-bold flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Address of Vendor
              </Label>
              {addresses.length > 0 && (
                <Select onValueChange={handleAddressChange}>
                  <SelectTrigger className="h-6 text-[10px] w-[130px] bg-slate-100 border-slate-200">
                    <SelectValue placeholder="Change Office" />
                  </SelectTrigger>
                  <SelectContent>
                    {addresses.map((a: any) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <Textarea
              name="vendorAddress"
              value={vendorAddress}
              onChange={(e) => setVendorAddress(e.target.value)}
              className="h-24 bg-slate-50"
            />
          </div>

          {/* CONSIGNEE */}
          <div className="space-y-2">
            <Label className="text-xs uppercase text-slate-500 font-bold">
              Address / Consignee
            </Label>
            <Textarea
              name="consignee"
              defaultValue={sc?.consignee || defaultBuyerInfo}
              className="h-24 bg-slate-50"
            />
          </div>

          {/* VENDOR BANK */}
          <div className="space-y-2">
            <Label className="text-xs uppercase text-slate-500 font-bold flex items-center gap-1">
              <Landmark className="w-3 h-3" /> Vendor&apos;s Bank
            </Label>
            <Textarea
              name="vendorBank"
              defaultValue={defaultVendorBank}
              className="h-24 bg-yellow-50 border-yellow-200"
            />
          </div>

          {/* BUYER BANK */}
          <div className="space-y-2">
            <Label className="text-xs uppercase text-slate-500 font-bold">
              LC/TT Opening Bank
            </Label>
            <Textarea
              name="buyerBank"
              defaultValue={sc?.buyerBank || ""}
              placeholder="To be advised..."
              className="h-24 bg-yellow-50 border-yellow-200"
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. ORDER DETAILS */}
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow className="bg-slate-100">
                <TableHead>Order No</TableHead>
                <TableHead className="w-[300px]">Item Description</TableHead>
                <TableHead>Article</TableHead>
                <TableHead className="text-right">Qty/Pcs</TableHead>
                <TableHead className="text-right">Unit Px</TableHead>
                <TableHead className="text-right">Amount (USD)</TableHead>
                <TableHead>Shipment Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item: any, idx: number) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">
                    {item.styleOrder.split("/")[1] || item.styleOrder}
                  </TableCell>
                  <TableCell className="text-sm">{item.description}</TableCell>
                  <TableCell className="text-xs">
                    {item.article || "Free"}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.qty.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">${item.rate}</TableCell>
                  <TableCell className="text-right font-bold">
                    ${item.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs">{item.shippingDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 3. TERMS */}
      <Card>
        <CardHeader>
          <CardTitle>Terms & Conditions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Terms of Delivery</Label>
            <Input
              name="deliveryTerm"
              defaultValue={sc?.deliveryTerm || '"FCA" BANGLADESH'}
            />
          </div>
          <div className="space-y-1">
            <Label>Mode of Shipment</Label>
            <Input
              name="shipmentMode"
              defaultValue={sc?.shipmentMode || "BY SEA / AIR"}
            />
          </div>
          <div className="space-y-1">
            <Label>Payment Term</Label>
            <Input
              name="paymentTerm"
              defaultValue={
                sc?.paymentTerm || "50% TT IN ADVANCE, 50% AFTER SHIPMENT"
              }
            />
          </div>
          <div className="space-y-1">
            <Label>Tolerance</Label>
            <Input name="tolerance" defaultValue={sc?.tolerance || "+-3%"} />
          </div>
          <div className="space-y-1">
            <Label>Partial Shipment</Label>
            <Input
              name="partialShipment"
              defaultValue={sc?.partialShipment || "ALLOWED"}
            />
          </div>
          <div className="space-y-1">
            <Label>Trans Shipment</Label>
            <Input
              name="transShipment"
              defaultValue={sc?.transShipment || "ALLOWED"}
            />
          </div>
          <div className="space-y-1">
            <Label>Port of Discharge</Label>
            <Input
              name="portDischarge"
              defaultValue={sc?.portDischarge || "HAKATA SEA PORT / FUKUOKA"}
            />
          </div>
          <div className="space-y-1">
            <Label>Port of Delivery (Final)</Label>
            <Input
              name="finalDest"
              defaultValue={sc?.finalDest || "HAKATA SEA PORT"}
            />
          </div>
          <div className="space-y-1">
            <Label>Port of Loading</Label>
            <Input
              name="portLoading"
              defaultValue={sc?.portLoading || "CHITTAGONG, BANGLADESH"}
            />
          </div>
          <div className="space-y-1">
            <Label>Latest Date of Shipment</Label>
            <Input
              name="latestShipDate"
              defaultValue={sc?.latestShipDate || "AS PER CHART"}
            />
          </div>
          <div className="space-y-1">
            <Label>Date/Place of Expiry</Label>
            <Input
              name="expiryDate"
              defaultValue={sc?.expiryDate || "15TH AUGUST-2025"}
            />
          </div>
          <div className="space-y-1">
            <Label>Negotiating Bank</Label>
            <Input
              name="negotiatingBank"
              defaultValue={sc?.negotiatingBank || "ANY BANK IN BANGLADESH"}
            />
          </div>
          <div className="space-y-1">
            <Label>Insurance</Label>
            <Input
              name="insurance"
              defaultValue={sc?.insurance || "TO BE COVERED BY ULTIMATE BUYER"}
            />
          </div>
          <div className="col-span-2 space-y-1">
            <Label>Special Condition</Label>
            <Input
              name="specialCondition"
              defaultValue={
                sc?.specialCondition ||
                "INSPECTION CERTIFICATE WILL BE ISSUED BY P.I OCEAN TRADE CO."
              }
            />
          </div>
          <div className="col-span-2 space-y-1 mt-4">
            <Label className="font-bold">Documents Required</Label>
            <Textarea
              name="docRequired"
              defaultValue={
                sc?.docRequired ||
                "COMMERCIAL INVOICE, PACKING LIST, DETAILED PACKING LIST, BILL OF LADING / HAWB , GSP, P.I. OCEAN TRADE CO., ISSUES IC, DOCUMENTS PRESENTATION: WITHIN 8 DAYS AFTER SHIPMENT DATE. LATE PRESENTATION OF DOCUMENTS IN THE AMOUNT OF USD250.00."
              }
              className="h-16"
            />
          </div>
          <div className="col-span-2 space-y-1">
            <Label className="font-bold">Late Delivery Clause</Label>
            <Textarea
              name="lateClause"
              defaultValue={sc?.lateClause || defaultLateClause}
              className="h-40 font-mono text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* 4. FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 p-4 bg-white border-t flex items-center justify-between z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="text-sm text-slate-500 pl-4">
          Contract Value:{" "}
          <span className="font-bold text-slate-900 text-lg">
            ${totalAmount.toLocaleString()}
          </span>
        </div>
        <div className="flex gap-3 pr-4">
          {isClient && sc ? (
            <div onClick={handleDownloadLog}>
              <PDFDownloadLink
                document={
                  <SCDocument order={order} pi={pi} sc={sc} settings={settings} />
                }
                fileName={`${sc.scNumber}.pdf`}
              >
                {({ loading }) => (
                  <Button type="button" variant="outline" disabled={loading}>
                    <Printer className="w-4 h-4 mr-2" />{" "}
                    {loading ? "Generating..." : "Download PDF"}
                  </Button>
                )}
              </PDFDownloadLink>
            </div>
          ) : (
            <Button type="button" variant="outline" disabled>
              <Printer className="w-4 h-4 mr-2" /> Save to Print
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-slate-900 hover:bg-slate-800 min-w-[150px]"
          >
            <Save className="w-4 h-4 mr-2" />{" "}
            {isLoading ? "Saving..." : "Save Contract"}
          </Button>
        </div>
      </div>
    </form>
  );
}
