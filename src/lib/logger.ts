import { db } from "@/lib/db";
import { auth } from "@/lib/auth"; // Your auth instance
import { headers } from "next/headers";

export async function logActivity(action: string, details: string, orderId?: string) {
  try {
    // 1. Get Current User securely
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) return; // Background tasks or errors won't log

    // 2. Create Log Entry
    await db.activityLog.create({
      data: {
        userId: session.user.id,
        userName: session.user.name,
        // @ts-ignore - custom field
        userRole: session.user.role, 
        action,
        details,
        orderId: orderId || null
      }
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
    // Don't throw error here, logging shouldn't break the main app flow
  }
}