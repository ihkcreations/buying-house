"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Calculator, Save, ChevronDown, ChevronUp } from "lucide-react";
import { saveCosting } from "@/app/actions/costing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function CostingForm({ orderId, initialData, orderFob }: { orderId: string, initialData?: any, orderFob: number }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showAccessories, setShowAccessories] = useState(false);
  const [showFabCalc, setShowFabCalc] = useState(false); // To toggle calculator

  // --- 1. FABRIC CALCULATOR STATE ---
  const [fabParams, setFabParams] = useState({
      pricePerKg: 0,
      consumption: 0, // kg/dzn
      wastage: 5 // %
  });

  // --- 2. MAIN COST STATE ---
  const [costs, setCosts] = useState({
    fabricCost: initialData?.fabricCostPerDzn || 0,
    
    // Value Addition
    printingCost: initialData?.printingCost || 0,
    embroideryCost: initialData?.embroideryCost || 0,
    washingCost: initialData?.washingCost || 0,
    cmCost: initialData?.cmCostPerDzn || 0,

    // Overheads
    labTestCost: initialData?.labTestCost || 0,
    inspectionCost: initialData?.inspectionCost || 0,
    samplingCost: initialData?.samplingCost || 0,
    commercialCost: initialData?.commercialCost || 0,
    logisticsCost: initialData?.logisticsCost || 0,

    // Commission %
    commissionPercent: initialData?.commissionPercent || 0,
  });

  // Accessories Breakdown
  const [accessories, setAccessories] = useState(initialData?.accessoriesBreakdown || {
      thread: 0, labels: 0, poly: 0, carton: 0, others: 0
  });

  // --- 3. AUTO-CALCULATIONS ---

  // A. Fabric Calculator Logic (Auto-update Fabric Cost field)
  useEffect(() => {
    if (fabParams.pricePerKg > 0 && fabParams.consumption > 0) {
        const baseCost = fabParams.pricePerKg * fabParams.consumption;
        const withWastage = baseCost * (1 + (fabParams.wastage / 100));
        setCosts(prev => ({ ...prev, fabricCost: parseFloat(withWastage.toFixed(2)) }));
    }
  }, [fabParams]);

  // B. Trims Total
  const trimsTotal = Object.values(accessories).reduce((a: number, b: any) => a + (parseFloat(b) || 0), 0);

  // C. Total Expenses (Per Dozen)
  const totalCost = 
    (costs.fabricCost || 0) +
    trimsTotal +
    (costs.printingCost || 0) +
    (costs.embroideryCost || 0) +
    (costs.washingCost || 0) +
    (costs.cmCost || 0) +
    (costs.labTestCost || 0) +
    (costs.inspectionCost || 0) +
    (costs.samplingCost || 0) +
    (costs.commercialCost || 0) +
    (costs.logisticsCost || 0);

  // D. Financials (THE FIX: Convert Unit Price to Dozen Price)
  const revenuePerDzn = orderFob * 12; // $2.50 * 12 = $30.00
  const commissionAmount = (revenuePerDzn * (costs.commissionPercent / 100));
  const netMargin = revenuePerDzn - totalCost - commissionAmount;
  const marginPercent = (netMargin / revenuePerDzn) * 100;

  // --- HANDLERS ---
  const handleSave = async () => {
    setIsLoading(true);
    const payload = {
      ...costs,
      accessoriesBreakdown: accessories,
      totalCost,
      profitMargin: netMargin,
      netFob: orderFob, // We save the original Unit Price
    };

    const result = await saveCosting(orderId, payload);
    if (result?.error) toast.error(result.error);
    else toast.success("Costing saved successfully!");
    setIsLoading(false);
  };

  const handleCostChange = (field: string, value: string) => {
      setCosts(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
      
      {/* LEFT COLUMN: INPUTS */}
      <div className="space-y-6 lg:col-span-2">
        
        <Card>
            <CardHeader><CardTitle>Direct Costs (Per Dozen)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                
                {/* FABRIC SECTION WITH CALCULATOR */}
                <div className="p-4 border rounded-md bg-blue-50/30">
                    <div className="flex justify-between items-center mb-2">
                        <Label className="text-blue-900 font-semibold">Fabric Cost ($/dzn)</Label>
                        <Button variant="ghost" size="sm" onClick={() => setShowFabCalc(!showFabCalc)} className="text-xs text-blue-600 h-6">
                            <Calculator className="w-3 h-3 mr-1" /> {showFabCalc ? "Hide Calculator" : "Use Calculator"}
                        </Button>
                    </div>
                    
                    {/* The Calculator */}
                    {showFabCalc && (
                        <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-blue-100">
                            <div>
                                <Label className="text-xs text-slate-500">Yarn Price ($/kg)</Label>
                                <Input type="number" placeholder="4.50" onChange={(e) => setFabParams({...fabParams, pricePerKg: parseFloat(e.target.value)})} className="h-8 bg-white" />
                            </div>
                            <div>
                                <Label className="text-xs text-slate-500">Cons. (kg/dzn)</Label>
                                <Input type="number" placeholder="2.40" onChange={(e) => setFabParams({...fabParams, consumption: parseFloat(e.target.value)})} className="h-8 bg-white" />
                            </div>
                            <div>
                                <Label className="text-xs text-slate-500">Wastage %</Label>
                                <Input type="number" defaultValue={5} onChange={(e) => setFabParams({...fabParams, wastage: parseFloat(e.target.value)})} className="h-8 bg-white" />
                            </div>
                        </div>
                    )}

                    <Input 
                        type="number" 
                        value={costs.fabricCost || ""} 
                        onChange={(e) => handleCostChange("fabricCost", e.target.value)}
                        className="bg-white font-bold text-slate-900"
                    />
                </div>

                {/* CM */}
                <div className="space-y-2">
                    <Label>CM (Making Cost)</Label>
                    <Input type="number" value={costs.cmCost || ""} onChange={(e) => handleCostChange("cmCost", e.target.value)} />
                </div>
                
                {/* Value Addition Grid */}
                <div className="grid grid-cols-3 gap-4 border p-4 rounded-md bg-slate-50/50">
                    <div className="space-y-2"><Label>Printing</Label><Input type="number" value={costs.printingCost || ""} onChange={(e) => handleCostChange("printingCost", e.target.value)} /></div>
                    <div className="space-y-2"><Label>Embroidery</Label><Input type="number" value={costs.embroideryCost || ""} onChange={(e) => handleCostChange("embroideryCost", e.target.value)} /></div>
                    <div className="space-y-2"><Label>Washing</Label><Input type="number" value={costs.washingCost || ""} onChange={(e) => handleCostChange("washingCost", e.target.value)} /></div>
                </div>

                {/* Accessories Collapsible */}
                <Collapsible open={showAccessories} onOpenChange={setShowAccessories} className="border rounded-md p-4 bg-slate-50">
                    <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">Trims & Accessories</Label>
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-slate-700">${trimsTotal.toFixed(2)}</span>
                            <CollapsibleTrigger asChild><Button variant="ghost" size="sm">{showAccessories ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>}</Button></CollapsibleTrigger>
                        </div>
                    </div>
                    <CollapsibleContent className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                        <div className="space-y-1"><Label className="text-xs">Thread</Label><Input type="number" value={accessories.thread || ""} onChange={(e) => setAccessories({...accessories, thread: e.target.value})}/></div>
                        <div className="space-y-1"><Label className="text-xs">Labels</Label><Input type="number" value={accessories.labels || ""} onChange={(e) => setAccessories({...accessories, labels: e.target.value})}/></div>
                        <div className="space-y-1"><Label className="text-xs">Poly</Label><Input type="number" value={accessories.poly || ""} onChange={(e) => setAccessories({...accessories, poly: e.target.value})}/></div>
                        <div className="space-y-1"><Label className="text-xs">Cartons</Label><Input type="number" value={accessories.carton || ""} onChange={(e) => setAccessories({...accessories, carton: e.target.value})}/></div>
                        <div className="space-y-1"><Label className="text-xs">Others</Label><Input type="number" value={accessories.others || ""} onChange={(e) => setAccessories({...accessories, others: e.target.value})}/></div>
                    </CollapsibleContent>
                </Collapsible>
            </CardContent>
        </Card>

        {/* OVERHEADS */}
        <Card>
            <CardHeader><CardTitle>Overheads & Indirect Costs</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Lab Test</Label><Input type="number" value={costs.labTestCost || ""} onChange={(e) => handleCostChange("labTestCost", e.target.value)} /></div>
                <div className="space-y-2"><Label>Inspection</Label><Input type="number" value={costs.inspectionCost || ""} onChange={(e) => handleCostChange("inspectionCost", e.target.value)} /></div>
                <div className="space-y-2"><Label>Sampling</Label><Input type="number" value={costs.samplingCost || ""} onChange={(e) => handleCostChange("samplingCost", e.target.value)} /></div>
                <div className="space-y-2"><Label>Commercial</Label><Input type="number" value={costs.commercialCost || ""} onChange={(e) => handleCostChange("commercialCost", e.target.value)} /></div>
                <div className="space-y-2"><Label>Logistics</Label><Input type="number" value={costs.logisticsCost || ""} onChange={(e) => handleCostChange("logisticsCost", e.target.value)} /></div>
                
                <div className="space-y-2 bg-yellow-50 p-2 rounded border border-yellow-200">
                    <Label className="text-yellow-800">Commission %</Label>
                    <Input type="number" className="bg-white h-8" value={costs.commissionPercent || ""} onChange={(e) => handleCostChange("commissionPercent", e.target.value)} />
                </div>
            </CardContent>
        </Card>
      </div>

      {/* RIGHT COLUMN: SUMMARY */}
      <div className="space-y-6">
        <Card className="bg-white shadow-lg border-slate-200 sticky top-6">
            <CardHeader className="bg-slate-900 text-white rounded-t-lg">
                <CardTitle className="flex justify-between items-center">
                    <span>Cost Sheet</span>
                    {/* THIS IS THE VISUAL FIX: SHOW DOZEN PRICE */}
                    <div className="text-right">
                        <span className="block text-sm font-normal text-slate-300">Unit: ${orderFob.toFixed(2)}</span>
                        <span className="block text-lg font-bold">Dzn: ${revenuePerDzn.toFixed(2)}</span>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
                
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Fabric Cost</span><span>${costs.fabricCost.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Trims & Acc.</span><span>${trimsTotal.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Value Added</span><span>${(costs.printingCost + costs.embroideryCost + costs.washingCost).toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Making (CM)</span><span>${costs.cmCost.toFixed(2)}</span></div>
                    <Separator className="my-2"/>
                    <div className="flex justify-between text-slate-500"><span>Overheads</span><span>${(costs.labTestCost + costs.inspectionCost + costs.samplingCost + costs.commercialCost + costs.logisticsCost).toFixed(2)}</span></div>
                    <div className="flex justify-between text-yellow-600 font-medium"><span>Commission ({costs.commissionPercent}%)</span><span>${commissionAmount.toFixed(2)}</span></div>
                </div>
                
                <Separator className="my-2 bg-slate-200" />
                
                <div className="flex justify-between items-center text-lg">
                    <span className="font-bold text-slate-700">TOTAL COST</span>
                    <span className="font-bold text-slate-900">${(totalCost + commissionAmount).toFixed(2)}</span>
                </div>

                <div className={`p-4 rounded-md border ${netMargin >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex justify-between items-center">
                        <span className={netMargin >= 0 ? "text-green-800 font-medium" : "text-red-800 font-medium"}>
                            Net Profit / Dzn
                        </span>
                        <div className="text-right">
                            <div className={`text-2xl font-bold ${netMargin >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                ${netMargin.toFixed(2)}
                            </div>
                            <div className={`text-xs ${netMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {marginPercent.toFixed(1)}% Margin
                            </div>
                        </div>
                    </div>
                </div>

                <Button 
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 h-12 text-lg" 
                    onClick={handleSave}
                    disabled={isLoading}
                >
                    <Save className="w-5 h-5 mr-2" /> 
                    {isLoading ? "Saving..." : "Approve Costing"}
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}