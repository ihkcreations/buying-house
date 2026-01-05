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
      
      <div className="flex flex-col md:flex-row gap-4">
        {/* 1. SEARCH BAR */}
        <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
            placeholder="Search user, order no, or details..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 bg-white"
            />
        </div>

        {/* 2. DATE RANGE PICKER */}
        <div className="w-full md:w-[300px]">
            <Popover>
            <PopoverTrigger asChild>
                <Button
                id="date"
                variant={"outline"}
                className={cn(
                    "w-full justify-start text-left font-normal bg-white",
                    !date && "text-muted-foreground"
                )}
                >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                    date.to ? (
                    <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                    </>
                    ) : (
                    format(date.from, "LLL dd, y")
                    )
                ) : (
                    <span>Pick a date range</span>
                )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                />
            </PopoverContent>
            </Popover>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* 3. ROLE FILTER */}
        <div className="w-full md:w-[200px]">
            <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="bg-white">
                <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="merchandiser">Merchandiser</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
            </SelectContent>
            </Select>
        </div>

        {/* 4. ACTION FILTER */}
        <div className="w-full md:w-[200px]">
            <Select value={action} onValueChange={setAction}>
            <SelectTrigger className="bg-white">
                <SelectValue placeholder="Action Type" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="ORDER">Orders</SelectItem>
                <SelectItem value="COSTING">Costing</SelectItem>
                <SelectItem value="PI">Proforma Invoice</SelectItem>
                <SelectItem value="SC">Sales Contract</SelectItem>
                <SelectItem value="DOC">Documents</SelectItem>
                <SelectItem value="PRODUCTION">Production</SelectItem>
                <SelectItem value="FABRIC">Fabric</SelectItem>
                <SelectItem value="TNA">T&A Plan</SelectItem>
            </SelectContent>
            </Select>
        </div>

        {/* 5. RESET BUTTON */}
        {(query || role !== "all" || action !== "all" || date?.from) && (
            <Button variant="ghost" onClick={clearFilters} className="text-slate-500">
            <X className="mr-2 h-4 w-4" /> Reset Filters
            </Button>
        )}
      </div>
    </div>
  );
}