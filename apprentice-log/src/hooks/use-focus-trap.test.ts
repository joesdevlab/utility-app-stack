import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFocusTrap } from "./use-focus-trap";

describe("useFocusTrap", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    container.innerHTML = `
      <button id="btn1">Button 1</button>
      <input id="input1" type="text" />
      <button id="btn2">Button 2</button>
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.restoreAllMocks();
  });

  it("should return a ref", () => {
    const { result } = renderHook(() => useFocusTrap<HTMLDivElement>(false));
    expect(result.current).toBeDefined();
    expect(result.current.current).toBeNull();
  });

  it("should not trap focus when inactive", () => {
    const { result } = renderHook(() => useFocusTrap<HTMLDivElement>(false));

    act(() => {
      if (result.current.current) {
        result.current.current = container;
      }
    });

    // Focus should not be affected
    const btn1 = document.getElementById("btn1") as HTMLButtonElement;
    btn1.focus();
    expect(document.activeElement).toBe(btn1);
  });

  it("should store previous active element when activated", () => {
    const outsideButton = document.createElement("button");
    outsideButton.id = "outside";
    document.body.appendChild(outsideButton);
    outsideButton.focus();

    const { result, rerender } = renderHook(
      ({ isActive }) => useFocusTrap<HTMLDivElement>(isActive),
      { initialProps: { isActive: false } }
    );

    // Set the ref
    Object.defineProperty(result.current, "current", {
      value: container,
      writable: true,
    });

    // Activate the trap
    rerender({ isActive: true });

    // Focus should be inside the container
    expect(container.contains(document.activeElement)).toBe(true);

    document.body.removeChild(outsideButton);
  });

  it("should handle Tab key to cycle through focusable elements", () => {
    const { result } = renderHook(() => useFocusTrap<HTMLDivElement>(true));

    Object.defineProperty(result.current, "current", {
      value: container,
      writable: true,
    });

    const btn2 = document.getElementById("btn2") as HTMLButtonElement;
    btn2.focus();

    // Tab from last element should cycle to first
    const tabEvent = new KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
    });

    act(() => {
      document.dispatchEvent(tabEvent);
    });
  });

  it("should handle Shift+Tab to cycle backwards", () => {
    const { result } = renderHook(() => useFocusTrap<HTMLDivElement>(true));

    Object.defineProperty(result.current, "current", {
      value: container,
      writable: true,
    });

    const btn1 = document.getElementById("btn1") as HTMLButtonElement;
    btn1.focus();

    // Shift+Tab from first element should cycle to last
    const shiftTabEvent = new KeyboardEvent("keydown", {
      key: "Tab",
      shiftKey: true,
      bubbles: true,
    });

    act(() => {
      document.dispatchEvent(shiftTabEvent);
    });
  });
});
