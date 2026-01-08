"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { createExpense } from "@/app/actions/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getExchangeRate } from "@/lib/currency"; 

export function ExpenseForm({ orders, currentRate }: { orders: any[], currentRate: number }) {
  const [isLoading, setIsLoading] = useState(false);
  const [currency, setCurrency] = useState("BDT");

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    formData.append("currency", currency);
    const result = await createExpense(formData);
    if(result?.error) toast.error(result.error);
    else {
        toast.success(result.success);
        // Optional: Reset form logic here
    }
    setIsLoading(false);
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="pt-6">
        <form action={handleSubmit} className="space-y-4">

            {/* Currency Switcher */}
            <div className="flex flex-col items-center mb-4 gap-2">
                <Tabs value={currency} onValueChange={setCurrency} className="w-[200px]">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="BDT">৳ BDT</TabsTrigger>
                        <TabsTrigger value="USD">$ USD</TabsTrigger>
                    </TabsList>
                </Tabs>
                {currency === "USD" && (
                    <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded">
                        <div className="flex flex-col items-center">
                            <div>Today's Conversion Rate</div>
                            <div>$1 = {currentRate}৳</div>
                        </div>
                    </span>
                )}
            </div>
            
            {/* Amount & Date - Stacked on Mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Amount ({currency})</Label>
                    <Input name="amount" type="number" step="0.01" required className="text-lg font-bold" />
                </div>
                <div className="space-y-2">
                    <Label>Date</Label>
                    <Input name="date" type="date" required />
                </div>
            </div>

            {/* Category & Order */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Category</Label>
                    <Select name="category" required>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Travel">Travel / Transport</SelectItem>
                            <SelectItem value="Food">Food / Entertainment</SelectItem>
                            <SelectItem value="Sample">Sample Cost</SelectItem>
                            <SelectItem value="Courier">Courier</SelectItem>
                            <SelectItem value="Office">Office Supplies</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Link Order (Optional)</Label>
                    <Select name="orderId">
                        <SelectTrigger><SelectValue placeholder="General Expense" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">General (No Order)</SelectItem>
                            {orders.map(o => (
                                <SelectItem key={o.id} value={o.id}>{o.orderNo} - {o.styleNo}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Description</Label>
                <Textarea name="description" placeholder="e.g. Lunch with H&M Buyer" className="h-20" />
            </div>

            {/* Full Width Button for easy tapping */}
            <Button type="submit" disabled={isLoading} className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700">
                {isLoading ? <Loader2 className="animate-spin" /> : <><Plus className="mr-2" /> Submit Claim</>}
            </Button>

        </form>
      </CardContent>
    </Card>
  );
}