import { db } from "@/lib/db";
import { OrderForm } from "./order-form";
import { protectPage } from "@/lib/protect";

export default async function NewOrderPage() {
  await protectPage(["merchandiser"]); 
  
  // Fetch Buyers for the dropdown
  const buyers = await db.buyer.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Order</h1>
        <p className="text-slate-500">Enter basic details and size breakdown.</p>
      </div>
      
      {/* Pass buyers to the Client Form */}
      <OrderForm buyers={buyers} />
    </div>
  );
}