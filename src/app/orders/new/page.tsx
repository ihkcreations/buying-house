import { db } from "@/lib/db";
import { OrderForm } from "./order-form";
import { protectPage } from "@/lib/protect";

export default async function NewOrderPage() {
  await protectPage(["admin", "merchandiser", "super_admin"]);

  const buyers = await db.buyer.findMany({
    orderBy: { name: "asc" },
  });

  // 1. Fetch the absolute last created order
  const lastOrder = await db.order.findFirst({
    orderBy: { createdAt: "desc" },
    select: { orderNo: true }
  });

  // 2. Calculate Next Number
  let suggestedOrderNo = "1001"; // Default start
  
  if (lastOrder?.orderNo) {
      // Regex: Extract the numeric part at the end of the string
      const match = lastOrder.orderNo.match(/(\d+)$/);
      
      if (match) {
          const lastNum = parseInt(match[0]);
          const nextNum = lastNum + 1;
          
          // Preserve zero-padding if it exists (e.g., "005" -> "006")
          const paddedNextNum = String(nextNum).padStart(match[0].length, '0');
          
          // Reconstruct string (e.g., "PO-105" -> "PO-106")
          const prefix = lastOrder.orderNo.substring(0, match.index);
          suggestedOrderNo = `${prefix}${paddedNextNum}`;
      }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Order</h1>
        <p className="text-slate-500">Enter basic details and size breakdown.</p>
      </div>
      
      {/* 3. Pass it to the Form */}
      <OrderForm buyers={buyers} suggestedOrderNo={suggestedOrderNo} />
    </div>
  );
}