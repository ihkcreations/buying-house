"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createFabricBooking(orderId: string, formData: FormData) {
  try {
    // Math
    const consumption = parseFloat(formData.get("consumption") as string);
    const wastage = parseFloat(formData.get("wastage") as string);
    const requiredQty = parseFloat(formData.get("requiredQty") as string);

    // Create
    await db.fabricBooking.create({
      data: {
        orderId,
        type: formData.get("type") as string, // BODY or RIB
        composition: formData.get("composition") as string,
        construction: formData.get("construction") as string,
        yarnCount: formData.get("yarnCount") as string,
        gsm: formData.get("gsm") as string,
        dia: formData.get("dia") as string,
        stitchLength: formData.get("sl") as string, // Optional
        color: formData.get("color") as string, // Optional
        supplier: formData.get("supplier") as string,
        consumption,
        wastage,
        requiredQty,
      },
    });

    await db.order.update({ where: { id: orderId }, data: { status: "FABRIC_BOOKED" } });
    revalidatePath(`/orders/${orderId}`);
    return { success: "Fabric Booking added!" };
  } catch (error) {
    return { error: "Failed to add booking." };
  }
}

// ... deleteFabricBooking remains the same ...
export async function deleteFabricBooking(id: string, orderId: string) {
    try {
        await db.fabricBooking.delete({ where: { id } });
        revalidatePath(`/orders/${orderId}`);
        return { success: "Deleted successfully" };
    } catch (error) {
        return { error: "Failed to delete." };
    }
}