import { db } from "@/lib/db";
import { FactoryClient } from "./client";
import { protectPage } from "@/lib/protect";

export default async function ManageFactoriesPage() {
  const user = await protectPage(["admin", "merchandiser", "commercial"]);

  const factories = await db.factory.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Manage Factories</h1>
      </div>
      <FactoryClient initialFactories={factories} userRole={user.role} />
    </div>
  );
}