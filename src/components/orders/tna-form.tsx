"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CalendarIcon, Save, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { saveTNA } from "@/app/actions/tna";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Define the Milestones we want to track
const milestones = [
  { key: "labDip", label: "Lab Dip Approval" },
  { key: "fabric", label: "Fabric In-House" }, // The most critical one
  { key: "cutting", label: "Cutting Start" },
  { key: "sewing", label: "Sewing Start" },
  { key: "shipment", label: "Final Shipment" },
];

export function TNAForm({ orderId, initialData }: { orderId: string; initialData?: any }) {
  const [isLoading, setIsLoading] = useState(false);

  // Helper to format date for HTML Input (YYYY-MM-DD)
  const formatDate = (dateStr?: Date) => {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().split("T")[0];
  };

  // Helper to determine status
  const getStatus = (plan?: Date, actual?: Date) => {
    if (!plan) return <Badge variant="outline">Not Set</Badge>;
    if (!actual) return <Badge variant="secondary" className="bg-slate-100"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    
    const planDate = new Date(plan).getTime();
    const actualDate = new Date(actual).getTime();

    if (actualDate <= planDate) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" /> On Time</Badge>;
    } else {
      const daysLate = Math.ceil((actualDate - planDate) / (1000 * 60 * 60 * 24));
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><AlertCircle className="w-3 h-3 mr-1" /> {daysLate} Days Late</Badge>;
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    const result = await saveTNA(orderId, formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
    }
    setIsLoading(false);
  };

  return (
    <form action={handleSubmit}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Time & Action Calendar</CardTitle>
              <CardDescription>Track planned deadlines vs. actual execution dates.</CardDescription>
            </div>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? "Saving..." : "Update Plan"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-[30%]">Milestone</TableHead>
                  <TableHead className="w-[25%]">Plan Date</TableHead>
                  <TableHead className="w-[25%]">Actual Date</TableHead>
                  <TableHead className="w-[20%] text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {milestones.map((m) => {
                  const planKey = `${m.key}Plan`;
                  const actualKey = `${m.key}Actual`;
                  const planVal = initialData?.[planKey];
                  const actualVal = initialData?.[actualKey];

                  return (
                    <TableRow key={m.key}>
                      <TableCell className="font-medium text-slate-700">
                        {m.label}
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="date" 
                          name={planKey} 
                          defaultValue={formatDate(planVal)} 
                          className="w-full md:w-40"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="date" 
                          name={actualKey}
                          defaultValue={formatDate(actualVal)} 
                          className="w-full md:w-40 bg-slate-50 focus:bg-white transition-colors"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        {getStatus(planVal, actualVal)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}