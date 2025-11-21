import { db } from "@/lib/db";
import { OverviewCharts } from "@/components/dashboard/overview-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, ShoppingBag, Activity } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default async function DashboardPage() {
  // 1. Fetch Real Stats
  const totalOrders = await db.order.count();
  
  const activeOrders = await db.order.count({
    where: { status: { not: "CLOSED" } }
  });

  const buyersCount = await db.buyer.count();

  // Calculate Total Revenue (Sum of all orders)
  const revenueAgg = await db.order.aggregate({
    _sum: { totalValue: true }
  });
  const totalRevenue = revenueAgg._sum.totalValue || 0;

  // Fetch recent 5 orders
  const recentOrders = await db.order.findMany({
    take: 5,
    orderBy: { updatedAt: "desc" },
    include: { buyer: true }
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      {/* TOP STATS CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
                ${totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOrders}</div>
            <p className="text-xs text-muted-foreground">{totalOrders} Total Lifetime</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buyers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{buyersCount}</div>
            <p className="text-xs text-muted-foreground">Active Clients</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Production Load</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">Factory Capacity</p>
          </CardContent>
        </Card>
      </div>

      {/* CHARTS & RECENT ACTIVITY */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Left: The Bar Chart */}
        <div className="col-span-4">
            <OverviewCharts />
        </div>

        {/* Right: Recent Activity Feed */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
                {recentOrders.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No recent activity.</p>
                ) : (
                    recentOrders.map(order => (
                        <div key={order.id} className="flex items-center">
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    Order #{order.orderNo} Updated
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {order.buyer.name} • {order.status}
                                </p>
                            </div>
                            <div className="ml-auto font-medium text-sm">
                                +${order.totalValue.toLocaleString()}
                            </div>
                        </div>
                    ))
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}