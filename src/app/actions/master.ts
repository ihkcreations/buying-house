"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// --- BUYER ACTIONS ---
export async function createBuyer(formData: FormData) {
  const name = formData.get("name") as string;
  const country = formData.get("country") as string;

  if (!name || !country) {
    return { error: "Name and Country are required" };
  }

  try {
    await db.buyer.create({
      data: { name, country },
    });
    revalidatePath("/admin/buyers");
    return { success: "Buyer created successfully" };
  } catch (error) {
    return { error: "Failed to create buyer. Database error." };
  }
}

// --- FACTORY ACTIONS ---
export async function createFactory(formData: FormData) {
  const name = formData.get("name") as string;
  const address = formData.get("address") as string;

  if (!name || !address) {
    return { error: "Name and Address are required" };
  }

  try {
    await db.factory.create({
      data: { name, address },
    });
    revalidatePath("/admin/factories");
    return { success: "Factory created successfully" };
  } catch (error) {
    return { error: "Failed to create factory." };
  }
}