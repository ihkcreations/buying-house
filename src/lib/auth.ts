import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";
import { admin } from "better-auth/plugins/admin";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "mongodb", // or "postgresql", etc
  }),
  emailAndPassword: {  
    enabled: true,
  },
  plugins: [admin()],
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "merchandiser" 
      }
    }
  }
});