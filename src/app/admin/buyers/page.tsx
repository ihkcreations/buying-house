import { db } from "@/lib/db";
import { BuyerClient } from "./client"; // We will make this next

export default async function ManageBuyersPage() {
  // Fetch data on the server
  const buyers = await db.buyer.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Manage Buyers</h1>
      </div>
      
      {/* We pass data to the client component to handle the UI/Dialog */}
      <BuyerClient initialBuyers={buyers} />
    </div>
  );
}