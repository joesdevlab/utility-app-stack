"use client";

import { useAuth } from "@/components/auth-provider";
import { useOrgApprentices } from "@/hooks/use-organization";
import { ReportGenerator } from "@/components/employer/report-generator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download, FileSpreadsheet } from "lucide-react";

export default function ReportsPage() {
  const { organization } = useAuth();
  const { apprentices, isLoading } = useOrgApprentices(organization?.id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Compliance Reports</h1>
        <p className="text-muted-foreground">
          Generate and export reports for BCITO audits and compliance tracking
        </p>
      </div>

      {/* Report Generator */}
      {organization && (
        <ReportGenerator
          organizationId={organization.id}
          apprentices={apprentices}
        />
      )}

      {/* Report Types Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileSpreadsheet className="h-5 w-5" />
              CSV Export
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Export detailed data in CSV format for spreadsheet analysis.
              Includes all entry details, hours, tasks, and skills for each apprentice.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Download className="h-5 w-5" />
              PDF Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Generate formatted PDF reports suitable for BCITO submissions.
              Includes summary statistics and formatted entry logs.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report Data Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-2xl font-bold">{apprentices.length}</p>
              <p className="text-sm text-muted-foreground">Active Apprentices</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {apprentices.reduce((sum, a) => sum + a.entries_count, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Entries</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {apprentices.reduce((sum, a) => sum + a.total_hours, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Hours</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {apprentices.filter((a) => a.last_entry_date).length}
              </p>
              <p className="text-sm text-muted-foreground">Active This Month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
