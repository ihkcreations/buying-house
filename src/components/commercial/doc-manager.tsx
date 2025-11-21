"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle, Upload, FileText, Clock } from "lucide-react";
import { updateDocStatus } from "@/app/actions/commercial";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const REQUIRED_DOCS = [
    { name: "Purchase Order (P.O)", stage: "Pre-Production" },
    { name: "Master L/C", stage: "Banking" },
    { name: "Utilization Declaration (U.D)", stage: "Government" },
    { name: "Packing List", stage: "Shipment" },
    { name: "Commercial Invoice", stage: "Shipment" },
    { name: "Bill of Lading (B/L)", stage: "Shipment" },
    { name: "Certificate of Origin (CO)", stage: "Shipment" },
];

export function DocManager({ orderId, docs }: { orderId: string, docs: any[] }) {
  
  const handleUpload = async (docName: string) => {
      // Simulate upload delay
      const result = await updateDocStatus(orderId, docName, "COMPLETED");
      if(result.success) toast.success(`${docName} uploaded!`);
  };

  // Helper to check if doc exists in DB
  const getDocStatus = (name: string) => {
      const doc = docs.find(d => d.name === name);
      return doc ? "COMPLETED" : "PENDING";
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle>Document Vault</CardTitle>
            <CardDescription>Track and upload all export documentation.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Document Name</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {REQUIRED_DOCS.map((doc, idx) => {
                        const status = getDocStatus(doc.name);
                        const isDone = status === "COMPLETED";
                        
                        return (
                            <TableRow key={idx}>
                                <TableCell className="font-medium flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-slate-400" />
                                    {doc.name}
                                </TableCell>
                                <TableCell className="text-slate-500 text-xs">{doc.stage}</TableCell>
                                <TableCell className="text-center">
                                    {isDone ? (
                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 pointer-events-none">
                                            Completed
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 pointer-events-none">
                                            Pending
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    {isDone ? (
                                        <Button size="sm" variant="ghost" className="text-green-600 gap-1">
                                            <CheckCircle className="w-4 h-4" /> View
                                        </Button>
                                    ) : (
                                        <Button size="sm" variant="outline" onClick={() => handleUpload(doc.name)}>
                                            <Upload className="w-4 h-4 mr-2" /> Upload
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
  );
}