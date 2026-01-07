import { db } from "@/lib/db";
import { protectPage } from "@/lib/protect";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, ArrowRight, SearchX } from "lucide-react";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { OrderFilters } from "@/components/orders/order-filters"; // <--- Import Filters

export default async function DocumentMatrixPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await protectPage(["admin", "commercial"]);

  const sp = await searchParams;
  const query = (sp.q as string) || "";
  const buyerId = (sp.buyer as string) || "all";
  const statusFilter = (sp.status as string) || "all"; 

  // --- QUERY BUILDER ---
  const where: any = { AND: [] };
  if (query) where.AND.push({
      OR: [{ orderNo: { contains: query, mode: "insensitive" } }, { styleNo: { contains: query, mode: "insensitive" } }]
  });
  if (buyerId !== "all") where.AND.push({ buyerId });
  
  if (statusFilter === "active") where.AND.push({ status: { notIn: ["SHIPPED", "CLOSED", "OCS_FINALIZED"] } });
  else if (statusFilter === "completed") where.AND.push({ status: { in: ["SHIPPED", "CLOSED", "OCS_FINALIZED"] } });
  else if (statusFilter !== "all") where.AND.push({ status: statusFilter });

  if (statusFilter === "active" || statusFilter === "all") where.AND.push({ status: { not: "PENDING" } });

  // Fetch Data
  const [orders, buyers] = await Promise.all([
    db.order.findMany({
      where,
      include: {
        buyer: true,
        proformaInvoice: true,
        salesContract: true,
        commercialDocs: true,
      },
      orderBy: { updatedAt: "desc" }
    }),
    db.buyer.findMany({ orderBy: { name: "asc" } })
  ]);

  const StatusCell = ({ status, label }: { status: "DONE" | "PENDING", label: string }) => {
      const colorClass = status === "DONE" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400";
      const Icon = status === "DONE" ? CheckCircle2 : Clock;
      return (
          <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${colorClass}`}>
                        <Icon className="w-4 h-4" />
                    </div>
                </TooltipTrigger>
                <TooltipContent><p>{label}: {status}</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
      );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Document Status Matrix</h1>
        <p className="text-slate-500">Overview of all required export documentation per order.</p>
      </div>

      {/* FILTERS */}
      <OrderFilters buyers={buyers} />

      <Card className="border-none shadow-md">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[1200px]">
            <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-200">
                <TableHead className="w-[120px] font-bold text-slate-700">Order</TableHead>
                <TableHead className="w-[180px] font-bold text-slate-700">Buyer</TableHead>
                
                {/* MATRIX COLUMNS */}
                <TableHead className="text-center font-bold w-[60px]">PO</TableHead>
                <TableHead className="text-center font-bold w-[60px]">PI</TableHead>
                <TableHead className="text-center font-bold w-[60px]">SC</TableHead>
                <TableHead className="text-center font-bold w-[60px]">L/C</TableHead>
                <TableHead className="text-center font-bold w-[60px]">UD</TableHead>
                <TableHead className="text-center font-bold w-[60px]">Pack.</TableHead>
                <TableHead className="text-center font-bold w-[60px]">Inv.</TableHead>
                <TableHead className="text-center font-bold w-[70px]">Dm. B/L</TableHead>
                <TableHead className="text-center font-bold w-[70px]">Og. B/L</TableHead>
                <TableHead className="text-center font-bold w-[60px]">GSP</TableHead>
                
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow><TableCell colSpan={13} className="text-center py-12 text-slate-400 italic"><SearchX className="w-8 h-8 opacity-50 mx-auto mb-2"/>No orders found.</TableCell></TableRow>
              ) : (
                orders.map((order) => {
                  const docs = order.commercialDocs || [];
                  const hasPI = !!order.proformaInvoice ? "DONE" : "PENDING";
                  const hasSC = !!order.salesContract ? "DONE" : "PENDING";
                  const hasPO = docs.some(d => d.name.includes("Purchase Order") || d.name.includes("P.O")) ? "DONE" : "PENDING";
                  const hasLC = docs.some(d => d.name.includes("L/C")) ? "DONE" : "PENDING";
                  const hasUD = docs.some(d => d.name.includes("UD") || d.name.includes("Utilization")) ? "DONE" : "PENDING";
                  const hasPL = docs.some(d => d.name.includes("Packing List")) ? "DONE" : "PENDING";
                  const hasCI = docs.some(d => d.name.includes("Commercial Invoice")) ? "DONE" : "PENDING";
                  const hasDummyBL = docs.some(d => d.name.toLowerCase().includes("dummy")) ? "DONE" : "PENDING";
                  const hasOrgBL = docs.some(d => (d.name.includes("Bill of Lading") || d.name.includes("B/L")) && !d.name.toLowerCase().includes("dummy")) ? "DONE" : "PENDING";
                  const hasGSP = docs.some(d => d.name.includes("GSP")) ? "DONE" : "PENDING";

                  return (
                    <TableRow key={order.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="font-medium text-blue-700">{order.orderNo}</TableCell>
                      <TableCell>
                          <div className="font-medium truncate max-w-[150px]" title={order.buyer.name}>{order.buyer.name}</div>
                          <div className="text-[10px] text-slate-400">{order.styleNo}</div>
                      </TableCell>
                      
                      <TableCell className="text-center"><StatusCell status={hasPO} label="PO" /></TableCell>
                      <TableCell className="text-center"><StatusCell status={hasPI} label="PI" /></TableCell>
                      <TableCell className="text-center"><StatusCell status={hasSC} label="SC" /></TableCell>
                      <TableCell className="text-center"><StatusCell status={hasLC} label="L/C" /></TableCell>
                      <TableCell className="text-center"><StatusCell status={hasUD} label="UD" /></TableCell>
                      <TableCell className="text-center"><StatusCell status={hasPL} label="Packing" /></TableCell>
                      <TableCell className="text-center"><StatusCell status={hasCI} label="Invoice" /></TableCell>
                      <TableCell className="text-center"><StatusCell status={hasDummyBL} label="Dummy BL" /></TableCell>
                      <TableCell className="text-center"><StatusCell status={hasOrgBL} label="Original BL" /></TableCell>
                      <TableCell className="text-center"><StatusCell status={hasGSP} label="GSP" /></TableCell>

                      <TableCell className="text-right">
                        <Link href={`/commercial/orders/${order.id}?tab=docs`}>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                             <ArrowRight className="w-4 h-4 text-slate-500" />
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