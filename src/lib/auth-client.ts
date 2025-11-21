import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    baseURL: "http://localhost:3000" // Change this in production
})

export const { signIn, signUp, useSession, signOut } = authClient;