import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements as adminStatements, adminAc } from "better-auth/plugins/admin/access";

// 1. Define Statements (We inherit all default admin powers)
const statement = {
    ...adminStatements,
} as const;

// 2. Create Access Controller
export const ac = createAccessControl(statement);

// 3. Define the Roles
// This tells Better Auth: "super_admin" has all admin permissions
export const superAdminRole = ac.newRole({
    ...adminAc.statements
});

// "admin" also has admin permissions (but your custom logic limits them)
export const adminRole = ac.newRole({
    ...adminAc.statements,
});