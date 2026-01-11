import { db } from "@/lib/db";
import { protectPage } from "@/lib/protect";
import { FinanceDashboard } from "@/components/finance/finance-dashboard";

export default async function BusinessOverviewPage() {
  await protectPage(["admin", "super_admin"]);

  // 1. Fetch Completed Orders (Revenue)
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

  // 3. Fetch Global Settings for Fallback Rate
  const settings = await db.companySettings.findUnique({
      where: { id: "main_settings" },
      select: { manualExchangeRate: true }
  });
  
  // Use Admin's Manual Rate or default to 120
  const GLOBAL_USD_RATE = settings?.manualExchangeRate || 120;

  // --- HELPER: Convert Any Amount to USD ---
  const convertToUsd = (amount: number, currency: string) => {
      if (currency === "USD") {
          return amount;
      } else {
          // It is BDT. We divide by the Rate (e.g. 120) to get USD.
          return amount / GLOBAL_USD_RATE;
      }
  };

  // --- DATA PROCESSING ---

  // A. Totals
  const revenueTotal = orders.reduce((sum, o) => sum + o.totalValue, 0);
  
  const expenseTotal = expenses.reduce((sum, e) => {
      return sum + convertToUsd(e.amount, e.currency);
  }, 0);

  const netIncome = revenueTotal - expenseTotal;
  const netMargin = revenueTotal > 0 ? (netIncome / revenueTotal) * 100 : 0;

  // B. Monthly P&L
  const monthlyData = new Array(12).fill(0).map((_, i) => ({
    name: new Date(0, i).toLocaleString('en-US', { month: 'short' }),
    income: 0,
    expense: 0,
    profit: 0
  }));

  orders.forEach(o => {
      const m = new Date(o.createdAt).getMonth();
      monthlyData[m].income += o.totalValue;
  });

  expenses.forEach(e => {
      const m = new Date(e.date).getMonth();
      const val = convertToUsd(e.amount, e.currency);
      monthlyData[m].expense += val;
  });

  // Calc Net per month
  monthlyData.forEach(m => {
      m.profit = m.income - m.expense;
  });

  // C. Top Buyers
  const buyerMap: Record<string, number> = {};
  orders.forEach(o => {
      buyerMap[o.buyer.name] = (buyerMap[o.buyer.name] || 0) + o.totalValue;
  });
  
  const buyerData = Object.keys(buyerMap)
    .map(key => ({ name: key, value: buyerMap[key] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // D. Expense Categories
  const catMap: Record<string, number> = {};
  expenses.forEach(e => {
      const val = convertToUsd(e.amount, e.currency);
      catMap[e.category] = (catMap[e.category] || 0) + val;
  });
  
  const categoryData = Object.keys(catMap).map(key => ({
      name: key,
      value: Math.round(catMap[key])
  }));

  const summary = {
      revenue: Math.round(revenueTotal * 1000) / 1000,
      expenses: Math.round(expenseTotal * 1000) / 1000,
      net: Math.round(netIncome * 1000) / 1000,
      margin: netMargin.toFixed(2)
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