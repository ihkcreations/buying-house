"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { signUp } from "@/lib/auth-client"; // We can't use client auth here directly on server easily 
// NOTE: BetterAuth usually requires client-side interaction for signup to handle sessions.
// However, for Admin creating another user, we strictly need to insert into DB + hash password.
// Since BetterAuth handles hashing complexly, the easiest way is to use the BetterAuth Admin API or direct DB insert if we handle hashing.

// RECOMMENDATION: For this MVP, we will use the Client-Side Signup logic inside the Admin Panel
// but we still need actions to DELETE and FETCH users.

export async function getUsers() {
  // Only return necessary fields
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        image: true
    }
  });
  return users;
}

export async function deleteUser(userId: string) {
  try {
    await db.user.delete({
      where: { id: userId },
    });
    revalidatePath("/users");
    return { success: "User deleted successfully." };
  } catch (error) {
    return { error: "Failed to delete user." };
  }
}