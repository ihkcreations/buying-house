"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
    ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell 
} from "recharts";
import { DollarSign, TrendingUp, TrendingDown, Users, PieChart as PieIcon, Percent } from "lucide-react";

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
    <div className="space-y-6 pb-20">
        
        {/* ROW 1: CARDS (1 col mobile, 2 col tablet, 4 col desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* INFLOW */}
            <Card className="bg-white border-l-4 border-l-blue-500 shadow-sm p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold">Total Inflow</p>
                        <div className="text-2xl font-bold text-slate-900 mt-1">${summary.revenue.toLocaleString()}</div>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-full text-blue-600"><TrendingUp className="w-5 h-5" /></div>
                </div>
            </Card>

            {/* OUTFLOW */}
            <Card className="bg-white border-l-4 border-l-red-500 shadow-sm p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold">Total Outflow</p>
                        <div className="text-2xl font-bold text-red-600 mt-1">${summary.expenses.toLocaleString()}</div>
                    </div>
                    <div className="p-2 bg-red-50 rounded-full text-red-600"><TrendingDown className="w-5 h-5" /></div>
                </div>
            </Card>

            {/* NET CASH */}
            <Card className="bg-slate-900 text-white border-none shadow-md p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">Net Cash Flow</p>
                        <div className="text-2xl font-bold mt-1">${summary.net.toLocaleString()}</div>
                    </div>
                    <div className="p-2 bg-slate-800 rounded-full text-slate-300"><DollarSign className="w-5 h-5" /></div>
                </div>
            </Card>

            {/* MARGIN */}
            <Card className="bg-white border-l-4 border-l-green-500 shadow-sm p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold">Net Margin</p>
                        <div className="text-2xl font-bold text-green-700 mt-1">{summary.margin}%</div>
                    </div>
                    <div className="p-2 bg-green-50 rounded-full text-green-600"><Percent className="w-5 h-5" /></div>
                </div>
            </Card>
        </div>

        {/* ROW 2: P&L CHART */}
        <Card className="shadow-sm">
            <CardHeader className="px-4 py-4">
                <CardTitle className="text-base md:text-lg">Profit & Loss Analysis</CardTitle>
                <CardDescription>Income vs Expense Trend</CardDescription>
            </CardHeader>
            <CardContent className="px-2">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={monthlyData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                            <CartesianGrid stroke="#f5f5f5" vertical={false} />
                            <XAxis dataKey="name" scale="point" padding={{ left: 10, right: 10 }} fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`}/>
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                                formatter={(value: number | undefined) => {
                                    if (value === undefined) return '';
                                    return `৳${value.toLocaleString()}`;
                                }}
                            />
                            <Legend wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} />
                            <Bar dataKey="income" name="Income" barSize={12} fill="#22c55e" radius={[2, 2, 0, 0]} />
                            <Bar dataKey="expense" name="Expense" barSize={12} fill="#ef4444" radius={[2, 2, 0, 0]} />
                            <Line type="monotone" dataKey="profit" name="Net" stroke="#0f172a" strokeWidth={2} dot={false} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>

        {/* ROW 3: BREAKDOWNS (Stack on mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Top Buyers */}
            <Card>
                <CardHeader className="px-4 py-4">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-500"/>
                        <CardTitle className="text-base">Top Revenue Sources</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="px-4">
                    <div className="space-y-4">
                        {buyerData.map((buyer, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
                                        {idx + 1}
                                    </div>
                                    <span className="font-medium text-slate-700 text-sm truncate max-w-[120px]">{buyer.name}</span>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <span className="font-bold text-slate-900 text-sm">${buyer.value.toLocaleString()}</span>
                                    <div className="h-1.5 w-16 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min((buyer.value / summary.revenue) * 100, 100)}%` }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {buyerData.length === 0 && <p className="text-center text-slate-400 py-4 text-sm">No data available</p>}
                    </div>
                </CardContent>
            </Card>

            {/* Expense Pie Chart */}
            <Card>
                <CardHeader className="px-4 py-4">
                    <div className="flex items-center gap-2">
                        <PieIcon className="w-5 h-5 text-orange-500"/>
                        <CardTitle className="text-base">Expense Categories</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number | undefined) => {
                                    if (value === undefined) return '';
                                    return `৳${value.toLocaleString()}`;
                                }} />
                                <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{fontSize: '11px'}}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}