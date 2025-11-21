"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { createFactory } from "@/app/actions/master";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

type Factory = { id: string; name: string; address: string };

export function FactoryClient({ initialFactories }: { initialFactories: Factory[] }) {
  const [open, setOpen] = useState(false);

  async function clientAction(formData: FormData) {
    const result = await createFactory(formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Factory added successfully!");
      setOpen(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700"><Plus className="mr-2 h-4 w-4" /> Add Factory</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Factory</DialogTitle></DialogHeader>
            <form action={clientAction} className="space-y-4 mt-4">
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
                  <TableCell className="text-right"><Button variant="ghost" size="sm">Edit</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}