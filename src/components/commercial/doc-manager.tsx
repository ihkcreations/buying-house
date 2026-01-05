"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle, FileText, ExternalLink, Loader2, Trash2 } from "lucide-react";
import { updateDocStatus } from "@/app/actions/commercial";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UploadButton } from "@/utils/uploadthing"; 
import Link from "next/link";

const REQUIRED_DOCS = [
    { name: "Purchase Order (P.O)", stage: "Pre-Production" },
    { name: "Master L/C", stage: "Banking" },
    { name: "Utilization Declaration (U.D)", stage: "Government" },
    { name: "Packing List", stage: "Shipment" },
    { name: "Commercial Invoice", stage: "Shipment" },
    { name: "Bill of Lading (B/L)", stage: "Shipment" },
    { name: "Certificate of Origin (CO)", stage: "Shipment" },
];

export function DocManager({ orderId, docs }: { orderId: string, docs: any[] }) {
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Track which specific document is currently uploading
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  const getDoc = (name: string) => docs.find(d => d.name === name);

  const handleUploadComplete = async (docName: string, url: string) => {
      setIsUpdating(true);
      const result = await updateDocStatus(orderId, docName, url);
      if(result.success) {
          toast.success(`${docName} uploaded successfully!`);
      } else {
          toast.error("Database update failed.");
      }
      setIsUpdating(false);
      setUploadingDoc(null); // Reset state
  };

  return (
    <Card className="relative">
        {/* --- BLOCKING OVERLAY --- */}
        {uploadingDoc && (
            <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center backdrop-blur-[1px] rounded-lg">
                <div className="bg-white border p-4 rounded-lg shadow-xl flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                    <div className="text-center">
                        <p className="font-bold text-slate-900">Uploading {uploadingDoc}...</p>
                        <p className="text-xs text-slate-500">Please do not switch tabs.</p>
                    </div>
                </div>
            </div>
        )}
        <CardHeader>
            <CardTitle>Document Vault</CardTitle>
            <CardDescription>Upload official PDF/Image documents. Maximum 4MB.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Document Name</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {REQUIRED_DOCS.map((docItem, idx) => {
                        const existingDoc = getDoc(docItem.name);
                        const isUploaded = !!existingDoc;
                        
                        // Check if THIS specific row is uploading
                        const isThisUploading = uploadingDoc === docItem.name;
                        // Check if ANY row is uploading (to disable others)
                        const isAnyUploading = uploadingDoc !== null;

                        return (
                            <TableRow key={idx}>
                                <TableCell className="font-medium flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-slate-400" />
                                    {docItem.name}
                                </TableCell>
                                <TableCell className="text-slate-500 text-xs">{docItem.stage}</TableCell>
                                
                                <TableCell className="text-center">
                                    {isUploaded ? (
                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 pointer-events-none">
                                            Uploaded
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 pointer-events-none">
                                            {isThisUploading ? "Uploading..." : "Pending"}
                                        </Badge>
                                    )}
                                </TableCell>
                                
                                <TableCell className="text-right">
                                    {isUploaded ? (
                                        <div className="flex justify-end gap-2">
                                            <Link href={existingDoc.url} target="_blank">
                                                <Button size="sm" variant="ghost" className="text-blue-600 gap-1">
                                                    <ExternalLink className="w-4 h-4" /> View
                                                </Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="flex justify-end relative">
                                            {/* 
                                                If another row is uploading, disable this row visually.
                                                UploadThing doesn't expose a simple 'disabled' prop easily, 
                                                so we conditionally render or mask it.
                                            */}
                                            {isAnyUploading && !isThisUploading ? (
                                                <Button size="sm" variant="ghost" disabled className="text-slate-300">
                                                    Wait...
                                                </Button>
                                            ) : (
                                                <UploadButton
                                                    endpoint="commercialDoc"
                                                    onUploadBegin={() => {
                                                        setUploadingDoc(docItem.name); // START LOADING
                                                    }}
                                                    onClientUploadComplete={(res) => {
                                                        if(res?.[0]) handleUploadComplete(docItem.name, res[0].url);
                                                    }}
                                                    onUploadError={(error: Error) => {
                                                        toast.error(`Upload failed: ${error.message}`);
                                                        setUploadingDoc(null); // RESET ON ERROR
                                                    }}
                                                    appearance={{
                                                        button: "bg-slate-900 text-white text-xs h-8 px-4 rounded-md hover:bg-slate-800 focus-within:ring-0 transition-all",
                                                        allowedContent: "hidden"
                                                    }}
                                                    content={{
                                                        button({ ready, isUploading }) {
                                                            if (isUploading) return (
                                                                <div className="flex items-center gap-1">
                                                                    <Loader2 className="h-3 w-3 animate-spin" /> 
                                                                    <span className="text-[10px]">Uploading...</span>
                                                                </div>
                                                            );
                                                            if (ready) return <div>Upload</div>;
                                                            return "Loading...";
                                                        }
                                                    }}
                                                />
                                            )}
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
  );
}