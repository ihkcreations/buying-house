"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "./app-sidebar";
import { Header } from "./header";

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // FIX: Added 'pathname === "/"' to this list.
  // Now, the root path acts like a full-screen page (no sidebar), 
  // preventing the flash while the middleware redirects.
  const isAuthPage = pathname === "/login" || pathname === "/signup" || pathname === "/";

  // 1. If it's an Auth Page OR Root, render just the content (No Sidebar)
  if (isAuthPage) {
    return (
        <main className="min-h-screen bg-slate-100 flex flex-col">
            {children}
        </main>
    );
  }

  // 2. If it's an App Page (Dashboard, Orders, etc.), render Sidebar + Header
  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="hidden md:block fixed inset-y-0 z-50 bg-slate-50">
        <AppSidebar />
      </div>

      <div className="flex-1 md:pl-64 flex flex-col bg-slate-50">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}