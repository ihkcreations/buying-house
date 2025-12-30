import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";

export default function Home() {
  // This page is transient. Middleware redirects away from here immediately.
  // We show a spinner just in case there's a split-second delay.
  
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-100">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
    
  );
}