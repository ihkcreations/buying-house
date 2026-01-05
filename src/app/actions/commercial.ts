"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function savePI(orderId: string, formData: FormData) {
  try {
    const piNumber = formData.get("piNumber") as string;
    const dateStr = formData.get("date") as string;
    const bankDetails = formData.get("bankDetails") as string;
    
    // --- 1. Parse Multiple Items (Dynamic Rows) ---
    const styles = formData.getAll("item_style");
    const articles = formData.getAll("item_article");
    const descs = formData.getAll("item_desc");
    const shipDates = formData.getAll("item_shipdate");
    const qtys = formData.getAll("item_qty");
    const rates = formData.getAll("item_rate");
    const amounts = formData.getAll("item_amount");

    // Construct the JSON Array for Items
    const items = styles.map((_, index) => ({
        styleOrder: styles[index],
        article: articles[index],
        description: descs[index],
        shippingDate: shipDates[index],
        qty: parseInt(qtys[index] as string) || 0,
        rate: parseFloat(rates[index] as string) || 0,
        amount: parseFloat(amounts[index] as string) || 0,
    }));

    // --- 2. Construct Payload (FLATTENED TERMS) ---
    // We do NOT wrap these in a "terms" object anymore. 
    // They map directly to the columns we created in the schema.
    const payload = {
        piNumber,
        date: new Date(dateStr),
        bankDetails,
        items: items, // JSON Array
        
        // Map form inputs directly to the 12 Database Columns
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

    // --- 3. Save to DB ---
    await db.proformaInvoice.upsert({
      where: { orderId },
      update: payload, // Pass the flat object directly
      create: {
        orderId,
        ...payload,      // Spread the flat object directly
      },
    });

    revalidatePath(`/commercial/orders/${orderId}`);
    return { success: "PI Saved Successfully!" };
  } catch (error) {
    console.error("Save PI Error:", error);
    return { error: "Failed to save PI." };
  }
}

export async function saveSC(orderId: string, formData: FormData) {
  try {
    const scNumber = formData.get("scNumber") as string;
    const dateStr = formData.get("scDate") as string;

    const payload = {
        scNumber,
        scDate: new Date(dateStr),
        // Map the 12 Terms

        consignee: formData.get("consignee") as string,
        notifyParty: formData.get("notifyParty") as string,

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

    await db.salesContract.upsert({
      where: { orderId },
      update: payload,
      create: {
        orderId,
        ...payload,
      },
    });

    revalidatePath(`/commercial/orders/${orderId}`);
    return { success: "Sales Contract Saved!" };
  } catch (error) {
    return { error: "Failed to save Contract." };
  }
}

export async function updateDocStatus(orderId: string, docName: string, url: string) {
  try {
    // Check if doc exists, update it. If not, create it.
    // Note: We search by docName + orderId. 
    // Prisma composite keys or findFirst is needed if 'id' isn't known.
    // Easier way: Use findFirst to get ID, then update/create.
    
    const existing = await db.commercialDoc.findFirst({
        where: { orderId, name: docName }
    });

    if (existing) {
        await db.commercialDoc.update({
            where: { id: existing.id },
            data: { url, status: "COMPLETED", type: "UPLOADED" }
        });
    } else {
        await db.commercialDoc.create({
            data: {
                orderId,
                name: docName,
                url,
                status: "COMPLETED",
                type: "UPLOADED"
            }
        });
    }

    revalidatePath(`/commercial/orders/${orderId}`);
    return { success: "Document Status Updated" };
  } catch (error) {
    return { error: "Failed to update doc" };
  }
}

export async function createCommercialDoc(orderId: string, formData: FormData) {
  try {
    const type = formData.get("type") as string;
    const refNo = formData.get("refNo") as string; // e.g. "Amendment 01"
    const url = formData.get("url") as string; // URL from UploadThing

    await db.commercialDoc.create({
        data: {
            orderId,
            name: `${type} - ${refNo}`, // Store as "Master L/C - AMD 01"
            type: "UPLOADED",
            url,
            status: "COMPLETED"
        }
    });

    revalidatePath(`/commercial/orders/${orderId}`);
    return { success: "Document added successfully" };
  } catch (error) {
    return { error: "Failed to add document" };
  }
}

// Keep the delete function too
export async function deleteCommercialDoc(id: string, orderId: string) {
    await db.commercialDoc.delete({ where: { id } });
    revalidatePath(`/commercial/orders/${orderId}`);
}