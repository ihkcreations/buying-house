import Link from "next/link";
import { FileText, Handshake, Landmark, ArrowRight, CalendarClock, AlertCircle, SearchX } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { protectPage } from "@/lib/protect";
import { format, differenceInDays } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { OrderFilters } from "@/components/orders/order-filters"; // <--- Import Filters

export default async function CommercialDashboard({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  await protectPage(["admin", "commercial"]);

  const sp = await searchParams;
  const query = (sp.q as string) || "";
  const buyerId = (sp.buyer as string) || "all";
  const statusFilter = (sp.status as string) || "all"; 

  // --- BUILD QUERY (Same logic as Merchandiser) ---
  const where: any = { AND: [] };

  // 1. Text Search
  if (query) {
    where.AND.push({
      OR: [
        { orderNo: { contains: query, mode: "insensitive" } },
        { styleNo: { contains: query, mode: "insensitive" } },
      ]
    });
  }

  // 2. Buyer Filter
  if (buyerId !== "all") where.AND.push({ buyerId });

  // 3. Status Filter
  if (statusFilter === "active") {
      where.AND.push({ status: { notIn: ["SHIPPED", "CLOSED", "OCS_FINALIZED"] } });
  } else if (statusFilter === "completed") {
      where.AND.push({ status: { in: ["SHIPPED", "CLOSED", "OCS_FINALIZED"] } });
  } else if (statusFilter !== "all") {
      where.AND.push({ status: statusFilter });
  }
  // If "all", no filter added

  // 4. Exclude PENDING (Commercial shouldn't see draft orders)
  // Note: If user specifically filters for "PENDING", we allow it, otherwise exclude.
  if (statusFilter === "active" || statusFilter === "all") {
      where.AND.push({ status: { not: "PENDING" } });
  }

  // Fetch Data
  const [orders, buyers] = await Promise.all([
    db.order.findMany({
      where,
      include: {
        buyer: true,
        proformaInvoice: true,
        salesContract: true,
        commercialDocs: true,
        timeAction: true,
      },
      orderBy: { updatedAt: "desc" }
    }),
    db.buyer.findMany({ orderBy: { name: "asc" } })
  ]);

  // Helper Icon
  const StatusIcon = ({ status, label }: { status: boolean, label: string }) => (
      <TooltipProvider>
          <Tooltip>
              <TooltipTrigger>
                  <div className={`p-1.5 rounded-full border ${status ? "bg-green-100 border-green-200 text-green-700" : "bg-slate-50 border-slate-200 text-slate-300"}`}>
                      {label === "PI" ? <FileText className="w-4 h-4" /> : 
                       label === "SC" ? <Handshake className="w-4 h-4" /> : 
                       <Landmark className="w-4 h-4" />}
                  </div>
              </TooltipTrigger>
              <TooltipContent><p>{label}: {status ? "Ready" : "Pending"}</p></TooltipContent>
          </Tooltip>
      </TooltipProvider>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Commercial Order List</h1>
            <p className="text-slate-500">Track documentation, banking, and shipment deadlines.</p>
        </div>
      </div>

      {/* FILTERS */}
      <OrderFilters buyers={buyers} />

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
                    <div className="flex flex-col items-center gap-2">
                        <SearchX className="w-8 h-8 opacity-50" />
                        No orders found matching criteria.
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => {
                  const hasPI = !!order.proformaInvoice;
                  const hasSC = !!order.salesContract;
                  const hasLC = order.commercialDocs.some(d => d.name.includes("Master L/C") || d.name.includes("L/C"));
                  
                  const shipDate = order.timeAction?.shipmentPlan ? new Date(order.timeAction.shipmentPlan) : null;
                  const daysLeft = shipDate ? differenceInDays(shipDate, new Date()) : null;
                  const isLate = daysLeft !== null && daysLeft < 0;

                  return (
                    <TableRow key={order.id} className="group hover:bg-slate-50 transition-colors">
                      <TableCell className="font-medium text-blue-700">{order.orderNo}</TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-900 truncate max-w-[180px]" title={order.buyer.name}>{order.buyer.name}</div>
                        <div className="text-xs text-slate-500">{order.styleNo}</div>
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium text-slate-700">
                        ${order.totalValue.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        {shipDate ? (
                            <div className="flex flex-col items-center">
                                <span className={`text-sm font-bold ${isLate ? "text-red-600" : "text-slate-600"}`}>
                                    {format(shipDate, "dd MMM yyyy")}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                    {isLate ? `${Math.abs(daysLeft!)} days late` : `${daysLeft} days left`}
                                </span>
                            </div>
                        ) : (<span className="text-xs text-slate-400">-</span>)}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                            <StatusIcon status={hasPI} label="PI" />
                            <StatusIcon status={hasSC} label="SC" />
                            <StatusIcon status={hasLC} label="L/C" />
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                         {order.status === "OCS_FINALIZED" ? <Badge variant="outline" className="bg-slate-900 text-white">Closed</Badge> : 
                          order.status === "SHIPPED" ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Shipped</Badge> : 
                          hasLC ? <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">L/C Active</Badge> : 
                          <Badge variant="outline" className="text-slate-500">Processing</Badge>}
                      </TableCell>

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