"use client"

import { useState } from "react"
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function OverviewCharts({ data }: { data: any[] }) {
  const [activeTab, setActiveTab] = useState("revenue"); // 'revenue' | 'profit' | 'both'

  // Custom Gradient Definitions
  const Gradients = () => (
    <defs>
      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
      </linearGradient>
      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
        <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
      </linearGradient>
    </defs>
  );

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
            <CardTitle>Financial Overview</CardTitle>
            <CardDescription>Monthly Revenue & Profit Performance</CardDescription>
        </div>
        
        {/* TAB SWITCHER */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[300px]">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="profit">Profit</TabsTrigger>
                <TabsTrigger value="both">Both</TabsTrigger>
            </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent className="pl-0">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
              <Gradients />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              
              <YAxis 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `$${value/1000}k`} 
              />
              
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value: number) => `$${value.toLocaleString()}`}
              />

              {/* REVENUE LINE */}
              {(activeTab === "revenue" || activeTab === "both") && (
                  <Area 
                    type="monotone" // This makes it curved
                    dataKey="revenue" 
                    stroke="#2563eb" // Blue
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    name="Revenue"
                  />
              )}

              {/* PROFIT LINE */}
              {(activeTab === "profit" || activeTab === "both") && (
                  <Area 
                    type="monotone" // This makes it curved
                    dataKey="profit" 
                    stroke="#16a34a" // Green
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorProfit)" 
                    name="Profit"
                  />
              )}

            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}