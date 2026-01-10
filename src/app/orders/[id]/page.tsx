import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// Import modules
import { CostingForm } from "@/components/orders/costing-form";
import { TNAForm } from "@/components/orders/tna-form";
import { FabricBooking } from "@/components/orders/fabric-booking";
import { ProductionLog } from "@/components/orders/production-log";
import { OCSForm } from "@/components/orders/ocs-form";
import { OrderOverview } from "@/components/orders/order-overview";
import { QuantityMatrix } from "@/components/orders/quantity-matrix";
import { TechPackManager } from "@/components/orders/tech-pack-manager";

// --- HELPER: Status Badge ---
const getStatusBadge = (status: string) => {
  switch (status) {
    case "PENDING": return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
    case "COSTING_APPROVED": return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Costing Approved</Badge>;
    case "FABRIC_BOOKED": return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Fabric Booked</Badge>;
    case "IN_PRODUCTION": return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">In Production</Badge>;
    case "SHIPPED": return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Shipped</Badge>;
    case "OCS_FINALIZED": return <Badge variant="outline" className="bg-slate-900 text-white border-slate-900">OCS Ready</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
};

export default async function OrderDetailsPage({ 
    params, 
    searchParams 
}: { 
    params: Promise<{ id: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { id } = await params;
  const sp = await searchParams;
  
  // 1. Determine Active Tab (Default to 'overview')
  const activeTab = (sp.tab as string) || "overview";

  // 2. Fetch Data
  const order = await db.order.findUnique({
    where: { id },
    include: { 
        buyer: true,
        costing: true,
        timeAction: true,
        fabricBookings: true,
        productionLogs: true,
        actualCosting: true,
        // commercialDocs: true
    },
  });

  if (!order) return notFound();

  const productionLogs = order.productionLogs || [];
  const matrix = order.sizeColorMap as any[];
  const factories = await db.factory.findMany({ orderBy: { name: 'asc' } });

  // Mobile Friendly Tab Style (Added shrink-0)
  const tabTriggerClass = "data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-full px-4 py-2 transition-all whitespace-nowrap text-sm font-medium border border-transparent data-[state=active]:border-slate-900 hover:bg-slate-100 shrink-0";

  return (
    <div className="space-y-6 pb-20 overflow-x-hidden w-full">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between bg-white p-4 md:p-6 rounded-lg border shadow-sm">
        <div className="flex items-start gap-4">
          <Link href="/orders/ongoing">
            <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{order.orderNo}</h1>
              {getStatusBadge(order.status)}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center text-sm text-slate-500 gap-1 sm:gap-4">
               <span>Style: <strong className="text-slate-700">{order.styleNo}</strong></span>
               <span className="hidden sm:inline">•</span>
               <span>Season: <strong className="text-slate-700">{order.season}</strong></span>
               <span className="hidden sm:inline">•</span>
               <span>Buyer: <strong className="text-slate-700">{order.buyer.name}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* --- STICKY TABS --- */}
      <Tabs defaultValue={activeTab} className="w-full">
        
        {/* CSS FIX: w-full parent + flex + overflow-x-auto on parent */}
        <div className="sticky top-16 z-30 bg-slate-50 pt-2 pb-2 -mx-4 px-4 md:mx-0 md:px-0 border-b border-slate-200 overflow-x-auto no-scrollbar">
            <TabsList className="flex w-max min-w-full justify-start h-auto bg-transparent p-0 gap-2">
            
            <TabsTrigger value="overview" asChild className={tabTriggerClass}>
                <Link href={`/orders/${id}?tab=overview`}>Overview</Link>
            </TabsTrigger>
            
            <TabsTrigger value="costing" asChild className={tabTriggerClass}>
                <Link href={`/orders/${id}?tab=costing`}>Costing Sheet</Link>
            </TabsTrigger>
            
            {/* <TabsTrigger value="tna" asChild className={tabTriggerClass}>
                <Link href={`/orders/${id}?tab=tna`}>T&A Plan</Link>
            </TabsTrigger>
            
            <TabsTrigger value="fabric" asChild className={tabTriggerClass}>
                <Link href={`/orders/${id}?tab=fabric`}>Fabric Booking</Link>
            </TabsTrigger>
            
            <TabsTrigger value="production" asChild className={tabTriggerClass}>
                <Link href={`/orders/${id}?tab=production`}>Production</Link>
            </TabsTrigger>

            <TabsTrigger value="ocs" asChild className={tabTriggerClass}>
                <Link href={`/orders/${id}?tab=ocs`}>Post Costing (OCS)</Link>
            </TabsTrigger> */}

            </TabsList>
        </div>

        {/* --- CONTENT --- */}
        <div className="mt-4">
            <TabsContent value="overview" className="space-y-6">
                <OrderOverview order={order} />
                <TechPackManager orderId={order.id} initialUrls={order.techPackUrls} />
                <QuantityMatrix matrix={matrix} totalQty={order.orderQty} />
            </TabsContent>

            <TabsContent value="costing">
                <CostingForm orderId={order.id} initialData={order.costing} orderFob={order.unitPrice} />
            </TabsContent>

            <TabsContent value="tna">
                <TNAForm orderId={order.id} initialData={order.timeAction} />
            </TabsContent>

            <TabsContent value="fabric">
                <FabricBooking orderId={order.id} orderQty={order.orderQty} matrix={order.sizeColorMap} bookings={order.fabricBookings} factories={factories} />
            </TabsContent>

            <TabsContent value="production">
                <ProductionLog orderId={order.id} orderQty={order.orderQty} logs={productionLogs} />
            </TabsContent>

            <TabsContent value="ocs">
                {order.costing ? (
                    <OCSForm orderId={order.id} budgetPerDzn={order.costing} actuals={order.actualCosting} orderQty={order.orderQty} totalRevenue={order.totalValue} />
                ) : (
                    <div className="p-8 text-center text-slate-500 bg-white border rounded-lg shadow-sm">Please approve Costing Sheet first.</div>
                )}
            </TabsContent>
        </div>

      </Tabs>
    </div>
  );
}