import { SidebarContent } from "./sidebar-content";

export function AppSidebar() {
  return (
    <div className="h-screen w-64 border-r bg-white fixed inset-y-0 z-50">
      <SidebarContent />
    </div>
  );
}