"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Search, Loader2, Menu } from "lucide-react"; // Added Menu
import { useSession } from "@/lib/auth-client";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"; // Added Sheet
import { SidebarContent } from "./sidebar-content"; // Import the content

export function Header() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false); // Control Sheet State

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [isPending, session, router]);

  const getInitials = (name: string) => {
    return name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "--";
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6 sticky top-0 z-40">
      
      {/* LEFT SIDE: MOBILE MENU + SEARCH */}
      <div className="flex items-center gap-4 w-full md:w-auto">
        
        {/* --- MOBILE TRIGGER (Visible only on mobile) --- */}
        <div className="md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="-ml-2">
                        <Menu className="h-6 w-6 text-slate-700" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    {/* Pass onClose so clicking a link closes the drawer */}
                    <SidebarContent onLinkClick={() => setIsSheetOpen(false)} />
                </SheetContent>
            </Sheet>
        </div>
      </div>

      {/* RIGHT SIDE: PROFILE */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <Button variant="ghost" size="icon" className="text-slate-500">
          <Bell className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-3 pl-4 border-l min-w-[50px] justify-end">
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
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
              <Avatar className="h-8 w-8 md:h-9 md:w-9 cursor-pointer border border-slate-200">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-xs md:text-sm">
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