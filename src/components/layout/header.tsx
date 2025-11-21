"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Search, Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth-client"; // Import Better Auth hook

export function Header() {
  // 1. Get the session data
  const { data: session, isPending } = useSession();

  // Helper to generate initials (e.g. "John Doe" -> "JD")
  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      {/* Left: Global Search */}
      <div className="flex items-center gap-2 rounded-md border bg-slate-50 px-3 py-2 w-96">
        <Search className="h-4 w-4 text-slate-500" />
        <input 
          type="text" 
          placeholder="Search by Order #, Style, or Buyer..." 
          className="bg-transparent text-sm outline-none w-full placeholder:text-slate-400"
        />
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-slate-500">
          <Bell className="h-5 w-5" />
        </Button>
        
        {/* User Profile Section */}
        <div className="flex items-center gap-3 pl-4 border-l min-w-[150px] justify-end">
          {isPending ? (
            // Show spinner while loading session
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
          ) : (
            <>
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-slate-900 leading-none">
                  {session?.user?.name || "Guest User"}
                </p>
                <p className="text-xs text-slate-500 mt-1 capitalize">
                  {/* We cast to any because 'role' is a custom field we added */}
                  {(session?.user as any)?.role || "Visitor"}
                </p>
              </div>
              <Avatar className="h-9 w-9 cursor-pointer border border-slate-200">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                  {getInitials(session?.user?.name || "")}
                </AvatarFallback>
              </Avatar>
            </>
          )}
        </div>
      </div>
    </header>
  );
}