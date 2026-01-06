"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, X, User, Calendar, FileText } from "lucide-react";
import { updateExpenseStatus } from "@/app/actions/finance";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function ExpenseApprovalList({ expenses }: { expenses: any[] }) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAction = async (id: string, status: "APPROVED" | "REJECTED") => {
      setProcessingId(id);
      const result = await updateExpenseStatus(id, status);
      if(result.success) toast.success(result.success);
      else toast.error(result.error);
      setProcessingId(null);
  };

  if (expenses.length === 0) {
      return (
          <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
              <Check className="w-12 h-12 mx-auto mb-2 text-green-200" />
              No pending expenses to review.
          </div>
      );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {expenses.map((exp) => (
            <Card key={exp.id} className="overflow-hidden border-l-4 border-l-yellow-400 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                    
                    {/* Header: User & Date */}
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                                {exp.userName.substring(0,2).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 leading-none">{exp.userName}</p>
                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                    <Calendar className="w-3 h-3"/> {format(new Date(exp.date), "dd MMM")}
                                </p>
                            </div>
                        </div>
                        <Badge variant="outline" className="bg-white text-slate-600">{exp.category}</Badge>
                    </div>

                    {/* Amount */}
                    <div className="mb-3">
                        <span className="text-2xl font-extrabold text-slate-900">
                            {exp.currency === "USD" ? "$" : "৳"}{exp.amount.toLocaleString()}
                        </span>
                    </div>

                    {/* Description */}
                    <div className="bg-slate-50 p-3 rounded-md text-sm text-slate-600 mb-4 min-h-[60px]">
                        {exp.description || "No description provided."}
                        {exp.order && (
                            <div className="mt-2 pt-2 border-t border-slate-200 flex items-center gap-1 text-xs text-blue-600 font-medium">
                                <FileText className="w-3 h-3" /> Order #{exp.order.orderNo}
                            </div>
                        )}
                    </div>

                    {/* Actions (Big Touch Targets) */}
                    <div className="grid grid-cols-2 gap-3">
                        <Button 
                            variant="outline" 
                            className="bg-white hover:bg-red-50 hover:text-red-600 border-red-100 text-red-500"
                            onClick={() => handleAction(exp.id, "REJECTED")}
                            disabled={processingId === exp.id}
                        >
                            <X className="w-4 h-4 mr-2" /> Reject
                        </Button>
                        <Button 
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleAction(exp.id, "APPROVED")}
                            disabled={processingId === exp.id}
                        >
                            <Check className="w-4 h-4 mr-2" /> Approve
                        </Button>
                    </div>

                </CardContent>
                
                {/* Loading Overlay */}
                {processingId === exp.id && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                        <span className="animate-pulse font-bold text-slate-500">Processing...</span>
                    </div>
                )}
            </Card>
        ))}
    </div>
  );
}