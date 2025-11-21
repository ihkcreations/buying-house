"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function savePI(orderId: string, formData: FormData) {
  try {
    const piNumber = formData.get("piNumber") as string;
    const dateStr = formData.get("date") as string;
    const bankDetails = formData.get("bankDetails") as string;
    
    // Collect the 12 Terms
    const terms = {
        paymentMethod: formData.get("term_payment"),
        shipmentDate: formData.get("term_shipment"),
        portOfLoading: formData.get("term_port"),
        tolerance: formData.get("term_tolerance"),
        // Add others as needed, or store as a big JSON object
    };

    // Collect Items (For now, we assume single item based on Order, 
    // but structured as JSON for future flexibility)
    const items = [
        {
            description: formData.get("item_desc"),
            hsCode: formData.get("item_hs"),
            qty: parseInt(formData.get("item_qty") as string),
            rate: parseFloat(formData.get("item_rate") as string),
            amount: parseFloat(formData.get("item_amount") as string),
        }
    ];

    await db.proformaInvoice.upsert({
      where: { orderId },
      update: {
        piNumber,
        date: new Date(dateStr),
        bankDetails,
        items: items, // Saves as JSON
      },
      create: {
        orderId,
        piNumber,
        date: new Date(dateStr),
        bankDetails,
        items: items,
      },
    });

    revalidatePath(`/commercial/orders/${orderId}`);
    return { success: "PI Saved Successfully!" };
  } catch (error) {
    console.error(error);
    return { error: "Failed to save PI." };
  }
}

export async function saveSC(orderId: string, formData: FormData) {
  try {
    const scNumber = formData.get("scNumber") as string;
    const dateStr = formData.get("scDate") as string;

    // In a real app, we would handle file uploads for signatures here
    // For now, we assume the form is just saving the data record
    
    await db.salesContract.upsert({
      where: { orderId },
      update: {
        scNumber,
        scDate: new Date(dateStr),
      },
      create: {
        orderId,
        scNumber,
        scDate: new Date(dateStr),
      },
    });

    revalidatePath(`/commercial/orders/${orderId}`);
    return { success: "Sales Contract Saved!" };
  } catch (error) {
    return { error: "Failed to save Contract." };
  }
}

export async function updateDocStatus(orderId: string, docName: string, status: string) {
  try {
    // In a real app, we would save the file URL here.
    // For MVP, we just upsert a record saying the doc is "COMPLETED"
    await db.commercialDoc.create({
        data: {
            orderId,
            name: docName,
            type: "UPLOADED",
            url: "http://placeholder.com/file.pdf", // Placeholder
            status: status
        }
    });
    revalidatePath(`/commercial/orders/${orderId}`);
    return { success: "Document Status Updated" };
  } catch (error) {
    return { error: "Failed to update doc" };
  }
}