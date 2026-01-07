import { db } from "@/lib/db";
import { protectPage } from "@/lib/protect";
import { FinanceDashboard } from "@/components/finance/finance-dashboard";

export default async function BusinessOverviewPage() {
  await protectPage(["admin", "super_admin"]);

  // 1. Fetch Completed Orders (Revenue) with Buyer Name
  const orders = await db.order.findMany({
    where: { status: { in: ["SHIPPED", "CLOSED", "OCS_FINALIZED"] } },
    select: { 
        totalValue: true, 
        createdAt: true,
        buyer: { select: { name: true } },
        orderNo: true
    },
    orderBy: { updatedAt: 'desc' }
  });

  // 2. Fetch Approved Expenses
  const expenses = await db.expense.findMany({
    where: { status: "APPROVED" },
    select: { amount: true, date: true, category: true, currency: true, exchangeRate: true },
    orderBy: { date: 'desc' }
  });

  // --- DATA PROCESSING ---
  
  // A. Calculate Exchange Rate Helper
  const getUsd = (amount: number, currency: string, rate: number) => {
      if (currency === "USD") return amount;
      const r = rate > 0 ? rate : 120; // Fallback
      return amount / r;
  };

  // B. Monthly P&L Data
  const monthlyData = new Array(12).fill(0).map((_, i) => ({
    name: new Date(0, i).toLocaleString('en-US', { month: 'short' }),
    income: 0,
    expense: 0,
    profit: 0 // Net for the month
  }));

  orders.forEach(o => {
      const m = new Date(o.createdAt).getMonth();
      monthlyData[m].income += o.totalValue;
  });

  expenses.forEach(e => {
      const m = new Date(e.date).getMonth();
      const val = getUsd(e.amount, e.currency, e.exchangeRate);
      monthlyData[m].expense += val;
  });

  // Calculate Net Profit per Month for the Line Chart
  monthlyData.forEach(m => {
      m.profit = m.income - m.expense;
  });

  // C. Totals for Cards
  const revenueTotal = orders.reduce((sum, o) => sum + o.totalValue, 0);
  const expenseTotal = expenses.reduce((sum, e) => sum + getUsd(e.amount, e.currency, e.exchangeRate), 0);
  const netIncome = revenueTotal - expenseTotal;
  const netMargin = revenueTotal > 0 ? (netIncome / revenueTotal) * 100 : 0;

  // D. Top Buyers (Revenue Source)
  const buyerMap: Record<string, number> = {};
  orders.forEach(o => {
      buyerMap[o.buyer.name] = (buyerMap[o.buyer.name] || 0) + o.totalValue;
  });
  
  const buyerData = Object.keys(buyerMap)
    .map(key => ({ name: key, value: buyerMap[key] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5

  // E. Expense Categories
  const catMap: Record<string, number> = {};
  expenses.forEach(e => {
      const val = getUsd(e.amount, e.currency, e.exchangeRate);
      catMap[e.category] = (catMap[e.category] || 0) + val;
  });
  
  const categoryData = Object.keys(catMap).map(key => ({
      name: key,
      value: Math.round(catMap[key])
  }));

  const summary = {
      revenue: revenueTotal,
      expenses: Math.round(expenseTotal),
      net: Math.round(netIncome),
      margin: netMargin.toFixed(1)
  };

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Business Overview</h1>
        <p className="text-slate-500">Financial health, liquidity, and P&L analysis (USD Base).</p>
      </div>

      <FinanceDashboard 
        summary={summary} 
        monthlyData={monthlyData} 
        categoryData={categoryData}
        buyerData={buyerData}
      />
    </div>
  );
}