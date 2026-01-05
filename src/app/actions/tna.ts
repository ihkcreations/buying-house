"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/logger";

export async function saveTNA(orderId: string, formData: FormData) {
  try {
    // Helper to parse date strings from form (YYYY-MM-DD) to ISO Date objects
    const getDate = (key: string) => {
      const val = formData.get(key) as string;
      return val ? new Date(val) : null;
    };

    const payload = {
      labDipPlan: getDate("labDipPlan"),
      labDipActual: getDate("labDipActual"),
      fabricPlan: getDate("fabricPlan"),
      fabricActual: getDate("fabricActual"),
      cuttingPlan: getDate("cuttingPlan"),
      cuttingActual: getDate("cuttingActual"),
      sewingPlan: getDate("sewingPlan"),
      sewingActual: getDate("sewingActual"),
      shipmentPlan: getDate("shipmentPlan"), // Usually mandatory
      shipmentActual: getDate("shipmentActual"),
    };

    // Upsert (Update if exists, Create if not)
    await db.timeAction.upsert({
      where: { orderId },
      update: payload,
      create: {
        orderId,
        // If creating new, ensure shipmentPlan is valid or handle nulls
        shipmentPlan: payload.shipmentPlan || new Date(), 
        ...payload,
      },
    });

    await logActivity("UPDATED_TNA", "Updated Time & Action Plan", orderId);

    revalidatePath(`/orders/${orderId}`);
    return { success: "T&A Plan updated successfully!" };
  } catch (error) {
    console.error(error);
    return { error: "Failed to update T&A Plan." };
  }
}