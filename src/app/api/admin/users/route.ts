import { NextResponse } from "next/server";
import { auth } from "@/lib/auth"; // Your server-side auth instance
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    // 1. Security Check: Get Current User Session
    const session = await auth.api.getSession({
        headers: await headers()
    });

    const currentUserRole = (session?.user as any)?.role;

    // Must be at least an Admin to access this route
    if (currentUserRole !== "admin" && currentUserRole !== "super_admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 2. Parse Request Body
    const body = await req.json();
    const { email, password, name, role } = body;

    // 3. HIERARCHY CHECK (The New Logic)
    // If trying to create a high-privilege account ('admin' or 'super_admin')
    if (role === "admin" || role === "super_admin") {
        // Only Super Admin can do this
        if (currentUserRole !== "super_admin") {
            return NextResponse.json({ 
                error: "Permission Denied: Only Super Admin can create Admin accounts." 
            }, { status: 403 });
        }
    }

    // 4. Create User using Better Auth Server API
    // We pass 'asResponse: true' to get the full response object
    const res = await auth.api.signUpEmail({
        body: {
            email,
            password,
            name,
            // @ts-ignore - Ensure your auth config allows 'role' in additionalFields
            role, 
        },
        asResponse: true
    });

    // 5. Intercept the Response
    // We create a NEW JSON response for your Admin Browser that DOES NOT have the new user's cookie.
    
    if (!res) {
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    // Return a clean 200 OK
    return NextResponse.json({ success: true, user: { email, name, role } });

  } catch (error: any) {
    // Handle Better Auth errors (like Email already exists)
    return NextResponse.json({ 
        error: error.body?.message || error.message || "Something went wrong" 
    }, { status: 400 });
  }
}