import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PIGenerator } from "@/components/commercial/pi-generator";
import { SCGenerator } from "@/components/commercial/sc-generator";
// import { PackingGenerator } from "@/components/commercial/packing-generator";
import { DocManager } from "@/components/commercial/doc-manager";
import { getCompanySettings } from "@/app/actions/settings";
import { protectPage } from "@/lib/protect";

export default async function CommercialOrderPage({ 
    params,
    searchParams 
}: { 
    params: { id: string },
    searchParams: { [key: string]: string | string[] | undefined }
}) {
  await protectPage(["admin", "commercial"]);
  
  // Await params (Next.js 15)
  const { id } = await params;
  const sp = await searchParams;

  // 1. Determine Active Tab (Default to 'pi')
  const activeTab = (sp.tab as string) || "pi";

  const order = await db.order.findUnique({
    where: { id },
    include: { 
        buyer: true,
        proformaInvoice: true,
        salesContract: true,
        commercialDocs: true,
        packingList: true
    },
  });

  if (!order) return notFound();

  const settings = await getCompanySettings();

  // Styling for Tabs
  const tabTriggerClass = "data-[state=active]:bg-slate-100 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-md px-4 py-2 transition-all";

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-3">
          <Link href="/commercial/ongoing">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Order #{order.orderNo} Docs</h1>
            <p className="text-slate-500">Buyer: {order.buyer.name}</p>
          </div>
      </div>

      <Tabs defaultValue={activeTab} className="w-full">
        
        {/* Navigation Bar */}
        <TabsList className="w-full justify-start h-auto bg-white border p-1 mb-6 gap-1">
          
          <TabsTrigger value="pi" asChild className={tabTriggerClass}>
            <Link href={`/commercial/orders/${id}?tab=pi`}>Proforma Invoice (PI)</Link>
          </TabsTrigger>
          
          <TabsTrigger value="sc" asChild className={tabTriggerClass}>
            <Link href={`/commercial/orders/${id}?tab=sc`}>Sales Contract (SC)</Link>
          </TabsTrigger>

          
          <TabsTrigger value="docs" asChild className={tabTriggerClass}>
            <Link href={`/commercial/orders/${id}?tab=docs`}>Manage Documents</Link>
          </TabsTrigger>

          {/* <TabsTrigger value="pl" asChild className={tabTriggerClass}>
            <Link href={`/commercial/orders/${id}?tab=pl`}>Packing List (PL) Calculator</Link>
          </TabsTrigger> */}
        </TabsList>

        {/* Tab 1: PI */}
        <TabsContent value="pi">
            <PIGenerator 
                order={order} 
                existingPI={order.proformaInvoice} 
                settings={settings}
            />
        </TabsContent>

        {/* Tab 2: SC */}
        <TabsContent value="sc">
            <SCGenerator 
                order={order} 
                pi={order.proformaInvoice} 
                sc={order.salesContract}
                settings={settings}
            />
        </TabsContent>

        
        {/* Tab 3: Docs */}
        <TabsContent value="docs">
            <DocManager 
                orderId={order.id} 
                docs={order.commercialDocs} 
            />
        </TabsContent>

        {/* Tab 4: PL
        <TabsContent value="pl">
          <PackingGenerator order={order} pl={order.packingList} />
        </TabsContent> */}
      </Tabs>
    </div>
  );
}