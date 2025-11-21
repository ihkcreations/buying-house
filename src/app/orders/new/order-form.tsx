"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, X } from "lucide-react"; // Added X icon
import { createOrder } from "@/app/actions/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function OrderForm({ buyers }: { buyers: any[] }) {
  const [isLoading, setIsLoading] = useState(false);

  // --- STATE FOR THE MATRIX ---
  const [sizes, setSizes] = useState<string[]>(["S", "M", "L"]);
  const [colors, setColors] = useState<string[]>(["Red", "Blue"]);
  const [matrix, setMatrix] = useState<Record<string, number>>({});

  const [formData, setFormData] = useState({
    orderNo: "",
    styleNo: "",
    season: "",
    buyerId: "",
    unitPrice: 0,
  });

  // --- IMPROVED CALCULATION ---
  // Only sum quantities for sizes/colors that currently exist in the arrays
  const totalQty = colors.reduce((acc, color) => {
    const rowSum = sizes.reduce((sAcc, size) => {
      return sAcc + (matrix[`${color}-${size}`] || 0);
    }, 0);
    return acc + rowSum;
  }, 0);

  const totalValue = totalQty * formData.unitPrice;

  // --- HANDLERS ---
  const handleMatrixChange = (color: string, size: string, val: string) => {
    const qty = parseInt(val) || 0;
    setMatrix((prev) => ({
      ...prev,
      [`${color}-${size}`]: qty,
    }));
  };

  const addSize = () => {
    const newSize = prompt("Enter new size (e.g. XL, XXL):");
    if (newSize) {
      if (sizes.includes(newSize)) {
        toast.error("Size already exists!");
      } else {
        setSizes([...sizes, newSize]);
      }
    }
  };

  const addColor = () => {
    const newColor = prompt("Enter new color (e.g. Black, Navy):");
    if (newColor) {
      if (colors.includes(newColor)) {
        toast.error("Color already exists!");
      } else {
        setColors([...colors, newColor]);
      }
    }
  };

  // --- DELETE HANDLERS (New Feature) ---
  const removeSize = (sizeToRemove: string) => {
    if (confirm(`Remove size ${sizeToRemove}? Data in this column will be ignored.`)) {
      setSizes(sizes.filter((s) => s !== sizeToRemove));
    }
  };

  const removeColor = (colorToRemove: string) => {
    if (confirm(`Remove color ${colorToRemove}? Data in this row will be ignored.`)) {
      setColors(colors.filter((c) => c !== colorToRemove));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Convert Flat Matrix to Nested JSON
    const sizeColorMap = colors.map((color) => {
      const sizeObj: Record<string, number> = {};
      sizes.forEach((size) => {
        const qty = matrix[`${color}-${size}`] || 0;
        if (qty > 0) sizeObj[size] = qty;
      });
      return { color, sizes: sizeObj };
    });

    const payload = {
      ...formData,
      orderQty: totalQty,
      totalValue: totalValue,
      sizeColorMap: sizeColorMap,
    };

    const result = await createOrder(payload);

    if (result?.error) {
      toast.error(result.error);
      setIsLoading(false);
    } else {
      toast.success("Order Created Successfully!");
      // Redirect is handled by Server Action
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-20">
      
      {/* 1. BASIC INFO CARD */}
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Order Number</Label>
            <Input 
              required 
              placeholder="#1001" 
              onChange={(e) => setFormData({...formData, orderNo: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label>Style Number</Label>
            <Input 
              required 
              placeholder="e.g. STYLE-2024-A"
              onChange={(e) => setFormData({...formData, styleNo: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label>Season</Label>
            <Input 
              required 
              placeholder="e.g. SS25" 
              onChange={(e) => setFormData({...formData, season: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label>Buyer</Label>
            <Select onValueChange={(val) => setFormData({...formData, buyerId: val})} required>
              <SelectTrigger>
                <SelectValue placeholder="Select Buyer" />
              </SelectTrigger>
              <SelectContent>
                {buyers.map(b => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 2. THE MATRIX (QUANTITY BREAKDOWN) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Quantity Breakdown (Matrix)</CardTitle>
          <div className="space-x-2">
            <Button type="button" variant="outline" size="sm" onClick={addSize}>
              <Plus className="w-4 h-4 mr-2" /> Add Size
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={addColor}>
              <Plus className="w-4 h-4 mr-2" /> Add Color
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-700 uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Color / Size</th>
                  {sizes.map((size) => (
                    <th key={size} className="px-4 py-3 text-center font-medium min-w-[80px] group">
                      <div className="flex items-center justify-center gap-1">
                        {size}
                        {/* Delete Size Button */}
                        <button 
                          type="button"
                          onClick={() => removeSize(size)}
                          className="text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove Size"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right font-bold">Total</th>
                </tr>
              </thead>
              <tbody>
                {colors.map((color) => {
                  const rowTotal = sizes.reduce(
                    (acc, size) => acc + (matrix[`${color}-${size}`] || 0), 
                    0
                  );
                  return (
                    <tr key={color} className="border-b last:border-0 group">
                      <td className="px-4 py-3 font-medium bg-slate-50/50">
                        <div className="flex items-center gap-2">
                           {/* Delete Color Button */}
                          <button 
                            type="button"
                            onClick={() => removeColor(color)}
                            className="text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove Color"
                          >
                             <Trash2 className="w-3 h-3" />
                          </button>
                          {color}
                        </div>
                      </td>
                      {sizes.map((size) => (
                        <td key={size} className="p-2">
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            className="text-center h-9 w-full min-w-[60px]"
                            value={matrix[`${color}-${size}`] || ""}
                            onChange={(e) => handleMatrixChange(color, size, e.target.value)}
                          />
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right font-bold text-slate-600">
                        {rowTotal}
                      </td>
                    </tr>
                  );
                })}
                {/* Grand Totals Row */}
                <tr className="bg-blue-50 font-bold text-blue-900">
                  <td className="px-4 py-3">TOTAL QTY</td>
                  {sizes.map((size) => {
                    const colTotal = colors.reduce(
                      (acc, color) => acc + (matrix[`${color}-${size}`] || 0), 
                      0
                    );
                    return (
                      <td key={size} className="px-4 py-3 text-center">{colTotal}</td>
                    );
                  })}
                  <td className="px-4 py-3 text-right text-lg">{totalQty}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 3. FINANCIAL SUMMARY */}
      <Card>
        <CardHeader>
          <CardTitle>Financials</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Total Quantity (Auto)</Label>
            <Input value={totalQty} disabled className="bg-slate-100 font-bold text-slate-900" />
          </div>
          <div className="space-y-2">
            <Label>Unit Price (FOB $)</Label>
            <Input 
              type="number" 
              step="0.01" 
              required 
              placeholder="0.00"
              onChange={(e) => setFormData({...formData, unitPrice: parseFloat(e.target.value) || 0})} 
            />
          </div>
          <div className="space-y-2">
            <Label>Total Value ($)</Label>
            <Input 
              value={`$${totalValue.toLocaleString()}`} 
              disabled 
              className="bg-green-50 text-green-700 font-bold border-green-200" 
            />
          </div>
        </CardContent>
      </Card>

      {/* ACTION BAR */}
      <div className="flex items-center justify-end gap-4">
        <Button type="button" variant="ghost">Cancel</Button>
        <Button 
          type="submit" 
          className="bg-blue-600 hover:bg-blue-700 w-40"
          disabled={isLoading || totalQty === 0}
        >
          {isLoading ? "Saving..." : "Create Order"}
        </Button>
      </div>
    </form>
  );
}