import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Global mocks (must be set before importing the module) ──

const mockPutImageData = vi.fn();
const mockCreateImageData = vi.fn().mockImplementation((w: number, h: number) => {
  const data = new Uint8ClampedArray(w * h * 4);
  return { data, width: w, height: h };
});

const mockGetContext = vi.fn().mockReturnValue({
  createImageData: mockCreateImageData,
  putImageData: mockPutImageData,
});

// Mock canvas getContext before any import touches it
HTMLCanvasElement.prototype.getContext = mockGetContext as unknown as typeof HTMLCanvasElement.prototype.getContext;

// Track requestAnimationFrame calls
const rafCallbacks: ((time: number) => void)[] = [];
vi.stubGlobal("requestAnimationFrame", vi.fn((cb: (time: number) => void) => {
  rafCallbacks.push(cb);
  return rafCallbacks.length;
}));

// Default: no reduced motion
const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));
Object.defineProperty(window, "matchMedia", { writable: true, value: matchMediaMock });

// Mock demoGlow to avoid importing the full demo module
vi.mock("./demo", () => ({
  demoGlow: { phase: "idle" as const, changedAt: 0 },
}));

beforeEach(() => {
  document.body.innerHTML = ""; // reset DOM between tests
  vi.clearAllMocks();
  rafCallbacks.length = 0;
  mockGetContext.mockReturnValue({
    createImageData: mockCreateImageData,
    putImageData: mockPutImageData,
  });
  matchMediaMock.mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

// ── Tests ─────────────────────────────────────────────

describe("initCloudBackground", () => {
  it("creates a canvas element and prepends it to body", async () => {
    const { initCloudBackground } = await import("./cloud");
    initCloudBackground();
    const canvas = document.querySelector("canvas.cloud-canvas");
    expect(canvas).not.toBeNull();
    expect(document.body.firstElementChild).toBe(canvas);
  });

  it("sets canvas dimensions to 400x240", async () => {
    const { initCloudBackground } = await import("./cloud");
    initCloudBackground();
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    expect(canvas.width).toBe(400);
    expect(canvas.height).toBe(240);
  });

  it("sets aria-hidden on the canvas for accessibility", async () => {
    const { initCloudBackground } = await import("./cloud");
    initCloudBackground();
    const canvas = document.querySelector("canvas.cloud-canvas")!;
    expect(canvas.getAttribute("aria-hidden")).toBe("true");
  });

  it("calls getContext with 2d", async () => {
    const { initCloudBackground } = await import("./cloud");
    initCloudBackground();
    expect(mockGetContext).toHaveBeenCalledWith("2d");
  });

  it("calls createImageData with canvas dimensions", async () => {
    const { initCloudBackground } = await import("./cloud");
    initCloudBackground();
    expect(mockCreateImageData).toHaveBeenCalledWith(400, 240);
  });

  it("performs an initial render via putImageData", async () => {
    const { initCloudBackground } = await import("./cloud");
    initCloudBackground();
    expect(mockPutImageData).toHaveBeenCalled();
  });

  it("schedules requestAnimationFrame when motion is not reduced", async () => {
    const { initCloudBackground } = await import("./cloud");
    initCloudBackground();
    expect(requestAnimationFrame).toHaveBeenCalled();
  });

  it("skips requestAnimationFrame when prefers-reduced-motion matches", async () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    vi.resetModules();
    const { initCloudBackground } = await import("./cloud");
    (requestAnimationFrame as ReturnType<typeof vi.fn>).mockClear();
    initCloudBackground();
    expect(requestAnimationFrame).not.toHaveBeenCalled();
  });

  it("assigns cloud-canvas className to the canvas", async () => {
    const { initCloudBackground } = await import("./cloud");
    initCloudBackground();
    const canvas = document.querySelector("canvas")!;
    expect(canvas.className).toBe("cloud-canvas");
  });
});
