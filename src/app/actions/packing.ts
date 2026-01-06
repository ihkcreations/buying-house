"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function savePackingList(orderId: string, formData: FormData) {
  try {
    const payload = {
        invoiceNo: formData.get("invoiceNo") as string,
        date: new Date(formData.get("date") as string),
        
        totalCartons: parseInt(formData.get("totalCartons") as string),
        cartonSize: formData.get("cartonSize") as string,
        netWeight: parseFloat(formData.get("netWeight") as string),
        grossWeight: parseFloat(formData.get("grossWeight") as string),
        cbm: parseFloat(formData.get("cbm") as string),
        
        description: formData.get("description") as string,
    };

    await db.packingList.upsert({
      where: { orderId },
      update: payload,
      create: { orderId, ...payload }
    });

    revalidatePath(`/commercial/orders/${orderId}`);
    return { success: "Packing List Saved!" };
  } catch (error) {
    return { error: "Failed to save." };
  }
}