import { db } from "@/lib/db";
import { OverviewCharts } from "@/components/dashboard/overview-charts";
import { StatusDistribution } from "@/components/dashboard/status-distribution"; // New Component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Users, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { protectPage } from "@/lib/protect"; // Ensure security

export default async function DashboardPage() {
  await protectPage(["admin", "merchandiser", "commercial", "finance"]);

  // 1. Fetch Data efficiently
  const [orders, buyersCount] = await Promise.all([
    db.order.findMany({
      select: { id: true, totalValue: true, status: true, createdAt: true, orderNo: true, buyer: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    db.buyer.count(),
  ]);

  // 2. Calculate KPI Stats
  const totalRevenue = orders.reduce((acc, o) => acc + o.totalValue, 0);
  const activeOrdersCount = orders.filter(o => o.status !== "SHIPPED" && o.status !== "CLOSED").length;
  const completedOrdersCount = orders.filter(o => o.status === "SHIPPED" || o.status === "CLOSED").length;

  // 3. Process Data for Revenue Chart (Group by Month)
  const monthlyRevenue = new Array(12).fill(0).map((_, i) => ({
    name: new Date(0, i).toLocaleString('en-US', { month: 'short' }), // Jan, Feb...
    total: 0
  }));

  orders.forEach(order => {
    const monthIndex = new Date(order.createdAt).getMonth();
    monthlyRevenue[monthIndex].total += order.totalValue;
  });

  // 4. Process Data for Status Chart (Pie)
  const statusCounts = orders.reduce((acc: any, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});
  
  const statusData = Object.keys(statusCounts).map(status => ({
    name: status.replace("_", " "),
    value: statusCounts[status]
  }));

  // 5. Recent Activity (Last 5 orders)
  const recentActivity = orders.slice(0, 5);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
        <Link href="/orders/new">
            <Button className="bg-slate-900 hover:bg-slate-800">Create New Order</Button>
        </Link>
      </div>

      {/* --- ROW 1: KPI CARDS --- */}
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

        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Active Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOrdersCount}</div>
            <p className="text-xs text-slate-500 mt-1">In Production / Pending</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedOrdersCount}</div>
            <p className="text-xs text-slate-500 mt-1">Shipped Successfully</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Buyers</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{buyersCount}</div>
            <p className="text-xs text-slate-500 mt-1">Active Clients</p>
          </CardContent>
        </Card>
      </div>

      {/* --- ROW 2: CHARTS --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Left: Revenue Trend (Bar Chart) */}
        <div className="col-span-4">
            <OverviewCharts data={monthlyRevenue} />
        </div>

        {/* Right: Order Status (Pie Chart) - NEW */}
        <div className="col-span-3">
            <StatusDistribution data={statusData} />
        </div>
      </div>

      {/* --- ROW 3: RECENT ACTIVITY --- */}
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