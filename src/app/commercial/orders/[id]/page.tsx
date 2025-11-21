import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PIGenerator } from "@/components/commercial/pi-generator";
import { SCGenerator } from "@/components/commercial/sc-generator"; // Import
import { DocManager } from "@/components/commercial/doc-manager";   // Import

export default async function CommercialOrderPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  // Fetch ALL commercial relations
  const order = await db.order.findUnique({
    where: { id },
    include: { 
        buyer: true,
        proformaInvoice: true,
        salesContract: true,   // Add this
        commercialDocs: true,  // Add this
    },
  });

  if (!order) return notFound();

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

      <Tabs defaultValue="pi" className="w-full">
        <TabsList className="w-full justify-start h-12 bg-white border p-1 mb-6">
          <TabsTrigger value="pi">Proforma Invoice (PI)</TabsTrigger>
          <TabsTrigger value="sc">Sales Contract (SC)</TabsTrigger>
          <TabsTrigger value="docs">Manage Documents</TabsTrigger>
        </TabsList>

        {/* Tab 1: PI */}
        <TabsContent value="pi">
            <PIGenerator order={order} existingPI={order.proformaInvoice} />
        </TabsContent>

        {/* Tab 2: SC */}
        <TabsContent value="sc">
            <SCGenerator 
                order={order} 
                pi={order.proformaInvoice} 
                sc={order.salesContract} 
            />
        </TabsContent>
        
        {/* Tab 3: Docs */}
        <TabsContent value="docs">
            <DocManager 
                orderId={order.id} 
                docs={order.commercialDocs} 
            />
        </TabsContent>
      </Tabs>
    </div>
  );
}