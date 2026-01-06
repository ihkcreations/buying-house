import { db } from "@/lib/db";
import { protectPage } from "@/lib/protect";
import { ExpenseForm } from "@/components/finance/expense-form"; // We build this next
import { ExpenseList } from "@/components/finance/expense-list"; // We build this next
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseChart } from "@/components/finance/expense-chart";
import { ExpenseFilter } from "@/components/finance/expense-filter";

export default async function ExpenseEntryPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const user = await protectPage(["admin", "merchandiser", "commercial", "finance"]);
  const isAdmin = user.role === "admin";

  const sp = await searchParams;
  const q = (sp.q as string) || "";
  const monthFilter = sp.month ? parseInt(sp.month as string) : undefined;

  // --- BUILD QUERY ---
  const where: any = {
      // Basic Filter: User sees their own, Admin sees all? 
      // Usually "My Expenses" page shows only mine. 
      // Admin dashboard shows all. Let's assume this page is "My Expenses".
      // If you want Admin to see everyone here, remove this line for Admin.
      // userId: user.role === "admin" ? undefined : user.id, 
      
      AND: []
  };

  if (q) {
      where.AND.push({
          OR: [
              { description: { contains: q, mode: "insensitive" } },
              { category: { contains: q, mode: "insensitive" } },
              { userName: { contains: q, mode: "insensitive" } } // Find by person
          ]
      });
  }

  if (monthFilter !== undefined && !isNaN(monthFilter)) {
      const start = new Date(new Date().getFullYear(), monthFilter, 1);
      const end = new Date(new Date().getFullYear(), monthFilter + 1, 0);
      where.AND.push({ date: { gte: start, lte: end } });
  }

  const expenses = await db.expense.findMany({
    where,
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

  // Process Data for Chart (Group by Month - only BDT for simplicity in chart)
  const monthlyData = new Array(12).fill(0).map((_, i) => ({
    name: new Date(0, i).toLocaleString('en-US', { month: 'short' }),
    total: 0
  }));

  expenses.forEach(e => {
      // Convert USD to BDT approx for chart view if needed, or filter only BDT
      if (e.currency === "BDT") {
          const month = new Date(e.date).getMonth();
          monthlyData[month].total += e.amount;
      }
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Expenses</h1>
        <p className="text-slate-500 text-sm md:text-base">Submit travel, food, or sample costs.</p>
      </div>

      <Tabs defaultValue="new" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new">New Expense Claim</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="new">
            <ExpenseForm orders={orders} />
        </TabsContent>

        <TabsContent value="history">
            {/* The New Chart */}
            <ExpenseChart data={monthlyData} />
            <ExpenseFilter />
            
            {/* The New List */}
            <ExpenseList expenses={expenses} isAdmin={isAdmin} />
        </TabsContent>
      </Tabs>
    </div>
  );
}