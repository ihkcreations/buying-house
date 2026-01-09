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
    <div className="space-y-6 pb-20 p-2 md:p-0"> {/* Added mobile padding */}
      
      {/* 1. HEADER (Stacks on mobile) */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            {showFinancials ? "Executive Dashboard" : "Operations Dashboard"}
        </h2>
        <div className="flex flex-wrap items-center gap-2 md:gap-4">
            <DashboardFilter />
            {/* Hide Create button for Finance users */}
            {user.role !== "finance" || user.role!=="commercial" && (
                <Link href="/orders/new" className="w-full md:w-auto">
                    <Button className="bg-slate-900 hover:bg-slate-800 w-full md:w-auto">Create Order</Button>
                </Link>
            )}
        </div>
      </div>

      {/* ALERTS (1 per row on mobile for readability) */}
      <ActionAlerts alerts={alerts} />

      {/* 2. KPI CARDS (2x2 on Mobile) */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        
        {/* REVENUE */}
        {showFinancials ? (
            <Card className="border-l-4 border-l-blue-600 shadow-sm p-3 md:p-6">
                <CardHeader className="p-0 pb-2 space-y-0">
                    <CardTitle className="text-xs md:text-sm font-medium text-slate-500">Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-blue-600 hidden md:block" /> {/* Hide icon on tiny screens if needed */}
                </CardHeader>
                <CardContent className="p-0">
                    <div className="text-lg md:text-2xl font-bold truncate">${totalRevenue.toLocaleString()}</div>
                    <p className="text-[10px] md:text-xs text-slate-500 mt-1 capitalize">{range.replace("_", " ")}</p>
                </CardContent>
            </Card>
        ) : (
            <Card className="border-l-4 border-l-blue-600 shadow-sm p-3 md:p-6">
                <CardHeader className="p-0 pb-2 space-y-0">
                    <CardTitle className="text-xs md:text-sm font-medium text-slate-500">Volume</CardTitle>
                    <Box className="h-4 w-4 text-blue-600 hidden md:block" />
                </CardHeader>
                <CardContent className="p-0">
                    <div className="text-lg md:text-2xl font-bold truncate">{totalQty.toLocaleString()}</div>
                    <p className="text-[10px] md:text-xs text-slate-500 mt-1">Pcs Total</p>
                </CardContent>
            </Card>
        )}

        {/* PROFIT */}
        {showFinancials ? (
            <Card className={`border-l-4 shadow-sm p-3 md:p-6 ${trueNetProfit >= 0 ? "border-l-green-500" : "border-l-red-500"}`}>
                <CardHeader className="p-0 pb-2 space-y-0">
                    <CardTitle className="text-xs md:text-sm font-medium text-slate-500">Net Profit</CardTitle>
                    <TrendingUp className={`h-4 w-4 hidden md:block ${trueNetProfit >= 0 ? "text-green-600" : "text-red-600"}`} />
                </CardHeader>
                <CardContent className="p-0">
                    <div className={`text-lg md:text-2xl font-bold truncate ${trueNetProfit >= 0 ? "text-green-700" : "text-red-600"}`}>
                        ${trueNetProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <p className="text-[10px] md:text-xs text-slate-500 mt-1">Realized</p>
                </CardContent>
            </Card>
        ) : (
            <Card className="border-l-4 border-l-green-500 shadow-sm p-3 md:p-6">
                <CardHeader className="p-0 pb-2 space-y-0">
                    <CardTitle className="text-xs md:text-sm font-medium text-slate-500">Completed</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-green-600 hidden md:block" />
                </CardHeader>
                <CardContent className="p-0">
                    <div className="text-lg md:text-2xl font-bold truncate">{completedOrdersCount}</div>
                    <p className="text-[10px] md:text-xs text-slate-500 mt-1">Orders</p>
                </CardContent>
            </Card>
        )}

        {/* ACTIVE */}
        <Card className="border-l-4 border-l-orange-500 shadow-sm p-3 md:p-6">
          <CardHeader className="p-0 pb-2 space-y-0">
            <CardTitle className="text-xs md:text-sm font-medium text-slate-500">Active</CardTitle>
            <ShoppingBag className="h-4 w-4 text-orange-600 hidden md:block" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-lg md:text-2xl font-bold truncate">{activeOrdersCount}</div>
            <p className="text-[10px] md:text-xs text-slate-500 mt-1">In Pipeline</p>
          </CardContent>
        </Card>

        {/* CLIENTS */}
        <Card className="border-l-4 border-l-purple-500 shadow-sm p-3 md:p-6">
          <CardHeader className="p-0 pb-2 space-y-0">
            <CardTitle className="text-xs md:text-sm font-medium text-slate-500">Clients</CardTitle>
            <Users className="h-4 w-4 text-purple-600 hidden md:block" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-lg md:text-2xl font-bold truncate">{buyersCount}</div>
            <p className="text-[10px] md:text-xs text-slate-500 mt-1">Active</p>
          </CardContent>
        </Card>
      </div>

      {/* --- CHARTS (Stack vertically on mobile) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 md:gap-6">
        <div className="lg:col-span-4 min-w-0"> {/* min-w-0 prevents chart overflow */}
            {showFinancials ? (
                <OverviewCharts data={monthlyData} />
            ) : (
                <div className="h-[300px] bg-slate-50 border rounded-lg flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                    <TrendingUp className="w-12 h-12 mb-3 opacity-20" />
                    <p className="font-medium">Financial Data Restricted</p>
                </div>
            )}
        </div>
        <div className="lg:col-span-3 min-w-0">
            <StatusDistribution data={Object.keys(orders.reduce((acc:any, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {})).map(key => ({ name: key.replace("_", " "), value: orders.filter(o => o.status === key).length }))} />
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <Card className="col-span-4">
        <CardHeader className="px-4 md:px-6">
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
                <p className="text-sm text-slate-500">No activity recorded yet.</p>
            ) : (
                recentActivity.map(order => (
                    <div key={order.id} className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors gap-3">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                                <ShoppingBag className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium leading-none truncate">
                                    Order <span className="font-bold text-slate-900">{order.orderNo}</span> Updated
                                </p>
                                <p className="text-xs text-slate-500 mt-1 truncate">
                                    {order.buyer.name} • <span className="uppercase text-[10px] bg-slate-200 px-1 rounded">{order.status.replace("_", " ")}</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto pl-11 md:pl-0">
                            {showFinancials && (
                                <div className="text-sm font-bold text-slate-900">
                                    ${order.totalValue.toLocaleString()}
                                </div>
                            )}
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