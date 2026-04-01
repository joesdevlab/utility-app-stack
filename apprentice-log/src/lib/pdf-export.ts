import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { LogbookEntry } from "@/types";

interface PDFExportOptions {
  apprenticeName: string;
  dateRange?: { start: string; end: string };
  siteName?: string;
  organizationName?: string;
}

/**
 * Generate a BCITO-formatted PDF from logbook entries.
 * Uses landscape A4 for better readability with all BCITO-required columns.
 * Works both client-side and server-side (Node).
 */
export function generateBCITOPdf(
  entries: LogbookEntry[],
  options: PDFExportOptions
): jsPDF {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // --- Header ---
  doc.setFillColor(249, 115, 22); // orange-500
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Apprentice Log", 14, 12);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("BCITO Logbook Export", 14, 20);

  // Date on right
  doc.setFontSize(9);
  const exportDate = new Date().toLocaleDateString("en-NZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(`Generated: ${exportDate}`, pageWidth - 14, 12, { align: "right" });

  // --- Info Section ---
  let y = 36;
  doc.setTextColor(55, 65, 81); // gray-700
  doc.setFontSize(10);

  // Left column
  doc.setFont("helvetica", "bold");
  doc.text("Apprentice:", 14, y);
  doc.setFont("helvetica", "normal");
  doc.text(options.apprenticeName, 50, y);

  // Right column
  if (options.dateRange) {
    doc.setFont("helvetica", "bold");
    doc.text("Period:", pageWidth / 2, y);
    doc.setFont("helvetica", "normal");
    doc.text(
      `${formatDate(options.dateRange.start)} — ${formatDate(options.dateRange.end)}`,
      pageWidth / 2 + 28,
      y
    );
  }

  y += 6;

  if (options.organizationName) {
    doc.setFont("helvetica", "bold");
    doc.text("Employer:", 14, y);
    doc.setFont("helvetica", "normal");
    doc.text(options.organizationName, 50, y);
  }

  if (options.siteName) {
    doc.setFont("helvetica", "bold");
    doc.text("Site:", pageWidth / 2, y);
    doc.setFont("helvetica", "normal");
    doc.text(options.siteName, pageWidth / 2 + 28, y);
  }

  // --- Summary Stats ---
  const totalHours = entries.reduce(
    (sum, e) => sum + (e.totalHours || e.hours || 0),
    0
  );
  const totalEntries = entries.length;
  const uniqueSites = [...new Set(entries.map((e) => e.siteName).filter(Boolean))];

  y += 10;
  doc.setFillColor(255, 247, 237); // orange-50
  doc.roundedRect(14, y, pageWidth - 28, 12, 2, 2, "F");
  doc.setFontSize(9);
  doc.setTextColor(154, 52, 18); // orange-800
  doc.setFont("helvetica", "bold");
  doc.text(`Total Entries: ${totalEntries}`, 20, y + 5);
  doc.text(`Total Hours: ${totalHours.toFixed(1)}`, 90, y + 5);
  doc.text(
    `Avg Hours/Day: ${totalEntries > 0 ? (totalHours / totalEntries).toFixed(1) : "0"}`,
    160,
    y + 5
  );
  if (uniqueSites.length > 0) {
    doc.text(`Sites: ${uniqueSites.length}`, 230, y + 5);
  }

  y += 18;

  // --- Entries Table ---
  const tableBody = entries.map((entry) => {
    const tasks = (entry.tasks || [])
      .map((t) => t.description)
      .join("\n");
    const hours = entry.totalHours || entry.hours || 0;
    const tools = [
      ...new Set((entry.tasks || []).flatMap((t) => t.tools || [])),
    ].join(", ");
    const skills = [
      ...new Set((entry.tasks || []).flatMap((t) => t.skills || [])),
    ].join(", ");
    const safety = entry.safetyObservations || "";

    return [
      formatDate(entry.date),
      entry.siteName || "",
      tasks,
      `${hours}`,
      tools,
      skills,
      safety,
      entry.weather || "",
      entry.supervisor || "",
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [["Date", "Site", "Tasks Performed", "Hrs", "Tools / Equipment", "Skills / Competencies", "H&S Observations", "Weather", "Supervisor"]],
    body: tableBody,
    theme: "grid",
    headStyles: {
      fillColor: [249, 115, 22], // orange-500
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: 2,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [55, 65, 81],
      cellPadding: 2,
      lineColor: [209, 213, 219], // gray-300
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 22 },   // Date
      1: { cellWidth: 28 },   // Site
      2: { cellWidth: 55 },   // Tasks
      3: { cellWidth: 12, halign: "center" }, // Hours
      4: { cellWidth: 35 },   // Tools
      5: { cellWidth: 35 },   // Skills
      6: { cellWidth: 40 },   // Safety
      7: { cellWidth: 18 },   // Weather
      8: { cellWidth: 24 },   // Supervisor
    },
    alternateRowStyles: {
      fillColor: [255, 247, 237], // orange-50
    },
    showHead: "everyPage",
    margin: { left: 14, right: 14, bottom: 30 },
    didDrawPage: (data) => {
      // Footer on each page
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(7);
      doc.setTextColor(156, 163, 175); // gray-400
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 8,
        { align: "center" }
      );
      doc.text(
        "Generated by Apprentice Log — apprenticelog.nz",
        pageWidth / 2,
        pageHeight - 4,
        { align: "center" }
      );
    },
  });

  // --- Supervisor Sign-Off Section ---
  // Get the final Y position after the table
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY || y;
  const signOffY = finalY + 12;

  // Check if sign-off section fits on current page, otherwise add new page
  if (signOffY + 30 > pageHeight - 15) {
    doc.addPage();
    drawSignOffSection(doc, 20, pageWidth);
  } else {
    drawSignOffSection(doc, signOffY, pageWidth);
  }

  return doc;
}

function drawSignOffSection(doc: jsPDF, startY: number, pageWidth: number) {
  doc.setTextColor(55, 65, 81);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Supervisor Verification", 14, startY);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    "I confirm the above entries are an accurate record of the apprentice's work activities.",
    14,
    startY + 7
  );

  const lineY = startY + 20;
  doc.setDrawColor(156, 163, 175); // gray-400
  doc.setLineWidth(0.3);

  // Signature line
  doc.line(14, lineY, 90, lineY);
  doc.setFontSize(7);
  doc.text("Supervisor Signature", 14, lineY + 4);

  // Name line
  doc.line(100, lineY, 176, lineY);
  doc.text("Print Name", 100, lineY + 4);

  // Date line
  doc.line(186, lineY, pageWidth - 14, lineY);
  doc.text("Date", 186, lineY + 4);
}

/**
 * Generate and trigger download of a BCITO PDF.
 */
export function downloadBCITOPdf(
  entries: LogbookEntry[],
  options: PDFExportOptions
) {
  const doc = generateBCITOPdf(entries, options);
  const filename = buildFilename(options);
  doc.save(filename);
}

function buildFilename(options: PDFExportOptions): string {
  const parts = ["apprentice-log"];
  if (options.dateRange) {
    parts.push(options.dateRange.start, "to", options.dateRange.end);
  }
  return `${parts.join("-")}.pdf`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-NZ", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}
