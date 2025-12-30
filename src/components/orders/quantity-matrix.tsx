"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Layers } from "lucide-react";

export function QuantityMatrix({ matrix, totalQty }: { matrix: any[], totalQty: number }) {
  // Get all unique sizes across all colors
  const allSizes = Array.from(new Set(matrix.flatMap(row => Object.keys(row.sizes)))).sort();

  return (
    <Card className="shadow-md border-slate-200 overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b pb-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-slate-500" />
                <CardTitle className="text-lg text-slate-700">Size-Color Breakdown</CardTitle>
            </div>
            <Badge variant="secondary" className="text-sm px-3 py-1 bg-white border shadow-sm">
                Total: <span className="font-bold ml-1 text-slate-900">{totalQty.toLocaleString()} pcs</span>
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
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
                <th className="px-6 py-4 text-right font-medium uppercase text-xs tracking-wider w-[150px]">Distribution</th>
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
                            {/* Color Dot */}
                            <div 
                                className="w-3 h-3 rounded-full border border-slate-200" 
                                style={{ backgroundColor: row.color.toLowerCase() }}
                            />
                            {row.color}
                        </div>
                    </td>
                    {allSizes.map(size => (
                        <td key={size} className="px-4 py-4 text-center">
                            {row.sizes[size] ? (
                                <span className="font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded text-xs group-hover:bg-white group-hover:shadow-sm transition-all">
                                    {row.sizes[size]}
                                </span>
                            ) : (
                                <span className="text-slate-200">-</span>
                            )}
                        </td>
                    ))}
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                        {rowTotal.toLocaleString()}
                    </td>
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
            {/* Footer Row */}
            <tfoot className="bg-slate-50 font-bold text-slate-900 border-t">
                <tr>
                    <td className="px-6 py-4">GRAND TOTAL</td>
                    {allSizes.map(size => {
                        const colTotal = matrix.reduce((acc, row) => acc + (row.sizes[size] || 0), 0);
                        return <td key={size} className="px-4 py-4 text-center text-slate-500">{colTotal}</td>
                    })}
                    <td className="px-6 py-4 text-right text-lg text-blue-700">{totalQty.toLocaleString()}</td>
                    <td className="px-6 py-4"></td>
                </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}