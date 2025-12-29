"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// 1. Update Basic Info (Name)
export async function updateProfileName(userId: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    
    if (!name || name.length < 2) {
        return { error: "Name must be at least 2 characters." };
    }

    await db.user.update({
      where: { id: userId },
      data: { name },
    });

    revalidatePath("/settings");
    return { success: "Profile updated successfully." };
  } catch (error) {
    return { error: "Failed to update profile." };
  }
}

// 2. Request Password Reset (Simulates sending a request to Admin)
export async function requestPasswordReset(userId: string) {
  try {
    // In a real app with Email, we would send an email to the Admin here.
    // For this ERP, we can log a notification or just mock the success.
    
    // Example: await db.notification.create({ ... })
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return { success: "Request sent to Admin. Please check your email or contact HR." };
  } catch (error) {
    return { error: "Failed to send request." };
  }
}