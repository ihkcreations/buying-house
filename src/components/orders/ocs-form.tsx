"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Save, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { saveOCS } from "@/app/actions/ocs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export function OCSForm({ 
    orderId, 
    budgetPerDzn, // From Costing Model
    actuals,      // From ActualCosting Model
    orderQty,
    totalRevenue  // Order Total Value
}: { 
    orderId: string, 
    budgetPerDzn: any, 
    actuals?: any,
    orderQty: number,
    totalRevenue: number
}) {
  const [isLoading, setIsLoading] = useState(false);

  // Helper to convert Costing (Per Dzn) to Budget (Total $)
  // Formula: (Qty / 12) * CostPerDzn
  const getBudgetTotal = (costPerDzn: number) => {
      const dozens = orderQty / 12;
      return parseFloat(((costPerDzn || 0) * dozens).toFixed(2));
  };

  // State for Actuals (User Inputs)
  const [vals, setVals] = useState({
      fabric: actuals?.fabricActual || 0,
      trims: actuals?.trimsActual || 0,
      print: actuals?.printingActual || 0,
      emb: actuals?.embroideryActual || 0,
      wash: actuals?.washingActual || 0,
      cm: actuals?.cmActual || 0,
      lab: actuals?.labTestActual || 0,
      insp: actuals?.inspectionActual || 0,
      sample: actuals?.samplingActual || 0,
      comm: actuals?.commercialActual || 0,
      log: actuals?.logisticsActual || 0,
  });

  const handleChange = (key: string, val: string) => {
      setVals(prev => ({ ...prev, [key]: parseFloat(val) || 0 }));
  };

  // --- COMPARISON LOGIC ---
  const renderRow = (label: string, budgetDzn: number, actualKey: string) => {
      const budgetTotal = getBudgetTotal(budgetDzn);
      // @ts-ignore
      const actualTotal = vals[actualKey];
      const variance = budgetTotal - actualTotal; // Positive means we saved money
      const isOverBudget = variance < 0;

      return (
          <div className="grid grid-cols-12 gap-4 items-center py-3 border-b last:border-0 hover:bg-slate-50/50 px-2">
              <div className="col-span-4 font-medium text-sm text-slate-700">{label}</div>
              
              {/* Budget Column (Read Only) */}
              <div className="col-span-3 text-right text-slate-500 font-mono text-sm">
                  ${budgetTotal.toLocaleString()}
              </div>

              {/* Actual Column (Input) */}
              <div className="col-span-3">
                  <Input 
                    type="number" 
                    value={actualTotal || ""} 
                    onChange={(e) => handleChange(actualKey, e.target.value)}
                    className={`text-right h-8 font-bold ${isOverBudget ? "text-red-600 bg-red-50 border-red-200" : "text-slate-900"}`}
                  />
              </div>

              {/* Variance Indicator */}
              <div className="col-span-2 text-right text-xs">
                  {Math.abs(variance) > 1 ? (
                      <span className={`flex items-center justify-end gap-1 ${isOverBudget ? "text-red-600" : "text-green-600"}`}>
                          {isOverBudget ? <TrendingUp className="w-3 h-3"/> : <TrendingDown className="w-3 h-3"/>}
                          ${Math.abs(variance).toLocaleString()}
                      </span>
                  ) : (
                      <span className="text-slate-300">-</span>
                  )}
              </div>
          </div>
      );
  };

  const handleSave = async () => {
      setIsLoading(true);
      const formData = new FormData();
      Object.keys(vals).forEach(key => formData.append(key, vals[key as keyof typeof vals].toString()));
      
      const result = await saveOCS(orderId, formData);
      if(result.error) toast.error(result.error);
      else toast.success(result.success);
      setIsLoading(false);
  };

  // --- FINAL TOTALS ---
  const totalActualCost = Object.values(vals).reduce((a, b) => a + b, 0);
  const finalProfit = totalRevenue - totalActualCost;
  const profitColor = finalProfit >= 0 ? "text-green-600" : "text-red-600";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: THE INPUT TABLE */}
        <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Budget vs. Actuals</CardTitle>
                <Badge variant="outline" className="font-mono">Total Order Qty: {orderQty.toLocaleString()}</Badge>
            </CardHeader>
            <CardContent>
                {/* Header Row */}
                <div className="grid grid-cols-12 gap-4 pb-2 border-b-2 border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <div className="col-span-4">Cost Head</div>
                    <div className="col-span-3 text-right">Budget (Total)</div>
                    <div className="col-span-3 text-right">Actual (Paid)</div>
                    <div className="col-span-2 text-right">Var</div>
                </div>

                {renderRow("Fabric Cost", budgetPerDzn?.fabricCostPerDzn, "fabric")}
                {renderRow("Trims & Acc.", budgetPerDzn?.trimsCostPerDzn, "trims")}
                {renderRow("Printing", budgetPerDzn?.printingCost, "print")}
                {renderRow("Embroidery", budgetPerDzn?.embroideryCost, "emb")}
                {renderRow("Washing", budgetPerDzn?.washingCost, "wash")}
                {renderRow("Making (CM)", budgetPerDzn?.cmCostPerDzn, "cm")}
                
                <Separator className="my-2"/>
                
                {renderRow("Lab Test", budgetPerDzn?.labTestCost, "lab")}
                {renderRow("Inspection", budgetPerDzn?.inspectionCost, "insp")}
                {renderRow("Sampling", budgetPerDzn?.samplingCost, "sample")}
                {renderRow("Commercial", budgetPerDzn?.commercialCost, "comm")}
                {renderRow("Logistics", budgetPerDzn?.logisticsCost, "log")}
            </CardContent>
        </Card>

        {/* RIGHT: THE VERDICT */}
        <div className="space-y-6">
            <Card className="bg-slate-900 text-white border-none shadow-xl">
                <CardHeader>
                    <CardTitle className="text-slate-300">Final Financials</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex justify-between items-end border-b border-slate-700 pb-2">
                        <span className="text-sm text-slate-400">Total Revenue</span>
                        <span className="text-2xl font-bold">${totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-slate-700 pb-2">
                        <span className="text-sm text-slate-400">Total Actual Cost</span>
                        <span className="text-2xl font-bold text-orange-400">${totalActualCost.toLocaleString()}</span>
                    </div>
                    
                    <div className="pt-2">
                        <span className="text-sm text-slate-400 block mb-1">Realized Net Profit</span>
                        <div className={`text-4xl font-extrabold ${finalProfit >= 0 ? "text-green-400" : "text-red-500"}`}>
                            ${finalProfit.toLocaleString()}
                        </div>
                        {finalProfit < 0 && (
                            <div className="flex items-center gap-2 mt-2 text-red-400 bg-red-900/30 p-2 rounded text-xs font-bold">
                                <AlertCircle className="w-4 h-4" /> 
                                ALERT: LOSS PROJECT DETECTED
                            </div>
                        )}
                    </div>

                    <Button onClick={handleSave} disabled={isLoading} className="w-full bg-white text-slate-900 hover:bg-slate-200 font-bold">
                        {isLoading ? "Saving..." : "Finalize Actuals & Save"} <Save className="w-4 h-4 ml-2"/>
                    </Button>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}