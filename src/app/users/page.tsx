import { protectPage } from "@/lib/protect";
import { getUsers } from "@/app/actions/users";
import { UserList } from "@/components/admin/user-list";

export default async function UserManagementPage() {
  // 1. Security Check (Admin Only)
  await protectPage(["admin"]);

  // 2. Fetch Users
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-slate-500">Manage team access and roles.</p>
      </div>

      <UserList initialUsers={users} />
    </div>
  );
}