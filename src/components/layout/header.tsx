"use client";

import { useEffect } from "react"; // Import useEffect
import { useRouter } from "next/navigation"; // Import useRouter
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Search, Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";

export function Header() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Client-side Safety Net: 
  // If loading finishes and there is no session, force logout/redirect
  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [isPending, session, router]);

  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "--";
  };

  return (
    <header className="flex h-16 items-center justify-end border-b bg-white px-6">
      

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-slate-500">
          <Bell className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-3 pl-4 border-l min-w-[150px] justify-end">
          {isPending ? (
            <div className="flex items-center gap-3">
               <div className="space-y-1 text-right">
                  <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
                  <div className="h-2 w-12 bg-slate-200 rounded animate-pulse ml-auto" />
               </div>
               <div className="h-9 w-9 rounded-full bg-slate-200 animate-pulse" />
            </div>
          ) : (
            <>
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-slate-900 leading-none">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-slate-500 mt-1 capitalize">
                  {(session?.user as any)?.role}
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