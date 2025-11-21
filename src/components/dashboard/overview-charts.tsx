"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Mock data for now (In a real app, we aggregate this from DB)
const data = [
  { name: "Jan", total: 15000 },
  { name: "Feb", total: 22000 },
  { name: "Mar", total: 45000 },
  { name: "Apr", total: 32000 },
  { name: "May", total: 58000 },
  { name: "Jun", total: 42000 },
]

export function OverviewCharts() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Revenue Overview (2025)</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}