import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { initDemo, demoGlow } from "./demo";

function mockMatchMedia(reducedMotion: boolean): void {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)" ? reducedMotion : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

function buildDemoDOM(): void {
  document.body.textContent = "";

  const tabs = document.createElement("div");
  tabs.id = "demo-tabs";
  const keys = ["terminal", "firefox", "messages", "slack", "notes"];
  for (const key of keys) {
    const btn = document.createElement("button");
    btn.setAttribute("data-demo-key", key);
    btn.textContent = key.charAt(0).toUpperCase() + key.slice(1);
    tabs.appendChild(btn);
  }
  document.body.appendChild(tabs);

  const preview = document.createElement("div");
  preview.id = "app-preview";
  document.body.appendChild(preview);
}

describe("initDemo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockMatchMedia(false);
    buildDemoDOM();
    history.replaceState(null, "", "/");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does nothing when preview element is missing", () => {
    document.body.textContent = "";
    const btn = document.createElement("button");
    btn.setAttribute("data-demo-key", "terminal");
    document.body.appendChild(btn);
    initDemo(); // should not throw
  });

  it("does nothing when no demo buttons exist", () => {
    document.body.textContent = "";
    const preview = document.createElement("div");
    preview.id = "app-preview";
    document.body.appendChild(preview);
    initDemo(); // should not throw
  });

  it("sets the first button as active by default", () => {
    initDemo();
    const btn = document.querySelector("[data-demo-key='terminal']")!;
    expect(btn.classList.contains("is-active")).toBe(true);
    expect(btn.getAttribute("aria-selected")).toBe("true");
  });

  it("marks non-active buttons with aria-selected false", () => {
    initDemo();
    const btn = document.querySelector("[data-demo-key='firefox']")!;
    expect(btn.getAttribute("aria-selected")).toBe("false");
  });

  it("clicking a demo button sets it as active", () => {
    initDemo();
    const firefoxBtn = document.querySelector<HTMLElement>("[data-demo-key='firefox']")!;
    firefoxBtn.click();
    expect(firefoxBtn.classList.contains("is-active")).toBe(true);
    expect(firefoxBtn.getAttribute("aria-selected")).toBe("true");
  });

  it("clicking a demo button deactivates the previous button", () => {
    initDemo();
    const terminalBtn = document.querySelector<HTMLElement>("[data-demo-key='terminal']")!;
    const firefoxBtn = document.querySelector<HTMLElement>("[data-demo-key='firefox']")!;
    firefoxBtn.click();
    expect(terminalBtn.classList.contains("is-active")).toBe(false);
    expect(terminalBtn.getAttribute("aria-selected")).toBe("false");
  });

  it("populates the preview element after scenario selection", () => {
    initDemo();
    vi.advanceTimersByTime(200);
    const preview = document.getElementById("app-preview")!;
    expect(preview.textContent).not.toBe("");
    expect(preview.querySelector(".window-frame")).not.toBeNull();
  });

  it("renders the correct scenario title in the preview", () => {
    initDemo();
    vi.advanceTimersByTime(200);
    const title = document.querySelector(".window-title");
    expect(title).not.toBeNull();
    expect(title!.textContent).toBe("Terminal");
  });

  it("switching scenario renders different content", () => {
    initDemo();
    vi.advanceTimersByTime(200);
    const firefoxBtn = document.querySelector<HTMLElement>("[data-demo-key='firefox']")!;
    firefoxBtn.click();
    vi.advanceTimersByTime(200);
    const title = document.querySelector(".window-title");
    expect(title!.textContent).toBe("Firefox");
  });

  it("adds is-swapping class during transition", () => {
    initDemo();
    const preview = document.getElementById("app-preview")!;
    expect(preview.classList.contains("is-swapping")).toBe(true);
    vi.advanceTimersByTime(200);
    expect(preview.classList.contains("is-swapping")).toBe(false);
  });
});

describe("initDemo reduced motion", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockMatchMedia(true);
    buildDemoDOM();
    history.replaceState(null, "", "/");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows final text immediately with reduced motion", () => {
    initDemo();
    vi.advanceTimersByTime(200);
    const liveText = document.querySelector("[data-role='live-text']");
    expect(liveText).not.toBeNull();
    expect(liveText!.textContent).not.toBe("");
  });

  it("sets phase to success with reduced motion", () => {
    initDemo();
    vi.advanceTimersByTime(200);
    const frame = document.querySelector(".window-frame");
    expect(frame!.getAttribute("data-phase")).toBe("success");
  });
});

describe("demoGlow", () => {
  beforeEach(() => {
    demoGlow.phase = "idle";
    demoGlow.changedAt = 0;
  });

  it("exports an object with phase and changedAt", () => {
    expect(demoGlow).toHaveProperty("phase");
    expect(demoGlow).toHaveProperty("changedAt");
  });

  it("phase defaults to idle after reset", () => {
    expect(demoGlow.phase).toBe("idle");
  });

  it("changedAt defaults to 0 after reset", () => {
    expect(demoGlow.changedAt).toBe(0);
  });

  it("phase is a mutable string accepting DemoPhase values", () => {
    demoGlow.phase = "listening";
    expect(demoGlow.phase).toBe("listening");
  });

  it("changedAt is a mutable number", () => {
    demoGlow.changedAt = 42;
    expect(demoGlow.changedAt).toBe(42);
  });
});
