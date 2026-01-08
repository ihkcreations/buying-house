"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileText, Image as ImageIcon, X, Plus, CloudUpload, AlertTriangle } from "lucide-react";
import { updateOrderAttachments } from "@/app/actions/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UploadDropzone } from "@/utils/uploadthing";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";

export function TechPackManager({ orderId, initialUrls }: { orderId: string, initialUrls: string[] }) {
  const [urls, setUrls] = useState<string[]>(initialUrls || []);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  
  // State for Deletion
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);

  // --- SAVE ---
  const saveChanges = async (newUrls: string[]) => {
      const result = await updateOrderAttachments(orderId, newUrls);
      if (result.success) {
          toast.success("Files updated");
          setUrls(newUrls);
      } else {
          toast.error("Failed to save changes");
      }
  };

  // --- HANDLERS ---
  const confirmDelete = async () => {
      if(!fileToDelete) return;
      
      const newUrls = urls.filter(u => u !== fileToDelete);
      await saveChanges(newUrls);
      
      setFileToDelete(null); // Close dialog
  };

  const handleUploadComplete = async (res: any[]) => {
      if (!res) return;
      const newLinks = res.map(f => f.url);
      const combined = [...urls, ...newLinks];
      await saveChanges(combined);
      setIsUploadOpen(false);
  };

  return (
    <>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold">Tech Pack & Attachments</CardTitle>
                
                {/* UPLOAD DIALOG */}
                <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="h-8">
                            <Plus className="w-4 h-4 mr-2" /> Add File
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Upload Attachments</DialogTitle></DialogHeader>
                        <div className="pt-4">
                            <UploadDropzone
                                endpoint="techPackUploader"
                                onClientUploadComplete={handleUploadComplete}
                                onUploadError={(e: Error) => { toast.error(e.message); }}
                                appearance={{
                                    container: "border-2 border-dashed border-slate-300 bg-slate-50/50 p-8",
                                    button: "bg-slate-900"
                                }}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            
            <CardContent>
                {urls.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 border border-dashed rounded-md bg-slate-50">
                        <CloudUpload className="w-8 h-8 mx-auto mb-2 opacity-50"/>
                        <p className="text-sm">No files attached.</p>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-4">
                        {urls.map((url, idx) => (
                            <div key={idx} className="relative group">
                                <Link href={url} target="_blank">
                                    <div className="flex flex-col items-center gap-2 p-3 border rounded-lg hover:bg-slate-50 transition-colors w-28 text-center cursor-pointer bg-white">
                                        <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center">
                                            {url.endsWith('.pdf') ? <FileText className="w-5 h-5 text-red-500"/> : <ImageIcon className="w-5 h-5 text-blue-500"/>}
                                        </div>
                                        <span className="text-[10px] text-slate-600 font-medium truncate w-full">
                                            Attachment {idx + 1}
                                        </span>
                                    </div>
                                </Link>
                                
                                {/* DELETE TRIGGER */}
                                <button 
                                    onClick={() => setFileToDelete(url)}
                                    className="absolute -top-2 -right-2 bg-white text-slate-400 hover:text-red-600 border rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    title="Remove File"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>

        {/* --- DELETE CONFIRMATION DIALOG --- */}
        <AlertDialog open={!!fileToDelete} onOpenChange={(o) => !o && setFileToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5"/> Remove File?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to remove this attachment? This cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                        Remove
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}