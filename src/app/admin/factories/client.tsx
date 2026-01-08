"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, MoreHorizontal, AlertTriangle, MapPin } from "lucide-react";
import { createFactory, updateFactory, deleteFactory } from "@/app/actions/master";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
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

  // Shared Action Menu Component
  const ActionMenu = ({ factory }: { factory: Factory }) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditingFactory(factory)}>
                <Pencil className="w-4 h-4 mr-2" /> Edit
            </DropdownMenuItem>
            {userRole === "admin" || userRole === "super_admin" && (
                <DropdownMenuItem onClick={() => setDeletingId(factory.id)} className="text-red-600">
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
            <Button className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto"><Plus className="mr-2 h-4 w-4" /> Add Factory</Button>
          </DialogTrigger>
          <DialogContent className="w-[90%] rounded-lg">
            <DialogHeader><DialogTitle>Add New Factory</DialogTitle></DialogHeader>
            <form action={handleCreate} className="space-y-4 mt-2">
              <div className="space-y-2"><Label>Factory Name</Label><Input name="name" required /></div>
              <div className="space-y-2"><Label>Address</Label><Input name="address" required /></div>
              <Button type="submit" className="w-full bg-blue-600">Save Factory</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* DESKTOP TABLE */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Factory Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialFactories.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium text-slate-900">{f.name}</TableCell>
                  <TableCell>{f.address}</TableCell>
                  <TableCell className="text-right"><ActionMenu factory={f} /></TableCell>
                </TableRow>
              ))}
              {initialFactories.length === 0 && <TableRow><TableCell colSpan={3} className="text-center py-8 text-slate-400">No factories found.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* MOBILE LIST */}
      <div className="md:hidden space-y-3">
          {initialFactories.map((f) => (
              <Card key={f.id} className="shadow-sm border border-slate-200">
                  <CardContent className="p-4 flex items-center justify-between">
                      <div>
                          <p className="font-bold text-slate-900 text-lg">{f.name}</p>
                          <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                              <MapPin className="w-5 h-4" /> <div className="text-xs">{f.address}</div>
                          </div>
                      </div>
                      <ActionMenu factory={f} />
                  </CardContent>
              </Card>
          ))}
          {initialFactories.length === 0 && <div className="text-center py-10 text-slate-400">No factories found.</div>}
      </div>

      {/* EDIT DIALOG */}
      <Dialog open={!!editingFactory} onOpenChange={(open) => !open && setEditingFactory(null)}>
        <DialogContent className="w-[90%] rounded-lg">
          <DialogHeader><DialogTitle>Edit Factory</DialogTitle></DialogHeader>
          <form action={handleUpdate} className="space-y-4 mt-2">
            <div className="space-y-2"><Label>Factory Name</Label><Input name="name" defaultValue={editingFactory?.name} required /></div>
            <div className="space-y-2"><Label>Address</Label><Input name="address" defaultValue={editingFactory?.address} required /></div>
            <Button type="submit" className="w-full bg-blue-600">Update Factory</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE ALERT */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent className="w-[90%] rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600"><AlertTriangle className="h-5 w-5"/> Delete Factory?</AlertDialogTitle>
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