"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, MoreHorizontal, AlertTriangle } from "lucide-react";
import { createFactory, updateFactory, deleteFactory } from "@/app/actions/master";
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

type Factory = { id: string; name: string; address: string; };

export function FactoryClient({ initialFactories, userRole }: { initialFactories: Factory[], userRole: string }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingFactory, setEditingFactory] = useState<Factory | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleCreate(formData: FormData) {
    const result = await createFactory(formData);
    if (result?.error) toast.error(result.error);
    else { toast.success("Factory added!"); setIsCreateOpen(false); }
  }

  async function handleUpdate(formData: FormData) {
    if (!editingFactory) return;
    const result = await updateFactory(editingFactory.id, formData);
    if (result?.error) toast.error(result.error);
    else { toast.success("Factory updated!"); setEditingFactory(null); }
  }

  async function handleDelete() {
    if (!deletingId) return;
    const result = await deleteFactory(deletingId);
    if (result?.error) toast.error(result.error);
    else toast.success("Factory deleted!");
    setDeletingId(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700"><Plus className="mr-2 h-4 w-4" /> Add Factory</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Factory</DialogTitle></DialogHeader>
            <form action={handleCreate} className="space-y-4 mt-4">
              <div className="space-y-2"><Label>Factory Name</Label><Input name="name" required /></div>
              <div className="space-y-2"><Label>Address</Label><Input name="address" required /></div>
              <div className="flex justify-end pt-4"><Button type="submit">Save Factory</Button></div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Factory Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialFactories.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">{f.name}</TableCell>
                  <TableCell>{f.address}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingFactory(f)}>
                          <Pencil className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        {/* CONDITIONAL RENDER: Only Admin can see Delete */}
                        {userRole === "admin" && (
                            <DropdownMenuItem onClick={() => setDeletingId(f.id)} className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                        )}
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
      <Dialog open={!!editingFactory} onOpenChange={(open) => !open && setEditingFactory(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Factory</DialogTitle></DialogHeader>
          <form action={handleUpdate} className="space-y-4 mt-4">
            <div className="space-y-2"><Label>Factory Name</Label><Input name="name" defaultValue={editingFactory?.name} required /></div>
            <div className="space-y-2"><Label>Address</Label><Input name="address" defaultValue={editingFactory?.address} required /></div>
            <div className="flex justify-end pt-4"><Button type="submit">Update Factory</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE ALERT */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600"><AlertTriangle className="h-5 w-5"/> Delete Factory?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
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