import { db } from "@/lib/db";

// Fallback if API fails
const DEFAULT_RATE = 120;

export async function getExchangeRate() {
  try {
    // 1. Check if Admin set a manual rate
    const settings = await db.companySettings.findUnique({
        where: { id: "main_settings" },
        select: { manualExchangeRate: true }
    });

    if (settings?.manualExchangeRate) {
        return settings.manualExchangeRate;
    }

    // 2. Try Open Source API (Frankfurter or similar free API)
    // Note: Most free APIs base on EUR. We need USD -> BDT.
    // Let's use a simple fetch.
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD", { next: { revalidate: 3600 } });
    const data = await res.json();
    
    if (data && data.rates && data.rates.BDT) {
        return data.rates.BDT;
    }

    return DEFAULT_RATE;
  } catch (error) {
    console.error("Currency Fetch Failed:", error);
    return DEFAULT_RATE;
  }
}