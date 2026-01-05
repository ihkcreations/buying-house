"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileText, ExternalLink, Plus, Trash2, Loader2, Paperclip, CheckCircle } from "lucide-react";
import { createCommercialDoc, deleteCommercialDoc } from "@/app/actions/commercial";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { UploadButton } from "@/utils/uploadthing"; 
import Link from "next/link";

const DOC_TYPES = [
    "Master L/C", "L/C Amendment", "Sales Contract", "Purchase Order", 
    "Commercial Invoice", "Packing List", "Bill of Lading", "Certificate of Origin", "Inspection Report", "Other"
];

export function DocManager({ orderId, docs }: { orderId: string, docs: any[] }) {
  const [open, setOpen] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [docType, setDocType] = useState("Master L/C");
  const [refNo, setRefNo] = useState("");

  const handleSave = async () => {
      if (!uploadedUrl || !refNo) {
          toast.error("Please upload a file and enter a Reference No.");
          return;
      }
      setIsSaving(true);
      const formData = new FormData();
      formData.append("type", docType);
      formData.append("refNo", refNo);
      formData.append("url", uploadedUrl);

      const result = await createCommercialDoc(orderId, formData);
      if (result.success) {
          toast.success("Document added!");
          setOpen(false);
          setUploadedUrl(null);
          setRefNo("");
      } else {
          toast.error("Failed to save.");
      }
      setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
      if (confirm("Delete this document permanently?")) {
          await deleteCommercialDoc(id, orderId);
          toast.success("Deleted");
      }
  };

  // Helper to group docs
  const getDocsByType = (typeGroup: string[]) => docs.filter(d => typeGroup.some(t => d.name.startsWith(t)));

  const bankingDocs = getDocsByType(["Master L/C", "L/C Amendment", "Sales Contract", "Purchase Order"]);
  const shippingDocs = getDocsByType(["Commercial Invoice", "Packing List", "Bill of Lading"]);
  const otherDocs = docs.filter(d => !bankingDocs.includes(d) && !shippingDocs.includes(d));

  const renderTable = (title: string, list: any[]) => (
      <div className="mb-8">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">{title}</h3>
          <div className="border rounded-md bg-white overflow-hidden">
              <Table>
                  <TableHeader>
                      <TableRow className="bg-slate-50">
                          <TableHead>Document Name</TableHead>
                          <TableHead>Uploaded Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {list.length === 0 ? (
                          <TableRow>
                              <TableCell colSpan={3} className="text-center py-6 text-slate-400 italic">No documents yet.</TableCell>
                          </TableRow>
                      ) : (
                          list.map((doc) => (
                              <TableRow key={doc.id}>
                                  <TableCell className="font-medium flex items-center gap-2">
                                      <FileText className="w-4 h-4 text-blue-500" />
                                      {doc.name}
                                  </TableCell>
                                  <TableCell className="text-slate-500 text-xs">
                                      {new Date(doc.createdAt).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell className="text-right">
                                      <div className="flex justify-end gap-2">
                                          <Link href={doc.url} target="_blank">
                                              <Button size="sm" variant="outline" className="h-8 gap-1">
                                                  <ExternalLink className="w-3 h-3" /> View
                                              </Button>
                                          </Link>
                                          <Button size="sm" variant="ghost" onClick={() => handleDelete(doc.id)} className="h-8 w-8 p-0 text-slate-400 hover:text-red-600">
                                              <Trash2 className="w-4 h-4" />
                                          </Button>
                                      </div>
                                  </TableCell>
                              </TableRow>
                          ))
                      )}
                  </TableBody>
              </Table>
          </div>
      </div>
  );

  return (
    <Card className="bg-slate-50/50">
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Document Repository</CardTitle>
                <CardDescription>Manage all shipping and banking files.</CardDescription>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" /> Add Document
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader><DialogTitle>Upload New Document</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-2">
                        <div className="space-y-2">
                            <Label>Document Type</Label>
                            <Select value={docType} onValueChange={setDocType}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {DOC_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Reference No / Note</Label>
                            <Input value={refNo} onChange={(e) => setRefNo(e.target.value)} placeholder="e.g. Amendment 02" />
                        </div>
                        <div className="space-y-2">
                            <Label>File Attachment (PDF/Image)</Label>
                            {uploadedUrl ? (
                                <div className="flex items-center gap-2 p-2 border rounded bg-green-50 text-green-700 text-sm">
                                    <CheckCircle className="w-4 h-4" /> File Ready
                                    <Button variant="ghost" size="sm" onClick={() => setUploadedUrl(null)} className="ml-auto text-xs h-6">Change</Button>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed rounded-md p-6 flex justify-center bg-slate-400">
                                    <UploadButton
                                        
                                        endpoint="commercialDoc"
                                        onClientUploadComplete={(res) => {
                                            if(res?.[0]) setUploadedUrl(res[0].url);
                                        }}
                                        onUploadError={(error: Error) => toast.error(error.message)}
                                    />
                                </div>
                            )}
                        </div>
                        <Button onClick={handleSave} disabled={isSaving || !uploadedUrl} className="w-full bg-slate-900">
                            {isSaving ? "Saving..." : "Save Document"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </CardHeader>
        <CardContent>
            {renderTable("Banking & Contracts", bankingDocs)}
            {renderTable("Shipping & Customs", shippingDocs)}
            {renderTable("Certificates & Others", otherDocs)}
        </CardContent>
    </Card>
  );
}