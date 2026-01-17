import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useReducedMotion } from "./use-reduced-motion";

describe("useReducedMotion", () => {
  let mediaQueryList: {
    matches: boolean;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mediaQueryList = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      matches: mediaQueryList.matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: mediaQueryList.addEventListener,
      removeEventListener: mediaQueryList.removeEventListener,
      dispatchEvent: vi.fn(),
    }));
  });

  it("should return false when user prefers motion", () => {
    mediaQueryList.matches = false;
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it("should return true when user prefers reduced motion", () => {
    mediaQueryList.matches = true;
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it("should update when preference changes", () => {
    mediaQueryList.matches = false;
    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(false);

    // Get the change handler that was registered
    const changeHandler = mediaQueryList.addEventListener.mock.calls[0][1];

    // Simulate preference change
    act(() => {
      changeHandler({ matches: true });
    });

    expect(result.current).toBe(true);
  });

  it("should clean up event listeners on unmount", () => {
    const { unmount } = renderHook(() => useReducedMotion());
    unmount();

    expect(mediaQueryList.removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function)
    );
  });

  it("should query for prefers-reduced-motion media", () => {
    renderHook(() => useReducedMotion());

    expect(window.matchMedia).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)");
  });
});
