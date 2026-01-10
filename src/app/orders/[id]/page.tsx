import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils"; // Import utility for class merging

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

// --- CONFIG: Define Tabs Here ---
const ORDER_TABS = [
    { key: "overview", label: "Overview" },
    { key: "costing", label: "Costing Sheet" },
    { key: "tna", label: "T&A Plan" },
    { key: "fabric", label: "Fabric Booking" },
    { key: "production", label: "Production" },
    { key: "ocs", label: "Post Costing (OCS)" },
];

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
    },
  });

  if (!order) return notFound();

  const productionLogs = order.productionLogs || [];
  const matrix = order.sizeColorMap as any[];
  const factories = await db.factory.findMany({ orderBy: { name: 'asc' } });

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

      {/* --- CUSTOM NAVIGATION BAR (Replaces Tabs) --- */}
      <div className="sticky top-16 z-30 bg-slate-50 pt-2 pb-2 -mx-4 px-4 md:mx-0 md:px-0 border-b border-slate-200">
          <div className="flex w-full overflow-x-auto no-scrollbar gap-2">
              {ORDER_TABS.map((tab) => {
                  const isActive = activeTab === tab.key;
                  return (
                      <Link key={tab.key} href={`/orders/${id}?tab=${tab.key}`}>
                          <div className={cn(
                              "rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors border",
                              isActive 
                                ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                                : "bg-transparent text-slate-600 border-transparent hover:bg-slate-200 hover:text-slate-900"
                          )}>
                              {tab.label}
                          </div>
                      </Link>
                  );
              })}
          </div>
      </div>

      {/* --- CONTENT RENDERER (Conditional) --- */}
      <div className="mt-4">
          
          {activeTab === "overview" && (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                  <OrderOverview order={order} />
                  <TechPackManager orderId={order.id} initialUrls={order.techPackUrls} />
                  <QuantityMatrix matrix={matrix} totalQty={order.orderQty} />
              </div>
          )}

          {activeTab === "costing" && (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                  <CostingForm orderId={order.id} initialData={order.costing} orderFob={order.unitPrice} />
              </div>
          )}

          {activeTab === "tna" && (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                  <TNAForm orderId={order.id} initialData={order.timeAction} />
              </div>
          )}

          {activeTab === "fabric" && (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                  <FabricBooking orderId={order.id} orderQty={order.orderQty} matrix={order.sizeColorMap} bookings={order.fabricBookings} factories={factories} />
              </div>
          )}

          {activeTab === "production" && (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                  <ProductionLog orderId={order.id} orderQty={order.orderQty} logs={productionLogs} />
              </div>
          )}

          {activeTab === "ocs" && (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                  {order.costing ? (
                      <OCSForm orderId={order.id} budgetPerDzn={order.costing} actuals={order.actualCosting} orderQty={order.orderQty} totalRevenue={order.totalValue} />
                  ) : (
                      <div className="p-8 text-center text-slate-500 bg-white border rounded-lg shadow-sm">Please approve Costing Sheet first.</div>
                  )}
              </div>
          )}

      </div>
    </div>
  );
}