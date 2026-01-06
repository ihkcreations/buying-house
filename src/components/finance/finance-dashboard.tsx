"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { DollarSign, TrendingUp, TrendingDown, PieChart as PieIcon } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function FinanceDashboard({ 
    summary, 
    monthlyData, 
    categoryData 
}: { 
    summary: any, 
    monthlyData: any[], 
    categoryData: any[] 
}) {
  return (
    <div className="space-y-6">
        
        {/* ROW 1: CASH FLOW CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white border-l-4 border-l-green-500 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">Total Inflow (Revenue)</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-900">${summary.revenue.toLocaleString()}</div>
                    <p className="text-xs text-slate-500 mt-1">From Shipped Orders</p>
                </CardContent>
            </Card>

            <Card className="bg-white border-l-4 border-l-red-500 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">Total Outflow (Expenses)</CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">${summary.expenses.toLocaleString()}</div>
                    <p className="text-xs text-slate-500 mt-1">Approved Claims</p>
                </CardContent>
            </Card>

            <Card className="bg-slate-900 text-white border-none shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-300">Net Cash Flow</CardTitle>
                    <DollarSign className="h-4 w-4 text-slate-300" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">${summary.net.toLocaleString()}</div>
                    <p className="text-xs text-slate-400 mt-1">Realized Liquidity</p>
                </CardContent>
            </Card>
        </div>

        {/* ROW 2: CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* P&L CHART */}
            <Card>
                <CardHeader>
                    <CardTitle>Monthly P&L</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`}/>
                                <Tooltip formatter={(val: number) => `$${val.toLocaleString()}`} cursor={{fill: 'transparent'}} />
                                <Legend />
                                <Bar dataKey="income" fill="#16a34a" name="Income" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" fill="#dc2626" name="Expense" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* EXPENSE BREAKDOWN */}
            <Card>
                <CardHeader>
                    <CardTitle>Expense Categories</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(val: number) => `$${val.toLocaleString()}`} />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}