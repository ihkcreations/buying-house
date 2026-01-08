"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ExpenseChart({ data }: { data: any[] }) {
  const [currency, setCurrency] = useState("BDT");

  return (
    <Card className="mb-6">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-500">
                Monthly Expenses ({currency})
            </CardTitle>
            
            {/* Currency Toggle */}
            <Tabs value={currency} onValueChange={setCurrency} className="h-8">
                <TabsList className="h-8">
                    <TabsTrigger value="BDT" className="text-xs px-2">৳ BDT</TabsTrigger>
                    <TabsTrigger value="USD" className="text-xs px-2">$ USD</TabsTrigger>
                </TabsList>
            </Tabs>
        </CardHeader>
        
        <CardContent>
            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis 
                            dataKey="name" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false} 
                        />
                        <YAxis 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                            tickFormatter={(val) => currency === "USD" ? `$${val}` : `${val/1000}k`}
                        />
                        <Tooltip 
                            formatter={(value: number | undefined) => value !== undefined 
                                ? (currency === "USD" 
                                    ? `$${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` 
                                    : `৳${value.toLocaleString()}`)
                                : ''
                            }
                            cursor={{fill: '#f1f5f9'}}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        
                        {/* Dynamically choose the data key based on state */}
                        <Bar 
                            dataKey={currency === "BDT" ? "totalBDT" : "totalUSD"} 
                            fill={currency === "BDT" ? "#3b82f6" : "#10b981"} 
                            radius={[4, 4, 0, 0]} 
                            barSize={20} 
                            name="Total Expense"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </CardContent>
    </Card>
  );
}