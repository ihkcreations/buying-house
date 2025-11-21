"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Calculator, Save, AlertTriangle } from "lucide-react";
import { saveCosting } from "@/app/actions/costing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function CostingForm({ orderId, initialData, orderFob }: { orderId: string, initialData?: any, orderFob: number }) {
  const [isLoading, setIsLoading] = useState(false);

  // --- 1. FABRIC CALCULATOR STATE ---
  // The "Bridge" we discussed: Price/Kg -> Consumption -> Cost/Dzn
  const [fabPrice, setFabPrice] = useState(0); // $/kg
  const [consumption, setConsumption] = useState(0); // kg/dzn
  const [wastage, setWastage] = useState(0); // %

  // --- 2. COST COMPONENTS STATE ---
  const [costs, setCosts] = useState({
    fabricCost: initialData?.fabricCostPerDzn || 0,
    trimsCost: initialData?.trimsCostPerDzn || 0,
    cmCost: initialData?.cmCostPerDzn || 0,
    commercialCost: initialData?.commercialCost || 0,
    logisticsCost: initialData?.logisticsCost || 0,
  });

  // --- 3. CALCULATIONS ---
  // Auto-calculate Fabric Cost if user uses the calculator inputs
  useEffect(() => {
    if (fabPrice > 0 && consumption > 0) {
      const base = fabPrice * consumption;
      const withWastage = base * (1 + wastage / 100);
      setCosts(prev => ({ ...prev, fabricCost: parseFloat(withWastage.toFixed(2)) }));
    }
  }, [fabPrice, consumption, wastage]);

  const totalCost = Object.values(costs).reduce((a, b) => a + (parseFloat(b as any) || 0), 0);
  const margin = orderFob - totalCost;
  const marginPercent = (margin / orderFob) * 100;

  // --- SUBMIT ---
  const handleSave = async () => {
    setIsLoading(true);
    const payload = {
      ...costs,
      netFob: orderFob,
      margin: margin,
    };

    const result = await saveCosting(orderId, payload);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Costing saved successfully!");
    }
    setIsLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* LEFT COLUMN: CALCULATORS */}
      <div className="space-y-6">
        {/* Fabric Calculator */}
        <Card className="border-blue-100 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
                <Calculator className="w-4 h-4" /> Fabric Cost Calculator
            </CardTitle>
            <CardDescription>Auto-calculates Fabric Cost ($/dzn) based on consumption.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label>Fabric Price ($/kg)</Label>
                    <Input 
                        type="number" placeholder="0.00" 
                        onChange={(e) => setFabPrice(parseFloat(e.target.value))}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Cons. (kg/dzn)</Label>
                    <Input 
                        type="number" placeholder="0.00" 
                        onChange={(e) => setConsumption(parseFloat(e.target.value))}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Wastage (%)</Label>
                    <Input 
                        type="number" placeholder="5" 
                        onChange={(e) => setWastage(parseFloat(e.target.value))}
                    />
                </div>
            </div>
            <Separator />
            <div className="flex justify-between items-center pt-2">
                <span className="text-sm text-slate-600">Calculated Cost:</span>
                <span className="font-bold text-lg text-blue-700">${costs.fabricCost} <span className="text-xs font-normal">/dzn</span></span>
            </div>
          </CardContent>
        </Card>

        {/* Other Inputs */}
        <Card>
            <CardHeader><CardTitle>Other Costs (Per Dozen)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Trims & Accessories</Label>
                        <Input 
                            type="number" 
                            value={costs.trimsCost || ""}
                            onChange={(e) => setCosts({...costs, trimsCost: parseFloat(e.target.value)})}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>CM (Cost of Making)</Label>
                        <Input 
                            type="number" 
                            value={costs.cmCost || ""}
                            onChange={(e) => setCosts({...costs, cmCost: parseFloat(e.target.value)})}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Commercial Charge</Label>
                        <Input 
                            type="number" 
                            value={costs.commercialCost || ""}
                            onChange={(e) => setCosts({...costs, commercialCost: parseFloat(e.target.value)})}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Logistics / Freight</Label>
                        <Input 
                            type="number" 
                            value={costs.logisticsCost || ""}
                            onChange={(e) => setCosts({...costs, logisticsCost: parseFloat(e.target.value)})}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* RIGHT COLUMN: SUMMARY & PROFIT */}
      <div className="space-y-6">
        <Card className="bg-white shadow-md border-slate-200">
            <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Breakdown Rows */}
                <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Fabric Cost</span>
                    <span className="font-medium">${costs.fabricCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Trims Cost</span>
                    <span className="font-medium">${costs.trimsCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-600">CM (Making)</span>
                    <span className="font-medium">${costs.cmCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Comm. & Logistics</span>
                    <span className="font-medium">${(costs.commercialCost + costs.logisticsCost).toFixed(2)}</span>
                </div>
                
                <Separator className="my-2" />
                
                {/* Totals */}
                <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700">TOTAL COST</span>
                    <span className="font-bold text-xl text-red-600">${totalCost.toFixed(2)}</span>
                </div>
                
                <div className="bg-slate-100 p-3 rounded-md flex justify-between items-center">
                    <span className="font-bold text-slate-700">SELLING PRICE (FOB)</span>
                    <span className="font-bold text-xl text-slate-900">${orderFob.toFixed(2)}</span>
                </div>

                {/* Margin Indicator (Dynamic Color) */}
                <div className={`p-4 rounded-md border ${margin >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex justify-between items-center">
                        <span className={margin >= 0 ? "text-green-800 font-medium" : "text-red-800 font-medium"}>
                            Net Profit / Loss
                        </span>
                        <div className="text-right">
                            <div className={`text-2xl font-bold ${margin >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                ${margin.toFixed(2)}
                            </div>
                            <div className={`text-xs ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {marginPercent.toFixed(1)}% Margin
                            </div>
                        </div>
                    </div>
                    {margin < 0 && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-red-600 font-medium">
                            <AlertTriangle className="w-3 h-3" /> Warning: Order is making a loss!
                        </div>
                    )}
                </div>

                <Button 
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700" 
                    onClick={handleSave}
                    disabled={isLoading}
                >
                    <Save className="w-4 h-4 mr-2" /> 
                    {isLoading ? "Saving..." : "Save & Approve Costing"}
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}