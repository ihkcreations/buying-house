import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth"; // Your Better Auth server instance

/**
 * Protects a Server Component route based on roles.
 * @param allowedRoles Array of roles allowed to access this page. 'admin' is always allowed.
 */
export async function protectPage(allowedRoles: string[]) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const user = session.user as any; // Cast to access custom 'role' field
  const userRole = user.role || "guest";

  // 1. SUPER ADMIN: Access Everything immediately
  if (userRole === "super_admin") {
    return user;
  }


  // 2. Check if the user's role is in the allowed list
  if (!allowedRoles.includes(userRole)) {
    // If unauthorized, send them back to dashboard (or a 403 page)
    redirect("/dashboard");
  }

  return user;
}