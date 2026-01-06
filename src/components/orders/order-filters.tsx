"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X, Filter } from "lucide-react";
import { useState, useEffect } from "react";

export function OrderFilters({ buyers }: { buyers: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [buyerId, setBuyerId] = useState(searchParams.get("buyer") || "all");
  const [status, setStatus] = useState(searchParams.get("status") || "active"); // Default to 'active'

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Debounce Search
  useEffect(() => {
    if (!isMounted) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (buyerId && buyerId !== "all") params.set("buyer", buyerId);
      
      // CRITICAL FIX: Always set status unless it's default 'active' AND no other params exist
      // Actually, better to be explicit:
      if (status) params.set("status", status); 
      
      router.push(`/orders/ongoing?${params.toString()}`);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [query, buyerId, status, isMounted, router]);

  const clearFilters = () => {
    setQuery("");
    setBuyerId("all");
    setStatus("active");
    router.push("/orders/ongoing?status=active");
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-white border rounded-lg shadow-sm">
      
      {/* 1. TEXT SEARCH */}
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
        <Input
          placeholder="Search Order No, Style, or Season..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 bg-slate-50 border-slate-200"
        />
      </div>

      {/* 2. BUYER FILTER */}
      <div className="w-full md:w-[200px]">
        <Select value={buyerId} onValueChange={setBuyerId}>
          <SelectTrigger className="bg-slate-50 border-slate-200">
            <SelectValue placeholder="Select Buyer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Buyers</SelectItem>
            {buyers.map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 3. STATUS FILTER */}
      <div className="w-full md:w-[200px]">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="bg-slate-50 border-slate-200">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active Orders</SelectItem>
            <SelectItem value="completed">Completed / Shipped</SelectItem>
            {/* Detailed Statuses */}
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="IN_PRODUCTION">In Production</SelectItem>
            <SelectItem value="COSTING_APPROVED">Costing Approved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 4. RESET */}
      {(query || buyerId !== "all" || status !== "active") && (
        <Button variant="ghost" onClick={clearFilters} className="text-slate-500">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}