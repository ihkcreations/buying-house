import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { OrderTable } from "./order-table"; // We will create this next

export default async function OngoingOrdersPage() {
  // 1. Fetch Orders with Buyer details
  // sort by newest first
  const orders = await db.order.findMany({
    include: {
      buyer: true, 
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ongoing Orders</h1>
          <p className="text-slate-500">Manage active orders and track progress.</p>
        </div>
        <Link href="/orders/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> Create New Order
          </Button>
        </Link>
      </div>

      {/* The Data Table */}
      <OrderTable initialOrders={orders} />
    </div>
  );
}