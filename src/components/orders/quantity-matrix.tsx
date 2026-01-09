"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Layers } from "lucide-react";

export function QuantityMatrix({ matrix, totalQty }: { matrix: any[], totalQty: number }) {
  const allSizes = Array.from(new Set(matrix.flatMap(row => Object.keys(row.sizes)))).sort();

  return (
    <Card className="shadow-md border-slate-200 overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b pb-4 px-4 pt-4">
        <div className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-slate-500" />
                <CardTitle className="text-base md:text-lg text-slate-700">Quantity Matrix</CardTitle>
            </div>
            <Badge variant="secondary" className="text-xs md:text-sm px-2 py-1 bg-white border shadow-sm">
                Total: <span className="font-bold ml-1 text-slate-900">{totalQty.toLocaleString()}</span>
            </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        
        {/* DESKTOP TABLE VIEW (Hidden on Mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white text-slate-500 border-b">
              <tr>
                <th className="px-6 py-4 font-medium uppercase text-xs tracking-wider w-[200px]">Color Name</th>
                {allSizes.map(size => (
                    <th key={size} className="px-4 py-4 text-center font-medium uppercase text-xs text-slate-400">
                        {size}
                    </th>
                ))}
                <th className="px-6 py-4 text-right font-medium uppercase text-xs tracking-wider">Subtotal</th>
                <th className="px-6 py-4 text-right font-medium uppercase text-xs tracking-wider w-[150px]">Dist.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {matrix.map((row: any, idx: number) => {
                const rowTotal = Object.values(row.sizes).reduce((a: any, b: any) => a + b, 0) as number;
                const percentage = totalQty > 0 ? (rowTotal / totalQty) * 100 : 0;

                return (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-slate-700">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full border border-slate-200" style={{ backgroundColor: row.color.toLowerCase() }} />
                            {row.color}
                        </div>
                    </td>
                    {allSizes.map(size => (
                        <td key={size} className="px-4 py-4 text-center">
                            {row.sizes[size] ? <span className="font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded text-xs">{row.sizes[size]}</span> : <span className="text-slate-200">-</span>}
                        </td>
                    ))}
                    <td className="px-6 py-4 text-right font-bold text-slate-900">{rowTotal.toLocaleString()}</td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-end">
                            <span className="text-[10px] text-slate-400 w-8 text-right">{percentage.toFixed(0)}%</span>
                            <Progress value={percentage} className="h-1.5 w-16" indicatorClassName="bg-slate-400" />
                        </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARD VIEW (Hidden on Desktop) */}
        <div className="md:hidden divide-y divide-slate-100">
            {matrix.map((row: any, idx: number) => {
                const rowTotal = Object.values(row.sizes).reduce((a: any, b: any) => a + b, 0) as number;
                
                return (
                    <div key={idx} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 font-bold text-slate-900">
                                <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: row.color.toLowerCase() }} />
                                {row.color}
                            </div>
                            <Badge variant="outline" className="bg-slate-50">{rowTotal.toLocaleString()} pcs</Badge>
                        </div>
                        
                        {/* Size Grid */}
                        <div className="grid grid-cols-4 gap-2">
                            {allSizes.map(size => (
                                row.sizes[size] ? (
                                    <div key={size} className="flex flex-col items-center bg-slate-50 rounded p-1 border border-slate-100">
                                        <span className="text-[10px] text-slate-400 uppercase">{size}</span>
                                        <span className="text-xs font-bold text-slate-700">{row.sizes[size]}</span>
                                    </div>
                                ) : null
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>

      </CardContent>
    </Card>
  );
}