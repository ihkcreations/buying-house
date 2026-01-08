"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, MoreHorizontal, AlertTriangle, Globe } from "lucide-react";
import { createBuyer, updateBuyer, deleteBuyer } from "@/app/actions/master";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";

type Buyer = { id: string; name: string; country: string; };

export function BuyerClient({ initialBuyers, userRole }: { initialBuyers: Buyer[], userRole: string }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState<Buyer | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // --- ACTIONS ---
  async function handleCreate(formData: FormData) {
    const result = await createBuyer(formData);
    if (result?.error) toast.error(result.error);
    else { toast.success("Buyer added!"); setIsCreateOpen(false); }
  }

  async function handleUpdate(formData: FormData) {
    if (!editingBuyer) return;
    const result = await updateBuyer(editingBuyer.id, formData);
    if (result?.error) toast.error(result.error);
    else { toast.success("Buyer updated!"); setEditingBuyer(null); }
  }

  async function handleDelete() {
    if (!deletingId) return;
    const result = await deleteBuyer(deletingId);
    if (result?.error) toast.error(result.error);
    else toast.success("Buyer deleted!");
    setDeletingId(null);
  }

  // --- SHARED ACTION MENU ---
  const ActionMenu = ({ buyer }: { buyer: Buyer }) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditingBuyer(buyer)}>
                <Pencil className="w-4 h-4 mr-2" /> Edit
            </DropdownMenuItem>
            {userRole === "admin" || userRole === "super_admin" && (
                <DropdownMenuItem onClick={() => setDeletingId(buyer.id)} className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                </DropdownMenuItem>
            )}
        </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="space-y-4">
      
      {/* HEADER ACTION */}
      <div className="flex justify-end">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto"><Plus className="mr-2 h-4 w-4" /> Add Buyer</Button>
          </DialogTrigger>
          <DialogContent className="w-[90%] rounded-lg">
            <DialogHeader><DialogTitle>Add New Buyer</DialogTitle></DialogHeader>
            <form action={handleCreate} className="space-y-4 mt-2">
              <div className="space-y-2"><Label>Buyer Name</Label><Input name="name" required /></div>
              <div className="space-y-2"><Label>Country</Label><Input name="country" required /></div>
              <Button type="submit" className="w-full bg-blue-600">Save Buyer</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* DESKTOP TABLE (Hidden on Mobile) */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Buyer Name</TableHead>
                <TableHead>Country</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialBuyers.map((buyer) => (
                <TableRow key={buyer.id}>
                  <TableCell className="font-medium text-slate-900">{buyer.name}</TableCell>
                  <TableCell>{buyer.country}</TableCell>
                  <TableCell className="text-right">
                    <ActionMenu buyer={buyer} />
                  </TableCell>
                </TableRow>
              ))}
              {initialBuyers.length === 0 && <TableRow><TableCell colSpan={3} className="text-center py-8 text-slate-400">No buyers found.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* MOBILE LIST (Hidden on Desktop) */}
      <div className="md:hidden space-y-3">
          {initialBuyers.map((buyer) => (
              <Card key={buyer.id} className="shadow-sm border border-slate-200">
                  <CardContent className="p-4 flex items-center justify-between">
                      <div>
                          <p className="font-bold text-slate-900 text-lg">{buyer.name}</p>
                          <div className="flex items-center gap-2 text-slate-500 mt-1">
                              <Globe className="w-5 h-4" color="#0088FE" /><div className="text-xs">{buyer.country}</div> 
                          </div>
                      </div>
                      <ActionMenu buyer={buyer} />
                  </CardContent>
              </Card>
          ))}
          {initialBuyers.length === 0 && <div className="text-center py-10 text-slate-400">No buyers found.</div>}
      </div>

      {/* EDIT DIALOG (Responsive) */}
      <Dialog open={!!editingBuyer} onOpenChange={(open) => !open && setEditingBuyer(null)}>
        <DialogContent className="w-[90%] rounded-lg">
          <DialogHeader><DialogTitle>Edit Buyer</DialogTitle></DialogHeader>
          <form action={handleUpdate} className="space-y-4 mt-2">
            <div className="space-y-2"><Label>Buyer Name</Label><Input name="name" defaultValue={editingBuyer?.name} required /></div>
            <div className="space-y-2"><Label>Country</Label><Input name="country" defaultValue={editingBuyer?.country} required /></div>
            <Button type="submit" className="w-full bg-blue-600">Update Buyer</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE ALERT (Responsive) */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent className="w-[90%] rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600"><AlertTriangle className="h-5 w-5"/> Delete Buyer?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}