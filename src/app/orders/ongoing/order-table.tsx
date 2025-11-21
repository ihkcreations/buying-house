"use client";

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
import { Eye, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export function OrderTable({ initialOrders }: { initialOrders: any[] }) {
  return (
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
                      {/* The "View" Button - This will open the Master Details later */}
                      <Link href={`/orders/${order.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600">
                            <Eye className="h-4 w-4" />
                        </Button>
                      </Link>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>Edit Order Details</DropdownMenuItem>
                          <DropdownMenuItem>View Costing</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Delete Order</DropdownMenuItem>
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
  );
}