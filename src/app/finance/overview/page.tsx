import { db } from "@/lib/db";
import { protectPage } from "@/lib/protect";
import { FinanceDashboard } from "@/components/finance/finance-dashboard";

export default async function BusinessOverviewPage() {
  await protectPage(["admin"]);

  // 1. Fetch Completed Orders (Revenue - Always in USD)
  const orders = await db.order.findMany({
    where: { status: { in: ["SHIPPED", "CLOSED", "OCS_FINALIZED"] } },
    select: { totalValue: true, createdAt: true }
  });

  // 2. Fetch Approved Expenses (With Historical Rates)
  const expenses = await db.expense.findMany({
    where: { status: "APPROVED" },
    select: { 
        amount: true, 
        date: true, 
        category: true, 
        currency: true, 
        exchangeRate: true // <--- CRITICAL
    }
  });

  // --- PROCESSING DATA ---
  
  // A. Summary Totals
  const revenueTotal = orders.reduce((sum, o) => sum + o.totalValue, 0);
  
  // Calculate Total Expense in USD using Historical Rates
  const expenseTotal = expenses.reduce((sum, e) => {
      let usdAmount = 0;
      if (e.currency === "USD") {
          usdAmount = e.amount;
      } else {
          // Fallback to 120 if legacy data has no rate
          const rate = e.exchangeRate > 0 ? e.exchangeRate : 120;
          usdAmount = e.amount / rate;
      }
      return sum + usdAmount;
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
      let val = 0;
      if (e.currency === "USD") {
          val = e.amount;
      } else {
          const rate = e.exchangeRate > 0 ? e.exchangeRate : 120;
          val = e.amount / rate;
      }
      monthlyData[m].expense += Math.round(val);
  });

  // C. Category Breakdown
  const catMap: Record<string, number> = {};
  expenses.forEach(e => {
      let val = 0;
      if (e.currency === "USD") {
          val = e.amount;
      } else {
          const rate = e.exchangeRate > 0 ? e.exchangeRate : 120;
          val = e.amount / rate;
      }
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
        <p className="text-slate-500">Financial health, liquidity, and expense analysis (USD Base).</p>
      </div>

      <FinanceDashboard 
        summary={summary} 
        monthlyData={monthlyData} 
        categoryData={categoryData} 
      />
    </div>
  );
}