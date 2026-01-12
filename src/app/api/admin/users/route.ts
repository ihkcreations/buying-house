import { NextResponse } from "next/server";
import { auth } from "@/lib/auth"; 
import { db } from "@/lib/db"; // Import Prisma
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    // 1. AUTH CHECK
    const session = await auth.api.getSession({
        headers: await headers()
    });
    const currentUserRole = (session?.user as any)?.role;

    if (currentUserRole !== "admin" && currentUserRole !== "super_admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { email, password, name, role } = body;

    // 2. HIERARCHY CHECK
    if (role === "admin" || role === "super_admin") {
        if (currentUserRole !== "super_admin") {
            return NextResponse.json({ error: "Only Super Admin can create Admins." }, { status: 403 });
        }
    }

    // --- 3. CRITICAL FIX: CHECK EXISTENCE FIRST ---
    const existingUser = await db.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        return NextResponse.json({ 
            error: "User with this email already exists." 
        }, { status: 409 }); // 409 Conflict
    }
    // ----------------------------------------------

    // 4. Create User (Safe to proceed now)
    const res = await auth.api.signUpEmail({
        body: { email, password, name },
        asResponse: true
    });

    if (!res) return NextResponse.json({ error: "Failed to create user" }, { status: 500 });

    // 5. Force Update Role
    // Now we know this is a BRAND NEW user, so updating is safe.
    const newUser = await db.user.findUnique({ where: { email } });
    
    if (newUser) {
        await db.user.update({
            where: { id: newUser.id },
            data: { role: role }
        });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json({ 
        error: error.body?.message || error.message || "Something went wrong" 
    }, { status: 400 });
  }
}