"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, X, FileText, Image as ImageIcon, Loader2, Trash2 } from "lucide-react";
import { createOrder } from "@/app/actions/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadDropzone } from "@/utils/uploadthing";
import Link from "next/link";

export function OrderForm({ buyers }: { buyers: any[] }) {
  const [isLoading, setIsLoading] = useState(false);
  
  // State
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, url: string}[]>([]);
  const [sizes, setSizes] = useState<string[]>(["S", "M", "L", "XL"]);
  const [colors, setColors] = useState<string[]>(["Black", "White", "Navy"]);
  const [matrix, setMatrix] = useState<Record<string, number>>({});
  const [formData, setFormData] = useState({ orderNo: "", styleNo: "", season: "", buyerId: "", unitPrice: 0 });

  // Calculations
  const totalQty = colors.reduce((acc, color) => {
    const rowSum = sizes.reduce((sAcc, size) => sAcc + (matrix[`${color}-${size}`] || 0), 0);
    return acc + rowSum;
  }, 0);
  const totalValue = totalQty * (formData.unitPrice || 0);

  // Handlers
  const handleMatrixChange = (c: string, s: string, v: string) => { setMatrix(p => ({...p, [`${c}-${s}`]: parseInt(v)||0 })); };
  const addSize = () => { const s = prompt("Size:"); if(s) setSizes([...sizes, s]); };
  const addColor = () => { const c = prompt("Color:"); if(c) setColors([...colors, c]); };
  const removeSize = (s: string) => { if(confirm("Remove?")) setSizes(sizes.filter(x => x !== s)); };
  const removeColor = (c: string) => { if(confirm("Remove?")) setColors(colors.filter(x => x !== c)); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalQty === 0) return toast.error("Total Qty cannot be 0");
    setIsLoading(true);

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
      sizeColorMap,
      techPackUrls: uploadedFiles.map(f => f.url), 
    };

    const result = await createOrder(payload);
    if (result?.error) toast.error(result.error);
    else toast.success("Order Created!");
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-20">
      
      {/* 1. BASIC INFO (Mobile Stacked) */}
      <Card>
        <CardHeader><CardTitle>Order Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
           <div className="space-y-2"><Label>Order Number</Label><Input required onChange={(e) => setFormData({...formData, orderNo: e.target.value})} /></div>
           <div className="space-y-2"><Label>Style Number</Label><Input required onChange={(e) => setFormData({...formData, styleNo: e.target.value})} /></div>
           <div className="space-y-2"><Label>Season</Label><Input required onChange={(e) => setFormData({...formData, season: e.target.value})} /></div>
           <div className="space-y-2"><Label>Buyer</Label>
             <Select onValueChange={(val) => setFormData({...formData, buyerId: val})}>
                <SelectTrigger><SelectValue placeholder="Select Buyer" /></SelectTrigger>
                <SelectContent>{buyers.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
             </Select>
           </div>
        </CardContent>
      </Card>

      {/* 2. TECH PACK (Already Mobile Optimized via p-8 fix) */}
      <Card>
        <CardHeader><CardTitle>Tech Pack</CardTitle></CardHeader>
        <CardContent>
            {uploadedFiles.length > 0 && (
                <div className="grid grid-cols-1 gap-3 mb-4"> {/* Use 1 col on mobile for long names */}
                    {uploadedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 border rounded-md relative">
                            {/* ... File Item ... */}
                            <div className="p-2 bg-blue-50 text-blue-600 rounded"><FileText className="w-5 h-5"/></div>
                            <span className="truncate flex-1 text-sm">{file.name}</span>
                            <button type="button" onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== idx))}><X className="w-4 h-4 text-slate-400"/></button>
                        </div>
                    ))}
                </div>
            )}
            <UploadDropzone
                endpoint="techPackUploader"
                onClientUploadComplete={(res) => { if (res) setUploadedFiles(prev => [...prev, ...res.map(f => ({ name: f.name, url: f.url }))]); }}
                onUploadError={(e) => {toast.error(e.message)}}
                appearance={{
                    container: "border-2 border-dashed bg-slate-50 p-6 w-full",
                    button: "bg-slate-900 w-full md:w-auto" // Full width button on mobile
                }}
            />
        </CardContent>
      </Card>

      {/* 3. QUANTITY MATRIX (RESPONSIVE SPLIT) */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle>Quantity Breakdown</CardTitle>
          <div className="flex gap-2 w-full md:w-auto">
            <Button type="button" variant="outline" size="sm" onClick={addSize} className="flex-1 md:flex-none"><Plus className="w-4 h-4 mr-2"/>Add Size</Button>
            <Button type="button" variant="outline" size="sm" onClick={addColor} className="flex-1 md:flex-none"><Plus className="w-4 h-4 mr-2"/>Add Color</Button>
          </div>
        </CardHeader>
        
        <CardContent>
          
          {/* A. DESKTOP VIEW (Table) - Hidden on Mobile */}
          <div className="hidden md:block overflow-x-auto border rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-700 uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium w-[150px]">Color</th>
                  {sizes.map(s => (
                    <th key={s} className="px-4 py-3 text-center font-medium min-w-[80px] group relative">
                        {s}
                        <button type="button" onClick={() => removeSize(s)} className="absolute -top-1 -right-1 p-1 opacity-0 group-hover:opacity-100 text-red-500"><X className="w-3 h-3"/></button>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right font-bold w-[100px]">Total</th>
                </tr>
              </thead>
              <tbody>
                {colors.map(color => (
                    <tr key={color} className="border-b last:border-0 group hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium flex justify-between items-center">
                            {color}
                            <button type="button" onClick={() => removeColor(color)} className="opacity-0 group-hover:opacity-100 text-red-500"><Trash2 className="w-4 h-4"/></button>
                        </td>
                        {sizes.map(size => (
                            <td key={size} className="p-2"><Input type="number" className="text-center h-9 w-full" onChange={(e) => handleMatrixChange(color, size, e.target.value)} /></td>
                        ))}
                        <td className="px-4 py-3 text-right font-bold">{sizes.reduce((a, s) => a + (matrix[`${color}-${s}`]||0), 0)}</td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* B. MOBILE VIEW (Cards) - Visible only on Mobile */}
          <div className="md:hidden space-y-4">
              {colors.map(color => (
                  <div key={color} className="border rounded-lg p-4 bg-slate-50/50">
                      <div className="flex justify-between items-center mb-3">
                          <span className="font-bold text-slate-900">{color}</span>
                          <Button size="icon" variant="ghost" className="h-6 w-6 text-red-400" onClick={() => removeColor(color)}><X className="w-4 h-4"/></Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                          {sizes.map(size => (
                              <div key={size} className="flex flex-col gap-1">
                                  <div className="flex justify-between text-xs text-slate-500">
                                      <span>{size}</span>
                                      <span onClick={() => removeSize(size)} className="text-red-300 cursor-pointer">x</span>
                                  </div>
                                  <Input 
                                    type="number" 
                                    placeholder="0" 
                                    className="bg-white"
                                    onChange={(e) => handleMatrixChange(color, size, e.target.value)}
                                  />
                              </div>
                          ))}
                      </div>
                  </div>
              ))}
          </div>

        </CardContent>
      </Card>

      {/* 4. FINANCIALS (Stacked) */}
      <Card>
        <CardHeader><CardTitle>Financials</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="space-y-2"><Label>Total Qty</Label><Input value={totalQty} disabled className="bg-slate-100 font-bold" /></div>
          <div className="space-y-2"><Label>Unit Price ($)</Label><Input type="number" step="0.01" onChange={(e) => setFormData({...formData, unitPrice: parseFloat(e.target.value)})} required /></div>
          <div className="space-y-2"><Label>Total Value</Label><Input value={`$${totalValue.toLocaleString()}`} disabled className="bg-green-50 text-green-700 font-bold" /></div>
        </CardContent>
      </Card>

      {/* FOOTER */}
      <div className="flex flex-col-reverse md:flex-row items-center justify-end gap-3 border-t pt-6">
        <Link href="/orders/ongoing" className="w-full md:w-auto">
            <Button type="button" variant="ghost" className="w-full">Cancel</Button>
        </Link>
        <Button type="submit" className="bg-blue-600 w-full md:w-40" disabled={isLoading || totalQty === 0}>
            {isLoading ? "Saving..." : "Create Order"}
        </Button>
      </div>

    </form>
  );
}