"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine 
} from "recharts";
import { 
  DollarSign, Scissors, CalendarClock, AlertTriangle, CheckCircle2, Box
} from "lucide-react";
import { format, differenceInDays } from "date-fns";

export function OrderOverview({ order }: { order: any }) {
  
  // --- FINANCIALS ---
  const revenue = order.totalValue;
  // Costing Logic...
  let estimatedProfit = 0;
  let marginPercent = 0;
  if (order.costing) {
    const dozens = order.orderQty / 12;
    const profitPerDzn = order.costing.profitMargin;
    estimatedProfit = profitPerDzn * dozens;
    marginPercent = (estimatedProfit / revenue) * 100;
  }

  const financialData = [
    { name: "Revenue", value: revenue, color: "#2563eb" }, 
    { name: "Cost", value: revenue - estimatedProfit, color: "#94a3b8" }, 
    { name: "Profit", value: estimatedProfit, color: estimatedProfit >= 0 ? "#16a34a" : "#dc2626" },
  ];

  // --- PRODUCTION ---
  const logs = order.productionLogs || [];
  const totalCut = logs.reduce((acc: number, log: any) => acc + log.cutQty, 0);
  const totalSew = logs.reduce((acc: number, log: any) => acc + log.sewQty, 0);
  const totalPack = logs.reduce((acc: number, log: any) => acc + log.packQty, 0);

  const productionData = [
    { name: "Cut", value: totalCut, color: "#f97316" }, 
    { name: "Sew", value: totalSew, color: "#3b82f6" }, 
    { name: "Pack", value: totalPack, color: "#22c55e" }, 
  ];

  // --- TIMELINE ---
  const shipDate = order.timeAction?.shipmentPlan ? new Date(order.timeAction.shipmentPlan) : null;
  const daysLeft = shipDate ? differenceInDays(shipDate, new Date()) : null;
  const isLate = daysLeft !== null && daysLeft < 0;

  return (
    <div className="space-y-6">
      
      {/* ROW 1: PRIMARY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. ORDER QUANTITY (New & Prominent) */}
        <Card className="bg-slate-900 text-white shadow-md border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Order Qty</CardTitle>
            <Box className="h-4 w-4 text-slate-300" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{order.orderQty.toLocaleString()}</div>
            <p className="text-xs text-slate-400 mt-1">Pcs / {(order.orderQty / 12).toFixed(0)} Dozen</p>
          </CardContent>
        </Card>

        {/* 2. REVENUE */}
        <Card className="bg-white border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">${revenue.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">FOB: ${order.unitPrice}/pc</p>
          </CardContent>
        </Card>

        {/* 3. PROFIT */}
        <Card className="bg-white border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Est. Profit</CardTitle>
            {estimatedProfit >= 0 ? <CheckCircle2 className="h-4 w-4 text-green-500"/> : <AlertTriangle className="h-4 w-4 text-red-500"/>}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${estimatedProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              {order.costing ? `$${estimatedProfit.toLocaleString()}` : "-"}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {order.costing ? `${marginPercent.toFixed(1)}% Margin` : "No Costing"}
            </p>
          </CardContent>
        </Card>

        {/* 4. TIMELINE */}
        <Card className={`bg-white border shadow-sm ${isLate ? "border-red-200 bg-red-50" : ""}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Ship Date</CardTitle>
            <CalendarClock className={`h-4 w-4 ${isLate ? "text-red-600" : "text-purple-600"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isLate ? "text-red-700" : "text-slate-900"}`}>
              {daysLeft !== null ? (isLate ? `${Math.abs(daysLeft)} Days Over` : `${daysLeft} Days`) : "--"}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {shipDate ? format(shipDate, "dd MMM yyyy") : "Date Not Set"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ROW 2: CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financials */}
        <Card className="shadow-sm">
          <CardHeader className="pb-0"><CardTitle className="text-base">Financial Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[200px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financialData} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={60} tick={{fontSize: 12}} />
                  <Tooltip cursor={{fill: 'transparent'}} formatter={(value: number) => `$${value.toLocaleString()}`} />
                  <Bar dataKey="value" barSize={24} radius={[0, 4, 4, 0]}>
                    {financialData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Production */}
        <Card className="shadow-sm">
          <CardHeader className="pb-0"><CardTitle className="text-base">Production Status</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[200px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productionData} barGap={0}>
                  <XAxis dataKey="name" tick={{fontSize: 12}} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <ReferenceLine y={order.orderQty} stroke="#94a3b8" strokeDasharray="3 3" />
                  <Bar dataKey="value" barSize={40} radius={[4, 4, 0, 0]}>
                    {productionData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}