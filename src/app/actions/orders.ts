"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth"; // Import auth
import { headers } from "next/headers";
import { logActivity } from "@/lib/logger";

export async function createOrder(data: any) {
  // 1. Extract data
  const {
    orderNo,
    styleNo,
    season,
    buyerId,
    orderQty,
    unitPrice,
    totalValue,
    sizeColorMap, // This is the JSON Matrix
    techPackUrls,
  } = data;

  // 2. Validate Uniqueness
  const existing = await db.order.findUnique({
    where: { orderNo },
  });

  if (existing) {
    return { error: "Order Number already exists!" };
  }

  try {
    // 3. Save to DB
    const newOrder = await db.order.create({
      data: {
        orderNo,
        styleNo,
        season,
        buyerId,
        orderQty: parseInt(orderQty),
        unitPrice: parseFloat(unitPrice),
        totalValue: parseFloat(totalValue),
        sizeColorMap,
        techPackUrls: techPackUrls || [],
        status: "PENDING",
      },
    });

    // 4. Log Activity (Now newOrder is defined)
    await logActivity("CREATED_ORDER", `Created Order ${orderNo}`, newOrder.id);



    // 4. Success
    revalidatePath("/orders/all");
  } catch (error) {
    console.error("Order Creation Error:", error);
    return { error: "Failed to create order." };
  }
  
  // 5. Redirect after success
  redirect("/orders/ongoing");
}

export async function deleteOrder(orderId: string) {
  try {
    // 1. Security Check: Get Session
    const session = await auth.api.getSession({
        headers: await headers()
    });

    const role = (session?.user as any)?.role;

    // 2. Only ADMIN can delete Orders
    if (role !== "admin") {
        return { error: "Unauthorized. Only Admins can delete orders." };
    }

    // 3. Delete (Cascading handles the rest)
    await db.order.delete({
      where: { id: orderId },
    });
    
    await logActivity("DELETED_ORDER", `Deleted Order ID ${orderId}`);

    revalidatePath("/orders/ongoing");
    revalidatePath("/orders/all"); // Assuming you have this route
    
    return { success: "Order deleted successfully." };
  } catch (error) {
    console.error("Delete Error:", error);
    return { error: "Failed to delete order." };
  }
}