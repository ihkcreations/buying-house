"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";

export function ExpenseFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [month, setMonth] = useState(searchParams.get("month") || "all");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    if (!isMounted) return;
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (month && month !== "all") params.set("month", month);
      
      // Preserve the tab state if it exists
      // But we are inside a TabContent, so standard nav might reset tab
      // For query params to work inside Tabs, better to control Tab via URL too
      
      router.push(`${pathname}?${params.toString()}`);
    }, 500);
    return () => clearTimeout(timer);
  }, [query, month, isMounted, router, pathname]);

  const clear = () => {
      setQuery("");
      setMonth("all");
      router.push(pathname);
  };

  return (
    <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input 
                placeholder="Search description, category..." 
                className="pl-9 bg-white"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
        </div>
        <div className="w-[120px]">
            <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="bg-white"><SelectValue placeholder="Month" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Year</SelectItem>
                    {Array.from({length: 12}).map((_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                            {new Date(0, i).toLocaleString('default', { month: 'short' })}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        {(query || month !== "all") && (
            <Button variant="ghost" size="icon" onClick={clear}><X className="w-4 h-4"/></Button>
        )}
    </div>
  );
}