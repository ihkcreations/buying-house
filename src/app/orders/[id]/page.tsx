import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import { CostingForm } from "@/components/orders/costing-form";
import { TNAForm } from "@/components/orders/tna-form";
import { FabricBooking } from "@/components/orders/fabric-booking";
import { ProductionLog } from "@/components/orders/production-log";

// --- HELPER: Status Badge (Reused) ---
const getStatusBadge = (status: string) => {
  switch (status) {
    case "PENDING": return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
    case "COSTING_APPROVED": return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Costing Approved</Badge>;
    case "IN_PRODUCTION": return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">In Production</Badge>;
    case "SHIPPED": return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Shipped</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
};

// --- MAIN PAGE COMPONENT ---
export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
  // Await params (Next.js 15 requirement)
  const { id } = await params;

  // 1. Fetch Order Data
  const order = await db.order.findUnique({
    where: { id },
    include: { 
        buyer: true,
        costing: true,     // Needed for Tab 2
        timeAction: true,  // Needed for Tab 3 (NEW)
        fabricBookings: true,
        productionLogs: true,
    },
  });

  const factories = await db.factory.findMany({
      orderBy: { name: 'asc' }
  });

  if (!order) return notFound();

  // 2. Parse the Matrix JSON safely
  // The DB stores: [{ color: "Red", sizes: { S: 10 } }]
  const matrix = order.sizeColorMap as any[];
  
  // Extract all unique sizes for table header
  const allSizes = Array.from(new Set(
    matrix.flatMap(row => Object.keys(row.sizes))
  )).sort();

  return (
    <div className="space-y-6 pb-20">
      
      {/* --- TOP HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/orders/ongoing">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{order.orderNo}</h1>
              {getStatusBadge(order.status)}
            </div>
            <p className="text-slate-500 text-sm">
              Style: <span className="font-medium text-slate-900">{order.styleNo}</span> • 
              Season: <span className="font-medium text-slate-900">{order.season}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline">
                <Printer className="mr-2 h-4 w-4"/> Print Order
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">Edit Order</Button>
        </div>
      </div>

      {/* --- THE TABS --- */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start h-12 bg-white border p-1 mb-6 overflow-x-auto">
          <TabsTrigger value="overview" className="data-[state=active]:bg-slate-100 data-[state=active]:text-blue-700">Overview</TabsTrigger>
          <TabsTrigger value="costing">Costing Sheet</TabsTrigger>
          <TabsTrigger value="tna">T&A Plan</TabsTrigger>
          <TabsTrigger value="fabric">Fabric Booking</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
        </TabsList>

        {/* --- TAB 1: OVERVIEW --- */}
        <TabsContent value="overview" className="space-y-6">
            {/* Basic Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Buyer</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">{order.buyer.name}</div>
                        <div className="text-sm text-slate-500">{order.buyer.country}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Total Quantity</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">{order.orderQty.toLocaleString()} pcs</div>
                        <div className="text-sm text-slate-500">Target: 100%</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Total Value</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold text-green-700">${order.totalValue.toLocaleString()}</div>
                        <div className="text-sm text-slate-500">FOB: ${order.unitPrice}</div>
                    </CardContent>
                </Card>
            </div>

            {/* The Matrix (Read Only View) */}
            <Card>
                <CardHeader>
                    <CardTitle>Quantity Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-700 uppercase">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Color / Size</th>
                                    {allSizes.map(size => (
                                        <th key={size} className="px-4 py-3 text-center">{size}</th>
                                    ))}
                                    <th className="px-4 py-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {matrix.map((row: any, idx: number) => {
                                    const rowTotal = Object.values(row.sizes).reduce((a: any, b: any) => a + b, 0);
                                    return (
                                        <tr key={idx} className="border-b last:border-0 hover:bg-slate-50/50">
                                            <td className="px-4 py-3 font-medium">{row.color}</td>
                                            {allSizes.map(size => (
                                                <td key={size} className="px-4 py-3 text-center text-slate-600">
                                                    {row.sizes[size] || "-"}
                                                </td>
                                            ))}
                                            <td className="px-4 py-3 text-right font-bold">{rowTotal}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        {/* --- TAB 2: COSTING (Placeholder) --- */}
         <TabsContent value="costing">
            {/* We pass the order FOB price because calculating Margin depends on it */}
            <CostingForm 
                orderId={order.id} 
                initialData={order.costing} 
                orderFob={order.unitPrice} // Assuming unitPrice in DB is per Dozen. If per Pc, multiply by 12.
            />
        </TabsContent>

        {/* --- TAB 3: T&A --- */}
        <TabsContent value="tna">
            <TNAForm orderId={order.id} initialData={order.timeAction} />
        </TabsContent>

        {/* --- TAB 4: FABRIC BOOKING --- */}
        <TabsContent value="fabric">
            <FabricBooking 
                orderId={order.id} 
                orderQty={order.orderQty} 
                bookings={order.fabricBookings}
                factories={factories}
            />
        </TabsContent>

        {/* --- TAB 5: PRODUCTION --- */}
        <TabsContent value="production">
            <ProductionLog 
                orderId={order.id} 
                orderQty={order.orderQty} 
                logs={order.productionLogs}
            />
        </TabsContent>

      </Tabs>
    </div>
  );
}