"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

const SETTINGS_ID = "main_settings";

export async function getCompanySettings() {
  const settings = await db.companySettings.findUnique({
    where: { id: SETTINGS_ID },
    include: { addresses: true }
  });
  return settings;
}

export async function updateCompanySettings(formData: FormData) {
  try {
    const payload = {
      companyName: formData.get("companyName") as string,
      contactPhone: formData.get("contactPhone") as string,
      
      bankName: formData.get("bankName") as string,
      bankAddress: formData.get("bankAddress") as string,
      swiftCode: formData.get("swiftCode") as string,
      accountNumber: formData.get("accountNumber") as string,
      accountName: formData.get("accountName") as string,

      defaultPaymentTerms: formData.get("defaultPaymentTerms") as string,
      defaultPort: formData.get("defaultPort") as string,
    };

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

// --- NEW ADDRESS ACTIONS (FIXED) ---

export async function addAddress(formData: FormData) {
  try {
    const label = formData.get("label") as string;
    const addressText = formData.get("addressText") as string;
    
    // 1. CRITICAL FIX: Ensure Parent Settings Exist First
    await db.companySettings.upsert({
        where: { id: SETTINGS_ID },
        create: { id: SETTINGS_ID },
        update: {} // No changes, just ensure it exists
    });

    // 2. Count for default logic
    const count = await db.officeAddress.count({
        where: { settingsId: SETTINGS_ID }
    });

    // 3. Create Address
    await db.officeAddress.create({
      data: {
        settingsId: SETTINGS_ID,
        label,
        addressText,
        isDefault: count === 0 // First one is default
      }
    });
    
    revalidatePath("/settings");
    return { success: "Address added" };
  } catch (e) { 
      console.error(e);
      return { error: "Failed to add address" }; 
  }
}

export async function deleteAddress(id: string) {
  await db.officeAddress.delete({ where: { id } });
  revalidatePath("/settings");
}

export async function setDefaultAddress(id: string) {
  // Reset all to false
  await db.officeAddress.updateMany({
      where: { settingsId: SETTINGS_ID },
      data: { isDefault: false }
  });
  // Set one to true
  await db.officeAddress.update({
      where: { id },
      data: { isDefault: true }
  });
  revalidatePath("/settings");
}