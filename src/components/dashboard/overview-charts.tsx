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
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
        <div>
            <CardTitle className="text-base sm:text-lg">Financial Overview</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Monthly Revenue & Profit Performance</CardDescription>
        </div>
        
        {/* TAB SWITCHER (Full width on mobile) */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-[300px]">
            <TabsList className="grid w-full grid-cols-3 h-9">
                <TabsTrigger value="revenue" className="text-xs">Revenue</TabsTrigger>
                <TabsTrigger value="profit" className="text-xs">Profit</TabsTrigger>
                <TabsTrigger value="both" className="text-xs">Both</TabsTrigger>
            </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent className="pl-0">
        <div className="h-[250px] sm:h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <Gradients />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => value.slice(0, 3)} // Ensure short names on mobile
              />
              
              <YAxis 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `$${value/1000}k`} 
                width={40} // Reduced width for mobile
              />
              
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                formatter={(value: number | undefined) => {
                    if (value === undefined) return '';
                    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
                }}
              />

              {/* LINES (Same as before) */}
              {(activeTab === "revenue" || activeTab === "both") && (
                  <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              )}

              {(activeTab === "profit" || activeTab === "both") && (
                  <Area type="monotone" dataKey="profit" stroke="#16a34a" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
              )}

            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}