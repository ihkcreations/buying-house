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

// --- CONFIG ---
const sidebarNav = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    type: "link",
    roles: ["super_admin", "admin", "merchandiser", "commercial", "finance"]
  },
  {
    title: "Activity Log",
    href: "/activity-log",
    icon: ClipboardList,
    type: "link",
    roles: ["super_admin", "admin", "merchandiser", "commercial", "finance"]
  },
  {
    title: "Merchandiser",
    icon: Store,
    type: "accordion",
    roles: ["super_admin", "admin", "merchandiser"],
    items: [
      { title: "Create New Order", href: "/orders/new", icon: PlusCircle, variant: "primary" },
      { title: "Order List", href: "/orders/ongoing", icon: ClipboardList },
    ],
  },
  {
    title: "Commercial",
    icon: Briefcase,
    type: "accordion",
    roles: ["super_admin", "admin", "commercial"],
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
      { 
          title: "Expense Entry", 
          href: "/finance/expense", 
          icon: PlusCircle 
      },
      { 
          title: "Approve Expense", 
          href: "/finance/approve", 
          icon: FileText,
          roles: ["super_admin", "admin"]
      },
      { 
          title: "Business Overview", 
          href: "/finance/overview", 
          icon: LayoutDashboard,
          roles: ["super_admin", "admin"] 
      },
    ],
  },
  {
    title: "User Management",
    href: "/users",
    icon: Users,
    type: "link",
    roles: ["super_admin", "admin"],
  },
];

// --- REUSABLE COMPONENT ---
export function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const userRole = (session?.user as any)?.role || "guest";

  const handleLogout = async () => {
      await signOut();
      router.push("/login");
  };

  const filteredNav = sidebarNav.filter(item => {
    // SUPER ADMIN sees everything
      if (userRole === "super_admin") return true;

      if (item.roles) return item.roles.includes(userRole);
      return true; // If no roles defined on parent, show it (items logic handles children)
  });

  return (
    <div className="flex h-full flex-col bg-white text-slate-900">
      
      {/* LOGO */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-slate-900" onClick={onLinkClick}>
          <BriefcaseBusiness className="h-6 w-6 text-blue-600" />
          <span>PI Ocean</span>
        </Link>
      </div>

      {/* MENU */}
      <ScrollArea className="flex-1 px-3 py-4">
        {isPending ? (
            <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
        ) : (
            <nav className="space-y-1">
            {filteredNav.map((item, index) => {
                // LINK
                if (item.type === "link") {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={index} href={item.href!} onClick={onLinkClick}>
                        <Button
                            variant={isActive ? "secondary" : "ghost"}
                            className={cn("w-full justify-start gap-3 mb-1", isActive && "bg-slate-100 font-semibold text-blue-700")}
                        >
                            <item.icon className="h-4 w-4" /> {item.title}
                        </Button>
                        </Link>
                    );
                }

                // ACCORDION
                // Check if user has access to any child items before rendering parent
                const hasAccessToChildren = item.items?.some(sub => !sub.roles || sub.roles.includes(userRole));
                if (!hasAccessToChildren) return null;

                const shouldBeOpen = 
                    (userRole === "merchandiser" && item.title === "Merchandiser") ||
                    (userRole === "commercial" && item.title === "Commercial") ||
                    (userRole === "finance" && item.title === "Finance");

                return (
                <Accordion key={index} type="single" collapsible className="w-full" defaultValue={shouldBeOpen ? item.title : undefined}>
                    <AccordionItem value={item.title} className="border-none">
                    <AccordionTrigger className="py-2 px-4 hover:bg-slate-50 rounded-md hover:no-underline">
                        <div className="flex items-center gap-3"><item.icon className="h-4 w-4" /><span>{item.title}</span></div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-4 pt-1 pb-2">
                        <div className="flex flex-col space-y-1 border-l-2 border-slate-100 pl-2">
                        {item.items?.map((subItem, subIndex) => {
                            // Sub-item Role Check
                            if ('roles' in subItem && subItem.roles && !subItem.roles.includes(userRole)) return null;

                            return (
                                <Link key={subIndex} href={subItem.href} onClick={onLinkClick}>
                                    <Button
                                        variant="ghost"
                                        className={cn(
                                            "w-full justify-start gap-2 h-9 font-normal text-slate-600",
                                            pathname === subItem.href && "bg-blue-50 text-blue-700 font-medium",
                                            subItem.variant === "primary" && "bg-blue-600 hover:bg-blue-700 text-white mb-2 shadow-sm font-medium"
                                        )}
                                    >
                                    <subItem.icon className="h-4 w-4" /> {subItem.title}
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

      {/* FOOTER */}
      <div className="border-t p-3 space-y-1">
        {["admin", "super_admin", "merchandiser", "commercial"].includes(userRole) && (
            <>
                <Link href="/admin/buyers" onClick={onLinkClick}>
                    <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600"><Users className="h-4 w-4" /> Manage Buyers</Button>
                </Link>
                <Link href="/admin/factories" onClick={onLinkClick}>
                    <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600"><Factory className="h-4 w-4" /> Manage Factories</Button>
                </Link>
            </>
        )}
        <Link href="/settings" onClick={onLinkClick}>
            <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600"><Settings className="h-4 w-4" /> Account Settings</Button>
        </Link>
        <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"><LogOut className="h-4 w-4" /> Logout</Button>
      </div>
    </div>
  );
}