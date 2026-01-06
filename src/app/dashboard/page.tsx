import { db } from "@/lib/db";
import { OverviewCharts } from "@/components/dashboard/overview-charts";
import { StatusDistribution } from "@/components/dashboard/status-distribution";
import { DashboardFilter } from "@/components/dashboard/dashboard-filter"; // NEW
import { ActionAlerts } from "@/components/dashboard/action-alerts"; // NEW
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Users, TrendingUp, ArrowRight, Box, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { protectPage } from "@/lib/protect";
import { startOfYear, startOfMonth, subMonths } from "date-fns";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // 1. AUTH & ROLES
  const user = await protectPage(["admin", "merchandiser", "commercial", "finance"]);
  const showFinancials = ["admin", "finance"].includes(user.role);

  // 2. DATE FILTER SETUP
  const sp = await searchParams;
  const range = (sp.range as string) || "this_year";
  
  const now = new Date();
  let dateFilter: any = {}; 

  if (range === "this_year") {
      dateFilter = { gte: startOfYear(now) };
  } else if (range === "this_month") {
      dateFilter = { gte: startOfMonth(now) };
  } else if (range === "last_month") {
      const lastMonth = subMonths(now, 1);
      const start = startOfMonth(lastMonth);
      const end = startOfMonth(now);
      dateFilter = { gte: start, lt: end };
  }
  // If 'all', dateFilter remains empty {}

  // 3. FETCH DATA
  const [orders, expenses, buyersCount] = await Promise.all([
    // A. Orders (Filtered by Date)
    db.order.findMany({
      where: { createdAt: dateFilter }, 
      select: { 
        id: true, totalValue: true, status: true, createdAt: true, orderNo: true, orderQty: true,
        buyer: { select: { name: true } },
        costing: { select: { profitMargin: true, commissionPercent: true, totalCost: true } },
        actualCosting: {
            select: {
                fabricActual: true, trimsActual: true, printingActual: true,
                embroideryActual: true, washingActual: true, cmActual: true,
                labTestActual: true, inspectionActual: true, samplingActual: true,
                commercialActual: true, logisticsActual: true
            }
        },
        timeAction: { select: { shipmentPlan: true } }
      },
      orderBy: { updatedAt: "desc" },
    }),

    // B. Expenses (Only if allowed & Filtered by Date)
    showFinancials ? db.expense.findMany({
        where: { status: "APPROVED", date: dateFilter },
        select: { amount: true, currency: true, date: true }
    }) : [],

    db.buyer.count(),
  ]);

  // 4. ALERTS LOGIC (Snapshot of NOW, ignores date filter usually)
  const lateOrders = await db.timeAction.count({
      where: { 
          shipmentPlan: { lt: new Date() },
          order: { status: { notIn: ["SHIPPED", "CLOSED", "OCS_FINALIZED"] } }
      }
  });
  const pendingExpenses = showFinancials ? await db.expense.count({ where: { status: "PENDING" } }) : 0;
  // Missing docs logic is complex, keeping simple for now
  const alerts = { lateOrders, pendingExpenses, missingDocs: 0, total: lateOrders + pendingExpenses };


  // 5. CALCULATE KPIs
  let totalRevenue = 0;
  let totalQty = 0;
  let grossOrderProfit = 0;

  // Monthly Data Structure (0-11)
  const monthlyData = new Array(12).fill(0).map((_, i) => ({
    name: new Date(0, i).toLocaleString('en-US', { month: 'short' }),
    revenue: 0,
    profit: 0
  }));

  orders.forEach(order => {
    totalRevenue += order.totalValue;
    totalQty += order.orderQty;
    
    // --- SMART PROFIT LOGIC (Your Working Logic) ---
    let orderProfit = 0;

    if (order.actualCosting) {
        // PRIORITY 1: Actuals
        const ac = order.actualCosting;
        const totalActualExpenses = 
            (ac.fabricActual || 0) + (ac.trimsActual || 0) + 
            (ac.printingActual || 0) + (ac.embroideryActual || 0) + 
            (ac.washingActual || 0) + (ac.cmActual || 0) +
            (ac.labTestActual || 0) + (ac.inspectionActual || 0) + 
            (ac.samplingActual || 0) + (ac.commercialActual || 0) + 
            (ac.logisticsActual || 0);
        
        orderProfit = order.totalValue - totalActualExpenses;

    } else if (order.costing) {
        // PRIORITY 2: Budget
        const dozens = order.orderQty / 12;
        orderProfit = order.costing.profitMargin * dozens;
    }

    grossOrderProfit += orderProfit;

    // Map to Chart
    const m = new Date(order.createdAt).getMonth();
    if (monthlyData[m]) {
        monthlyData[m].revenue += order.totalValue;
        monthlyData[m].profit += orderProfit;
    }
  });

  // Subtract Office Expenses from Profit
  const EXCHANGE_RATE = 120;
  const totalOperationalExpenses = expenses.reduce((sum: number, e: any) => {
      const usdAmount = e.currency === "BDT" ? e.amount / EXCHANGE_RATE : e.amount;
      return sum + usdAmount;
  }, 0);

  // Apply Expenses to Chart
  expenses.forEach((e: any) => {
      const m = new Date(e.date).getMonth();
      const val = e.currency === "BDT" ? e.amount / EXCHANGE_RATE : e.amount;
      if (monthlyData[m]) {
          monthlyData[m].profit -= val; 
      }
  });

  // FINAL NET PROFIT
  const trueNetProfit = grossOrderProfit - totalOperationalExpenses;
  const activeOrdersCount = orders.filter(o => o.status !== "SHIPPED" && o.status !== "CLOSED" && o.status !== "OCS_FINALIZED").length;
  const completedOrdersCount = orders.filter(o => ["SHIPPED", "CLOSED", "OCS_FINALIZED"].includes(o.status)).length;
  const recentActivity = orders.slice(0, 5);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            {showFinancials ? "Executive Dashboard" : "Operations Dashboard"}
        </h2>
        <div className="flex items-center gap-4">
            <DashboardFilter />
            {user.role !== "finance" && user.role !== "commercial" && (
                <Link href="/orders/new">
                    <Button className="bg-slate-900 hover:bg-slate-800">Create New Order</Button>
                </Link>
            )}
        </div>
      </div>

      {/* ALERTS */}
      <ActionAlerts alerts={alerts} />

      {/* KPI CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        {/* 1. REVENUE (or QTY) */}
        {showFinancials ? (
            <Card className="border-l-4 border-l-blue-600 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
                    <p className="text-xs text-slate-500 mt-1 capitalize">{range.replace("_", " ")}</p>
                </CardContent>
            </Card>
        ) : (
            <Card className="border-l-4 border-l-blue-600 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">Total Volume</CardTitle>
                    <Box className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalQty.toLocaleString()} pcs</div>
                    <p className="text-xs text-slate-500 mt-1 capitalize">{range.replace("_", " ")}</p>
                </CardContent>
            </Card>
        )}

        {/* 2. PROFIT (or COMPLETED) */}
        {showFinancials ? (
            <Card className={`border-l-4 shadow-sm ${trueNetProfit >= 0 ? "border-l-green-500" : "border-l-red-500"}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">Net Profit</CardTitle>
                    <TrendingUp className={`h-4 w-4 ${trueNetProfit >= 0 ? "text-green-600" : "text-red-600"}`} />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${trueNetProfit >= 0 ? "text-green-700" : "text-red-600"}`}>
                        ${trueNetProfit.toLocaleString()}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Realized (After Expenses)</p>
                </CardContent>
            </Card>
        ) : (
            <Card className="border-l-4 border-l-green-500 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">Completed Orders</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{completedOrdersCount}</div>
                    <p className="text-xs text-slate-500 mt-1">Shipped</p>
                </CardContent>
            </Card>
        )}

        {/* 3. ACTIVE */}
        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Active Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOrdersCount}</div>
            <p className="text-xs text-slate-500 mt-1">In Production</p>
          </CardContent>
        </Card>

        {/* 4. CLIENTS */}
        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Clients</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{buyersCount}</div>
            <p className="text-xs text-slate-500 mt-1">Active Buyers</p>
          </CardContent>
        </Card>
      </div>

      {/* CHARTS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
            {showFinancials ? (
                <OverviewCharts data={monthlyData} />
            ) : (
                <div className="h-full bg-slate-50 border rounded-lg flex flex-col items-center justify-center text-slate-400">
                    <TrendingUp className="w-12 h-12 mb-2 opacity-20" />
                    <p>Financial charts restricted</p>
                </div>
            )}
        </div>
        <div className="col-span-3">
            <StatusDistribution data={Object.keys(orders.reduce((acc:any, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {})).map(key => ({ name: key.replace("_", " "), value: orders.filter(o => o.status === key).length }))} />
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
                <p className="text-sm text-slate-500">No activity recorded yet.</p>
            ) : (
                recentActivity.map(order => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                                <ShoppingBag className="h-4 w-4" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    Order <span className="font-bold text-slate-900">{order.orderNo}</span> Updated
                                </p>
                                <p className="text-xs text-slate-500">
                                    {order.buyer.name} • <span className="uppercase text-[10px] bg-slate-200 px-1 rounded">{order.status.replace("_", " ")}</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-sm font-bold text-slate-900">
                                ${order.totalValue.toLocaleString()}
                            </div>
                            <Link href={`/orders/${order.id}`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <ArrowRight className="h-4 w-4 text-slate-400" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}