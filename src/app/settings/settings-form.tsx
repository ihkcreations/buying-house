"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateCompanySettings } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Building2, Save, Landmark } from "lucide-react";

export function SettingsForm({ initialData }: { initialData: any }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    const result = await updateCompanySettings(formData);
    if (result.error) toast.error(result.error);
    else toast.success(result.success);
    setIsLoading(false);
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      
      {/* 1. COMPANY INFO */}
      <Card>
        <CardHeader>
            <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <CardTitle>Organization Profile</CardTitle>
            </div>
            <CardDescription>This information appears on the header of PIs and Invoices.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label>Company Name</Label>
                <Input name="companyName" defaultValue={initialData?.companyName || "P.I. OCEAN TEX"} />
            </div>
            <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input name="contactPhone" defaultValue={initialData?.contactPhone || ""} />
            </div>
            <div className="col-span-2 space-y-2">
                <Label>Office Address</Label>
                <Textarea name="companyAddress" defaultValue={initialData?.companyAddress || ""} />
            </div>
        </CardContent>
      </Card>

      {/* 2. BANKING DETAILS */}
      <Card className="border-yellow-200 bg-yellow-50/20">
        <CardHeader>
            <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-yellow-700" />
                <CardTitle>Advising Bank Details</CardTitle>
            </div>
            <CardDescription>These details will be auto-filled in the Proforma Invoice.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label>Beneficiary Name (Account Name)</Label>
                <Input name="accountName" defaultValue={initialData?.accountName || ""} placeholder="P.I. OCEAN TEX" />
            </div>
            <div className="space-y-2">
                <Label>Bank Name</Label>
                <Input name="bankName" defaultValue={initialData?.bankName || ""} placeholder="TRUST BANK PLC" />
            </div>
            <div className="space-y-2">
                <Label>Account Number</Label>
                <Input name="accountNumber" defaultValue={initialData?.accountNumber || ""} />
            </div>
            <div className="space-y-2">
                <Label>SWIFT Code</Label>
                <Input name="swiftCode" defaultValue={initialData?.swiftCode || ""} />
            </div>
            <div className="col-span-2 space-y-2">
                <Label>Branch Address</Label>
                <Input name="bankAddress" defaultValue={initialData?.bankAddress || ""} placeholder="Dilkusha Corp Branch, Dhaka" />
            </div>
        </CardContent>
      </Card>

      {/* 3. DEFAULTS */}
      <Card>
          <CardHeader><CardTitle>Document Defaults</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label>Default Payment Terms</Label>
                <Input name="defaultPaymentTerms" defaultValue={initialData?.defaultPaymentTerms || "Irrevocable L/C at sight"} />
            </div>
            <div className="space-y-2">
                <Label>Default Port of Loading</Label>
                <Input name="defaultPort" defaultValue={initialData?.defaultPort || "Chittagong, Bangladesh"} />
            </div>
          </CardContent>
      </Card>

      <div className="flex justify-end pb-20">
          <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 w-40">
              <Save className="w-4 h-4 mr-2" /> {isLoading ? "Saving..." : "Save Settings"}
          </Button>
      </div>
    </form>
  );
}