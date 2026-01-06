"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { logActivity } from "@/lib/logger";

export async function createExpense(formData: FormData) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { error: "Unauthorized" };

    const amount = parseFloat(formData.get("amount") as string);
    const category = formData.get("category") as string;
    const date = new Date(formData.get("date") as string);
    const description = formData.get("description") as string;
    const orderId = formData.get("orderId") as string || null;

    await db.expense.create({
      data: {
        userId: session.user.id,
        userName: session.user.name,
        amount,
        category,
        date,
        description,
        orderId: orderId === "none" ? null : orderId,
        status: "PENDING"
      }
    });

    await logActivity("EXPENSE_CLAIM", `Claimed $${amount} for ${category}`, orderId || undefined);

    revalidatePath("/finance/expense");
    return { success: "Expense submitted for approval" };
  } catch (error) {
    return { error: "Failed to submit expense" };
  }
}

export async function updateExpenseStatus(id: string, status: "APPROVED" | "REJECTED") {
  try {
    const expense = await db.expense.update({
        where: { id },
        data: { status }
    });
    
    await logActivity("EXPENSE_UPDATE", `${status} expense of $${expense.amount}`);
    revalidatePath("/finance/approve");
    return { success: `Expense ${status}` };
  } catch (error) {
    return { error: "Failed to update" };
  }
}