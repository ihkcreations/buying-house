"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "./app-sidebar";
import { Header } from "./header";

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Check if the current page is Login or Signup
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  // 1. If it's an Auth Page, just render the content (Full Screen, No Sidebar)
  if (isAuthPage) {
    return (
        <main className="min-h-screen bg-slate-100 flex flex-col">
            {children}
        </main>
    );
  }

  // 2. If it's an App Page, render the Sidebar + Header layout
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Fixed Sidebar */}
      <div className="hidden md:block fixed inset-y-0 z-50">
        <AppSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}