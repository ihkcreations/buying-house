"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "@/lib/auth-client";
import {
  LayoutDashboard,
  ClipboardList,
  Store,
  Briefcase,
  Users,
  DollarSign,
  Settings,
  LogOut,
  PlusCircle,
  FileText,
  Factory,
  BriefcaseBusiness,
  Loader2
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// --- NAVIGATION CONFIGURATION ---
const sidebarNav = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    type: "link",
    roles: ["admin", "merchandiser", "commercial", "finance"]
  },
  {
    title: "Activity Log",
    href: "/activity-log",
    icon: ClipboardList,
    type: "link",
    roles: ["admin", "merchandiser", "commercial", "finance"]
  },
  {
    title: "Merchandiser",
    icon: Store,
    type: "accordion",
    roles: ["admin", "merchandiser"],
    items: [
      { title: "Create New Order", href: "/orders/new", icon: PlusCircle, variant: "primary" },
      { title: "Order List", href: "/orders/ongoing", icon: ClipboardList },
    ],
  },
  {
    title: "Commercial",
    icon: Briefcase,
    type: "accordion",
    roles: ["admin", "commercial"],
    items: [
      { title: "Order List", href: "/commercial/ongoing", icon: ClipboardList },
      { title: "Manage Documents", href: "/commercial/documents", icon: FileText },
    ],
  },
  {
    title: "Finance",
    icon: DollarSign,
    type: "accordion",
    items: [
      { title: "Expense Entry", href: "/finance/expense", icon: PlusCircle },
      { title: "Approve Expense", href: "/finance/approve", icon: FileText, roles: ["admin"] },
      { title: "Business Overview", href: "/finance/overview", icon: LayoutDashboard, roles: ["admin"] },
    ],
  },
  {
    title: "User Management",
    href: "/users",
    icon: Users,
    type: "link",
    roles: ["admin"],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const userRole = (session?.user as any)?.role || "guest";

  const handleLogout = async () => {
      await signOut();
      router.push("/login");
  };

  const filteredNav = sidebarNav.filter(item => {
      if (item.roles) {
          return item.roles.includes(userRole);
      }
      return true;
  });

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-white text-slate-900">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-slate-900 cursor-pointer">
          <BriefcaseBusiness className="h-6 w-6 text-blue-600" />
          <span>PI Ocean</span>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        {isPending ? (
            <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
        ) : (
            <nav className="space-y-1">
            {filteredNav.map((item, index) => {
                // RENDER SIMPLE LINK
                if (item.type === "link") {
                const isActive = pathname === item.href;
                return (
                    <Link key={index} href={item.href!}>
                    <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                        "w-full justify-start gap-3 mb-1",
                        isActive && "bg-slate-100 font-semibold text-blue-700"
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        {item.title}
                    </Button>
                    </Link>
                );
                }

                // --- LOGIC TO AUTO-OPEN ACCORDION ---
                // If user is 'merchandiser' and menu title is 'Merchandiser', open it.
                // If user is 'commercial' and menu title is 'Commercial', open it.
                const shouldBeOpen = 
                    (userRole === "merchandiser" && item.title === "Merchandiser") ||
                    (userRole === "commercial" && item.title === "Commercial") ||
                    (userRole === "finance" && item.title === "Finance");

                return (
                <Accordion 
                    key={index} 
                    type="single" 
                    collapsible 
                    className="w-full"
                    defaultValue={shouldBeOpen ? item.title : undefined} // <--- THE FIX
                >
                    <AccordionItem value={item.title} className="border-none cursor-pointer">
                    <AccordionTrigger className="py-2 px-4 hover:bg-slate-50 rounded-md hover:no-underline">
                        <div className="flex items-center gap-3 ">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-4 pt-1 pb-2">
                        <div className="flex flex-col space-y-1 border-l-2 border-slate-100 pl-2">
                        {item.items?.map((subItem, subIndex) => {
                            if ('roles' in subItem &&subItem.roles && !subItem.roles.includes(userRole)) {
                                return null;
                            }
                            if ('variant' in subItem && subItem.variant === "primary") {
                            return (
                                <Link key={subIndex} href={subItem.href}>
                                <Button className="w-full justify-start gap-2 bg-blue-600 hover:bg-blue-700 text-white mb-2 shadow-sm">
                                    <subItem.icon className="h-4 w-4" />
                                    {subItem.title}
                                </Button>
                                </Link>
                            );
                            }
                            return (
                            <Link key={subIndex} href={subItem.href}>
                                <Button
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start gap-2 h-9 font-normal text-slate-600",
                                    pathname === subItem.href && "bg-blue-50 text-blue-700 font-medium"
                                )}
                                >
                                <subItem.icon className="h-4 w-4" />
                                {subItem.title}
                                </Button>
                            </Link>
                            );
                        })}
                        </div>
                    </AccordionContent>
                    </AccordionItem>
                </Accordion>
                );
            })}
            </nav>
        )}
      </ScrollArea>

       <div className="border-t p-3 space-y-1">
        
        {/* 1. MASTER DATA (Visible to Admin, Merch, Commercial) */}
        {/* This was the logic we lost - restoring it now */}
        {["admin", "merchandiser", "commercial"].includes(userRole) && (
            <>
                <Link href="/admin/buyers">
                <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600">
                    <Users className="h-4 w-4" />
                    Manage Buyers
                </Button>
                </Link>
                <Link href="/admin/factories">
                <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600">
                    <Factory className="h-4 w-4" />
                    Manage Factories
                </Button>
                </Link>
            </>
        )}

        {/* 2. SHARED LINKS (Visible to Everyone) */}
        <Link href="/settings">
            <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600">
                <Settings className="h-4 w-4" />
                Account Settings
            </Button>
        </Link>
        
        <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}