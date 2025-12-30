import { db } from "@/lib/db";
import { OverviewCharts } from "@/components/dashboard/overview-charts";
import { StatusDistribution } from "@/components/dashboard/status-distribution";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Users, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { protectPage } from "@/lib/protect";

export default async function DashboardPage() {
  await protectPage(["admin", "merchandiser", "commercial", "finance"]);

  // 1. Fetch Data (Include ActualCosting for Realized Profit)
  const [orders, buyersCount] = await Promise.all([
    db.order.findMany({
      select: { 
        id: true, 
        totalValue: true, 
        status: true, 
        createdAt: true, 
        orderNo: true, 
        orderQty: true,
        buyer: { select: { name: true } },
        // Budget Data
        costing: { select: { profitMargin: true } },
        // Realized Data (Fetch all fields needed for sum)
        actualCosting: {
            select: {
                fabricActual: true, trimsActual: true, printingActual: true,
                embroideryActual: true, washingActual: true, cmActual: true,
                labTestActual: true, inspectionActual: true, samplingActual: true,
                commercialActual: true, logisticsActual: true
            }
        }
      },
      orderBy: { updatedAt: "desc" },
    }),
    db.buyer.count(),
  ]);

  // 2. Calculate KPI Stats
  let totalRevenue = 0;
  let totalProfit = 0;

  const activeOrdersCount = orders.filter(o => o.status !== "SHIPPED" && o.status !== "CLOSED" && o.status !== "OCS_FINALIZED").length;
  // Completed = Shipped or OCS Finalized or Closed
  const completedOrdersCount = orders.filter(o => ["SHIPPED", "CLOSED", "OCS_FINALIZED"].includes(o.status)).length;

  // 3. Process Monthly Data
  const monthlyData = new Array(12).fill(0).map((_, i) => ({
    name: new Date(0, i).toLocaleString('en-US', { month: 'short' }),
    revenue: 0,
    profit: 0
  }));

  orders.forEach(order => {
    // A. Revenue
    totalRevenue += order.totalValue;
    
    // B. Smart Profit Calculation
    let orderProfit = 0;

    if (order.actualCosting) {
        // PRIORITY 1: Use Realized Profit (Revenue - Total Actual Expenses)
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
        // PRIORITY 2: Use Budget Profit (Margin Per Dzn * Dozens)
        const dozens = order.orderQty / 12;
        orderProfit = order.costing.profitMargin * dozens;
    }

    totalProfit += orderProfit;

    // C. Monthly Grouping
    const monthIndex = new Date(order.createdAt).getMonth();
    monthlyData[monthIndex].revenue += order.totalValue;
    monthlyData[monthIndex].profit += orderProfit;
  });

  const recentActivity = orders.slice(0, 5);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
        <Link href="/orders/new">
            <Button className="bg-slate-900 hover:bg-slate-800">Create New Order</Button>
        </Link>
      </div>

      {/* --- KPI CARDS --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        <Card className="border-l-4 border-l-blue-600 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">Lifetime Volume</p>
          </CardContent>
        </Card>

        {/* SMART PROFIT CARD */}
        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? "text-green-700" : "text-red-600"}`}>
                ${totalProfit.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
                {totalRevenue > 0 ? ((totalProfit/totalRevenue)*100).toFixed(1) : 0}% Realized Margin
            </p>
          </CardContent>
        </Card>

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

      {/* --- CHARTS ROW --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
            <OverviewCharts data={monthlyData} />
        </div>
        <div className="col-span-3">
            <StatusDistribution data={Object.keys(orders.reduce((acc:any, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {})).map(key => ({ name: key.replace("_", " "), value: orders.filter(o => o.status === key).length }))} />
        </div>
      </div>

      {/* --- RECENT ACTIVITY --- */}
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