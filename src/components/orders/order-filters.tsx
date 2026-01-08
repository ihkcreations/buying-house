"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";

export function OrderFilters({ buyers }: { buyers: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [buyerId, setBuyerId] = useState(searchParams.get("buyer") || "all");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (!isMounted) return;
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (buyerId && buyerId !== "all") params.set("buyer", buyerId);
      if (status) params.set("status", status); // Always preserve status state
      router.push(`${pathname}?${params.toString()}`);
    }, 500);
    return () => clearTimeout(timer);
  }, [query, buyerId, status, isMounted, router, pathname]);

  const clearFilters = () => {
    setQuery("");
    setBuyerId("all");
    setStatus("all");
    router.push(pathname);
  };

  return (
    <div className="flex flex-col md:flex-row gap-3 mb-6 p-4 bg-white border rounded-lg shadow-sm">
      
      {/* 1. TEXT SEARCH (Full width on mobile) */}
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
        <Input
          placeholder="Search Order No, Style, Season..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 bg-slate-50 border-slate-200"
        />
      </div>

      {/* 2. FILTERS (Grid for mobile, Row for desktop) */}
      <div className="grid grid-cols-2 md:flex md:gap-3 w-full md:w-auto">
          
          {/* Buyer Filter */}
          <div className="w-full md:w-[200px]">
            <Select value={buyerId} onValueChange={setBuyerId}>
              <SelectTrigger className="bg-slate-50 border-slate-200">
                <SelectValue placeholder="Buyer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Buyers</SelectItem>
                {buyers.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-[200px]">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="bg-slate-50 border-slate-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active Orders</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="IN_PRODUCTION">In Production</SelectItem>
                <SelectItem value="COSTING_APPROVED">Costing OK</SelectItem>
              </SelectContent>
            </Select>
          </div>
      </div>

      {/* 3. RESET BUTTON (Full width on mobile if visible) */}
      {(query || buyerId !== "all" || status !== "all") && (
        <Button variant="ghost" onClick={clearFilters} className="text-slate-500 w-full md:w-auto border md:border-none">
          <X className="h-4 w-4 mr-2 md:mr-0" /> <span className="md:hidden">Reset Filters</span>
        </Button>
      )}
    </div>
  );
}