"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/logger";

export async function saveOCS(orderId: string, formData: FormData) {
  try {
    const payload = {
      fabricActual: parseFloat(formData.get("fabric") as string) || 0,
      trimsActual: parseFloat(formData.get("trims") as string) || 0,
      printingActual: parseFloat(formData.get("print") as string) || 0,
      embroideryActual: parseFloat(formData.get("emb") as string) || 0,
      washingActual: parseFloat(formData.get("wash") as string) || 0,
      cmActual: parseFloat(formData.get("cm") as string) || 0,
      
      labTestActual: parseFloat(formData.get("lab") as string) || 0,
      inspectionActual: parseFloat(formData.get("insp") as string) || 0,
      samplingActual: parseFloat(formData.get("sample") as string) || 0,
      commercialActual: parseFloat(formData.get("comm") as string) || 0,
      logisticsActual: parseFloat(formData.get("log") as string) || 0,
    };

    await db.actualCosting.upsert({
      where: { orderId },
      update: payload,
      create: {
        orderId,
        ...payload
      }
    });

    await db.order.update({ 
        where: { id: orderId }, 
        data: { status: "OCS_FINALIZED" } 
    });

    // Mark order as CLOSED if financials are done? (Optional)
    // await db.order.update({ where: { id: orderId }, data: { status: "CLOSED" } });
    await logActivity("UPDATED_OCS", "Updated OCS Actuals", orderId);

    revalidatePath(`/orders/${orderId}`);
    return { success: "Actuals saved successfully!" };
  } catch (error) {
    return { error: "Failed to save OCS." };
  }
}