import Link from "next/link";
import { AlertCircle, FileText, DollarSign, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ActionAlerts({ alerts }: { alerts: any }) {
  if (alerts.total === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Late Shipments */}
        {alerts.lateOrders > 0 && (
            <Link href="/orders/ongoing">
                <Card className="bg-red-50 border-red-100 hover:shadow-md transition-all cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2 bg-red-100 rounded-full text-red-600">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-red-700">{alerts.lateOrders}</p>
                            <p className="text-xs text-red-600 font-medium">Late / Urgent Shipments</p>
                        </div>
                    </CardContent>
                </Card>
            </Link>
        )}

        {/* Pending Expenses */}
        {alerts.pendingExpenses > 0 && (
            <Link href="/finance/approve">
                <Card className="bg-yellow-50 border-yellow-100 hover:shadow-md transition-all cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2 bg-yellow-100 rounded-full text-yellow-700">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-yellow-800">{alerts.pendingExpenses}</p>
                            <p className="text-xs text-yellow-700 font-medium">Expenses to Approve</p>
                        </div>
                    </CardContent>
                </Card>
            </Link>
        )}

        {/* Missing Documents */}
        {alerts.missingDocs > 0 && (
            <Link href="/commercial/documents">
                <Card className="bg-blue-50 border-blue-100 hover:shadow-md transition-all cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-blue-800">{alerts.missingDocs}</p>
                            <p className="text-xs text-blue-700 font-medium">Orders missing Docs</p>
                        </div>
                    </CardContent>
                </Card>
            </Link>
        )}
    </div>
  );
}