"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ExpenseChart({ data }: { data: any[] }) {
  return (
    <Card className="mb-6">
        <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Monthly Expenses (BDT)</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="h-[150px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                            formatter={(value: number) => `৳${value.toLocaleString()}`}
                            cursor={{fill: 'transparent'}}
                        />
                        <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={35} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </CardContent>
    </Card>
  );
}