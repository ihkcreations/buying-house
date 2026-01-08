import { db } from "@/lib/db";
import { protectPage } from "@/lib/protect";
import { ExpenseForm } from "@/components/finance/expense-form"; // We build this next
import { ExpenseList } from "@/components/finance/expense-list"; // We build this next
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseChart } from "@/components/finance/expense-chart";
import { ExpenseFilter } from "@/components/finance/expense-filter";
import { getExchangeRate } from "@/lib/currency";

export default async function ExpenseEntryPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const user = await protectPage(["super_admin", "admin", "merchandiser", "commercial", "finance"]);
  const isAdmin = ["super_admin", "admin"].includes(user.role);

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

  // --- CHART DATA PROCESSING (Dual Currency) ---
  const monthlyData = new Array(12).fill(0).map((_, i) => ({
    name: new Date(0, i).toLocaleString('en-US', { month: 'short' }),
    totalBDT: 0, // Consolidated Value in BDT
    totalUSD: 0  // Consolidated Value in USD
  }));

  expenses.forEach(e => {
      const m = new Date(e.date).getMonth();
      let rate = e.exchangeRate;
      if (e.currency === "USD" && rate <= 1) {
          rate = 120; // Force default for old data
      }

      // Calculate Value in BDT
      let valInBDT = 0;
      if (e.currency === "BDT") {
          valInBDT = e.amount;
      } else {
          valInBDT = e.amount * rate; // Convert USD to BDT
      }

      // Calculate Value in USD
      let valInUSD = 0;
      if (e.currency === "USD") {
          valInUSD = e.amount;
      } else {
          valInUSD = e.amount / rate; // Convert BDT to USD
      }

      // Add to totals
      if (monthlyData[m]) {
          monthlyData[m].totalBDT += Math.round(valInBDT);
          monthlyData[m].totalUSD += valInUSD;
      }
  });
  const rate = await getExchangeRate();


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
            <ExpenseForm orders={orders} currentRate={rate} />
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