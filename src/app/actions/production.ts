"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function saveProductionLog(orderId: string, formData: FormData) {
  try {
    const dateStr = formData.get("date") as string;
    const cutQty = parseInt(formData.get("cutQty") as string) || 0;
    const sewQty = parseInt(formData.get("sewQty") as string) || 0;
    const packQty = parseInt(formData.get("packQty") as string) || 0;

    if (!dateStr) {
        return { error: "Date is required" };
    }

    // Create the log entry
    await db.productionLog.create({
      data: {
        orderId,
        date: new Date(dateStr),
        cutQty,
        sewQty,
        packQty,
      },
    });

    // Auto-update status: If sewing started, Order is IN_PRODUCTION
    if (sewQty > 0) {
        await db.order.update({
            where: { id: orderId },
            data: { status: "IN_PRODUCTION" }
        });
    }

    revalidatePath(`/orders/${orderId}`);
    return { success: "Production log added!" };
  } catch (error) {
    console.error(error);
    return { error: "Failed to save log." };
  }
}

export async function deleteProductionLog(id: string, orderId: string) {
    try {
        await db.productionLog.delete({ where: { id } });
        revalidatePath(`/orders/${orderId}`);
        return { success: "Log deleted." };
    } catch (error) {
        return { error: "Failed to delete." };
    }
}