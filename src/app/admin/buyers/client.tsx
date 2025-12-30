"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, MoreHorizontal, AlertTriangle } from "lucide-react";
import { createBuyer, updateBuyer, deleteBuyer } from "@/app/actions/master";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";

type Buyer = { id: string; name: string; country: string; };

export function BuyerClient({ initialBuyers }: { initialBuyers: Buyer[] }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState<Buyer | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // --- ACTIONS ---
  async function handleCreate(formData: FormData) {
    const result = await createBuyer(formData);
    if (result?.error) toast.error(result.error);
    else {
      toast.success("Buyer added!");
      setIsCreateOpen(false);
    }
  }

  async function handleUpdate(formData: FormData) {
    if (!editingBuyer) return;
    const result = await updateBuyer(editingBuyer.id, formData);
    if (result?.error) toast.error(result.error);
    else {
      toast.success("Buyer updated!");
      setEditingBuyer(null);
    }
  }

  async function handleDelete() {
    if (!deletingId) return;
    const result = await deleteBuyer(deletingId);
    if (result?.error) toast.error(result.error);
    else toast.success("Buyer deleted!");
    setDeletingId(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700"><Plus className="mr-2 h-4 w-4" /> Add Buyer</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Buyer</DialogTitle></DialogHeader>
            <form action={handleCreate} className="space-y-4 mt-4">
              <div className="space-y-2"><Label>Buyer Name</Label><Input name="name" required /></div>
              <div className="space-y-2"><Label>Country</Label><Input name="country" required /></div>
              <div className="flex justify-end pt-4"><Button type="submit">Save Buyer</Button></div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Buyer Name</TableHead>
                <TableHead>Country</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialBuyers.map((buyer) => (
                <TableRow key={buyer.id}>
                  <TableCell className="font-medium">{buyer.name}</TableCell>
                  <TableCell>{buyer.country}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingBuyer(buyer)}>
                          <Pencil className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeletingId(buyer.id)} className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* EDIT DIALOG */}
      <Dialog open={!!editingBuyer} onOpenChange={(open) => !open && setEditingBuyer(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Buyer</DialogTitle></DialogHeader>
          <form action={handleUpdate} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Buyer Name</Label>
              <Input name="name" defaultValue={editingBuyer?.name} required />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input name="country" defaultValue={editingBuyer?.country} required />
            </div>
            <div className="flex justify-end pt-4"><Button type="submit">Update Buyer</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE ALERT */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600"><AlertTriangle className="h-5 w-5"/> Delete Buyer?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. If this buyer has active orders, the deletion might fail.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}