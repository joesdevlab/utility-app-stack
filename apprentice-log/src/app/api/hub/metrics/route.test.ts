import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";

// Mock the admin client
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockGte = vi.fn();
const mockIn = vi.fn();
const mockNot = vi.fn();

function createChain(resolvedValue: unknown) {
  const chain: Record<string, unknown> = {};
  const self = () => chain;
  chain.select = vi.fn().mockImplementation(self);
  chain.eq = vi.fn().mockImplementation(self);
  chain.gte = vi.fn().mockImplementation(self);
  chain.in = vi.fn().mockImplementation(self);
  chain.not = vi.fn().mockImplementation(self);
  chain.then = vi.fn().mockImplementation((resolve: (v: unknown) => void) => resolve(resolvedValue));
  // Make the chain itself thenable so await works
  Object.defineProperty(chain, "then", {
    value: (resolve: (v: unknown) => void) => Promise.resolve(resolvedValue).then(resolve),
    enumerable: false,
  });
  return chain;
}

// Track calls to from() to return different results per table/query
let fromCallIndex = 0;
let fromResults: unknown[] = [];

const mockFrom = vi.fn().mockImplementation(() => {
  const result = fromResults[fromCallIndex] || { data: null, count: 0, error: null };
  fromCallIndex++;
  return createChain(result);
});

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: mockFrom,
  }),
}));

function makeRequest(apiKey?: string): NextRequest {
  const headers: Record<string, string> = {};
  if (apiKey) headers["x-api-key"] = apiKey;
  return new NextRequest("http://localhost:3000/api/hub/metrics", { headers });
}

describe("GET /api/hub/metrics", () => {
  const VALID_KEY = "test-hub-api-key";

  beforeEach(() => {
    vi.stubEnv("HUB_API_KEY", VALID_KEY);
    fromCallIndex = 0;
    fromResults = [];
    mockFrom.mockClear();
  });

  // --- Auth tests ---

  it("returns 401 when no API key is provided", async () => {
    const response = await GET(makeRequest());
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 401 when API key is wrong", async () => {
    const response = await GET(makeRequest("wrong-key"));
    expect(response.status).toBe(401);
  });

  it("returns 401 when HUB_API_KEY env var is not set", async () => {
    vi.stubEnv("HUB_API_KEY", "");
    const response = await GET(makeRequest(VALID_KEY));
    expect(response.status).toBe(401);
  });

  // --- Success tests ---

  it("returns 200 with correct structure when authenticated", async () => {
    // Set up mock results for the 6 parallel queries:
    // 1. active apprentices count
    // 2. active employers count
    // 3. entries last 7d count
    // 4. active subscriptions count
    // 5. cancelled last 30d count
    // 6. hours data
    fromResults = [
      { data: null, count: 42, error: null },
      { data: null, count: 10, error: null },
      { data: null, count: 350, error: null },
      { data: null, count: 8, error: null },
      { data: null, count: 2, error: null },
      {
        data: [
          { user_id: "u1", hours: 20 },
          { user_id: "u1", hours: 18 },
          { user_id: "u2", hours: 40 },
        ],
        count: null,
        error: null,
      },
    ];

    const response = await GET(makeRequest(VALID_KEY));
    expect(response.status).toBe(200);

    const data = await response.json();

    // Verify top-level keys
    expect(data).toHaveProperty("health");
    expect(data).toHaveProperty("subscriptions");
    expect(data).toHaveProperty("revenue");

    // Verify health fields
    expect(data.health.active_apprentices).toBe(42);
    expect(data.health.active_employers).toBe(10);
    expect(data.health.logbook_entries_7d).toBe(350);
    expect(data.health.completion_rate).toBe(0);

    // Avg hours: u1 = 38, u2 = 40 → avg = 39
    expect(data.health.avg_hours_per_week).toBe(39);

    // Subscriptions
    expect(data.subscriptions.total).toBe(8);

    // Revenue: 8 × 2900 = 23200
    expect(data.revenue.mrr_cents).toBe(23200);
    expect(data.revenue.cancelled_30d).toBe(2);
  });

  it("returns zeros when database is empty", async () => {
    fromResults = [
      { data: null, count: 0, error: null },
      { data: null, count: 0, error: null },
      { data: null, count: 0, error: null },
      { data: null, count: 0, error: null },
      { data: null, count: 0, error: null },
      { data: [], count: null, error: null },
    ];

    const response = await GET(makeRequest(VALID_KEY));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.health.active_apprentices).toBe(0);
    expect(data.health.active_employers).toBe(0);
    expect(data.health.logbook_entries_7d).toBe(0);
    expect(data.health.avg_hours_per_week).toBe(0);
    expect(data.subscriptions.total).toBe(0);
    expect(data.revenue.mrr_cents).toBe(0);
    expect(data.revenue.cancelled_30d).toBe(0);
  });

  it("queries the correct tables", async () => {
    fromResults = [
      { data: null, count: 0, error: null },
      { data: null, count: 0, error: null },
      { data: null, count: 0, error: null },
      { data: null, count: 0, error: null },
      { data: null, count: 0, error: null },
      { data: [], count: null, error: null },
    ];

    await GET(makeRequest(VALID_KEY));

    const tableNames = mockFrom.mock.calls.map((c: string[]) => c[0]);
    expect(tableNames).toContain("apprentice_entries");
    expect(tableNames).toContain("organizations");
    // apprentice_entries queried 3 times (active users, 7d entries, hours)
    expect(tableNames.filter((t: string) => t === "apprentice_entries")).toHaveLength(3);
    // organizations queried 3 times (active employers, subscriptions, cancelled)
    expect(tableNames.filter((t: string) => t === "organizations")).toHaveLength(3);
  });

  // --- Error handling ---

  it("returns 500 when database throws", async () => {
    mockFrom.mockImplementationOnce(() => {
      throw new Error("DB connection failed");
    });

    const response = await GET(makeRequest(VALID_KEY));
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe("Failed to fetch metrics");
  });
});
