import Link from "next/link";
import { FileText, Handshake, Landmark, ArrowRight, CalendarClock, AlertCircle } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { protectPage } from "@/lib/protect";
import { format, differenceInDays } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default async function CommercialDashboard() {
  await protectPage(["admin", "commercial"]);

  // 1. Fetch Orders with ALL Commercial Relations
  const orders = await db.order.findMany({
    where: {
      status: { not: "PENDING" } // Only show orders that have passed initial entry
    },
    include: {
      buyer: true,
      proformaInvoice: true, // Check PI
      salesContract: true,   // Check SC
      commercialDocs: true,  // Check L/C
      timeAction: true,      // Check Shipment Date
    },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Commercial Dashboard</h1>
            <p className="text-slate-500">Track documentation, banking, and shipment deadlines.</p>
        </div>
      </div>

      <Card className="border-none shadow-md">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-white">
                <TableHead className="w-[150px]">Order No</TableHead>
                <TableHead className="w-[200px]">Buyer / Style</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-center w-[180px]">Shipment Deadline</TableHead>
                <TableHead className="text-center">Doc Status</TableHead>
                <TableHead className="text-center">Export Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-400 italic">
                    No active files found. Wait for Merchandising to create orders.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => {
                  
                  // --- STATUS LOGIC ---
                  const hasPI = !!order.proformaInvoice;
                  const hasSC = !!order.salesContract;
                  // Check if any doc name contains "Master L/C"
                  const hasLC = order.commercialDocs.some(d => d.name.includes("Master L/C") || d.name.includes("L/C"));
                  
                  // Shipment Date Logic
                  const shipDate = order.timeAction?.shipmentPlan ? new Date(order.timeAction.shipmentPlan) : null;
                  const daysLeft = shipDate ? differenceInDays(shipDate, new Date()) : null;
                  const isUrgent = daysLeft !== null && daysLeft < 15 && daysLeft >= 0;
                  const isLate = daysLeft !== null && daysLeft < 0;

                  return (
                    <TableRow key={order.id} className="group hover:bg-slate-50 transition-colors">
                      
                      {/* 1. Order Info */}
                      <TableCell className="font-medium text-blue-700">
                        {order.orderNo}
                      </TableCell>
                      
                      {/* 2. Buyer Info */}
                      <TableCell>
                        <div className="font-medium text-slate-900">{order.buyer.name}</div>
                        <div className="text-xs text-slate-500">{order.styleNo}</div>
                      </TableCell>
                      
                      {/* 3. Value */}
                      <TableCell className="text-right font-mono font-medium text-slate-700">
                        ${order.totalValue.toLocaleString()}
                      </TableCell>

                      {/* 4. Shipment Deadline (Critical for Commercial) */}
                      <TableCell className="text-center">
                        {shipDate ? (
                            <div className="flex flex-col items-center">
                                <span className={`text-sm font-bold ${isLate ? "text-red-600" : isUrgent ? "text-orange-600" : "text-slate-600"}`}>
                                    {format(shipDate, "dd MMM yyyy")}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                    {isLate ? `${Math.abs(daysLeft!)} days late` : `${daysLeft} days left`}
                                </span>
                            </div>
                        ) : (
                            <span className="text-xs text-slate-400">-</span>
                        )}
                      </TableCell>
                      
                      {/* 5. DOC STATUS TRACKER (Icons) */}
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                            <TooltipProvider>
                                {/* PI Status */}
                                <Tooltip>
                                    <TooltipTrigger>
                                        <div className={`p-1.5 rounded-full border ${hasPI ? "bg-green-100 border-green-200 text-green-700" : "bg-slate-50 border-slate-200 text-slate-300"}`}>
                                            <FileText className="w-4 h-4" />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Proforma Invoice: {hasPI ? "Ready" : "Pending"}</p></TooltipContent>
                                </Tooltip>

                                {/* SC Status */}
                                <Tooltip>
                                    <TooltipTrigger>
                                        <div className={`p-1.5 rounded-full border ${hasSC ? "bg-blue-100 border-blue-200 text-blue-700" : "bg-slate-50 border-slate-200 text-slate-300"}`}>
                                            <Handshake className="w-4 h-4" />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Sales Contract: {hasSC ? "Signed" : "Pending"}</p></TooltipContent>
                                </Tooltip>

                                {/* LC Status */}
                                <Tooltip>
                                    <TooltipTrigger>
                                        <div className={`p-1.5 rounded-full border ${hasLC ? "bg-purple-100 border-purple-200 text-purple-700" : "bg-slate-50 border-slate-200 text-slate-300"}`}>
                                            <Landmark className="w-4 h-4" />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Master L/C: {hasLC ? "Received" : "Waiting"}</p></TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                      </TableCell>

                      {/* 6. Overall Status Badge */}
                      <TableCell className="text-center">
                         {order.status === "OCS_FINALIZED" ? (
                             <Badge variant="outline" className="bg-slate-900 text-white">Closed</Badge>
                         ) : order.status === "SHIPPED" ? (
                             <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Shipped</Badge>
                         ) : hasLC ? (
                             <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">L/C Active</Badge>
                         ) : hasPI ? (
                             <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">PI Sent</Badge>
                         ) : (
                             <Badge variant="outline" className="text-slate-500">New</Badge>
                         )}
                      </TableCell>

                      {/* 7. Action */}
                      <TableCell className="text-right">
                        <Link href={`/commercial/orders/${order.id}`}>
                          <Button size="sm" variant="ghost" className="text-slate-500 hover:text-blue-700 hover:bg-blue-50">
                             Manage <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}