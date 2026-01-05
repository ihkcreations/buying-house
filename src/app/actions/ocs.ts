"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/logger";

export async function saveOCS(orderId: string, formData: FormData) {
  try {
    // 1. Fetch Order & Existing Actuals (The "Before" State)
    const orderData = await db.order.findUnique({
        where: { id: orderId },
        select: { 
            totalValue: true, 
            actualCosting: true 
        }
    });

    if (!orderData) return { error: "Order not found" };

    // 2. Calculate OLD Profit (if exists)
    let oldProfitVal: number | null = null;
    if (orderData.actualCosting) {
        const oldAc = orderData.actualCosting;
        const oldTotalCost = 
            oldAc.fabricActual + oldAc.trimsActual + oldAc.printingActual + 
            oldAc.embroideryActual + oldAc.washingActual + oldAc.cmActual + 
            oldAc.labTestActual + oldAc.inspectionActual + oldAc.samplingActual + 
            oldAc.commercialActual + oldAc.logisticsActual;
        
        oldProfitVal = orderData.totalValue - oldTotalCost;
    }

    // 3. Prepare New Payload
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

    // 4. Save to DB
    await db.actualCosting.upsert({
      where: { orderId },
      update: payload,
      create: { orderId, ...payload }
    });

    await db.order.update({ 
        where: { id: orderId }, 
        data: { status: "OCS_FINALIZED" } 
    });

    // --- 5. SMART LOGGING (Diff Logic) ---
    // Calculate NEW Profit
    const newTotalCost = Object.values(payload).reduce((a, b) => a + b, 0);
    const newProfitVal = orderData.totalValue - newTotalCost;
    
    let logMessage = "";

    if (oldProfitVal !== null) {
        // Update scenario
        logMessage = `Updated OCS Actuals. Net Profit: $${oldProfitVal.toLocaleString()} ➔ $${newProfitVal.toLocaleString()}`;
    } else {
        // First time scenario
        logMessage = `Finalized OCS. Realized Net Profit: $${newProfitVal.toLocaleString()}`;
    }

    await logActivity("FINALIZED_OCS", logMessage, orderId);
    // -------------------------------------

    revalidatePath(`/orders/${orderId}`);
    return { success: "Actuals saved & Order marked as OCS Finalized!" };
  } catch (error) {
    return { error: "Failed to save OCS." };
  }
}