import Link from "next/link";
import { FileText, DollarSign, Ship } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";

import { protectPage } from "@/lib/protect";

export default async function CommercialDashboard() {
  await protectPage(["commercial"]); 
  
  // Fetch orders, but we might want to filter only those "Ready for Commercial"
  // e.g., where Status is NOT "PENDING"
  const orders = await db.order.findMany({
    where: {
      status: { not: "PENDING" } // Commercial only sees orders after Merch creates them
    },
    include: {
      buyer: true,
      proformaInvoice: true, // Include PI to check status
    },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Commercial Department</h1>
        <p className="text-slate-500">Manage PIs, LCs, and Shipping Documents.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order No</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
                <TableHead className="text-center">PI Status</TableHead>
                <TableHead className="text-center">LC Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">No active orders available for Commercial.</TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id} className="group">
                    <TableCell className="font-medium text-blue-600">{order.orderNo}</TableCell>
                    <TableCell>{order.buyer.name}</TableCell>
                    <TableCell className="text-right font-mono">${order.totalValue.toLocaleString()}</TableCell>
                    
                    {/* PI Status Column */}
                    <TableCell className="text-center">
                      {order.proformaInvoice ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Generated</Badge>
                      ) : (
                        <Badge variant="outline" className="text-slate-500">Pending</Badge>
                      )}
                    </TableCell>

                    {/* LC Status Column (Placeholder for now) */}
                    <TableCell className="text-center">
                       <Badge variant="outline" className="text-slate-500">Not Received</Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <Link href={`/commercial/orders/${order.id}`}>
                        <Button size="sm" variant="outline" className="gap-2">
                           <FileText className="w-4 h-4" /> Manage Docs
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}