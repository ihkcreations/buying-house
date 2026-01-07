import { protectPage } from "@/lib/protect";
import { db } from "@/lib/db";
import { SettingsForm } from "./settings-form";
import { UserProfileForm } from "./user-profile-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = "force-dynamic"; // Critical

export default async function SettingsPage() {
  const user = await protectPage(["super_admin", "admin", "merchandiser", "commercial", "finance"]);

  let companySettings = null;
  // Initialize as empty array to prevent undefined errors
  let addresses: any[] = []; 

  if (user.role === "admin" || user.role === "super_admin") {
    companySettings = await db.companySettings.findUnique({
        where: { id: "main_settings" },
        include: { addresses: true } // Fetch addresses
    });
    
    // Explicitly extract addresses
    if (companySettings && companySettings.addresses) {
        addresses = companySettings.addresses;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-slate-500">Manage your profile and system preferences.</p>
      </div>

      <Tabs defaultValue={user.role === "admin" || user.role === "super_admin" ? "company" : "profile"} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          {(user.role === "admin" || user.role === "super_admin") && <TabsTrigger value="company">Company & Banking</TabsTrigger>}
          <TabsTrigger value="profile">My Profile</TabsTrigger>
        </TabsList>

        {(user.role === "admin" || user.role === "super_admin") && (
          <TabsContent value="company">
             {/* Pass addresses explicitly as a separate prop */}
             <SettingsForm initialData={companySettings} initialAddresses={addresses} />
          </TabsContent>
        )}

        <TabsContent value="profile">
            <UserProfileForm user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}