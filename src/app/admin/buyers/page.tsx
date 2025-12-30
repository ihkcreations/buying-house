import { db } from "@/lib/db";
import { BuyerClient } from "./client";
import { protectPage } from "@/lib/protect";

export default async function ManageBuyersPage() {
  // Allow these roles to enter
  const user = await protectPage(["admin", "merchandiser", "commercial"]);

  const buyers = await db.buyer.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Manage Buyers</h1>
      </div>
      {/* Pass user role to handle UI logic */}
      <BuyerClient initialBuyers={buyers} userRole={user.role} />
    </div>
  );
}