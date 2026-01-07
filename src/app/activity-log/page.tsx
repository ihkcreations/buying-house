import { db } from "@/lib/db";
import { protectPage } from "@/lib/protect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Activity, FileText, DollarSign, Shirt, SearchX } from "lucide-react";
import Link from "next/link";
import { FilterToolbar } from "@/components/activity/filter-toolbar"; // Import new component

export default async function ActivityLogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await protectPage(["admin", "merchandiser", "commercial", "finance"]);

  const sp = await searchParams;
  const query = (sp.q as string) || "";
  const roleFilter = (sp.role as string) || "all";
  const actionFilter = (sp.action as string) || "all";
  
  // Date Params
  const fromDate = sp.from ? new Date(sp.from as string) : null;
  const toDate = sp.to ? new Date(sp.to as string) : null;

  // --- BUILD QUERY ---
  const where: any = {
    AND: []
  };

  // 1. Role
  if (roleFilter !== "all") where.AND.push({ userRole: roleFilter });

  // 2. Action
  if (actionFilter !== "all") where.AND.push({ action: { contains: actionFilter } });

  // 3. Search
  if (query) {
    where.AND.push({
      OR: [
        { userName: { contains: query, mode: "insensitive" } },
        { details: { contains: query, mode: "insensitive" } },
        { order: { orderNo: { contains: query, mode: "insensitive" } } },
      ]
    });
  }

  // 4. DATE RANGE FILTER (New)
  if (fromDate) {
      // Create date filter object
      const dateFilter: any = { gte: fromDate };
      
      // If 'To' date exists, set end of that day
      if (toDate) {
          // Adjust to end of day to include logs from that specific day
          const endOfDay = new Date(toDate);
          endOfDay.setHours(23, 59, 59, 999);
          dateFilter.lte = endOfDay;
      }
      
      where.AND.push({ createdAt: dateFilter });
  }

  // Execute
  const logs = await db.activityLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      order: { select: { orderNo: true, styleNo: true } }
    }
  });

  // Helper for icons
  const getIcon = (action: string) => {
      if (action.includes("COSTING")) return <DollarSign className="w-4 h-4 text-green-600" />;
      if (action.includes("PI") || action.includes("SC") || action.includes("DOC")) return <FileText className="w-4 h-4 text-purple-600" />;
      if (action.includes("PRODUCTION") || action.includes("FABRIC")) return <Shirt className="w-4 h-4 text-blue-600" />;
      return <Activity className="w-4 h-4 text-slate-500" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
        <p className="text-slate-500">Audit trail of system actions.</p>
      </div>

      {/* THE NEW SEARCH TOOLBAR */}
      <FilterToolbar />

      <Card>
        <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
        <CardContent>
            <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-8">
                    {logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <SearchX className="w-12 h-12 mb-4 opacity-50" />
                            <p>No activity found matching your filters.</p>
                        </div>
                    ) : (
                        logs.map((log) => (
                            <div key={log.id} className="flex items-start gap-4 border-b pb-4 last:border-0 hover:bg-slate-50/50 p-2 rounded transition-colors">
                                <Avatar className="h-9 w-9 mt-1 border border-slate-200">
                                    <AvatarFallback className="bg-white text-slate-700 font-bold text-xs">
                                        {log.userName.substring(0,2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-slate-900">
                                            {log.userName} 
                                            <Badge variant="outline" className="ml-2 text-[10px] uppercase bg-slate-100 text-slate-600 border-none">
                                                {log.userRole}
                                            </Badge>
                                        </p>
                                        <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                                            {formatDistanceToNow(log.createdAt, { addSuffix: true })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-full bg-white border shadow-sm">
                                            {getIcon(log.action)}
                                        </div>
                                        <p className="text-sm text-slate-700">
                                            {log.details} 
                                            {/* --- ADD COUNT HERE --- */}
                                            {log.documentCount && log.action.includes("GENERATED") && (
                                                <span className="text-xs text-slate-500 ml-2"> (Count: {log.documentCount})</span>
                                            )}
                                            {/* ---------------------- */}
                                        </p>
                                    </div>
                                    {log.order && (
                                        <Link href={`/orders/${log.orderId}`}>
                                            <Badge variant="secondary" className="mt-2 cursor-pointer hover:bg-blue-100 text-blue-700 bg-blue-50 border-blue-100">
                                                Order #{log.order.orderNo}
                                            </Badge>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}