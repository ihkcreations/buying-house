"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function savePI(orderId: string, formData: FormData) {
  try {
    const piNumber = formData.get("piNumber") as string;
    const dateStr = formData.get("date") as string;
    const bankDetails = formData.get("bankDetails") as string;
    
    // Collect Items
    const items = [
        {
            styleOrder: formData.get("item_style"),
            article: formData.get("item_article"),
            description: formData.get("item_desc"),
            hsCode: formData.get("item_hs"),
            shippingDate: formData.get("item_shipdate"),
            qty: parseInt(formData.get("item_qty") as string),
            rate: parseFloat(formData.get("item_rate") as string),
            amount: parseFloat(formData.get("item_amount") as string),
        }
    ];

    // Payload mapping to new Schema fields
    const payload = {
        piNumber,
        date: new Date(dateStr),
        bankDetails,
        items: items,
        
        // Map form inputs to the 12 Database Columns
        payment: formData.get("term_payment") as string,
        blClause: formData.get("term_bl") as string,
        tolerance: formData.get("term_tolerance") as string,
        freightTerm: formData.get("term_freight") as string,
        portLoading: formData.get("term_pol") as string,
        partialShipment: formData.get("term_partial") as string,
        charges: formData.get("term_charges") as string,
        insurance: formData.get("term_insurance") as string,
        lcTerm1: formData.get("term_lc1") as string,
        lcTerm2: formData.get("term_lc2") as string,
        portDischarge: formData.get("term_pod") as string,
        documents: formData.get("term_docs") as string,
    };

    await db.proformaInvoice.upsert({
      where: { orderId },
      update: payload,
      create: {
        orderId,
        ...payload
      },
    });

    revalidatePath(`/commercial/orders/${orderId}`);
    return { success: "PI Saved Successfully!" };
  } catch (error) {
    console.error(error);
    return { error: "Failed to save PI." };
  }
}