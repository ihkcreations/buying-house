import { db } from "@/lib/db";
import { protectPage } from "@/lib/protect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Activity, FileText, DollarSign, Shirt, Truck } from "lucide-react";

export default async function ActivityLogPage() {
  await protectPage(["admin", "merchandiser", "commercial", "finance"]);

  // Fetch logs (Last 100)
  const logs = await db.activityLog.findMany({
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
      if (action.includes("TNA")) return <Activity className="w-4 h-4 text-orange-600" />;
      return <Activity className="w-4 h-4 text-slate-500" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
        <p className="text-slate-500">Track all actions performed in the system.</p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Recent History</CardTitle>
        </CardHeader>
        <CardContent>
            <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-8">
                    {logs.map((log) => (
                        <div key={log.id} className="flex items-start gap-4 border-b pb-4 last:border-0">
                            {/* Avatar */}
                            <Avatar className="h-9 w-9 mt-1">
                                <AvatarFallback className="bg-slate-100 text-slate-700 font-bold text-xs">
                                    {log.userName.substring(0,2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            {/* Content */}
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-slate-900">
                                        {log.userName} 
                                        <span className="text-slate-400 font-normal ml-2 text-xs">
                                            ({log.userRole})
                                        </span>
                                    </p>
                                    <span className="text-xs text-slate-400">
                                        {formatDistanceToNow(log.createdAt, { addSuffix: true })}
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <div className="p-1 rounded-full bg-slate-50 border">
                                        {getIcon(log.action)}
                                    </div>
                                    <p className="text-sm text-slate-600">
                                        {log.details}
                                    </p>
                                </div>

                                {log.order && (
                                    <div className="mt-2">
                                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-100">
                                            Order #{log.order.orderNo}
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {logs.length === 0 && (
                        <div className="text-center text-slate-500 py-10">No activity recorded yet.</div>
                    )}
                </div>
            </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}