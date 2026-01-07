"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { signUp } from "@/lib/auth-client"; // We can't use client auth here directly on server easily 
// NOTE: BetterAuth usually requires client-side interaction for signup to handle sessions.
// However, for Admin creating another user, we strictly need to insert into DB + hash password.
// Since BetterAuth handles hashing complexly, the easiest way is to use the BetterAuth Admin API or direct DB insert if we handle hashing.

// RECOMMENDATION: For this MVP, we will use the Client-Side Signup logic inside the Admin Panel
// but we still need actions to DELETE and FETCH users.
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { logActivity } from "@/lib/logger";

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

export async function deleteUser(targetUserId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const currentUser = session?.user as any;
    
    if (!currentUser) return { error: "Unauthorized" };

    // --- HIERARCHY LOGIC ---
    
    // 1. Fetch Target User to check their role
    const targetUser = await db.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) return { error: "User not found" };

    // 2. Prevent Self-Deletion
    if (currentUser.id === targetUserId) {
        return { error: "You cannot delete yourself." };
    }

    // 3. Logic:
    // - Super Admin can delete ANYONE (except self).
    // - Admin can delete ANYONE EXCEPT 'admin' and 'super_admin'.
    
    if (currentUser.role !== "super_admin") {
        if (targetUser.role === "super_admin" || targetUser.role === "admin") {
            return { error: "Admins cannot delete other Admins." };
        }
        if (currentUser.role !== "admin") {
            return { error: "Unauthorized." }; // Merch/Comm can't delete
        }
    }

    // 4. Proceed
    await db.user.delete({ where: { id: targetUserId } });
    await logActivity("DELETED_USER", `Deleted user: ${targetUser.name} (${targetUser.role})`);

    revalidatePath("/users");
    return { success: "User deleted successfully." };
  } catch (error) {
    return { error: "Failed to delete user." };
  }
}

export async function adminResetPassword(userId: string, newPass: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const role = (session?.user as any)?.role;

    if (role !== "super_admin") {
        return { error: "Only Super Admin can reset passwords." };
    }

    const targetUser = await db.user.findUnique({ where: { id: userId } });
    if (!targetUser) return { error: "User not found" };
    
    // --- FIX: Use the specific Admin Plugin method ---
    await auth.api.setUserPassword({
        body: {
            userId: userId,      // The target user's ID
            newPassword: newPass // The new password
        },
        headers: await headers() // Pass the Super Admin's session headers
    });
    // ------------------------------------------------

    await logActivity("RESET_PASSWORD", `Reset password for user ${targetUser.name} (${targetUser.role})`);
    return { success: "Password reset successfully." };
  } catch (error: any) {
    console.error("Reset Error:", error);
    return { 
        // Better Auth errors usually come in error.body.message or error.message
        error: error?.body?.message || "Failed to reset password." 
    };
  }
}