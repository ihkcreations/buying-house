import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"
import { ac, superAdminRole, adminRole } from "@/lib/access";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000", // Change this in production
    plugins: [
        adminClient({
            ac,
            roles: {
                super_admin: superAdminRole,
                admin: adminRole
            }
        })
    ]
})

export const { signIn, signUp, useSession, signOut } = authClient;