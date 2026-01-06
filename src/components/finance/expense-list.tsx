"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { DollarSign, Calendar, Tag } from "lucide-react";

export function ExpenseList({ expenses }: { expenses: any[] }) {
  if (expenses.length === 0) {
      return <div className="text-center py-10 text-slate-500">No expenses found.</div>;
  }

  return (
    <div className="grid gap-3">
        {expenses.map((exp) => (
            <Card key={exp.id} className="p-4 flex flex-col gap-2 hover:bg-slate-50">
                
                {/* Header: Category & Amount */}
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-white">{exp.category}</Badge>
                            {exp.order && <Badge variant="secondary" className="text-[10px]">#{exp.order.orderNo}</Badge>}
                        </div>
                        <p className="text-sm font-medium mt-1 text-slate-900">{exp.description || "No description"}</p>
                    </div>
                    <div className="text-right">
                        <span className="text-lg font-bold text-slate-900">${exp.amount.toFixed(2)}</span>
                    </div>
                </div>

                {/* Footer: Date & Status */}
                <div className="flex justify-between items-center pt-2 border-t mt-1">
                    <div className="flex items-center text-xs text-slate-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {format(new Date(exp.date), "dd MMM yy")}
                    </div>
                    <StatusBadge status={exp.status} />
                </div>
            </Card>
        ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
    if (status === "APPROVED") return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Approved</Badge>;
    if (status === "REJECTED") return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Rejected</Badge>;
    return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pending</Badge>;
}