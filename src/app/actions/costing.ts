"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/logger";

export async function saveCosting(orderId: string, data: any) {
  try {
    // 1. Calculate Trims Total from Breakdown
    const accessories = data.accessoriesBreakdown || {};
    const trimsTotal = Object.values(accessories).reduce((a: number, b: any) => a + (parseFloat(b) || 0), 0);

    // 2. Prepare Payload
    const payload = {
      // Direct
      fabricCostPerDzn: parseFloat(data.fabricCost),
      trimsCostPerDzn: trimsTotal, // Auto-calculated
      accessoriesBreakdown: accessories,
      printingCost: parseFloat(data.printingCost) || 0,
      embroideryCost: parseFloat(data.embroideryCost) || 0,
      washingCost: parseFloat(data.washingCost) || 0,
      cmCostPerDzn: parseFloat(data.cmCost) || 0,

      // Indirect
      labTestCost: parseFloat(data.labTestCost) || 0,
      inspectionCost: parseFloat(data.inspectionCost) || 0,
      samplingCost: parseFloat(data.samplingCost) || 0,
      commercialCost: parseFloat(data.commercialCost) || 0,
      logisticsCost: parseFloat(data.logisticsCost) || 0,

      // Pricing
      totalCost: parseFloat(data.totalCost),
      profitMargin: parseFloat(data.profitMargin),
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
    
    // Update Order Status
    await db.order.update({
        where: { id: orderId },
        data: { status: "COSTING_APPROVED" } 
    });
    
    await logActivity("UPDATED_COSTING", "Updated Costing Sheet", orderId);

    revalidatePath(`/orders/${orderId}`);
    return { success: "Costing Saved Successfully" };
  } catch (error) {
    console.error(error);
    return { error: "Failed to save costing." };
  }
}