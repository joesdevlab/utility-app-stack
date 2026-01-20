"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileSpreadsheet, FileText, Download, Calendar } from "lucide-react";
import { toast } from "sonner";
import type { ApprenticeWithStats } from "@/types";

interface ReportGeneratorProps {
  organizationId: string;
  apprentices: ApprenticeWithStats[];
}

export function ReportGenerator({ organizationId, apprentices }: ReportGeneratorProps) {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [selectedApprentice, setSelectedApprentice] = useState<string>("all");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: "csv" | "pdf") => {
    setIsExporting(true);
    try {
      // Build the export URL with query params
      const params = new URLSearchParams({
        format,
        startDate,
        endDate,
      });

      if (selectedApprentice !== "all") {
        params.set("apprenticeId", selectedApprentice);
      }

      const response = await fetch(
        `/api/organizations/${organizationId}/reports?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      // Get the blob and download it
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `apprentice-report-${startDate}-to-${endDate}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`${format.toUpperCase()} report downloaded!`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to generate report");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="hover:shadow-lg hover:border-orange-200 transition-all">
        <CardHeader className="border-b bg-gradient-to-r from-orange-50/50 to-transparent">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md shadow-orange-500/20">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-gray-900">Generate Report</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-gray-700 font-medium">Start Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500" />
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-orange-300 focus:ring-orange-500/20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-gray-700 font-medium">End Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500" />
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-orange-300 focus:ring-orange-500/20"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apprentice" className="text-gray-700 font-medium">Apprentice</Label>
            <select
              id="apprentice"
              value={selectedApprentice}
              onChange={(e) => setSelectedApprentice(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-background px-3 py-2.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/20 focus-visible:border-orange-300 transition-all"
            >
              <option value="all">All Apprentices</option>
              {apprentices.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.full_name || a.email}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                onClick={() => handleExport("csv")}
                disabled={isExporting}
                className="border-orange-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => handleExport("pdf")}
                disabled={isExporting}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md shadow-orange-500/20"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </motion.div>
          </div>

          <p className="text-xs text-muted-foreground pt-2">
            Reports include hours logged, tasks completed, and compliance data suitable for BCITO audits.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
