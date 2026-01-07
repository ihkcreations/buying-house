import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";
import { admin } from "better-auth/plugins/admin";
import { ac, superAdminRole, adminRole } from "@/lib/access";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "mongodb", // or "postgresql", etc
  }),
  emailAndPassword: {  
    enabled: true,
  },
  plugins: [
    admin({
        ac: ac, // Pass the Access Controller
        roles: {
            // Map the Database String to the Role Definition
            super_admin: superAdminRole, 
            admin: adminRole
        }
    })
  ],
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "merchandiser" 
      },
      banned: {
         type: "boolean",
         required: false,
         defaultValue: false
      }
    }
  }
});