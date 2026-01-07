"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/logger";

export async function saveTNA(orderId: string, formData: FormData) {
  try {
    // Helper for Optional fields (Can be set to null in DB)
    const getNullableDate = (key: string) => {
      const val = formData.get(key) as string;
      return val ? new Date(val) : null;
    };

    // Helper for Mandatory fields (Cannot be null)
    // If empty, return undefined so Prisma ignores it during update
    const getMandatoryDate = (key: string) => {
      const val = formData.get(key) as string;
      return val ? new Date(val) : undefined;
    };

    const shipmentPlan = getMandatoryDate("shipmentPlan");

    const payload = {
      labDipPlan: getNullableDate("labDipPlan"),
      labDipActual: getNullableDate("labDipActual"),
      fabricPlan: getNullableDate("fabricPlan"),
      fabricActual: getNullableDate("fabricActual"),
      cuttingPlan: getNullableDate("cuttingPlan"),
      cuttingActual: getNullableDate("cuttingActual"),
      sewingPlan: getNullableDate("sewingPlan"),
      sewingActual: getNullableDate("sewingActual"),
      shipmentActual: getNullableDate("shipmentActual"),
      
      // Use the specific logic for the mandatory field
      // If 'undefined', update will ignore it.
      // If 'undefined' during create, we handle it in the create block below.
      shipmentPlan: shipmentPlan, 
    };

    // Upsert (Update if exists, Create if not)
    await db.timeAction.upsert({
      where: { orderId },
      update: payload,
      create: {
        orderId,
        // For creation, shipmentPlan MUST exist. Fallback to NOW if missing.
        ...payload,
        shipmentPlan: payload.shipmentPlan || new Date(), 
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