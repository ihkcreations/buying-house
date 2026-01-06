"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, User } from "lucide-react";
import { deleteExpense } from "@/app/actions/finance";
import { toast } from "sonner";
import { format } from "date-fns";

export function ExpenseList({ expenses, isAdmin }: { expenses: any[], isAdmin: boolean }) {
  
  const handleDelete = async (id: string) => {
      if(confirm("Delete this expense record?")) {
          const res = await deleteExpense(id);
          if(res.success) toast.success("Deleted");
          else toast.error("Failed");
      }
  };

  return (
    <div className="grid gap-3">
        {expenses.map((exp) => (
            <Card key={exp.id} className="p-4 flex flex-col gap-2 relative group">
                
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">{exp.category}</Badge>
                            {/* NEW: Show User Name */}
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                <User className="w-3 h-3"/> {exp.userName}
                            </span>
                        </div>
                        <p className="text-sm font-medium mt-1">{exp.description}</p>
                    </div>
                    <div className="text-right">
                        {/* NEW: Dynamic Symbol */}
                        <span className="text-lg font-bold text-slate-900">
                            {exp.currency === "USD" ? "$" : "৳"}{exp.amount.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-2 border-t mt-1">
                    <span className="text-xs text-slate-500">{format(new Date(exp.date), "dd MMM yy")}</span>
                    
                    <div className="flex items-center gap-2">
                        <StatusBadge status={exp.status} />
                        
                        {/* NEW: Admin Delete Button */}
                        {isAdmin && (
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600" onClick={() => handleDelete(exp.id)}>
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        )}
                    </div>
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