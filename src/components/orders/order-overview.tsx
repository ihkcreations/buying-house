"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine 
} from "recharts";
import { 
  DollarSign, Scissors, CalendarClock, AlertTriangle, CheckCircle2, Box, TrendingUp
} from "lucide-react";
import { format, differenceInDays } from "date-fns";

export function OrderOverview({ order }: { order: any }) {
  
  // --- 1. FINANCIAL LOGIC (Smart Switch) ---
  const revenue = order.totalValue;
  let cost = 0;
  let profit = 0;
  let isActual = false; // Flag to change label

  if (order.actualCosting) {
    // PRIORITY 1: Use OCS Actuals (Realized Numbers)
    isActual = true;
    
    // Sum all actual fields from the OCS Record
    const ac = order.actualCosting;
    cost = 
      (ac.fabricActual || 0) + (ac.trimsActual || 0) + 
      (ac.printingActual || 0) + (ac.embroideryActual || 0) + (ac.washingActual || 0) + (ac.cmActual || 0) +
      (ac.labTestActual || 0) + (ac.inspectionActual || 0) + (ac.samplingActual || 0) + 
      (ac.commercialActual || 0) + (ac.logisticsActual || 0);
      
    profit = revenue - cost;

  } else if (order.costing) {
    // PRIORITY 2: Use Costing Budget (Estimated Numbers)
    const dozens = order.orderQty / 12;
    
    // Calculate Commission Amount from Budget
    const commPercent = order.costing.commissionPercent || 0;
    const commAmountPerDzn = (order.unitPrice * 12) * (commPercent / 100);
    
    // Total Cost Per Dzn (Expenses + Commission)
    const costPerDzn = order.costing.totalCost + commAmountPerDzn;
    
    cost = costPerDzn * dozens;
    profit = revenue - cost;
  }

  const marginPercent = revenue > 0 ? (profit / revenue) * 100 : 0;

  const financialData = [
    { name: "Revenue", value: revenue, color: "#2563eb" }, 
    { name: "Cost", value: cost, color: "#94a3b8" }, 
    { name: "Profit", value: profit, color: profit >= 0 ? "#16a34a" : "#dc2626" },
  ];

  // --- 2. PRODUCTION LOGIC ---
  const logs = order.productionLogs || [];
  const totalCut = logs.reduce((acc: number, log: any) => acc + log.cutQty, 0);
  const totalSew = logs.reduce((acc: number, log: any) => acc + log.sewQty, 0);
  const totalPack = logs.reduce((acc: number, log: any) => acc + log.packQty, 0);

  const productionData = [
    { name: "Cut", value: totalCut, color: "#f97316" }, 
    { name: "Sew", value: totalSew, color: "#3b82f6" }, 
    { name: "Pack", value: totalPack, color: "#22c55e" }, 
  ];

  // --- 3. TIMELINE LOGIC ---
  const shipDate = order.timeAction?.shipmentPlan ? new Date(order.timeAction.shipmentPlan) : null;
  const daysLeft = shipDate ? differenceInDays(shipDate, new Date()) : null;
  const isLate = daysLeft !== null && daysLeft < 0;

  return (
    <div className="space-y-6">
      
      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* QTY */}
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

        {/* REVENUE */}
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

        {/* PROFIT (Smart Label) */}
        <Card className="bg-white border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
                {isActual ? "Realized Net Profit" : "Est. Profit"}
            </CardTitle>
            {isActual ? <TrendingUp className="h-4 w-4 text-purple-600"/> : (profit >= 0 ? <CheckCircle2 className="h-4 w-4 text-green-500"/> : <AlertTriangle className="h-4 w-4 text-red-500"/>)}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
              {cost > 0 ? `$${profit.toLocaleString()}` : "-"}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              {cost > 0 ? `${marginPercent.toFixed(1)}% Margin` : "No Costing Data"}
              {isActual && <span className="bg-slate-100 text-slate-600 px-1 rounded text-[10px] font-bold">ACTUAL</span>}
            </p>
          </CardContent>
        </Card>

        {/* TIMELINE */}
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

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financials */}
        <Card className="shadow-sm">
          <CardHeader className="pb-0 flex flex-row justify-between">
              <CardTitle className="text-base">Financial Breakdown</CardTitle>
              {isActual && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-bold">FINALIZED</span>}
          </CardHeader>
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