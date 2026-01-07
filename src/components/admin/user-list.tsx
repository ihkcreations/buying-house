"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { Plus, Trash2, AlertTriangle, KeyRound, Loader2 } from "lucide-react";
import { deleteUser, adminResetPassword } from "@/app/actions/users"; // Ensure reset action imported
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function UserList({ initialUsers }: { initialUsers: any[] }) {
  const router = useRouter();
  const { data: session } = useSession();
  const currentUserRole = (session?.user as any)?.role;

  // --- STATE ---
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Create User State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("merchandiser");

  // Reset Password State
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [newResetPass, setNewResetPass] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  // --- HANDLER: CREATE USER ---
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

      if (!response.ok) {
          throw new Error(data.error || "Failed to create user");
      }

      toast.success("User created successfully!");
      setOpen(false);
      setName(""); setEmail(""); setPassword(""); setRole("merchandiser");
      router.refresh(); 

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- HANDLER: DELETE USER ---
  const handleDelete = async (userId: string) => {
    const result = await deleteUser(userId);
    if (result.success) {
        toast.success(result.success);
        router.refresh();
    }
    else {
        toast.error(result.error);
    }
  };

  // --- HANDLER: RESET PASSWORD ---
  const handlePassReset = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!resetUserId) return;
      
      setIsResetting(true);
      const res = await adminResetPassword(resetUserId, newResetPass);
      if(res.success) {
          toast.success(res.success);
          setResetUserId(null);
          setNewResetPass("");
      } else {
          toast.error(res.error);
      }
      setIsResetting(false);
  };

  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  return (
    <div className="space-y-4">
      
      {/* ACTION BAR */}
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" /> Create New User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Team Member</DialogTitle></DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
              <div className="space-y-2"><Label>Full Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Jane Doe" /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="jane@company.com" /></div>
              <div className="space-y-2"><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} /></div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={setRole}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="merchandiser">Merchandiser</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create User"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* USERS TABLE */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialUsers.map((user) => {
                const isCurrentUser = session?.user?.id === user.id;
                
                // HIERARCHY LOGIC:
                // 1. Cannot delete self
                // 2. Super Admin can delete anyone (except self)
                // 3. Admin cannot delete 'admin' or 'super_admin'
                const canDelete = 
                    !isCurrentUser && 
                    (currentUserRole === "super_admin" || 
                    (currentUserRole === "admin" && user.role !== "admin" && user.role !== "super_admin"));

                const canReset = currentUserRole === "super_admin";

                return (
                  <TableRow key={user.id} className={isCurrentUser ? "bg-blue-50/50" : ""}>
                    <TableCell className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-xs">
                            {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name} {isCurrentUser && "(You)"}</span>
                        <span className="text-xs text-slate-500">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize bg-slate-100 text-slate-700">{user.role.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                          
                          {/* RESET PASSWORD (Super Admin Only) */}
                          {canReset && (
                              <Button 
                                variant="ghost" size="icon" 
                                className="text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                onClick={() => setResetUserId(user.id)}
                                title="Reset Password"
                              >
                                  <KeyRound className="w-4 h-4" />
                              </Button>
                          )}

                          {/* DELETE BUTTON */}
                          {canDelete ? (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600 hover:bg-red-50">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="flex items-center gap-2 text-red-600"><AlertTriangle className="h-5 w-5"/> Delete User?</AlertDialogTitle>
                                  <AlertDialogDescription>Are you sure you want to delete <strong>{user.name}</strong>? This cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(user.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : (
                              // Placeholder for alignment if button hidden
                              !canReset && <span className="w-8"></span> 
                          )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* RESET PASSWORD MODAL */}
      <Dialog open={!!resetUserId} onOpenChange={(o) => !o && setResetUserId(null)}>
          <DialogContent>
              <DialogHeader><DialogTitle>Reset User Password</DialogTitle></DialogHeader>
              <form onSubmit={handlePassReset} className="space-y-4 mt-2">
                  <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input 
                        type="text" 
                        value={newResetPass} 
                        onChange={(e) => setNewResetPass(e.target.value)} 
                        minLength={6} 
                        required 
                        placeholder="Type new password..."
                      />
                      <p className="text-xs text-slate-500">User will use this to login immediately.</p>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                      <Button type="submit" className="bg-slate-900 w-full" disabled={isResetting}>
                          {isResetting ? <Loader2 className="w-4 h-4 animate-spin"/> : "Confirm Reset"}
                      </Button>
                  </div>
              </form>
          </DialogContent>
      </Dialog>
    </div>
  );
}