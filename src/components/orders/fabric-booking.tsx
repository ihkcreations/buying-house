"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Shirt, Layers, Palette } from "lucide-react";
import { createFabricBooking, deleteFabricBooking } from "@/app/actions/booking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export function FabricBooking({ 
    orderId, 
    orderQty, 
    matrix, // <--- New Prop: The Color Data
    bookings, 
    factories 
}: { 
    orderId: string, 
    orderQty: number, 
    matrix: any, 
    bookings: any[], 
    factories: any[] 
}) {
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [activeTab, setActiveTab] = useState("BODY"); // BODY or RIB
  const [bookingScope, setBookingScope] = useState("ALL"); // "ALL" or "Specific Color Name"
  
  // Math State
  const [cons, setCons] = useState(0);
  const [wastage, setWastage] = useState(5); 
  const [reqQty, setReqQty] = useState(0);
  
  // Dynamic Qty based on selection
  // If ALL -> Use Total Order Qty
  // If Color -> Calculate Qty for that color from Matrix
  const activeQty = bookingScope === "ALL" 
    ? orderQty 
    : (matrix as any[]).find(row => row.color === bookingScope)
        // Sum all sizes for this color: { S: 10, M: 20 } -> 30
        ?.sizes ? Object.values((matrix as any[]).find(row => row.color === bookingScope).sizes).reduce((a:any, b:any) => a+b, 0) as number
        : 0;

  // Auto-Calculate Requirement
  useEffect(() => {
    if (cons > 0 && activeQty > 0) {
        const dozens = activeQty / 12;
        const base = dozens * cons;
        const total = base * (1 + wastage / 100);
        setReqQty(parseFloat(total.toFixed(2)));
    } else {
        setReqQty(0);
    }
  }, [cons, wastage, activeQty]);

  const handleAdd = async (formData: FormData) => {
    setIsLoading(true);
    formData.append("requiredQty", reqQty.toString());
    formData.append("type", activeTab);
    
    // Save the scope (Color Name or "ALL")
    if(bookingScope !== "ALL") {
        formData.append("color", bookingScope);
    }

    const result = await createFabricBooking(orderId, formData);
    
    if (result?.error) toast.error(result.error);
    else {
        toast.success("Booking added!");
        // Reset Logic
        setCons(0);
        setReqQty(0);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
      if(confirm("Delete this booking?")) {
          await deleteFabricBooking(id, orderId);
          toast.success("Deleted");
      }
  }

  // Filter lists
  const bodyBookings = bookings.filter(b => b.type === "BODY");
  const ribBookings = bookings.filter(b => b.type === "RIB" || b.type === "COLLAR");
  const totalKg = bookings.reduce((sum, item) => sum + item.requiredQty, 0);

  // Extract Colors from Matrix for Dropdown
  const availableColors = Array.isArray(matrix) ? matrix.map((row: any) => row.color) : [];

  return (
    <div className="space-y-8 pb-20">
      
      {/* 1. TOP SUMMARY */}
      <div className="flex items-center justify-between bg-slate-900 text-white p-6 rounded-lg shadow-md">
          <div>
              <h2 className="text-xl font-bold">Fabric Booking Status</h2>
              <p className="text-slate-400 text-sm">Manage Yarn and Knitting requirements</p>
          </div>
          <div className="text-right">
              <div className="text-3xl font-bold">{totalKg.toLocaleString()} <span className="text-lg font-normal text-slate-400">kg</span></div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">Total Yarn Booked</div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Input Form */}
          <Card className="lg:col-span-1 border-blue-200 bg-blue-50/20 h-fit">
              <CardHeader>
                  <div className="flex gap-2 mb-4">
                      <Button size="sm" variant={activeTab === "BODY" ? "default" : "outline"} onClick={() => setActiveTab("BODY")} className={activeTab === "BODY" ? "bg-blue-600" : "bg-white"}>
                        <Shirt className="w-3 h-3 mr-2" /> Body
                      </Button>
                      <Button size="sm" variant={activeTab === "RIB" ? "default" : "outline"} onClick={() => setActiveTab("RIB")} className={activeTab === "RIB" ? "bg-orange-600 hover:bg-orange-700" : "bg-white"}>
                        <Layers className="w-3 h-3 mr-2" /> Rib/Collar
                      </Button>
                  </div>
                  <CardTitle className="text-lg">New {activeTab === "BODY" ? "Body" : "Rib"} Booking</CardTitle>
              </CardHeader>
              <CardContent>
                  <form action={handleAdd} className="space-y-4">
                      
                      {/* SCOPE SELECTOR (SMART LOGIC) */}
                      <div className="space-y-2 p-3 bg-white rounded border">
                          <Label className="flex items-center gap-2"><Palette className="w-4 h-4"/> Booking For:</Label>
                          <Select value={bookingScope} onValueChange={setBookingScope}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Colors (Total Order)</SelectItem>
                                {availableColors.map((color: string) => (
                                    <SelectItem key={color} value={color}>{color} Only</SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          
                          <div className="text-xs text-right text-slate-500 font-medium">
                              Qty: {activeQty.toLocaleString()} pcs
                          </div>
                      </div>

                      {/* Technical Specs */}
                      <div className="space-y-2">
                          <Label>Construction</Label>
                          <Input name="composition" placeholder="100% Cotton" className="bg-white mb-2" required />
                          <Input name="construction" placeholder={activeTab === "BODY" ? "Single Jersey" : "1x1 Rib"} className="bg-white" required />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1"><Label className="text-xs">Yarn Count</Label><Input name="yarnCount" placeholder="26/1" className="bg-white" required /></div>
                          <div className="space-y-1"><Label className="text-xs">GSM</Label><Input name="gsm" placeholder="160" className="bg-white" /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1"><Label className="text-xs">Dia / Width</Label><Input name="dia" placeholder='30" Open' className="bg-white" /></div>
                          <div className="space-y-1"><Label className="text-xs">Stitch Len</Label><Input name="sl" placeholder="2.90" className="bg-white" /></div>
                      </div>

                      {/* The Math */}
                      <div className="p-3 bg-white rounded border space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label className="text-xs text-blue-600 font-bold">Cons (kg/dzn)</Label>
                                <Input name="consumption" type="number" step="any" onChange={(e) => setCons(parseFloat(e.target.value))} required />
                            </div>
                            <div>
                                <Label className="text-xs text-slate-500">Wastage %</Label>
                                <Input name="wastage" type="number" step="any" defaultValue={5} onChange={(e) => setWastage(parseFloat(e.target.value))} />
                            </div>
                          </div>
                          <div className="pt-2 border-t flex justify-between items-center">
                              <span className="text-xs font-bold text-slate-500 uppercase">Required</span>
                              <span className="text-xl font-bold text-slate-900">{reqQty.toFixed(2)} kg</span>
                          </div>
                      </div>

                      <div className="space-y-1">
                          <Label>Supplier</Label>
                          <Select name="supplier">
                            <SelectTrigger className="bg-white"><SelectValue placeholder="Select Factory" /></SelectTrigger>
                            <SelectContent>
                                {factories.map(f => <SelectItem key={f.id} value={f.name}>{f.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                      </div>

                      <Button type="submit" disabled={isLoading || reqQty <= 0} className={`w-full ${activeTab === "BODY" ? "bg-blue-600" : "bg-orange-600"}`}>
                          <Plus className="w-4 h-4 mr-2" /> Book {activeTab}
                      </Button>
                  </form>
              </CardContent>
          </Card>

          {/* Right: Lists */}
          <div className="lg:col-span-2 space-y-6">
              
              {/* BODY TABLE */}
              <Card>
                  <CardHeader className="pb-2 border-b"><CardTitle className="text-sm uppercase tracking-wider text-slate-500">Body Requirements</CardTitle></CardHeader>
                  <CardContent className="p-0">
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead>Scope</TableHead>
                                  <TableHead>Fabric Details</TableHead>
                                  <TableHead>Specs</TableHead>
                                  <TableHead className="text-right">Cons</TableHead>
                                  <TableHead className="text-right">Total</TableHead>
                                  <TableHead></TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {bodyBookings.map((item) => (
                                  <TableRow key={item.id}>
                                      <TableCell>
                                          {item.color ? <Badge className="bg-slate-900">{item.color}</Badge> : <Badge variant="outline">All Colors</Badge>}
                                      </TableCell>
                                      <TableCell>
                                          <div className="font-bold text-slate-800">{item.construction}</div>
                                          <div className="text-xs text-slate-500">{item.composition}</div>
                                      </TableCell>
                                      <TableCell>
                                          <div className="flex gap-2">
                                              <Badge variant="outline">{item.yarnCount}, {item.gsm} GSM</Badge>
                                              <Badge variant="outline">{item.dia}</Badge>
                                          </div>
                                      </TableCell>
                                      <TableCell className="text-right">{item.consumption}</TableCell>
                                      <TableCell className="text-right font-bold">{item.requiredQty.toFixed(2)} kg</TableCell>
                                      <TableCell><Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4 text-red-400"/></Button></TableCell>
                                  </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                  </CardContent>
              </Card>

              {/* RIB TABLE */}
              <Card>
                  <CardHeader className="pb-2 border-b"><CardTitle className="text-sm uppercase tracking-wider text-slate-500">Rib & Accessories</CardTitle></CardHeader>
                  <CardContent className="p-0">
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead>Scope</TableHead>
                                  <TableHead>Details</TableHead>
                                  <TableHead>Specs</TableHead>
                                  <TableHead className="text-right">Cons</TableHead>
                                  <TableHead className="text-right">Total</TableHead>
                                  <TableHead></TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {ribBookings.map((item) => (
                                  <TableRow key={item.id}>
                                      <TableCell>
                                          {item.color ? <Badge className="bg-slate-900">{item.color}</Badge> : <Badge variant="outline">All Colors</Badge>}
                                      </TableCell>
                                      <TableCell>
                                          <div className="font-bold text-slate-800">{item.construction}</div>
                                      </TableCell>
                                      <TableCell>
                                          <div className="flex gap-2">
                                              <Badge variant="outline">{item.yarnCount}, {item.gsm} GSM</Badge>
                                              <Badge variant="outline">{item.dia}</Badge>
                                          </div>
                                      </TableCell>
                                      <TableCell className="text-right">{item.consumption}</TableCell>
                                      <TableCell className="text-right font-bold">{item.requiredQty.toFixed(2)} kg</TableCell>
                                      <TableCell><Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4 text-red-400"/></Button></TableCell>
                                  </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                  </CardContent>
              </Card>

          </div>
      </div>
    </div>
  );
}