"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { logActivity } from "@/lib/logger";
import { getExchangeRate } from "@/lib/currency";

export async function createExpense(formData: FormData) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { error: "Unauthorized" };

    const currency = formData.get("currency") as string || "BDT"; // Default BDT
    const currentRate = await getExchangeRate();

    // If currency is USD, rate is 1. If BDT, use the fetched rate.
    const rateToStore = currency === "USD" ? 1 : currentRate;

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
        currency,
        exchangeRate: rateToStore,
        category,
        date,
        description,
        orderId: orderId === "none" ? null : orderId,
        status: "PENDING"
      }
    });

    const symbol = currency === "USD" ? "$" : "৳";
    await logActivity("EXPENSE_CLAIM", `Claimed ${symbol}${amount} for ${category}`, orderId || undefined);

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

export async function deleteExpense(id: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    // @ts-ignore
    const role = (session?.user as any)?.role;
    if (role !== "admin" && role !== "super_admin") {
        return { error: "Only Admin can delete expenses" };
    }

    const expense = await db.expense.findUnique({ where: { id } });
    if (!expense) return { error: "Not found" };

    await db.expense.delete({ where: { id } });

    // LOG IT
    const symbol = expense.currency === "USD" ? "$" : "৳";
    await logActivity("EXPENSE_DELETED", `Deleted expense: ${symbol}${expense.amount} (${expense.description})`);

    revalidatePath("/finance/expense");
    return { success: "Expense deleted" };
  } catch (error) {
    return { error: "Failed to delete" };
  }
}