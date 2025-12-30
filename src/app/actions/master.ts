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

// --- BUYER UPDATES ---
export async function updateBuyer(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const country = formData.get("country") as string;

    await db.buyer.update({
      where: { id },
      data: { name, country },
    });
    revalidatePath("/admin/buyers");
    return { success: "Buyer updated successfully" };
  } catch (error) {
    return { error: "Failed to update buyer." };
  }
}

export async function deleteBuyer(id: string) {
  try {
    // Note: If buyer has orders, Prisma might throw an error depending on Schema.
    // Ideally, we shouldn't delete buyers with history, but for this fix we allow it.
    await db.buyer.delete({ where: { id } });
    revalidatePath("/admin/buyers");
    return { success: "Buyer deleted successfully" };
  } catch (error) {
    return { error: "Cannot delete buyer. They might have active orders." };
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

// --- FACTORY UPDATES ---
export async function updateFactory(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const address = formData.get("address") as string;

    await db.factory.update({
      where: { id },
      data: { name, address },
    });
    revalidatePath("/admin/factories");
    return { success: "Factory updated successfully" };
  } catch (error) {
    return { error: "Failed to update factory." };
  }
}

export async function deleteFactory(id: string) {
  try {
    await db.factory.delete({ where: { id } });
    revalidatePath("/admin/factories");
    return { success: "Factory deleted successfully" };
  } catch (error) {
    return { error: "Cannot delete factory. They might be linked to active bookings." };
  }
}