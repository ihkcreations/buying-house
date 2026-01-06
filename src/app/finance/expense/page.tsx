import { db } from "@/lib/db";
import { protectPage } from "@/lib/protect";
import { ExpenseForm } from "@/components/finance/expense-form"; // We build this next
import { ExpenseList } from "@/components/finance/expense-list"; // We build this next
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function ExpenseEntryPage() {
  const user = await protectPage(["admin", "merchandiser", "commercial", "finance"]);

  // Fetch My Expenses
  const expenses = await db.expense.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { order: { select: { orderNo: true } } }
  });

  // Fetch Orders for Dropdown
  const orders = await db.order.findMany({
    where: { status: { not: "CLOSED" } },
    select: { id: true, orderNo: true, styleNo: true },
    orderBy: { updatedAt: "desc" },
    take: 50 // Limit to active ones
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">My Expenses</h1>
        <p className="text-slate-500 text-sm md:text-base">Submit travel, food, or sample costs.</p>
      </div>

      <Tabs defaultValue="new" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new">New Claim</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="new">
            <ExpenseForm orders={orders} />
        </TabsContent>

        <TabsContent value="history">
            <ExpenseList expenses={expenses} />
        </TabsContent>
      </Tabs>
    </div>
  );
}