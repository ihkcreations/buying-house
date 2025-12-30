"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner"; // For notifications
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal, Trash2, AlertTriangle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteOrder } from "@/app/actions/orders"; // <--- Import the action

// Helper to color-code statuses
const getStatusBadge = (status: string) => {
  switch (status) {
    case "PENDING":
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
    case "COSTING_APPROVED":
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Costing Approved</Badge>;
    case "FABRIC_BOOKED":
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Fabric Booked</Badge>;
    case "IN_PRODUCTION":
      return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">In Production</Badge>;
    case "SHIPPED":
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Shipped</Badge>;
    case "OCS_FINALIZED":
      return (
        <Badge variant="outline" className="bg-slate-900 text-white border-slate-900 hover:bg-slate-800">
           OCS Ready
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export function OrderTable({ initialOrders }: { initialOrders: any[] }) {
  // State to manage which order is being deleted
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;
    
    setIsDeleting(true);
    const result = await deleteOrder(orderToDelete);
    
    if (result?.error) {
        toast.error(result.error);
    } else {
        toast.success("Order deleted successfully");
        // Optional: refresh page logic if server action revalidatePath doesn't catch immediately
        // useRouter().refresh(); 
    }
    
    setIsDeleting(false);
    setOrderToDelete(null); // Close dialog
  };

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order No</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Style / Season</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-500">
                    No orders found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                initialOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-slate-50/50 cursor-pointer group">
                    <TableCell className="font-medium">
                      <span className="text-blue-600 font-bold">{order.orderNo}</span>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{order.buyer.name}</div>
                      <div className="text-xs text-slate-500">{order.buyer.country}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{order.styleNo}</div>
                      <div className="text-xs text-slate-500">{order.season}</div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {order.orderQty.toLocaleString()} pcs
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      ${order.totalValue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(order.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Button */}
                        <Link href={`/orders/${order.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600">
                              <Eye className="h-4 w-4" />
                          </Button>
                        </Link>

                        {/* Actions Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                                <Link href={`/orders/${order.id}`} className="w-full">Edit Order</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {/* Trigger the Delete Dialog */}
                            <DropdownMenuItem 
                                className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                                onClick={() => setOrderToDelete(order.id)}
                            >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete Order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --- CONFIRMATION DIALOG --- */}
      <AlertDialog open={!!orderToDelete} onOpenChange={(open) => !open && setOrderToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" /> Delete Order?
                </AlertDialogTitle>
                <AlertDialogDescription>
                    This action is permanent. It will delete the Order and all related 
                    <strong> Costing, T&A Plans, and Production Logs</strong>.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                    onClick={(e) => {
                        e.preventDefault(); // Prevent auto-close, handle manually
                        handleDeleteConfirm();
                    }}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={isDeleting}
                >
                    {isDeleting ? "Deleting..." : "Confirm Delete"}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}