import Link from "next/link";
import { Plus, SearchX } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { OrderTable } from "./order-table";
import { OrderFilters } from "@/components/orders/order-filters";
import { protectPage } from "@/lib/protect";

export default async function OrderListPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await protectPage(["admin", "merchandiser"]);

  const sp = await searchParams;
  const query = (sp.q as string) || "";
  const buyerId = (sp.buyer as string) || "all";
  // Default to 'all' if nothing is in URL
  const statusFilter = (sp.status as string) || "all"; 

  // --- BUILD QUERY ---
  const where: any = { AND: [] };

  // 1. Text Search
  if (query) {
    where.AND.push({
      OR: [
        { orderNo: { contains: query, mode: "insensitive" } },
        { styleNo: { contains: query, mode: "insensitive" } },
        { season: { contains: query, mode: "insensitive" } },
      ]
    });
  }

  // 2. Buyer Filter
  if (buyerId !== "all") {
    where.AND.push({ buyerId });
  }

  // 3. Status Filter (SIMPLIFIED & ROBUST)
  if (statusFilter === "all") {
      // Show EVERYTHING. Do not add any status constraints to 'where'.
      // This ensures both PENDING and OCS_FINALIZED appear.
  } 
  else if (statusFilter === "completed") {
      // Show ONLY Completed
      where.AND.push({
          status: { in: ["SHIPPED", "CLOSED", "OCS_FINALIZED"] }
      });
  } 
  else if (statusFilter === "active") {
      // Show ONLY Active (Hide Completed)
      where.AND.push({
          status: { notIn: ["SHIPPED", "CLOSED", "OCS_FINALIZED"] }
      });
  } 
  else {
      // Specific Status (e.g. "PENDING")
      where.AND.push({ status: statusFilter });
  }

  // 4. Fetch Data
  const [orders, buyers] = await Promise.all([
    db.order.findMany({
      where,
      include: { buyer: true },
      orderBy: { updatedAt: "desc" },
    }),
    db.buyer.findMany({ orderBy: { name: "asc" } })
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
          <p className="text-slate-500">View and manage all purchase orders.</p>
        </div>
        <Link href="/orders/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> Create New Order
          </Button>
        </Link>
      </div>

      <OrderFilters buyers={buyers} />

      {orders.length > 0 ? (
          <OrderTable initialOrders={orders} />
      ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 border rounded-lg text-slate-500">
              <SearchX className="h-10 w-10 mb-4 opacity-20" />
              <p className="text-lg font-medium">No orders found.</p>
              <p className="text-sm">Try adjusting your filters (Current Status: {statusFilter})</p>
          </div>
      )}
    </div>
  );
}