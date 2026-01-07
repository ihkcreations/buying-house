"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, X, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
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
  
  // --- 1. STATE MANAGEMENT ---
  
  // Tech Pack Files
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, url: string}[]>([]);

  // Matrix Configuration
  const [sizes, setSizes] = useState<string[]>(["S", "M", "L", "XL"]);
  const [colors, setColors] = useState<string[]>(["Black", "White", "Navy"]);
  
  // Matrix Data: Key = "Color-Size", Value = Quantity
  const [matrix, setMatrix] = useState<Record<string, number>>({});

  // Basic Info
  const [formData, setFormData] = useState({
    orderNo: "", 
    styleNo: "", 
    season: "", 
    buyerId: "", 
    unitPrice: 0,
  });

  // --- 2. CALCULATIONS ---
  
  const totalQty = colors.reduce((acc, color) => {
    const rowSum = sizes.reduce((sAcc, size) => sAcc + (matrix[`${color}-${size}`] || 0), 0);
    return acc + rowSum;
  }, 0);

  const totalValue = totalQty * (formData.unitPrice || 0);

  // --- 3. HANDLERS ---

  const handleMatrixChange = (color: string, size: string, val: string) => {
    const qty = parseInt(val) || 0;
    setMatrix((prev) => ({
      ...prev,
      [`${color}-${size}`]: qty,
    }));
  };

  const addSize = () => {
    const newSize = prompt("Enter new size (e.g. XXL):");
    if (newSize && !sizes.includes(newSize)) setSizes([...sizes, newSize]);
  };

  const addColor = () => {
    const newColor = prompt("Enter new color (e.g. Red):");
    if (newColor && !colors.includes(newColor)) setColors([...colors, newColor]);
  };

  const removeSize = (sizeToRemove: string) => {
      if(confirm(`Remove Size ${sizeToRemove}?`)) {
          setSizes(sizes.filter(s => s !== sizeToRemove));
      }
  };

  const removeColor = (colorToRemove: string) => {
      if(confirm(`Remove Color ${colorToRemove}?`)) {
          setColors(colors.filter(c => c !== colorToRemove));
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalQty === 0) {
        toast.error("Total Quantity cannot be 0");
        return;
    }
    
    setIsLoading(true);

    // Convert Flat Matrix to Nested JSON for Database
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
      techPackUrls: uploadedFiles.map(f => f.url), // Save File URLs
    };

    const result = await createOrder(payload);

    if (result?.error) {
      toast.error(result.error);
      setIsLoading(false);
    } else {
      toast.success("Order Created Successfully!");
      // Redirect happens in Server Action
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-20">
      
      {/* SECTION 1: BASIC INFO */}
      <Card>
        <CardHeader><CardTitle>Order Details</CardTitle></CardHeader>
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
                   placeholder="e.g. STYLE-2025"
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
                  <SelectTrigger><SelectValue placeholder="Select Buyer" /></SelectTrigger>
                  <SelectContent>
                      {buyers.map(b => (
                          <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                  </SelectContent>
               </Select>
           </div>
        </CardContent>
      </Card>

      {/* SECTION 2: TECH PACK UPLOAD */}
      <Card>
        <CardHeader><CardTitle>Tech Pack & Sketches</CardTitle></CardHeader>
        <CardContent>
            
            {/* Display Uploaded Files */}
            {uploadedFiles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {uploadedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 border rounded-md bg-white shadow-sm relative group">
                            <div className="p-2 bg-blue-50 border border-blue-100 rounded text-blue-600">
                                {file.name.endsWith('.pdf') ? <FileText className="w-5 h-5"/> : <ImageIcon className="w-5 h-5"/>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <Link href={file.url} target="_blank" className="text-sm font-medium text-slate-700 hover:text-blue-600 hover:underline truncate block">
                                    {file.name}
                                </Link>
                                <p className="text-xs text-slate-400">Attached</p>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== idx))}
                                className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-colors"
                                title="Remove file"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Area */}
            <UploadDropzone
                endpoint="techPackUploader"
                onClientUploadComplete={(res) => {
                    if (res) {
                        const newFiles = res.map(f => ({ name: f.name, url: f.url }));
                        setUploadedFiles(prev => [...prev, ...newFiles]);
                        toast.success("File uploaded successfully!");
                    }
                }}
                onUploadError={(error: Error) => {toast.error(`Upload failed: ${error.message}}`)}}
                className="ut-label:text-blue-600 ut-button:bg-slate-900 ut-button:hover:bg-slate-800"
                appearance={{
                    container: "border-2 border-dashed border-slate-300 rounded-lg p-8 bg-slate-50/50 hover:bg-slate-50 transition-colors w-full cursor-pointer min-h-[200px] flex flex-col justify-center",
                    label: "text-slate-500 hover:text-blue-600 font-medium mt-2",
                    allowedContent: "text-slate-400 text-xs",
                    button: "bg-slate-900 text-white text-sm px-6 py-2 rounded-md mt-4 hover:bg-slate-800 transition-colors"
                }}
            />
        </CardContent>
      </Card>

      {/* SECTION 3: QUANTITY MATRIX */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Quantity Breakdown</CardTitle>
          <div className="space-x-2">
            <Button type="button" variant="outline" size="sm" onClick={addSize}>
                <Plus className="w-4 h-4 mr-2"/> Add Size
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={addColor}>
                <Plus className="w-4 h-4 mr-2"/> Add Color
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-700 uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium w-[150px]">Color / Size</th>
                  {sizes.map(size => (
                    <th key={size} className="px-4 py-3 text-center font-medium min-w-[80px] group relative">
                        <div className="flex items-center justify-center gap-1">
                            {size}
                            <button type="button" onClick={() => removeSize(size)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-1 -right-1 p-1">
                                <X className="w-3 h-3"/>
                            </button>
                        </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right font-bold w-[100px]">Total</th>
                </tr>
              </thead>
              <tbody>
                {colors.map((color) => {
                  const rowTotal = sizes.reduce((acc, size) => acc + (matrix[`${color}-${size}`] || 0), 0);
                  return (
                    <tr key={color} className="border-b last:border-0 group hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium bg-slate-50/30 flex items-center justify-between">
                          {color}
                          <button type="button" onClick={() => removeColor(color)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="w-3 h-3"/>
                          </button>
                      </td>
                      {sizes.map((size) => (
                        <td key={size} className="p-2">
                          <Input 
                            type="number" 
                            min="0" 
                            className="text-center h-9 w-full"
                            value={matrix[`${color}-${size}`] || ""}
                            onChange={(e) => handleMatrixChange(color, size, e.target.value)}
                          />
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right font-bold text-slate-700">
                        {rowTotal}
                      </td>
                    </tr>
                  );
                })}
                {/* Grand Total Row */}
                <tr className="bg-blue-50 font-bold text-blue-900 border-t-2 border-blue-100">
                  <td className="px-4 py-3">TOTAL QTY</td>
                  {sizes.map((size) => {
                    const colTotal = colors.reduce((acc, color) => acc + (matrix[`${color}-${size}`] || 0), 0);
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

      {/* SECTION 4: FINANCIALS */}
      <Card>
        <CardHeader><CardTitle>Financials</CardTitle></CardHeader>
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
                  className="bg-green-50 text-green-700 font-bold border-green-200 text-lg" 
              />
          </div>
        </CardContent>
      </Card>

      {/* FOOTER ACTIONS */}
      <div className="flex items-center justify-end gap-4 border-t pt-6">
        <Link href="/orders/ongoing">
            <Button type="button" variant="ghost">Cancel</Button>
        </Link>
        <Button 
          type="submit" 
          className="bg-blue-600 hover:bg-blue-700 min-w-[150px] h-12 text-lg"
          disabled={isLoading || totalQty === 0}
        >
          {isLoading ? (
              <> <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving... </>
          ) : (
              "Create Order"
          )}
        </Button>
      </div>

    </form>
  );
}