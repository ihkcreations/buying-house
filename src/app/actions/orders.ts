"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
    await db.order.create({
      data: {
        orderNo,
        styleNo,
        season,
        buyerId,
        orderQty: parseInt(orderQty),
        unitPrice: parseFloat(unitPrice),
        totalValue: parseFloat(totalValue),
        sizeColorMap, // Saves directly as JSON
        status: "PENDING",
      },
    });

    // 4. Success
    revalidatePath("/orders/all");
  } catch (error) {
    console.error("Order Creation Error:", error);
    return { error: "Failed to create order." };
  }
  
  // 5. Redirect after success
  redirect("/orders/ongoing");
}