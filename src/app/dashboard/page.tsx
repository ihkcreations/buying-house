import { db } from "@/lib/db";
import { OverviewCharts } from "@/components/dashboard/overview-charts";
import { StatusDistribution } from "@/components/dashboard/status-distribution";
import { DashboardFilter } from "@/components/dashboard/dashboard-filter";
import { ActionAlerts } from "@/components/dashboard/action-alerts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Users, TrendingUp, ArrowRight, Box, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { protectPage } from "@/lib/protect";
import { startOfYear, startOfMonth, subMonths } from "date-fns";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // 1. AUTH & ROLES
  const user = await protectPage(["super_admin", "admin", "merchandiser", "commercial", "finance"]);
  
  // PERMISSION LOGIC UPDATED:
  const showFinancials = ["super_admin", "admin"].includes(user.role); // <--- ONLY ADMIN SEES REVENUE/PROFIT
  const canApproveExpenses = ["super_admin", "admin"].includes(user.role); // <--- FINANCE SEES ALERTS

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

  // 3. FETCH DATA
  const [orders, expenses, buyersCount] = await Promise.all([
    // A. Orders
    db.order.findMany({
      where: { createdAt: dateFilter }, 
      select: { 
        id: true, totalValue: true, status: true, createdAt: true, orderNo: true, orderQty: true,
        buyer: { select: { name: true } },
        costing: { select: { profitMargin: true } },
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

    // B. Expenses (Only fetch if user is allowed to see Financials to save DB calls)
    showFinancials ? db.expense.findMany({
        where: { status: "APPROVED", date: dateFilter },
        select: { amount: true, currency: true, date: true, exchangeRate: true }
    }) : [],

    db.buyer.count(),
  ]);

  // 4. ALERTS LOGIC
  const lateOrders = await db.timeAction.count({
      where: { 
          shipmentPlan: { lt: new Date() },
          order: { status: { notIn: ["SHIPPED", "CLOSED", "OCS_FINALIZED"] } }
      }
  });
  
  // Finance Team STILL sees pending expense alerts
  const pendingExpenses = canApproveExpenses ? await db.expense.count({ where: { status: "PENDING" } }) : 0;
  
  const alerts = { lateOrders, pendingExpenses, missingDocs: 0, total: lateOrders + pendingExpenses };


  // 5. KPI CALCULATIONS
  let totalRevenue = 0;
  let totalQty = 0;
  let grossOrderProfit = 0;

  // Monthly Data Structure
  const monthlyData = new Array(12).fill(0).map((_, i) => ({
    name: new Date(0, i).toLocaleString('en-US', { month: 'short' }),
    revenue: 0,
    profit: 0
  }));

  orders.forEach(order => {
    totalRevenue += order.totalValue;
    totalQty += order.orderQty;
    
    // Only calculate profit metrics if Admin
    if (showFinancials) {
        let orderProfit = 0;
        if (order.actualCosting) {
            const ac = order.actualCosting;
            const totalActuals = Object.values(ac).reduce((a,b) => (typeof b === 'number' ? a+b : a), 0);
            orderProfit = order.totalValue - (totalActuals as number);
        } else if (order.costing) {
            const dozens = order.orderQty / 12;
            orderProfit = order.costing.profitMargin * dozens;
        }
        grossOrderProfit += orderProfit;

        // Chart Data
        const m = new Date(order.createdAt).getMonth();
        monthlyData[m].revenue += order.totalValue;
        monthlyData[m].profit += orderProfit;
    }
  });

  // Subtract Expenses (Admin Only)
  const EXCHANGE_RATE = 120;
  const totalOperationalExpenses = expenses.reduce((sum: number, e: any) => {
      let usdAmount = 0;
      if (e.currency === "USD") {
          usdAmount = e.amount;
      } else {
          const rate = e.exchangeRate > 0 ? e.exchangeRate : 120;
          usdAmount = e.amount / rate;
      }
      return sum + usdAmount;
  }, 0);

  if (showFinancials) {
      expenses.forEach((e: any) => {
          const m = new Date(e.date).getMonth();
          let val = 0;
          if (e.currency === "USD") {
              val = e.amount;
          } else {
              const rate = e.exchangeRate > 0 ? e.exchangeRate : 120;
              val = e.amount / rate;
          }
          if (monthlyData[m]) monthlyData[m].profit -= val; 
      });
  }

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
            {/* Create Order: Only Admin & Merch */}
            {["admin", "merchandiser"].includes(user.role) && (
                <Link href="/orders/new">
                    <Button className="bg-slate-900 hover:bg-slate-800">Create New Order</Button>
                </Link>
            )}
        </div>
      </div>

      <ActionAlerts alerts={alerts} />

      {/* --- KPI CARDS --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        {/* 1. REVENUE vs VOLUME */}
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

        {/* 2. PROFIT vs COMPLETED */}
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
                    <p className="text-xs text-slate-500 mt-1">Shipped Successfully</p>
                </CardContent>
            </Card>
        )}

        {/* 3. ACTIVE (Everyone sees this) */}
        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Active Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOrdersCount}</div>
            <p className="text-xs text-slate-500 mt-1">In Pipeline</p>
          </CardContent>
        </Card>

        {/* 4. CLIENTS (Everyone sees this) */}
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

      {/* --- CHARTS --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
            {showFinancials ? (
                <OverviewCharts data={monthlyData} />
            ) : (
                <div className="h-full bg-slate-50 border rounded-lg flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                    <TrendingUp className="w-12 h-12 mb-3 opacity-20" />
                    <p className="font-medium">Financial Data Restricted</p>
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
                        {/* Only show Order Value to Admin/Finance */}
                        {showFinancials && (
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
                        )}
                        {!showFinancials && (
                             <Link href={`/orders/${order.id}`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <ArrowRight className="h-4 w-4 text-slate-400" />
                                </Button>
                            </Link>
                        )}
                    </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}