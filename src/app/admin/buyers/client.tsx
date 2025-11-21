"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { createBuyer } from "@/app/actions/master";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

// Define the Type based on Prisma
type Buyer = {
  id: string;
  name: string;
  country: string;
};

export function BuyerClient({ initialBuyers }: { initialBuyers: Buyer[] }) {
  const [open, setOpen] = useState(false);

  async function clientAction(formData: FormData) {
    const result = await createBuyer(formData);
    
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Buyer added successfully!");
      setOpen(false); // Close modal
    }
  }

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" /> Add New Buyer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Buyer</DialogTitle>
            </DialogHeader>
            <form action={clientAction} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Buyer Name</Label>
                <Input id="name" name="name" placeholder="e.g. H&M" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" placeholder="e.g. Sweden" required />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit">Save Buyer</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Data Table */}
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
              {initialBuyers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                    No buyers found. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                initialBuyers.map((buyer) => (
                  <TableRow key={buyer.id}>
                    <TableCell className="font-medium">{buyer.name}</TableCell>
                    <TableCell>{buyer.country}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}