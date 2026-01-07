"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
    ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell 
} from "recharts";
import { DollarSign, TrendingUp, TrendingDown, PieChart as PieIcon, Activity, Percent } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function FinanceDashboard({ 
    summary, 
    monthlyData, 
    categoryData,
    buyerData
}: { 
    summary: any, 
    monthlyData: any[], 
    categoryData: any[],
    buyerData: any[]
}) {
  return (
    <div className="space-y-6">
        
        {/* ROW 1: KEY FINANCIAL METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Revenue */}
            <Card className="bg-white border-l-4 border-l-blue-500 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">Total Inflow</CardTitle>
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-900">${summary.revenue.toLocaleString()}</div>
                    <p className="text-xs text-slate-500 mt-1">Realized Revenue</p>
                </CardContent>
            </Card>

            {/* Expenses */}
            <Card className="bg-white border-l-4 border-l-red-500 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">Total Outflow</CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">${summary.expenses.toLocaleString()}</div>
                    <p className="text-xs text-slate-500 mt-1">Approved Expenses</p>
                </CardContent>
            </Card>

            {/* Net Cash */}
            <Card className="bg-slate-900 text-white border-none shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-300">Net Cash Flow</CardTitle>
                    <DollarSign className="h-4 w-4 text-slate-300" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${summary.net.toLocaleString()}</div>
                    <p className="text-xs text-slate-400 mt-1">Liquidity</p>
                </CardContent>
            </Card>

            {/* Net Margin */}
            <Card className="bg-white border-l-4 border-l-green-500 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">Net Margin</CardTitle>
                    <Percent className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-700">{summary.margin}%</div>
                    <p className="text-xs text-slate-500 mt-1">Profitability Ratio</p>
                </CardContent>
            </Card>
        </div>

        {/* ROW 2: THE MASTER CHART */}
        <Card className="shadow-sm">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Profit & Loss Analysis</CardTitle>
                        <CardDescription>Income vs Expense vs Net Profit Trend</CardDescription>
                    </div>
                    <div className="flex gap-4 text-xs">
                        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded-sm"></div> Income</div>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded-sm"></div> Expense</div>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-900 rounded-full"></div> Net Profit</div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={monthlyData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid stroke="#f5f5f5" vertical={false} />
                            <XAxis dataKey="name" scale="point" padding={{ left: 20, right: 20 }} fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`}/>
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                formatter={(value: number | undefined) => {
                                    if (value === undefined) return '';
                                    return `$${value.toLocaleString()}`;
                                }}
                            />
                            
                            {/* Bars for Income/Expense */}
                            <Bar dataKey="income" name="Revenue" barSize={20} fill="#22c55e" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expense" name="Expense" barSize={20} fill="#ef4444" radius={[4, 4, 0, 0]} />
                            
                            {/* Line for Profit */}
                            <Line type="monotone" dataKey="profit" name="Net Profit" stroke="#0f172a" strokeWidth={3} dot={{r: 4}} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>

        {/* ROW 3: BREAKDOWNS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Top Buyers */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Revenue Sources</CardTitle>
                    <CardDescription>Revenue by Buyer</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {buyerData.map((buyer, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                        {idx + 1}
                                    </div>
                                    <span className="font-medium text-slate-700">{buyer.name}</span>
                                </div>
                                <div className="text-right">
                                    <span className="font-bold text-slate-900">${buyer.value.toLocaleString()}</span>
                                    <div className="h-1.5 w-24 bg-slate-100 rounded-full mt-1 overflow-hidden ml-auto">
                                        <div 
                                            className="h-full bg-blue-600 rounded-full" 
                                            style={{ width: `${(buyer.value / summary.revenue) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {buyerData.length === 0 && <p className="text-center text-slate-400 py-4">No data available</p>}
                    </div>
                </CardContent>
            </Card>

            {/* Expense Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>Expense Distribution</CardTitle>
                    <CardDescription>Where is the money going?</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full flex items-center justify-center">
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
                                <Tooltip formatter={(val: number | undefined) => {
                                    if (val === undefined) return '';
                                    return `$${val.toLocaleString()}`;
                                }} />
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