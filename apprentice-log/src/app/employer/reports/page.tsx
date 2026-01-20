"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/components/auth-provider";
import { useOrgApprentices } from "@/hooks/use-organization";
import { ReportGenerator } from "@/components/employer/report-generator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download, FileSpreadsheet, Users, Clock, Calendar } from "lucide-react";

export default function ReportsPage() {
  const { organization } = useAuth();
  const { apprentices, isLoading } = useOrgApprentices(organization?.id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Compliance Reports</h1>
        <p className="text-muted-foreground">
          Generate and export reports for BCITO audits and compliance tracking
        </p>
      </motion.div>

      {/* Report Generator */}
      {organization && (
        <ReportGenerator
          organizationId={organization.id}
          apprentices={apprentices}
        />
      )}

      {/* Report Types Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-full hover:shadow-lg hover:border-orange-200 transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-base">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
                  <FileSpreadsheet className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-gray-900">CSV Export</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Export detailed data in CSV format for spreadsheet analysis.
                Includes all entry details, hours, tasks, and skills for each apprentice.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full hover:shadow-lg hover:border-orange-200 transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-base">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                  <Download className="h-5 w-5 text-orange-600" />
                </div>
                <span className="text-gray-900">PDF Report</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Generate formatted PDF reports suitable for BCITO submissions.
                Includes summary statistics and formatted entry logs.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3 border-b bg-gradient-to-r from-orange-50/50 to-transparent">
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                <FileText className="h-4 w-4 text-orange-600" />
              </div>
              <span className="text-gray-900">Report Data Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-orange-50/50 to-transparent">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center mx-auto mb-2">
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{apprentices.length}</p>
                <p className="text-sm text-muted-foreground">Active Apprentices</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50/50 to-transparent">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mx-auto mb-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {apprentices.reduce((sum, a) => sum + a.entries_count, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Entries</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50/50 to-transparent">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mx-auto mb-2">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {apprentices.reduce((sum, a) => sum + a.total_hours, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Hours</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-50/50 to-transparent">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mx-auto mb-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {apprentices.filter((a) => a.last_entry_date).length}
                </p>
                <p className="text-sm text-muted-foreground">Active This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
