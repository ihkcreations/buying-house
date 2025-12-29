"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

const SETTINGS_ID = "main_settings";

export async function getCompanySettings() {
  const settings = await db.companySettings.findUnique({
    where: { id: SETTINGS_ID }
  });

  // If settings don't exist yet, return null (The UI will handle defaults)
  return settings;
}

export async function updateCompanySettings(formData: FormData) {
  try {
    const payload = {
      companyName: formData.get("companyName") as string,
      companyAddress: formData.get("companyAddress") as string,
      contactPhone: formData.get("contactPhone") as string,
      contactEmail: formData.get("contactEmail") as string,
      
      bankName: formData.get("bankName") as string,
      bankAddress: formData.get("bankAddress") as string,
      swiftCode: formData.get("swiftCode") as string,
      accountNumber: formData.get("accountNumber") as string,
      accountName: formData.get("accountName") as string,

      defaultPaymentTerms: formData.get("defaultPaymentTerms") as string,
      defaultPort: formData.get("defaultPort") as string,
    };

    // Upsert ensures we create it if it doesn't exist, or update if it does
    await db.companySettings.upsert({
      where: { id: SETTINGS_ID },
      update: payload,
      create: {
        id: SETTINGS_ID,
        ...payload
      }
    });

    revalidatePath("/settings");
    return { success: "Settings updated successfully" };
  } catch (error) {
    return { error: "Failed to update settings" };
  }
}