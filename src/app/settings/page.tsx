import { protectPage } from "@/lib/protect";
import { db } from "@/lib/db";
import { SettingsForm } from "./settings-form";
import { UserProfileForm } from "./user-profile-form"; // <--- Import
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function SettingsPage() {
  // 1. Get current user
  const user = await protectPage(["admin", "merchandiser", "commercial", "finance"]);

  // 2. Fetch Global Settings (Only needed if Admin)
  let companySettings = null;
  if (user.role === "admin") {
    companySettings = await db.companySettings.findUnique({
        where: { id: "main_settings" }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-slate-500">Manage your profile and system preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="profile">My Profile</TabsTrigger>
          {/* Admin only sees this tab trigger */}
          {user.role === "admin" && (
             <TabsTrigger value="company">Company & Banking</TabsTrigger>
          )}
        </TabsList>

        {/* --- ALL USERS: PROFILE SETTINGS --- */}
        <TabsContent value="profile">
            {/* Pass the logged-in user to the form */}
            <UserProfileForm user={user} />
        </TabsContent>

        {/* --- ADMIN ONLY: COMPANY SETTINGS --- */}
        {user.role === "admin" && (
          <TabsContent value="company">
             <SettingsForm initialData={companySettings} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}