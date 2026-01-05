"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateCompanySettings, addAddress, deleteAddress, setDefaultAddress } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Save, Plus, Trash2, MapPin, Landmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SettingsForm({ 
    initialData, 
    initialAddresses 
}: { 
    initialData: any, 
    initialAddresses: any[] 
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Use the explicit addresses prop
  const addresses = initialAddresses || [];

  const handleMainSave = async (formData: FormData) => {
    setIsLoading(true);
    const result = await updateCompanySettings(formData);
    if (result.error) {
        toast.error(result.error);
    } else {
        toast.success(result.success);
        router.refresh();
    }
    setIsLoading(false);
  };

  const handleAddAddress = async (formData: FormData) => {
      const res = await addAddress(formData);
      if(res.success) {
          toast.success("Address added");
          router.refresh();
      } else {
          toast.error("Failed to add address");
      }
  };

  const handleDeleteAddress = async (id: string) => {
      await deleteAddress(id);
      router.refresh();
      toast.success("Address deleted");
  };

  const handleSetDefault = async (id: string) => {
      await setDefaultAddress(id);
      router.refresh();
      toast.success("Default updated");
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* 1. GENERAL & BANKING SETTINGS */}
      <form action={handleMainSave} className="space-y-6">
        
        {/* Company Info */}
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <CardTitle>Organization Profile</CardTitle>
                </div>
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
            </CardContent>
        </Card>

        {/* Banking Details */}
        <Card className="border-yellow-200 bg-yellow-50/20">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-yellow-700" />
                    <CardTitle>Advising Bank Details</CardTitle>
                </div>
                <CardDescription>These details will be auto-filled in PIs and Contracts.</CardDescription>
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

        {/* Defaults */}
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

        <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 w-40">
                <Save className="w-4 h-4 mr-2" /> {isLoading ? "Saving..." : "Save Settings"}
            </Button>
        </div>
      </form>

      {/* 2. MANAGE ADDRESSES (List) */}
      <Card>
          <CardHeader>
              <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  <CardTitle>Office Locations</CardTitle>
              </div>
              <CardDescription>Add multiple office addresses. Select a default for new documents.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              
              <div className="space-y-3">
                  {addresses.length === 0 ? (
                      <div className="text-center p-4 border border-dashed rounded text-slate-500 bg-slate-50">
                          No addresses found. Add your first office location below.
                      </div>
                  ) : (
                      addresses.map((addr: any) => (
                          <div key={addr.id} className="flex items-start justify-between p-4 border rounded-md bg-white hover:bg-slate-50">
                              <div>
                                  <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-900">{addr.label}</span>
                                      {addr.isDefault && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Default</Badge>}
                                  </div>
                                  <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{addr.addressText}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                  {!addr.isDefault && (
                                      <Button size="sm" variant="outline" onClick={() => handleSetDefault(addr.id)}>Set Default</Button>
                                  )}
                                  <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDeleteAddress(addr.id)}>
                                      <Trash2 className="w-4 h-4" />
                                  </Button>
                              </div>
                          </div>
                      ))
                  )}
              </div>

              <div className="p-4 border rounded-md bg-slate-50/50">
                  <Label className="mb-2 block font-semibold text-slate-700">Add New Location</Label>
                  <form action={handleAddAddress} className="grid gap-4">
                      <Input name="label" placeholder="Label (e.g. Chittagong Branch)" required className="bg-white" />
                      <Textarea name="addressText" placeholder="Full Address..." required className="bg-white" />
                      <Button type="submit" variant="secondary" className="w-full">
                          <Plus className="w-4 h-4 mr-2" /> Add Address
                      </Button>
                  </form>
              </div>

          </CardContent>
      </Card>
    </div>
  );
}