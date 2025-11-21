"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createFabricBooking(orderId: string, formData: FormData) {
  try {
    const fabricName = formData.get("fabricName") as string;
    const yarnCount = formData.get("yarnCount") as string;
    const consumption = parseFloat(formData.get("consumption") as string);
    const wastage = parseFloat(formData.get("wastage") as string);
    const requiredQty = parseFloat(formData.get("requiredQty") as string); // Calculated on frontend
    const supplier = formData.get("supplier") as string;

    if (!fabricName || !consumption) {
        return { error: "Fabric Name and Consumption are required" };
    }

    await db.fabricBooking.create({
      data: {
        orderId,
        fabricName,
        yarnCount,
        consumption,
        wastage,
        requiredQty,
        bookedQty: requiredQty, // Initially, we assume we book what is required
        supplier,
      },
    });

    // Update Order status to indicate progress
    await db.order.update({
        where: { id: orderId },
        data: { status: "FABRIC_BOOKED" }
    });

    revalidatePath(`/orders/${orderId}`);
    return { success: "Fabric Booking added successfully!" };
  } catch (error) {
    return { error: "Failed to add fabric." };
  }
}

export async function deleteFabricBooking(id: string, orderId: string) {
    try {
        await db.fabricBooking.delete({ where: { id } });
        revalidatePath(`/orders/${orderId}`);
        return { success: "Deleted successfully" };
    } catch (error) {
        return { error: "Failed to delete." };
    }
}