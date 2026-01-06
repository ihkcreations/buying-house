import { db } from "@/lib/db";
import { protectPage } from "@/lib/protect";
import { FinanceDashboard } from "@/components/finance/finance-dashboard";

export default async function BusinessOverviewPage() {
  await protectPage(["admin", "merchandiser", "commercial", "finance"]);

  // 1. Fetch Completed Orders (Revenue)
  const orders = await db.order.findMany({
    where: { status: { in: ["SHIPPED", "CLOSED", "OCS_FINALIZED"] } },
    select: { totalValue: true, createdAt: true }
  });

  // 2. Fetch Approved Expenses
  const expenses = await db.expense.findMany({
    where: { status: "APPROVED" },
    select: { amount: true, date: true, category: true, currency: true }
  });

  // --- PROCESSING DATA ---
  
  // A. Summary Totals
  const revenueTotal = orders.reduce((sum, o) => sum + o.totalValue, 0);
  
  // Normalize Expense to USD (Simple assumption: 1 USD = 120 BDT)
  // In a real app, use a currency API or setting
  const EXCHANGE_RATE = 120; 
  
  const expenseTotal = expenses.reduce((sum, e) => {
      const val = e.currency === "BDT" ? e.amount / EXCHANGE_RATE : e.amount;
      return sum + val;
  }, 0);

  const summary = {
      revenue: revenueTotal,
      expenses: Math.round(expenseTotal),
      net: Math.round(revenueTotal - expenseTotal)
  };

  // B. Monthly P&L
  const monthlyData = new Array(12).fill(0).map((_, i) => ({
    name: new Date(0, i).toLocaleString('en-US', { month: 'short' }),
    income: 0,
    expense: 0
  }));

  orders.forEach(o => {
      const m = new Date(o.createdAt).getMonth();
      monthlyData[m].income += o.totalValue;
  });

  expenses.forEach(e => {
      const m = new Date(e.date).getMonth();
      const val = e.currency === "BDT" ? e.amount / EXCHANGE_RATE : e.amount;
      monthlyData[m].expense += Math.round(val);
  });

  // C. Category Breakdown
  const catMap: Record<string, number> = {};
  expenses.forEach(e => {
      const val = e.currency === "BDT" ? e.amount / EXCHANGE_RATE : e.amount;
      catMap[e.category] = (catMap[e.category] || 0) + val;
  });
  
  const categoryData = Object.keys(catMap).map(key => ({
      name: key,
      value: Math.round(catMap[key])
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Business Overview</h1>
        <p className="text-slate-500">Financial health, liquidity, and expense analysis.</p>
      </div>

      <FinanceDashboard 
        summary={summary} 
        monthlyData={monthlyData} 
        categoryData={categoryData} 
      />
    </div>
  );
}