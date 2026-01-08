"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, X, CalendarIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

export function FilterToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [role, setRole] = useState(searchParams.get("role") || "all");
  const [action, setAction] = useState(searchParams.get("action") || "all");
  
  // Date State
  const [date, setDate] = useState<DateRange | undefined>({
    from: searchParams.get("from") ? new Date(searchParams.get("from")!) : undefined,
    to: searchParams.get("to") ? new Date(searchParams.get("to")!) : undefined,
  });

  // Debounce & Update URL
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (role && role !== "all") params.set("role", role);
      if (action && action !== "all") params.set("action", action);
      
      // Date Params
      if (date?.from) params.set("from", date.from.toISOString());
      if (date?.to) params.set("to", date.to.toISOString());
      
      router.push(`/activity-log?${params.toString()}`);
    }, 500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, role, action, date]);

  const clearFilters = () => {
    setQuery("");
    setRole("all");
    setAction("all");
    setDate(undefined);
    router.push("/activity-log");
  };

  return (
    <div className="flex flex-col gap-4 mb-6 p-4 bg-slate-50 border rounded-lg">
      
      {/* 1. SEARCH BAR (Full Width) */}
      <div className="relative w-full">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
        <Input
          placeholder="Search user, order no, or details..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 bg-white"
        />
      </div>

      {/* 2. FILTERS (Grid Layout for Mobile) */}
      <div className="grid grid-cols-2 md:flex md:flex-row gap-3 w-full">
        
        {/* Date Picker (Full width on mobile grid if wanted, or half) */}
        <div className="col-span-2 md:col-span-1 md:w-[240px]">
            <Popover>
            <PopoverTrigger asChild>
                <Button
                id="date"
                variant={"outline"}
                className={cn("w-full justify-start text-left font-normal bg-white", !date && "text-muted-foreground")}
                >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                    date.to ? <span className="truncate">{format(date.from, "MMM dd")} - {format(date.to, "MMM dd")}</span> : format(date.from, "MMM dd, y")
                ) : (
                    <span>Date Range</span>
                )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={1} />
            </PopoverContent>
            </Popover>
        </div>

        {/* Role Filter */}
        <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="bg-white w-full"><SelectValue placeholder="Role" /></SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="merchandiser">Merchandiser</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
            </SelectContent>
        </Select>

        {/* Action Filter */}
        <Select value={action} onValueChange={setAction}>
            <SelectTrigger className="bg-white w-full"><SelectValue placeholder="Action" /></SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="ORDER">Orders</SelectItem>
                <SelectItem value="COSTING">Costing</SelectItem>
                <SelectItem value="PI">Proforma</SelectItem>
                <SelectItem value="DOC">Documents</SelectItem>
                <SelectItem value="PRODUCTION">Production</SelectItem>
            </SelectContent>
        </Select>

        {/* Reset Button (Only shows if filters active) */}
        {(query || role !== "all" || action !== "all" || date?.from) && (
            <Button variant="ghost" onClick={clearFilters} className="col-span-2 md:col-span-1 text-slate-500 w-full md:w-auto">
                <X className="mr-2 h-4 w-4" /> Reset
            </Button>
        )}
      </div>
    </div>
  );
}