"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { Plus, Trash2, AlertTriangle, KeyRound, Loader2, Shield, Calendar } from "lucide-react";
import { deleteUser, adminResetPassword } from "@/app/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";

export function UserList({ initialUsers }: { initialUsers: any[] }) {
  const router = useRouter();
  const { data: session } = useSession();
  const currentUserRole = (session?.user as any)?.role;

  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Create State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("merchandiser");

  // Reset State
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [newResetPass, setNewResetPass] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  // Handlers (Keep existing logic)
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name, role })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      toast.success("User created!");
      setOpen(false);
      setName(""); setEmail(""); setPassword("");
      router.refresh(); 
    } catch (error: any) { toast.error(error.message); } 
    finally { setIsLoading(false); }
  };

  const handleDelete = async (userId: string) => {
    const result = await deleteUser(userId);
    if (result.success) { toast.success("Deleted"); router.refresh(); }
    else toast.error(result.error);
  };

  const handlePassReset = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsResetting(true);
      const res = await adminResetPassword(resetUserId!, newResetPass);
      if(res.success) { toast.success("Password Reset"); setResetUserId(null); setNewResetPass(""); } 
      else toast.error(res.error);
      setIsResetting(false);
  };

  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  // Helper to render Actions (Reused for Mobile & Desktop)
  const ActionButtons = ({ user }: { user: any }) => {
      const isCurrentUser = session?.user?.id === user.id;
      const canDelete = !isCurrentUser && (currentUserRole === "super_admin" || (currentUserRole === "admin" && user.role !== "admin" && user.role !== "super_admin"));
      const canReset = currentUserRole === "super_admin";

      return (
          <div className="flex justify-end gap-2">
              {canReset && (
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600 hover:bg-blue-50" onClick={() => setResetUserId(user.id)}>
                      <KeyRound className="w-4 h-4" />
                  </Button>
              )}
              {canDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="w-[90%] rounded-lg">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2 text-red-600"><AlertTriangle className="h-5 w-5"/> Delete User?</AlertDialogTitle>
                      <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(user.id)} className="bg-red-600">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
          </div>
      );
  };

  return (
    <div className="space-y-4">
      
      {/* HEADER ACTION */}
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-800 w-full md:w-auto"><Plus className="mr-2 h-4 w-4" /> Create User</Button>
          </DialogTrigger>
          <DialogContent className="w-[90%] rounded-lg">
            <DialogHeader><DialogTitle>New Team Member</DialogTitle></DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4 mt-2">
              <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
              <div className="space-y-2"><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} /></div>
              <div className="space-y-2"><Label>Role</Label>
                <Select value={role} onValueChange={setRole}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {currentUserRole === "super_admin" && <SelectItem value="admin">Admin</SelectItem>}
                        <SelectItem value="merchandiser">Merchandiser</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-slate-900" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : "Create"}</Button>
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
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialUsers.map((user) => (
                <TableRow key={user.id} className={session?.user?.id === user.id ? "bg-blue-50/30" : ""}>
                  <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8"><AvatarFallback className="bg-slate-200 text-xs">{getInitials(user.name)}</AvatarFallback></Avatar>
                        <div>
                            <p className="font-medium text-slate-900">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{user.role.replace("_", " ")}</Badge></TableCell>
                  <TableCell className="text-slate-500 text-sm">{format(new Date(user.createdAt), "dd MMM yyyy hh:mm a")}</TableCell>
                  <TableCell className="text-right"><ActionButtons user={user} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* MOBILE CARDS */}
      <div className="md:hidden space-y-3">
          {initialUsers.map((user) => (
              <Card key={user.id} className="shadow-sm">
                  <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border"><AvatarFallback className="bg-slate-100 text-sm font-bold">{getInitials(user.name)}</AvatarFallback></Avatar>
                              <div>
                                  <p className="font-bold text-slate-900">{user.name}</p>
                                  <p className="text-xs text-slate-500">{user.email}</p>
                              </div>
                          </div>
                          <Badge variant="secondary" className="capitalize">{user.role.replace("_", " ")}</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t">
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                              <Calendar className="w-3 h-3"/> Joined {format(new Date(user.createdAt), "dd MMM yyyy hh:mm a")}
                          </div>
                          <ActionButtons user={user} />
                      </div>
                  </CardContent>
              </Card>
          ))}
      </div>

      {/* RESET PASSWORD MODAL (Shared) */}
      <Dialog open={!!resetUserId} onOpenChange={(o) => !o && setResetUserId(null)}>
          <DialogContent className="w-[90%] rounded-lg">
              <DialogHeader><DialogTitle>Reset Password</DialogTitle></DialogHeader>
              <form onSubmit={handlePassReset} className="space-y-4">
                  <Input type="password" value={newResetPass} onChange={(e) => setNewResetPass(e.target.value)} minLength={6} required placeholder="New password" />
                  <Button type="submit" className="w-full bg-slate-900" disabled={isResetting}>{isResetting ? "Updating..." : "Confirm"}</Button>
              </form>
          </DialogContent>
      </Dialog>

    </div>
  );
}