"use client";

import { useState, useTransition } from "react"; // <--- Import useTransition
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

export function ExpenseForm({ orders, currentRate }: { orders: any[], currentRate: number }) {
  const [currency, setCurrency] = useState("BDT");
  
  // --- USE TRANSITION FOR LOADING STATE ---
  const [isPending, startTransition] = useTransition(); 
  // 'isPending' will be true while the action is running

  const handleSubmit = (formData: FormData) => {
    formData.append("currency", currency);
    
    // Start the server action inside transition
    startTransition(async () => {
        const result = await createExpense(formData);
        
        if(result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Expense submitted!");
            // Optional: You can reset the form here using a ref if needed
        }
    });
  };

  return (
    <Card className="relative overflow-hidden shadow-sm border-slate-200"> 
      
      {/* --- BLOCKING OVERLAY --- */}
      {isPending && (
        <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-200">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
            <p className="text-lg font-bold text-slate-800">Processing...</p>
        </div>
      )}
      {/* ------------------------ */}

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
                        Today's Rate: 1 USD = {currentRate} BDT
                    </span>
                )}
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Amount ({currency})</Label>
                    <Input name="amount" type="number" step="0.01" placeholder="0.0" required className="text-lg font-bold" />
                </div>
                <div className="space-y-2">
                    <Label>Date</Label>
                    <Input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Category</Label>
                    <Select name="category" required>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Travel">Travel</SelectItem>
                            <SelectItem value="Food">Food</SelectItem>
                            <SelectItem value="Sample">Sample</SelectItem>
                            <SelectItem value="Courier">Courier</SelectItem>
                            <SelectItem value="Office">Office</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Link Order</Label>
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
                <Textarea name="description" placeholder="Description..." className="h-20" />
            </div>

            <Button type="submit" disabled={isPending} className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-5 w-5" /> Submit Claim
            </Button>

        </form>
      </CardContent>
    </Card>
  );
}