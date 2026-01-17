import { vi } from "vitest";

// Mock Supabase client for API route testing
export function createMockSupabaseClient(overrides: Record<string, unknown> = {}) {
  const mockFrom = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    ...overrides,
  });

  return {
    from: mockFrom,
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    },
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: { path: "test.jpg" }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: "https://test.com/test.jpg" } }),
      }),
    },
  };
}

// Create a mock NextRequest
export function createMockRequest(
  url: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: unknown;
  } = {}
) {
  const { method = "GET", headers = {}, body } = options;

  return {
    url: new URL(url, "http://localhost:3000").toString(),
    method,
    headers: new Headers(headers),
    nextUrl: new URL(url, "http://localhost:3000"),
    json: async () => body,
    text: async () => JSON.stringify(body),
    formData: async () => new FormData(),
  };
}
