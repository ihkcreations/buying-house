import { db } from "@/lib/db";
import { protectPage } from "@/lib/protect";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle2, Clock, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default async function DocumentMatrixPage() {
  await protectPage(["admin", "commercial"]);

  // Fetch all orders with docs
  const orders = await db.order.findMany({
    where: { status: { not: "PENDING" } },
    include: {
      buyer: true,
      proformaInvoice: true,
      salesContract: true,
      commercialDocs: true,
    },
    orderBy: { updatedAt: "desc" }
  });

  // Helper Component for Status Cell
  const StatusCell = ({ status, label }: { status: "DONE" | "PENDING" | "MISSING", label: string }) => {
      let colorClass = "bg-slate-100 text-slate-400"; // Pending
      let Icon = Clock;

      if (status === "DONE") {
          colorClass = "bg-green-100 text-green-700";
          Icon = CheckCircle2;
      } else if (status === "MISSING") {
          colorClass = "bg-red-50 text-red-400";
          Icon = AlertCircle;
      }

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

      <Card className="border-none shadow-md">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-200">
                <TableHead className="w-[120px] font-bold text-slate-700">Order</TableHead>
                <TableHead className="w-[180px] font-bold text-slate-700">Buyer</TableHead>
                
                {/* THE MATRIX COLUMNS */}
                <TableHead className="text-center font-bold w-[80px]">PI</TableHead>
                <TableHead className="text-center font-bold w-[80px]">SC</TableHead>
                <TableHead className="text-center font-bold w-[80px]">L/C</TableHead>
                <TableHead className="text-center font-bold w-[80px]">UD</TableHead>
                <TableHead className="text-center font-bold w-[80px]">Packing</TableHead>
                <TableHead className="text-center font-bold w-[80px]">Invoice</TableHead>
                <TableHead className="text-center font-bold w-[80px]">B/L</TableHead>
                
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow><TableCell colSpan={10} className="text-center py-12 text-slate-400">No active orders.</TableCell></TableRow>
              ) : (
                orders.map((order) => {
                  
                  // Check status for each doc type
                  const hasPI = !!order.proformaInvoice ? "DONE" : "PENDING";
                  const hasSC = !!order.salesContract ? "DONE" : "PENDING";
                  
                  // Check Uploaded Files by Name Match
                  const docs = order.commercialDocs || [];
                  const hasLC = docs.some(d => d.name.includes("L/C")) ? "DONE" : "PENDING";
                  const hasUD = docs.some(d => d.name.includes("UD") || d.name.includes("Utilization")) ? "DONE" : "PENDING";
                  const hasPL = docs.some(d => d.name.includes("Packing List")) ? "DONE" : "PENDING";
                  const hasCI = docs.some(d => d.name.includes("Commercial Invoice")) ? "DONE" : "PENDING";
                  const hasBL = docs.some(d => d.name.includes("Bill of Lading") || d.name.includes("B/L")) ? "DONE" : "PENDING";

                  return (
                    <TableRow key={order.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="font-medium text-blue-700">{order.orderNo}</TableCell>
                      <TableCell>
                          <div className="font-medium">{order.buyer.name}</div>
                          <div className="text-[10px] text-slate-400">{order.styleNo}</div>
                      </TableCell>
                      
                      {/* MATRIX CELLS */}
                      <TableCell className="text-center"><StatusCell status={hasPI} label="Proforma" /></TableCell>
                      <TableCell className="text-center"><StatusCell status={hasSC} label="Contract" /></TableCell>
                      <TableCell className="text-center"><StatusCell status={hasLC} label="Master L/C" /></TableCell>
                      <TableCell className="text-center"><StatusCell status={hasUD} label="Utilization Decl." /></TableCell>
                      <TableCell className="text-center"><StatusCell status={hasPL} label="Packing List" /></TableCell>
                      <TableCell className="text-center"><StatusCell status={hasCI} label="Comm. Invoice" /></TableCell>
                      <TableCell className="text-center"><StatusCell status={hasBL} label="Bill of Lading" /></TableCell>

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