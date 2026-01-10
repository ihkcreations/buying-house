"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/logger";

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
        styleOrder: styles[index] as string,
        article: articles[index] as string,
        description: descs[index] as string,
        shippingDate: shipDates[index] as string,
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
        supplierAddress: formData.get("vendorAddress") as string,
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

    const existingPI = await db.proformaInvoice.findUnique({ where: { orderId } });
    const oldPiCount = existingPI ? 1 : 0; // Simple count: if PI existed, it was generated once before

    // --- 3. Save to DB ---
    await db.proformaInvoice.upsert({
      where: { orderId },
      update: payload, // Pass the flat object directly
      create: {
        orderId,
        ...payload,
        ...(existingPI ? {} : { generationCount: 1 })      // Spread the flat object directly
      },
    });

    const generationLog = existingPI ? "Updated Proforma Invoice" : "Generated Proforma Invoice";
    await logActivity("GENERATED_PI", `${generationLog}`, orderId);

    revalidatePath(`/commercial/orders/${orderId}`);
    return { success: "PI Saved Successfully!" };
  } catch (error) {
    console.error("Save PI Error:", error);
    return { error: "Failed to save PI." };
  }
}

export async function saveSC(orderId: string, formData: FormData) {
  try {
    const payload = {
        scNumber: formData.get("scNumber") as string,
        scDate: new Date(formData.get("scDate") as string),
        
        vendorAddress: formData.get("vendorAddress") as string,
        consignee: formData.get("consignee") as string,
        vendorBank: formData.get("vendorBank") as string,
        buyerBank: formData.get("buyerBank") as string,
        negotiatingBank: formData.get("negotiatingBank") as string,

        deliveryTerm: formData.get("deliveryTerm") as string,
        shipmentMode: formData.get("shipmentMode") as string,
        paymentTerm: formData.get("paymentTerm") as string,
        tolerance: formData.get("tolerance") as string,
        partialShipment: formData.get("partialShipment") as string,
        transShipment: formData.get("transShipment") as string,
        portDischarge: formData.get("portDischarge") as string,
        finalDest: formData.get("finalDest") as string,
        portLoading: formData.get("portLoading") as string,
        latestShipDate: formData.get("latestShipDate") as string,
        expiryDate: formData.get("expiryDate") as string,
        insurance: formData.get("insurance") as string,
        specialCondition: formData.get("specialCondition") as string,
        
        docRequired: formData.get("docRequired") as string,
        lateClause: formData.get("lateClause") as string,
    };

    await db.salesContract.upsert({
      where: { orderId },
      update: payload,
      create: { orderId, ...payload },
    });

    const existingSC = await db.salesContract.findUnique({ where: { orderId } });
    const generationLog = existingSC ? "Updated Sales Contract" : "Generated Sales Contract";

    await logActivity("GENERATED_SC", generationLog, orderId);

    revalidatePath(`/commercial/orders/${orderId}`);
    return { success: "SC Saved Successfully!" };
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

    await logActivity("UPLOADED_DOC", `Uploaded ${formData.get("type")}`, orderId);

    revalidatePath(`/commercial/orders/${orderId}`);
    return { success: "Document added successfully" };
  } catch (error) {
    return { error: "Failed to add document" };
  }
}

// Keep the delete function too
export async function deleteCommercialDoc(id: string, orderId: string) {
    try {
        // Optional: Fetch doc details first to log the name before deleting
        const doc = await db.commercialDoc.findUnique({ where: { id } });
        const docName = doc?.name || "Document";

        await db.commercialDoc.delete({ where: { id } });
        
        // --- ADD LOG ---
        await logActivity("DELETED_DOC", `Deleted ${docName}`, orderId);
        // ----------------

        revalidatePath(`/commercial/orders/${orderId}`);
        return { success: "Document deleted" };
    } catch (error) {
        return { error: "Failed to delete" };
    }
}

export async function logDocumentGeneration(orderId: string, type: "PI" | "SC") {
  try {
    let newCount = 0;

    if (type === "PI") {
      const pi = await db.proformaInvoice.findUnique({ where: { orderId } });
      if (!pi) return;
      newCount = pi.generationCount + 1;
      
      await db.proformaInvoice.update({
        where: { orderId },
        data: { generationCount: newCount }
      });
    } else {
      const sc = await db.salesContract.findUnique({ where: { orderId } });
      if (!sc) return;
      newCount = sc.generationCount + 1;

      await db.salesContract.update({
        where: { orderId },
        data: { generationCount: newCount }
      });
    }

    // Log to Activity Table
    await logActivity(
        `GENERATED_${type}`, 
        `Generated ${type} PDF (Total downloads: ${newCount})`, 
        orderId
    );

    return { success: true, count: newCount };
  } catch (error) {
    console.error("Log Error:", error);
    return { error: "Failed to log download" };
  }
}