"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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
  BriefcaseBusiness
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// This defines your navigation structure
const sidebarNav = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    type: "link",
  },
  {
    title: "Activity Log",
    href: "/activity-log",
    icon: ClipboardList,
    type: "link",
  },
  {
    title: "Merchandiser",
    icon: Store,
    type: "accordion",
    items: [
      { title: "Create New Order", href: "/orders/new", icon: PlusCircle, variant: "primary" }, // The Blue Button
      { title: "Ongoing Order", href: "/orders/ongoing", icon: ClipboardList },
      { title: "Manage Documents", href: "/orders/documents", icon: FileText },
      { title: "All Orders", href: "/orders/all", icon: LayoutDashboard },
    ],
  },
  {
    title: "Commercial",
    icon: Briefcase,
    type: "accordion",
    items: [
      { title: "Ongoing Order", href: "/commercial/ongoing", icon: ClipboardList },
      { title: "Manage Documents", href: "/commercial/documents", icon: FileText },
      { title: "All Orders", href: "/commercial/all", icon: LayoutDashboard },
    ],
  },
  {
    title: "User Management", // Renamed from 'Operator'
    icon: Users,
    type: "accordion",
    items: [
      { title: "Create User", href: "/users/create", icon: PlusCircle },
      { title: "Manage Users", href: "/users", icon: Users },
    ],
  },
  {
    title: "Finance",
    icon: DollarSign,
    type: "accordion",
    items: [
      { title: "Expense Entry", href: "/finance/expense", icon: PlusCircle },
      { title: "Approve Expense", href: "/finance/approve", icon: FileText },
      { title: "Business Overview", href: "/finance/overview", icon: LayoutDashboard },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-white text-slate-900">
      {/* Logo Area */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-slate-900">
          <BriefcaseBusiness className="h-6 w-6 text-blue-600" />
          <span>PI Ocean</span>
        </Link>
      </div>

      {/* Scrollable Menu */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {sidebarNav.map((item, index) => {
            if (item.type === "link") {
              const isActive = pathname === item.href;
              return (
                <Link key={index} href={item.href}>
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

            return (
              <Accordion key={index} type="single" collapsible className="w-full">
                <AccordionItem value={item.title} className="border-none">
                  <AccordionTrigger className="py-2 px-4 hover:bg-slate-50 rounded-md hover:no-underline">
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pl-4 pt-1 pb-2">
                    <div className="flex flex-col space-y-1 border-l-2 border-slate-100 pl-2">
                      {item.items?.map((subItem, subIndex) => {
                        // Special styling for "Create New Order" button
                        if (subItem.variant === "primary") {
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
      </ScrollArea>

      {/* Bottom Master Settings */}
      <div className="border-t p-3 space-y-1">
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
        <Link href="/settings">
          <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600">
            <Settings className="h-4 w-4" />
            Account Settings
          </Button>
        </Link>
        <Button variant="ghost" className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}