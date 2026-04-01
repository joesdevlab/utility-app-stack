import { describe, it, expect, vi } from "vitest";
import { generateBCITOPdf } from "./pdf-export";
import type { LogbookEntry } from "@/types";
import autoTable from "jspdf-autotable";

// Mock jsPDF and autoTable
vi.mock("jspdf", () => {
  const mockDoc = {
    internal: {
      pageSize: { getWidth: () => 297, getHeight: () => 210 },
    },
    setFillColor: vi.fn(),
    rect: vi.fn(),
    setTextColor: vi.fn(),
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    text: vi.fn(),
    roundedRect: vi.fn(),
    setDrawColor: vi.fn(),
    setLineWidth: vi.fn(),
    line: vi.fn(),
    addPage: vi.fn(),
    getNumberOfPages: vi.fn(() => 1),
    save: vi.fn(),
    lastAutoTable: { finalY: 100 },
  };
  return {
    default: vi.fn(() => mockDoc),
  };
});

vi.mock("jspdf-autotable", () => ({
  default: vi.fn(),
}));

const mockAutoTable = vi.mocked(autoTable);

function createEntry(overrides: Partial<LogbookEntry> = {}): LogbookEntry {
  return {
    id: "test-id",
    date: "2026-03-15",
    formattedEntry: "Worked on framing today",
    tasks: [
      {
        description: "Framed exterior wall",
        hours: 4,
        tools: ["Nail gun", "Level"],
        skills: ["Framing", "Measurement"],
      },
    ],
    totalHours: 4,
    weather: "Fine",
    siteName: "123 Main St",
    supervisor: "John Smith",
    safetyObservations: "Wore PPE at all times",
    ...overrides,
  };
}

describe("generateBCITOPdf", () => {
  it("creates a PDF document", () => {
    const doc = generateBCITOPdf([createEntry()], { apprenticeName: "Test User" });
    // Returns a doc object with expected methods
    expect(doc).toBeDefined();
    expect(doc.text).toBeDefined();
  });

  it("renders header with apprentice name", () => {
    const doc = generateBCITOPdf([createEntry()], {
      apprenticeName: "Jane Doe",
    });

    expect(doc.text).toHaveBeenCalledWith("Apprentice Log", 14, 12);
    expect(doc.text).toHaveBeenCalledWith("Jane Doe", 50, expect.any(Number));
  });

  it("renders employer name when provided", () => {
    const doc = generateBCITOPdf([createEntry()], {
      apprenticeName: "Jane Doe",
      organizationName: "Acme Construction",
    });

    expect(doc.text).toHaveBeenCalledWith(
      "Acme Construction",
      50,
      expect.any(Number)
    );
  });

  it("renders date range when provided", () => {
    const doc = generateBCITOPdf([createEntry()], {
      apprenticeName: "Jane Doe",
      dateRange: { start: "2026-03-01", end: "2026-03-31" },
    });

    // Should render formatted dates
    expect(doc.text).toHaveBeenCalledWith(
      expect.stringContaining("—"),
      expect.any(Number),
      expect.any(Number)
    );
  });

  it("calculates correct summary stats", () => {
    const entries = [
      createEntry({ totalHours: 8, siteName: "Site A" }),
      createEntry({ totalHours: 6, siteName: "Site B" }),
      createEntry({ totalHours: 4, siteName: "Site A" }),
    ];

    const doc = generateBCITOPdf(entries, { apprenticeName: "Test" });

    // Total entries: 3
    expect(doc.text).toHaveBeenCalledWith(
      "Total Entries: 3",
      expect.any(Number),
      expect.any(Number)
    );
    // Total hours: 18.0
    expect(doc.text).toHaveBeenCalledWith(
      "Total Hours: 18.0",
      expect.any(Number),
      expect.any(Number)
    );
    // Unique sites: 2
    expect(doc.text).toHaveBeenCalledWith(
      "Sites: 2",
      expect.any(Number),
      expect.any(Number)
    );
  });

  it("passes correct columns to autoTable", () => {
    mockAutoTable.mockClear();
    generateBCITOPdf([createEntry()], { apprenticeName: "Test" });

    expect(mockAutoTable).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        head: [
          [
            "Date",
            "Site",
            "Tasks Performed",
            "Hrs",
            "Tools / Equipment",
            "Skills / Competencies",
            "H&S Observations",
            "Weather",
            "Supervisor",
          ],
        ],
        showHead: "everyPage",
      })
    );
  });

  it("includes entry data in table body", () => {
    mockAutoTable.mockClear();
    const entry = createEntry();
    generateBCITOPdf([entry], { apprenticeName: "Test" });

    const call = mockAutoTable.mock.calls[0][1] as { body: string[][] };
    const row = call.body[0];

    // Row should contain: date, site, tasks, hours, tools, skills, safety, weather, supervisor
    expect(row[1]).toBe("123 Main St"); // site
    expect(row[2]).toBe("Framed exterior wall"); // tasks
    expect(row[3]).toBe("4"); // hours
    expect(row[4]).toBe("Nail gun, Level"); // tools
    expect(row[5]).toBe("Framing, Measurement"); // skills
    expect(row[6]).toBe("Wore PPE at all times"); // safety
    expect(row[7]).toBe("Fine"); // weather
    expect(row[8]).toBe("John Smith"); // supervisor
  });

  it("handles entries with missing optional fields", () => {
    const entry = createEntry({
      weather: undefined,
      siteName: undefined,
      supervisor: undefined,
      safetyObservations: undefined,
    });

    // Should not throw
    expect(() =>
      generateBCITOPdf([entry], { apprenticeName: "Test" })
    ).not.toThrow();
  });

  it("handles empty entries array", () => {
    expect(() =>
      generateBCITOPdf([], { apprenticeName: "Test" })
    ).not.toThrow();
  });

  it("renders supervisor sign-off section", () => {
    const doc = generateBCITOPdf([createEntry()], { apprenticeName: "Test" });

    expect(doc.text).toHaveBeenCalledWith(
      "Supervisor Verification",
      14,
      expect.any(Number)
    );
    expect(doc.text).toHaveBeenCalledWith(
      "Supervisor Signature",
      14,
      expect.any(Number)
    );
  });
});
