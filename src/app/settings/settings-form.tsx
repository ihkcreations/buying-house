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
import { Building2, Save, Plus, Trash2, MapPin, Landmark, FileText, Check, Star } from "lucide-react";
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
  const [isAddingAddr, setIsAddingAddr] = useState(false);
  
  const addresses = initialAddresses || [];

  const handleMainSave = async (formData: FormData) => {
    setIsLoading(true);
    const result = await updateCompanySettings(formData);
    if (result.error) toast.error(result.error);
    else {
        toast.success(result.success);
        router.refresh();
    }
    setIsLoading(false);
  };

  const handleAddAddress = async (formData: FormData) => {
      setIsAddingAddr(true);
      const res = await addAddress(formData);
      if(res.success) {
          toast.success("Address added");
          router.refresh();
          // Reset form manually by clearing inputs if needed, 
          // but browser usually handles it or we can use a ref.
          // For simplicity in Server Actions, page refresh clears it.
      } else {
          toast.error("Failed to add address");
      }
      setIsAddingAddr(false);
  };

  const handleDeleteAddress = async (id: string) => {
      if(confirm("Delete this address?")) {
          await deleteAddress(id);
          router.refresh();
          toast.success("Address deleted");
      }
  };

  const handleSetDefault = async (id: string) => {
      await setDefaultAddress(id);
      router.refresh();
      toast.success("Default updated");
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* 1. GENERAL & BANKING SETTINGS */}
      <form action={handleMainSave} className="space-y-6">
        
        {/* Company Info */}
        <Card className="shadow-sm">
            <CardHeader className="pb-4 border-b bg-slate-50/50 rounded-t-lg">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                        <CardTitle className="text-base md:text-lg">Organization Profile</CardTitle>
                        <CardDescription>Company details used on headers.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input name="companyName" defaultValue={initialData?.companyName || "P.I. OCEAN TEX"} className="font-bold text-slate-700" />
                </div>
                <div className="space-y-2">
                    <Label>Contact Phone / Email</Label>
                    <Input name="contactPhone" defaultValue={initialData?.contactPhone || ""} placeholder="+880..." />
                </div>
            </CardContent>
        </Card>

        {/* Banking Details */}
        <Card className="shadow-sm border-l-4 border-l-yellow-400">
            <CardHeader className="pb-4 border-b bg-yellow-50/30 rounded-t-lg">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-yellow-100 text-yellow-700 rounded-lg">
                        <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                        <CardTitle className="text-base md:text-lg">Advising Bank</CardTitle>
                        <CardDescription>Auto-filled on Export PIs and Contracts.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                <div className="space-y-2">
                    <Label>Beneficiary Name</Label>
                    <Input name="accountName" defaultValue={initialData?.accountName || ""} placeholder="Account Name" />
                </div>
                <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input name="bankName" defaultValue={initialData?.bankName || ""} placeholder="Bank Name" />
                </div>
                <div className="space-y-2">
                    <Label>Account Number</Label>
                    <Input name="accountNumber" defaultValue={initialData?.accountNumber || ""} className="font-mono" />
                </div>
                <div className="space-y-2">
                    <Label>SWIFT Code</Label>
                    <Input name="swiftCode" defaultValue={initialData?.swiftCode || ""} className="font-mono uppercase" />
                </div>
                <div className="col-span-1 md:col-span-2 space-y-2">
                    <Label>Branch Address</Label>
                    <Textarea name="bankAddress" defaultValue={initialData?.bankAddress || ""} className="resize-none h-20" />
                </div>
            </CardContent>
        </Card>

        {/* Defaults */}
        <Card className="shadow-sm">
            <CardHeader className="pb-4 border-b bg-slate-50/50 rounded-t-lg">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-200 text-slate-600 rounded-lg">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <CardTitle className="text-base md:text-lg">Document Defaults</CardTitle>
                        <CardDescription>Standard terms for new documents.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
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

        <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-800 w-full md:w-48 h-12 text-base">
                <Save className="w-4 h-4 mr-2" /> {isLoading ? "Saving..." : "Save Changes"}
            </Button>
        </div>
      </form>

      {/* 2. MANAGE ADDRESSES */}
      <Card className="shadow-sm border-l-4 border-l-orange-500">
          <CardHeader className="pb-4 border-b bg-orange-50/30 rounded-t-lg">
              <div className="flex items-center gap-2">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                      <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                      <CardTitle className="text-base md:text-lg">Office Locations</CardTitle>
                      <CardDescription>Manage multiple office addresses.</CardDescription>
                  </div>
              </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
              
              {/* Address List */}
              <div className="grid gap-4">
                  {addresses.length === 0 && (
                      <div className="text-center p-8 border-2 border-dashed rounded-lg text-slate-400 bg-slate-50">
                          No addresses found. Add your first office location below.
                      </div>
                  )}
                  
                  {addresses.map((addr: any) => (
                      <div key={addr.id} className={`flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-lg bg-white transition-all ${addr.isDefault ? "border-green-200 shadow-sm bg-green-50/20" : "hover:border-slate-300"}`}>
                          <div className="mb-3 md:mb-0">
                              <div className="flex items-center gap-3">
                                  <span className="font-bold text-slate-900 text-sm md:text-base">{addr.label}</span>
                                  {addr.isDefault && (
                                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 gap-1 pl-1">
                                          <Check className="w-3 h-3" /> Default
                                      </Badge>
                                  )}
                              </div>
                              <p className="text-xs md:text-sm text-slate-600 mt-1 whitespace-pre-wrap leading-relaxed">
                                  {addr.addressText}
                              </p>
                          </div>
                          
                          <div className="flex items-center gap-2 w-full md:w-auto">
                              {!addr.isDefault && (
                                  <Button size="sm" variant="outline" onClick={() => handleSetDefault(addr.id)} className="flex-1 md:flex-none text-xs h-8">
                                      <Star className="w-3 h-3 mr-1" /> Make Default
                                  </Button>
                              )}
                              <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-600 hover:bg-red-50 flex-1 md:flex-none h-8" onClick={() => handleDeleteAddress(addr.id)}>
                                  <Trash2 className="w-4 h-4 md:mr-0" /> <span className="md:hidden ml-1">Delete</span>
                              </Button>
                          </div>
                      </div>
                  ))}
              </div>

              {/* Add New Form */}
              <div className="pt-6 border-t">
                  <Label className="mb-3 block font-semibold text-slate-700">Add New Location</Label>
                  <form action={handleAddAddress} className="flex flex-col gap-4 p-4 bg-slate-50 rounded-lg border">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input name="label" placeholder="Label (e.g. Chittagong Branch)" required className="bg-white" />
                        <div className="md:col-span-2">
                             <Input name="addressText" placeholder="Full Address..." required className="bg-white" />
                        </div>
                      </div>
                      <Button type="submit" disabled={isAddingAddr} className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto self-end">
                          <Plus className="w-4 h-4 mr-2" /> {isAddingAddr ? "Adding..." : "Add Address"}
                      </Button>
                  </form>
              </div>

          </CardContent>
      </Card>
    </div>
  );
}