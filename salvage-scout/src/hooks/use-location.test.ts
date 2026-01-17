import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useLocation, calculateDistance } from "./use-location";

describe("useLocation", () => {
  const mockGeolocation = {
    getCurrentPosition: vi.fn(),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
  };

  beforeEach(() => {
    Object.defineProperty(navigator, "geolocation", {
      value: mockGeolocation,
      writable: true,
      configurable: true,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should initialize with null location and no error", () => {
    const { result } = renderHook(() => useLocation());

    expect(result.current.location).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("should set location on successful geolocation", async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success({
        coords: {
          latitude: -36.848,
          longitude: 174.763,
        },
      });
    });

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await result.current.getLocation();
    });

    expect(result.current.location).toEqual({
      latitude: -36.848,
      longitude: 174.763,
      suburb: "Auckland CBD",
    });
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("should find nearest suburb for coordinates near Auckland", async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success({
        coords: {
          latitude: -36.853,
          longitude: 174.743,
        },
      });
    });

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await result.current.getLocation();
    });

    expect(result.current.location?.suburb).toBe("Ponsonby");
  });

  it("should return 'New Zealand' for coordinates far from known suburbs", async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success({
        coords: {
          latitude: -45.0,
          longitude: 170.0,
        },
      });
    });

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await result.current.getLocation();
    });

    expect(result.current.location?.suburb).toBe("New Zealand");
  });

  it("should handle permission denied error", async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
      error({
        code: 1, // PERMISSION_DENIED
        message: "Permission denied",
      });
    });

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await result.current.getLocation();
    });

    expect(result.current.location).toBeNull();
    expect(result.current.error).toBe("Location permission denied. Please enable location access.");
  });

  it("should handle position unavailable error", async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
      error({
        code: 2, // POSITION_UNAVAILABLE
        message: "Position unavailable",
      });
    });

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await result.current.getLocation();
    });

    expect(result.current.error).toBe("Location information unavailable.");
  });

  it("should handle timeout error", async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
      error({
        code: 3, // TIMEOUT
        message: "Timeout",
      });
    });

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await result.current.getLocation();
    });

    expect(result.current.error).toBe("Location request timed out.");
  });

  it("should set isLoading to true while getting location", async () => {
    let resolvePosition: (value: unknown) => void;
    const positionPromise = new Promise((resolve) => {
      resolvePosition = resolve;
    });

    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      positionPromise.then(() => {
        success({
          coords: { latitude: -36.848, longitude: 174.763 },
        });
      });
    });

    const { result } = renderHook(() => useLocation());

    act(() => {
      result.current.getLocation();
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolvePosition!(undefined);
      await positionPromise;
    });
  });

  it("should handle missing geolocation API", async () => {
    Object.defineProperty(navigator, "geolocation", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await result.current.getLocation();
    });

    expect(result.current.error).toBe("Geolocation is not supported by your browser");
  });
});

describe("calculateDistance", () => {
  it("should calculate distance between two points", () => {
    // Auckland to Wellington is approximately 657 km
    const distance = calculateDistance(-36.848, 174.763, -41.286, 174.776);
    expect(distance).toBeGreaterThan(450);
    expect(distance).toBeLessThan(500);
  });

  it("should return 0 for same coordinates", () => {
    const distance = calculateDistance(-36.848, 174.763, -36.848, 174.763);
    expect(distance).toBe(0);
  });

  it("should return correct distance for short distances", () => {
    // Auckland CBD to Ponsonby is approximately 1.8 km
    const distance = calculateDistance(-36.848, 174.763, -36.853, 174.743);
    expect(distance).toBeGreaterThan(1);
    expect(distance).toBeLessThan(3);
  });
});
