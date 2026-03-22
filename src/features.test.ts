import { describe, it, expect, vi, beforeEach } from "vitest";
import { initFeatureCards, initDemoVideo } from "./features";

// Mock matchMedia globally (FeatureCardStack reads it at construction time)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
const observeMock = vi.fn();
const disconnectMock = vi.fn();
vi.stubGlobal("IntersectionObserver", class {
  private cb: IntersectionObserverCallback;
  constructor(cb: IntersectionObserverCallback) {
    this.cb = cb;
    setTimeout(() => {
      this.cb(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver
      );
    }, 0);
  }
  observe = observeMock;
  disconnect = disconnectMock;
  unobserve = vi.fn();
});

function setupDOM(html: string): void {
  document.body.innerHTML = html; // static test fixtures only
}

beforeEach(() => {
  document.body.innerHTML = ""; // reset between tests
  vi.clearAllMocks();
});

// ── initFeatureCards ──────────────────────────────────

describe("initFeatureCards", () => {
  it("returns early when track element is missing", () => {
    setupDOM('<div class="feature-dot" data-goto="0"></div>');
    initFeatureCards();
    expect(observeMock).not.toHaveBeenCalled();
  });

  it("returns early when dots are missing", () => {
    setupDOM("<div data-feature-track></div>");
    initFeatureCards();
    expect(observeMock).not.toHaveBeenCalled();
  });

  it("creates stack directly when section-features is absent", () => {
    setupDOM(
      '<div data-feature-track><div class="feature-card"></div></div>' +
      '<div class="feature-dot" data-goto="0"></div>'
    );
    initFeatureCards();
    expect(observeMock).not.toHaveBeenCalled();
  });

  it("sets up IntersectionObserver when section-features exists", () => {
    setupDOM(
      '<div class="section-features"><div data-feature-track>' +
      '<div class="feature-card"></div></div></div>' +
      '<div class="feature-dot" data-goto="0"></div>'
    );
    initFeatureCards();
    expect(observeMock).toHaveBeenCalled();
  });

  it("initializes dots with is-active on the first dot after intersection", async () => {
    setupDOM(
      '<div class="section-features"><div data-feature-track>' +
      '<div class="feature-card"></div><div class="feature-card"></div>' +
      '</div></div>' +
      '<div class="feature-dot" data-goto="0"></div>' +
      '<div class="feature-dot" data-goto="1"></div>'
    );
    initFeatureCards();
    await vi.waitFor(() => {
      const dots = document.querySelectorAll(".feature-dot");
      expect(dots[0].classList.contains("is-active")).toBe(true);
    });
  });
});

// ── initDemoVideo ─────────────────────────────────────

describe("initDemoVideo", () => {
  it("returns early when video element is missing", () => {
    setupDOM('<button id="demo-play-btn"></button>');
    initDemoVideo();
    expect(document.getElementById("demo-play-btn")).toBeTruthy();
  });

  it("returns early when play button is missing", () => {
    setupDOM('<video id="demo-video"></video>');
    initDemoVideo();
    expect(document.getElementById("demo-video")).toBeTruthy();
  });

  it("hides button and plays video on button click", () => {
    setupDOM('<video id="demo-video"></video><button id="demo-play-btn"></button>');
    const video = document.getElementById("demo-video") as HTMLVideoElement;
    const btn = document.getElementById("demo-play-btn")!;
    video.play = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(video, "paused", { value: true, writable: true });
    initDemoVideo();
    btn.click();
    expect(video.play).toHaveBeenCalled();
    expect(btn.classList.contains("is-hidden")).toBe(true);
  });

  it("shows button and pauses video when playing video is clicked", () => {
    setupDOM('<video id="demo-video"></video><button id="demo-play-btn"></button>');
    const video = document.getElementById("demo-video") as HTMLVideoElement;
    const btn = document.getElementById("demo-play-btn")!;
    video.play = vi.fn().mockResolvedValue(undefined);
    video.pause = vi.fn();
    Object.defineProperty(video, "paused", { value: false, writable: true });
    initDemoVideo();
    video.click();
    expect(video.pause).toHaveBeenCalled();
    expect(btn.classList.contains("is-hidden")).toBe(false);
  });

  it("shows button when video ends", () => {
    setupDOM('<video id="demo-video"></video><button id="demo-play-btn" class="is-hidden"></button>');
    const video = document.getElementById("demo-video") as HTMLVideoElement;
    const btn = document.getElementById("demo-play-btn")!;
    video.play = vi.fn().mockResolvedValue(undefined);
    initDemoVideo();
    video.dispatchEvent(new Event("ended"));
    expect(btn.classList.contains("is-hidden")).toBe(false);
  });
});
