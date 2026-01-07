import { NextResponse } from "next/server";
import { auth } from "@/lib/auth"; // Your server-side auth instance
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    // 1. Security Check: Ensure Requester is Admin
    const session = await auth.api.getSession({
        headers: await headers() // Pass current headers to check YOUR admin session
    });

    const currentUserRole = (session?.user as any)?.role;
    if (currentUserRole !== "admin" && currentUserRole !== "super_admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 2. Parse Body
    const body = await req.json();
    const { email, password, name, role } = body;

    // 3. Create User using Better Auth Server API
    // We pass 'asResponse: true' to get the full response object
    // This creates the user in the DB
    const res = await auth.api.signUpEmail({
        body: {
            email,
            password,
            name,
            role, // Ensure your auth.ts config allows 'role' in additionalFields
        },
        asResponse: true
    });

    // 4. THE FIX: Intercept the Response
    // The 'res' object contains the new user's session cookie.
    // We create a NEW JSON response for your Admin Browser that DOES NOT have that cookie.
    
    // We assume success if we got a response, but check for errors
    if (!res) {
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    // Return a clean 200 OK without forwarding the Set-Cookie header from 'res'
    return NextResponse.json({ success: true, user: body });

  } catch (error: any) {
    // Handle Better Auth errors (like Email already exists)
    return NextResponse.json({ 
        error: error.body?.message || error.message || "Something went wrong" 
    }, { status: 400 });
  }
}