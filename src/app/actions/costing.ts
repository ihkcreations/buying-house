"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/logger";

export async function saveCosting(orderId: string, data: any) {
  try {
    // 1. Fetch Existing Data (The "Before" State)
    const existing = await db.costing.findUnique({
      where: { orderId },
    });

    // 2. Prepare New Payload (The "After" State)
    const accessories = data.accessoriesBreakdown || {};
    const trimsTotal = Object.values(accessories).reduce((a: number, b: any) => a + (parseFloat(b) || 0), 0);

    const payload = {
      fabricCostPerDzn: parseFloat(data.fabricCost),
      trimsCostPerDzn: trimsTotal,
      accessoriesBreakdown: accessories,
      printingCost: parseFloat(data.printingCost) || 0,
      embroideryCost: parseFloat(data.embroideryCost) || 0,
      washingCost: parseFloat(data.washingCost) || 0,
      cmCostPerDzn: parseFloat(data.cmCost) || 0,
      labTestCost: parseFloat(data.labTestCost) || 0,
      inspectionCost: parseFloat(data.inspectionCost) || 0,
      samplingCost: parseFloat(data.samplingCost) || 0,
      commercialCost: parseFloat(data.commercialCost) || 0,
      logisticsCost: parseFloat(data.logisticsCost) || 0,
      totalCost: parseFloat(data.totalCost),
      profitMargin: parseFloat(data.profitMargin), // New Profit
      commissionPercent: parseFloat(data.commissionPercent) || 0,
      netFob: parseFloat(data.netFob),
      isApproved: false, 
    };

    // 3. Save to DB
    await db.costing.upsert({
      where: { orderId },
      update: payload,
      create: {
        orderId,
        ...payload,
      },
    });
    
    await db.order.update({
        where: { id: orderId },
        data: { status: "COSTING_APPROVED" } 
    });

    // --- 4. SMART LOGGING (Diff Logic) ---
    const newProfit = payload.profitMargin.toFixed(2);
    let logMessage = "";

    if (existing) {
        // It was an update
        const oldProfit = existing.profitMargin.toFixed(2);
        // Only mention "Changed" if the value actually changed
        if (oldProfit !== newProfit) {
            logMessage = `Updated Costing. Profit changed: $${oldProfit} ➔ $${newProfit}/dzn`;
        } else {
            logMessage = `Updated Costing details. Profit remains $${newProfit}/dzn`;
        }
    } else {
        // It was a new creation
        logMessage = `Created Costing Sheet. Est. Profit: $${newProfit}/dzn`;
    }

    await logActivity("UPDATED_COSTING", logMessage, orderId);
    // -------------------------------------

    revalidatePath(`/orders/${orderId}`);
    return { success: "Costing Saved Successfully" };
  } catch (error) {
    console.error(error);
    return { error: "Failed to save costing." };
  }
}