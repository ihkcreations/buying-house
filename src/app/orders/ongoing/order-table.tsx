"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal, Trash2, AlertTriangle, Calendar, Box, DollarSign, User } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteOrder } from "@/app/actions/orders";
import { format } from "date-fns";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "PENDING": return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
    case "COSTING_APPROVED": return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Costing OK</Badge>;
    case "FABRIC_BOOKED": return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Fabric Booked</Badge>;
    case "IN_PRODUCTION": return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Production</Badge>;
    case "SHIPPED": return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Shipped</Badge>;
    case "OCS_FINALIZED": return <Badge variant="outline" className="bg-slate-900 text-white border-slate-900">Closed</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
};

export function OrderTable({ initialOrders }: { initialOrders: any[] }) {
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    const result = await deleteOrder(orderToDelete);
    if (result?.error) toast.error(result.error);
    else toast.success("Order deleted successfully");
    setIsDeleting(false);
    setOrderToDelete(null);
  };

  return (
    <>
      {/* DESKTOP VIEW (Table) */}
      <div className="hidden md:block border rounded-lg overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-[100px]">Order No</TableHead>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead>Buyer / Style</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialOrders.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-10 text-slate-500">No orders found.</TableCell></TableRow>
              ) : (
                initialOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-slate-50 transition-colors group">
                    <TableCell className="font-bold text-blue-600">{order.orderNo}</TableCell>
                    <TableCell className="text-xs text-slate-500">{format(new Date(order.createdAt), "dd MMM yyyy hh:mm a")}</TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900">{order.buyer.name}</div>
                      <div className="text-xs text-slate-500">{order.styleNo}</div>
                    </TableCell>
                    <TableCell className="text-right font-mono">{order.orderQty.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-bold text-slate-700">${order.totalValue.toLocaleString()}</TableCell>
                    <TableCell className="text-center">{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                          <Link href={`/orders/${order.id}`}><Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-blue-600"><Eye className="w-4 h-4"/></Button></Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" className="h-8 w-8"><MoreHorizontal className="w-4 h-4"/></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem className="text-red-600" onClick={() => setOrderToDelete(order.id)}><Trash2 className="w-4 h-4 mr-2"/> Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
      </div>

      {/* MOBILE VIEW (Cards) */}
      <div className="md:hidden space-y-4">
          {initialOrders.length === 0 && <div className="text-center py-10 text-slate-500">No orders found.</div>}
          
          {initialOrders.map((order) => (
              <Card key={order.id} className="shadow-sm border border-slate-200">
                  <CardContent className="p-4">
                      
                      {/* Header: Order No + Status */}
                      <div className="flex justify-between items-start mb-3">
                          <div>
                              <span className="text-lg font-bold text-blue-600">#{order.orderNo}</span>
                              <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                  <Calendar className="w-3 h-3"/> {format(new Date(order.createdAt), "dd MMM yyyy hh:mm a")}
                              </div>
                          </div>
                          {getStatusBadge(order.status)}
                      </div>

                      {/* Body: Buyer & Style */}
                      <div className="bg-slate-50 p-3 rounded-md space-y-2 mb-3">
                          <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-500 flex items-center gap-1"><User className="w-3 h-3"/> Buyer</span>
                              <span className="font-medium text-slate-900">{order.buyer.name}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-500">Style</span>
                              <span className="font-medium text-slate-900">{order.styleNo}</span>
                          </div>
                      </div>

                      {/* Footer: Metrics & Action */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <div className="flex gap-4">
                              <div className="flex flex-col">
                                  <span className="text-[10px] text-slate-400 uppercase font-bold">Qty</span>
                                  <span className="text-sm font-bold flex items-center gap-1"><Box className="w-3 h-3 text-slate-400"/> {order.orderQty.toLocaleString()}</span>
                              </div>
                              <div className="flex flex-col">
                                  <span className="text-[10px] text-slate-400 uppercase font-bold">Value</span>
                                  <span className="text-sm font-bold text-green-700 flex items-center gap-1"><DollarSign className="w-3 h-3"/> {order.totalValue.toLocaleString()}</span>
                              </div>
                          </div>
                          
                          <div className="flex gap-2">
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400" onClick={() => setOrderToDelete(order.id)}>
                                 <Trash2 className="w-4 h-4"/>
                             </Button>
                             <Link href={`/orders/${order.id}`}>
                                 <Button size="sm" className="bg-slate-900 text-xs h-8">View</Button>
                             </Link>
                          </div>
                      </div>

                  </CardContent>
              </Card>
          ))}
      </div>

      {/* Delete Dialog (Shared) */}
      <AlertDialog open={!!orderToDelete} onOpenChange={(o) => !o && setOrderToDelete(null)}>
        <AlertDialogContent className="w-[90%] rounded-lg"> {/* Mobile width fix */}
            <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-red-600"><AlertTriangle className="h-5 w-5"/> Delete Order?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone. All related data (Costing, T&A) will be lost.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={(e) => { e.preventDefault(); handleDeleteConfirm(); }} className="bg-red-600 hover:bg-red-700" disabled={isDeleting}>
                    {isDeleting ? "Deleting..." : "Confirm Delete"}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}