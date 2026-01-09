"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine 
} from "recharts";
import { 
  DollarSign, Scissors, CalendarClock, AlertTriangle, CheckCircle2, Box, TrendingUp
} from "lucide-react";
import { format, differenceInDays } from "date-fns";

export function OrderOverview({ order }: { order: any }) {
  
  // --- LOGIC (Same as before) ---
  const revenue = order.totalValue;
  let cost = 0;
  let profit = 0;
  let isActual = false;

  if (order.actualCosting) {
    isActual = true;
    const ac = order.actualCosting;
    cost = (ac.fabricActual || 0) + (ac.trimsActual || 0) + (ac.printingActual || 0) + (ac.embroideryActual || 0) + (ac.washingActual || 0) + (ac.cmActual || 0) + (ac.labTestActual || 0) + (ac.inspectionActual || 0) + (ac.samplingActual || 0) + (ac.commercialActual || 0) + (ac.logisticsActual || 0);
    profit = revenue - cost;
  } else if (order.costing) {
    const dozens = order.orderQty / 12;
    const commPercent = order.costing.commissionPercent || 0;
    const commAmountPerDzn = (order.unitPrice * 12) * (commPercent / 100);
    const costPerDzn = order.costing.totalCost + commAmountPerDzn;
    cost = costPerDzn * dozens;
    profit = revenue - cost;
  }

  const marginPercent = revenue > 0 ? (profit / revenue) * 100 : 0;

  const financialData = [
    { name: "Rev", value: revenue, color: "#2563eb" }, 
    { name: "Cost", value: cost, color: "#94a3b8" }, 
    { name: "Profit", value: profit, color: profit >= 0 ? "#16a34a" : "#dc2626" },
  ];

  const logs = order.productionLogs || [];
  const totalCut = logs.reduce((acc: number, log: any) => acc + log.cutQty, 0);
  const totalSew = logs.reduce((acc: number, log: any) => acc + log.sewQty, 0);
  const totalPack = logs.reduce((acc: number, log: any) => acc + log.packQty, 0);

  const productionData = [
    { name: "Cut", value: totalCut, color: "#f97316" }, 
    { name: "Sew", value: totalSew, color: "#3b82f6" }, 
    { name: "Pack", value: totalPack, color: "#22c55e" }, 
  ];

  const shipDate = order.timeAction?.shipmentPlan ? new Date(order.timeAction.shipmentPlan) : null;
  const daysLeft = shipDate ? differenceInDays(shipDate, new Date()) : null;
  const isLate = daysLeft !== null && daysLeft < 0;

  return (
    <div className="space-y-6">
      
      {/* ROW 1: KPI CARDS (2x2 on Mobile) */}
      {/* Added 'min-w-0' to prevent overflow issues */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4 min-w-0">
        
        {/* QTY */}
        <Card className="bg-slate-900 text-white shadow-md border-none p-4 min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
            <CardTitle className="text-xs font-medium text-slate-300 truncate">Total Qty</CardTitle>
            <Box className="h-4 w-4 text-slate-300 hidden sm:block" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-xl sm:text-2xl font-bold truncate tracking-tight">{order.orderQty.toLocaleString()}</div>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-1 truncate">{(order.orderQty / 12).toFixed(0)} Dozen</p>
          </CardContent>
        </Card>

        {/* REVENUE */}
        <Card className="bg-white border shadow-sm p-4 min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 truncate">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600 hidden sm:block" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-xl sm:text-2xl font-bold text-slate-900 truncate tracking-tight">${revenue.toLocaleString()}</div>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1 truncate">FOB ${order.unitPrice}</p>
          </CardContent>
        </Card>

        {/* PROFIT */}
        <Card className="bg-white border shadow-sm p-4 min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 truncate">
                {isActual ? "Realized" : "Est. Profit"}
            </CardTitle>
            <TrendingUp className={`h-4 w-4 hidden sm:block ${profit >= 0 ? "text-green-600" : "text-red-600"}`} />
          </CardHeader>
          <CardContent className="p-0">
            <div className={`text-xl sm:text-2xl font-bold truncate tracking-tight ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
              {cost > 0 ? `$${profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "-"}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1 truncate">
              {cost > 0 ? `${marginPercent.toFixed(1)}% Margin` : "No Costing"}
            </p>
          </CardContent>
        </Card>

        {/* TIMELINE */}
        <Card className={`bg-white border shadow-sm p-4 min-w-0 ${isLate ? "border-red-200 bg-red-50" : ""}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 truncate">Timeline</CardTitle>
            <CalendarClock className={`h-4 w-4 hidden sm:block ${isLate ? "text-red-600" : "text-purple-600"}`} />
          </CardHeader>
          <CardContent className="p-0">
            <div className={`text-xl sm:text-2xl font-bold truncate tracking-tight ${isLate ? "text-red-700" : "text-slate-900"}`}>
              {daysLeft !== null ? (isLate ? `${Math.abs(daysLeft)} Days Late` : `${daysLeft} Days`) : "--"}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1 truncate">
              Ship: {shipDate ? format(shipDate, "dd MMM") : "N/A"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ROW 2: CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 min-w-0">
        
        {/* Financials Chart (Fixed Margins) */}
        <Card className="shadow-sm">
          <CardHeader className="pb-0 pt-4 px-4"><CardTitle className="text-base">Financial Breakdown</CardTitle></CardHeader>
          <CardContent className="px-2">
            <div className="h-[200px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                    data={financialData} 
                    layout="vertical" 
                    margin={{ left: 0, right: 30, top: 10, bottom: 10 }} // Adjusted margins
                > 
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={40} tick={{fontSize: 10}} />
                  <Tooltip cursor={{fill: 'transparent'}} formatter={(value: number | undefined) => value !== undefined ? `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : ''} />
                  <Bar dataKey="value" barSize={20} radius={[0, 4, 4, 0]}>
                    {financialData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Production Chart */}
        <Card className="shadow-sm">
          <CardHeader className="pb-0 pt-4 px-4"><CardTitle className="text-base">Production Status</CardTitle></CardHeader>
          <CardContent className="px-2">
            <div className="h-[200px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productionData} barGap={0} margin={{ top: 10 }}>
                  <XAxis dataKey="name" tick={{fontSize: 10}} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <ReferenceLine y={order.orderQty} stroke="#94a3b8" strokeDasharray="3 3" />
                  <Bar dataKey="value" barSize={30} radius={[4, 4, 0, 0]}>
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