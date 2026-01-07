import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db"; // <--- Import Prisma
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    // 1. Security Check (Only Admin/Super Admin allowed)
    const session = await auth.api.getSession({
        headers: await headers()
    });
    const currentUserRole = (session?.user as any)?.role;

    if (currentUserRole !== "admin" && currentUserRole !== "super_admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { email, password, name, role } = body;

    // 2. Hierarchy Check
    if (role === "admin" || role === "super_admin") {
        if (currentUserRole !== "super_admin") {
            return NextResponse.json({ error: "Only Super Admin can create Admins." }, { status: 403 });
        }
    }

    // 3. Create User (Standard / Safe Creation)
    // We DO NOT pass 'role' here. It defaults to 'merchandiser'.
    const res = await auth.api.signUpEmail({
        body: { email, password, name },
        asResponse: true
    });

    if (!res) return NextResponse.json({ error: "Failed" }, { status: 500 });

    // 4. FORCE UPDATE ROLE VIA DATABASE
    // Since we are inside the server, we have direct DB access.
    // This bypasses Better Auth's API restrictions.
    const newUser = await db.user.findUnique({ where: { email } });
    
    if (newUser) {
        await db.user.update({
            where: { id: newUser.id },
            data: { role: role } // <--- Apply the high-privilege role here
        });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json({ 
        error: error.body?.message || error.message || "Something went wrong" 
    }, { status: 400 });
  }
}