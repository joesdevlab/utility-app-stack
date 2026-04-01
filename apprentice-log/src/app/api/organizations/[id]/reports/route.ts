import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateBCITOPdf } from "@/lib/pdf-export";
import type { LogbookEntry, LogbookTask } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check org access (owner, admin, or supervisor)
    const { data: organization } = await supabase
      .from("organizations")
      .select("id, name, owner_id")
      .eq("id", id)
      .single();

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    let hasAccess = organization.owner_id === user.id;
    if (!hasAccess) {
      const { data: membership } = await supabase
        .from("organization_members")
        .select("role")
        .eq("organization_id", id)
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      hasAccess =
        !!membership?.role &&
        ["owner", "admin", "supervisor"].includes(membership.role);
    }

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Parse and validate query params
    const url = new URL(request.url);
    const format = url.searchParams.get("format") || "csv";
    if (!["csv", "pdf"].includes(format)) {
      return NextResponse.json({ error: "Format must be 'csv' or 'pdf'" }, { status: 400 });
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    if ((startDate && !dateRegex.test(startDate)) || (endDate && !dateRegex.test(endDate))) {
      return NextResponse.json({ error: "Dates must be in YYYY-MM-DD format" }, { status: 400 });
    }
    const apprenticeId = url.searchParams.get("apprenticeId");

    // Build entries query
    let query = supabase
      .from("apprentice_entries")
      .select("*")
      .eq("is_deleted", false)
      .order("date", { ascending: false });

    if (apprenticeId) {
      query = query.eq("user_id", apprenticeId);
    } else {
      // Get all apprentice user IDs in this org
      const { data: members } = await supabase
        .from("organization_members")
        .select("user_id")
        .eq("organization_id", id)
        .eq("status", "active")
        .not("user_id", "is", null);

      const userIds = (members || [])
        .map((m) => m.user_id)
        .filter(Boolean) as string[];

      if (userIds.length === 0) {
        return emptyResponse(format);
      }
      query = query.in("user_id", userIds);
    }

    if (startDate) query = query.gte("date", startDate);
    if (endDate) query = query.lte("date", endDate);

    const { data: rows, error: entriesError } = await query;

    if (entriesError) {
      console.error("Report query error:", entriesError);
      return NextResponse.json(
        { error: "Failed to fetch entries" },
        { status: 500 }
      );
    }

    const entries: LogbookEntry[] = (rows || []).map((row) => ({
      id: row.id,
      date: row.date,
      rawTranscript: row.raw_transcript,
      formattedEntry: row.formatted_entry,
      tasks: (row.tasks as LogbookTask[]) || [],
      hours: row.hours,
      weather: row.weather,
      siteName: row.site_name,
      supervisor: row.supervisor,
      createdAt: row.created_at,
      photos: row.photos || [],
      totalHours: row.total_hours,
      notes: row.notes,
      safetyObservations: row.safety_observations,
    }));

    // Get apprentice name for PDF header
    let apprenticeName = "All Apprentices";
    if (apprenticeId) {
      const { data: userData } =
        await supabase.auth.admin.getUserById(apprenticeId);
      apprenticeName =
        userData?.user?.user_metadata?.full_name ||
        userData?.user?.email ||
        "Apprentice";
    }

    if (format === "pdf") {
      const doc = generateBCITOPdf(entries, {
        apprenticeName,
        organizationName: organization.name,
        dateRange:
          startDate && endDate ? { start: startDate, end: endDate } : undefined,
      });

      const pdfBuffer = doc.output("arraybuffer");

      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="report-${startDate || "all"}-to-${endDate || "now"}.pdf"`,
        },
      });
    }

    // CSV format
    const csvContent = entriesToCSV(entries);
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="report-${startDate || "all"}-to-${endDate || "now"}.csv"`,
      },
    });
  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}

function emptyResponse(format: string) {
  if (format === "pdf") {
    return new NextResponse(new ArrayBuffer(0), {
      headers: { "Content-Type": "application/pdf" },
    });
  }
  return new NextResponse("No data", {
    headers: { "Content-Type": "text/csv" },
  });
}

function entriesToCSV(entries: LogbookEntry[]): string {
  const headers = [
    "Date",
    "Total Hours",
    "Tasks",
    "Tools",
    "Skills",
    "Safety Observations",
    "Site",
    "Supervisor",
    "Notes",
  ];

  const rows = entries.map((entry) => {
    const tasks = (entry.tasks || []).map((t) => t.description).join("; ");
    const tools = [
      ...new Set((entry.tasks || []).flatMap((t) => t.tools || [])),
    ].join("; ");
    const skills = [
      ...new Set((entry.tasks || []).flatMap((t) => t.skills || [])),
    ].join("; ");

    return [
      entry.date,
      String(entry.totalHours || entry.hours || 0),
      csvEscape(tasks),
      csvEscape(tools),
      csvEscape(skills),
      csvEscape(entry.safetyObservations || ""),
      csvEscape(entry.siteName || ""),
      csvEscape(entry.supervisor || ""),
      csvEscape(entry.notes || ""),
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
