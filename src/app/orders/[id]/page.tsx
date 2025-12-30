import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";

// Import your modules
import { CostingForm } from "@/components/orders/costing-form";
import { TNAForm } from "@/components/orders/tna-form";
import { FabricBooking } from "@/components/orders/fabric-booking";
import { ProductionLog } from "@/components/orders/production-log";
import { OCSForm } from "@/components/orders/ocs-form";
import { DocManager } from "@/components/commercial/doc-manager"; // To view commercial status
import { OrderOverview } from "@/components/orders/order-overview";
import { QuantityMatrix } from "@/components/orders/quantity-matrix";

// --- HELPER: Status Badge ---
const getStatusBadge = (status: string) => {
  switch (status) {
    case "PENDING":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          Pending
        </Badge>
      );
    case "COSTING_APPROVED":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          Costing Approved
        </Badge>
      );
    case "FABRIC_BOOKED":
      return (
        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
          Fabric Booked
        </Badge>
      );
    case "IN_PRODUCTION":
      return (
        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
          In Production
        </Badge>
      );
    case "SHIPPED":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          Shipped
        </Badge>
      );
    case "OCS_FINALIZED":
      return (
        <Badge
          variant="outline"
          className="bg-slate-900 text-white border-slate-900"
        >
          OCS Ready
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

// --- MAIN PAGE COMPONENT ---
export default async function OrderDetailsPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Await params (Next.js 15 requirement)
  const { id } = await params;
  const sp = await searchParams; // Await searchParams

  // 1. Determine Active Tab from URL (Default to 'overview')
  const activeTab = (sp.tab as string) || "overview";

  // 2. Fetch ALL Data needed for tabs
  const order = await db.order.findUnique({
    where: { id },
    include: {
      buyer: true,
      costing: true,
      timeAction: true,
      fabricBookings: true,
      productionLogs: true,
      actualCosting: true,
      commercialDocs: true,
    },
  });

  if (!order) return notFound();

  const matrix = order.sizeColorMap as any[];
  const allSizes = Array.from(
    new Set(matrix.flatMap((row) => Object.keys(row.sizes)))
  ).sort();

  // Fetch factories for dropdowns (Booking tab)
  const factories = await db.factory.findMany({ orderBy: { name: "asc" } });

  // --- STYLING CLASS FOR TABS ---
  // This ensures selected tab is Blue/Grey and unselected is plain
  const tabTriggerClass =
    "data-[state=active]:bg-slate-100 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-md px-4 py-2 transition-all";

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
              <h1 className="text-2xl font-bold tracking-tight">
                {order.orderNo}
              </h1>
              {getStatusBadge(order.status)}
            </div>
            <p className="text-slate-500 text-sm">
              Style:{" "}
              <span className="font-medium text-slate-900">
                {order.styleNo}
              </span>{" "}
              • Season:{" "}
              <span className="font-medium text-slate-900">{order.season}</span>
            </p>
          </div>
        </div>
      </div>

      {/* --- THE TABS --- */}
      <Tabs defaultValue={activeTab} className="w-full">
        {/* We use Link inside TabsTrigger to update URL without reload */}
        <TabsList className="w-full justify-start h-auto bg-white border p-1 mb-6 overflow-x-auto gap-1">
          <TabsTrigger value="overview" asChild className={tabTriggerClass}>
            <Link href={`/orders/${id}?tab=overview`}>Overview</Link>
          </TabsTrigger>

          <TabsTrigger value="costing" asChild className={tabTriggerClass}>
            <Link href={`/orders/${id}?tab=costing`}>Costing Sheet</Link>
          </TabsTrigger>

          <TabsTrigger value="tna" asChild className={tabTriggerClass}>
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
          </TabsTrigger>
        </TabsList>

        {/* --- TAB CONTENT --- */}

        <TabsContent value="overview" className="space-y-6">
          {/* The New Visual Dashboard */}
          <OrderOverview order={order} />

          {/* 2. The Modern Matrix (Breakdown) */}
          <QuantityMatrix
            matrix={order.sizeColorMap as any[]}
            totalQty={order.orderQty}
          />
        </TabsContent>

        <TabsContent value="costing">
          <CostingForm
            orderId={order.id}
            initialData={order.costing}
            orderFob={order.unitPrice}
          />
        </TabsContent>

        <TabsContent value="tna">
          <TNAForm orderId={order.id} initialData={order.timeAction} />
        </TabsContent>

        <TabsContent value="fabric">
          <FabricBooking
            orderId={order.id}
            orderQty={order.orderQty}
            matrix={order.sizeColorMap}
            bookings={order.fabricBookings}
            factories={factories}
          />
        </TabsContent>

        <TabsContent value="production">
          <ProductionLog
            orderId={order.id}
            orderQty={order.orderQty}
            logs={order.productionLogs}
          />
        </TabsContent>

        <TabsContent value="ocs">
          {order.costing ? (
            <OCSForm
              orderId={order.id}
              budgetPerDzn={order.costing}
              actuals={order.actualCosting}
              orderQty={order.orderQty}
              totalRevenue={order.totalValue}
            />
          ) : (
            <div className="p-8 text-center text-slate-500 bg-slate-50 border rounded">
              Please approve Costing Sheet first.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
