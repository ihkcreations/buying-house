"use client";

import { useState } from "react";
import { toast } from "sonner";
import { User, Mail, Shield, KeyRound, Save, Loader2 } from "lucide-react";
import { updateProfileName, requestPasswordReset } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export function UserProfileForm({ user }: { user: any }) {
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Helper for Initials
  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";
  };

  const handleUpdateName = async (formData: FormData) => {
    setIsSaving(true);
    const result = await updateProfileName(user.id, formData);
    if (result.error) toast.error(result.error);
    else toast.success(result.success);
    setIsSaving(false);
  };

  const handlePasswordRequest = async () => {
    setIsResetting(true);
    const result = await requestPasswordReset(user.id);
    if (result.error) toast.error(result.error);
    else toast.success(result.success);
    setIsResetting(false);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. PUBLIC PROFILE CARD */}
      <Card>
        <CardHeader>
            <CardTitle>Public Profile</CardTitle>
            <CardDescription>This is how you appear to others in the system.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20 border-2 border-slate-100">
                    <AvatarImage src={user.image || ""} />
                    <AvatarFallback className="text-xl font-bold bg-blue-100 text-blue-700">
                        {getInitials(user.name)}
                    </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                    <h3 className="font-medium text-lg">{user.name}</h3>
                    <p className="text-sm text-slate-500 capitalize">{user.role}</p>
                    {/* Placeholder for Avatar Upload */}
                    <Button variant="outline" size="sm" className="mt-2 text-xs h-8" disabled>
                        Change Avatar (Coming Soon)
                    </Button>
                </div>
            </div>

            <Separator />

            {/* Edit Name Form */}
            <form action={handleUpdateName} className="grid gap-4 max-w-md">
                <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <div className="flex gap-2">
                        <Input 
                            id="name" 
                            name="name" 
                            defaultValue={user.name} 
                            className="bg-white"
                        />
                        <Button type="submit" size="icon" disabled={isSaving}>
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </form>

        </CardContent>
      </Card>

      {/* 2. ACCOUNT SECURITY CARD */}
      <Card>
        <CardHeader>
            <CardTitle>Account Security</CardTitle>
            <CardDescription>Manage your login credentials.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-lg">
            
            {/* Read Only Email */}
            <div className="space-y-2">
                <Label className="text-slate-500">Email Address</Label>
                <div className="flex items-center gap-2 p-3 border rounded-md bg-slate-50 text-slate-600">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{user.email}</span>
                    <Badge variant="outline" className="ml-auto bg-green-50 text-green-700 border-green-200">Verified</Badge>
                </div>
                <p className="text-[10px] text-slate-400">Email address cannot be changed. Contact Admin for help.</p>
            </div>

            {/* Read Only Role */}
            <div className="space-y-2">
                <Label className="text-slate-500">System Role</Label>
                <div className="flex items-center gap-2 p-3 border rounded-md bg-slate-50 text-slate-600">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm capitalize font-medium">{user.role}</span>
                </div>
            </div>

        </CardContent>
        <CardFooter className="bg-slate-50/50 border-t flex flex-col items-start gap-3 p-6">
            <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-slate-500" />
                <span className="font-medium text-sm">Password</span>
            </div>
            <p className="text-sm text-slate-500">
                You cannot change your password directly. Please request a reset from the Administrator.
            </p>
            <Button variant="secondary" onClick={handlePasswordRequest} disabled={isResetting}>
                {isResetting ? "Sending Request..." : "Request Password Change"}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}