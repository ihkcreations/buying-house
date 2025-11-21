"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function saveCosting(orderId: string, data: any) {
  try {
    // Check if costing exists to decide Update vs Create
    const existing = await db.costing.findUnique({
      where: { orderId },
    });

    const payload = {
      fabricCostPerDzn: parseFloat(data.fabricCost),
      trimsCostPerDzn: parseFloat(data.trimsCost),
      cmCostPerDzn: parseFloat(data.cmCost),
      commercialCost: parseFloat(data.commercialCost),
      logisticsCost: parseFloat(data.logisticsCost),
      netFob: parseFloat(data.netFob),
      margin: parseFloat(data.margin),
      isApproved: false, // Reset approval on change
    };

    if (existing) {
      await db.costing.update({
        where: { orderId },
        data: payload,
      });
    } else {
      await db.costing.create({
        data: {
          orderId,
          ...payload,
        },
      });
    }
    
    // Update the Order Status to show progress
    await db.order.update({
        where: { id: orderId },
        data: { status: "COSTING_APPROVED" } // Simplified logic for now
    });

    revalidatePath(`/orders/${orderId}`);
    return { success: "Costing Saved Successfully" };
  } catch (error) {
    console.error(error);
    return { error: "Failed to save costing." };
  }
}