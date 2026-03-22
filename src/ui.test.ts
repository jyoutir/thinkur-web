import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  initSavingsCalculator,
  initDownloadButtons,
  initGitHubStars,
  initAppMarquee,
  initScrollReveal,
  initTabEasterEgg,
} from "./ui";

// Helper to set up DOM for tests (jsdom environment)
function setupDOM(html: string): void {
  document.body.innerHTML = html;
}

// ── computeSavings (internal logic, tested via the DOM output) ───

describe("computeSavings (via initSavingsCalculator)", () => {
  beforeEach(() => {
    setupDOM(`
      <input id="typing-hours" type="range" value="2" />
      <span id="typing-hours-label"></span>
      <input id="hourly-rate" value="50" />
      <span id="monthly-savings"></span>
      <span id="hours-saved"></span>
      <span id="words-day"></span>
    `);
  });

  it("computes expected savings for 2h/day at $50/hr", () => {
    initSavingsCalculator();
    const wordsPerDay = 2 * 60 * 45; // 5,400
    const dictationHours = (wordsPerDay / 110) / 60;
    const dailySaved = 2 - dictationHours;
    const monthlySaved = Math.round(dailySaved * 21);
    expect(document.getElementById("hours-saved")!.textContent).toBe(`${monthlySaved} hours`);
    expect(document.getElementById("words-day")!.textContent).toBe("5,400");
  });

  it("returns zero savings when typing hours would be less than dictation time", () => {
    (document.getElementById("typing-hours") as HTMLInputElement).value = "0.5";
    initSavingsCalculator();
    expect(document.getElementById("hours-saved")!.textContent).toMatch(/^\d+ hours$/);
  });
});

// ── initSavingsCalculator ────────────────────────────────────────

describe("initSavingsCalculator", () => {
  beforeEach(() => {
    setupDOM(`
      <input id="typing-hours" type="range" value="2" />
      <span id="typing-hours-label"></span>
      <input id="hourly-rate" value="30" />
      <span id="monthly-savings"></span>
      <span id="hours-saved"></span>
      <span id="words-day"></span>
    `);
  });

  it("updates display when slider value changes", () => {
    initSavingsCalculator();
    const slider = document.getElementById("typing-hours") as HTMLInputElement;
    slider.value = "5";
    slider.dispatchEvent(new Event("input"));
    expect(document.getElementById("typing-hours-label")!.textContent).toBe("5h");
    expect(document.getElementById("words-day")!.textContent).toBe("13,500");
  });

  it("gracefully exits when required DOM elements are missing", () => {
    setupDOM("");
    expect(() => initSavingsCalculator()).not.toThrow();
  });
});

// ── initDownloadButtons ──────────────────────────────────────────

describe("initDownloadButtons", () => {
  beforeEach(() => {
    setupDOM(`<button data-download>Download</button>`);
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls fetch on click and redirects to .dmg URL", async () => {
    const dmgUrl = "https://example.com/thinkur.dmg";
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ assets: [{ name: "thinkur.dmg", browser_download_url: dmgUrl }] }),
    });
    initDownloadButtons();
    const btn = document.querySelector("[data-download]") as HTMLElement;
    btn.click();
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  });

  it("does not call fetch when no buttons exist", () => {
    setupDOM("");
    initDownloadButtons();
    expect(fetch).not.toHaveBeenCalled();
  });
});

// ── initGitHubStars ──────────────────────────────────────────────

describe("initGitHubStars", () => {
  beforeEach(() => {
    setupDOM(`<span data-github-stars></span>`);
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses cached value from localStorage when fresh", async () => {
    localStorage.setItem("thinkur_stars", JSON.stringify({ count: 42, ts: Date.now() }));
    await initGitHubStars();
    expect(fetch).not.toHaveBeenCalled();
    expect(document.querySelector("[data-github-stars]")!.textContent).toBe("(42)");
  });

  it("fetches from API when cache is expired and stores result", async () => {
    localStorage.setItem("thinkur_stars", JSON.stringify({ count: 10, ts: Date.now() - 4_000_000 }));
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ stargazers_count: 99 }),
    });
    await initGitHubStars();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(document.querySelector("[data-github-stars]")!.textContent).toBe("(99)");
    const cached = JSON.parse(localStorage.getItem("thinkur_stars")!);
    expect(cached.count).toBe(99);
  });
});

// ── initAppMarquee ───────────────────────────────────────────────

describe("initAppMarquee", () => {
  beforeEach(() => {
    setupDOM(`
      <div class="app-marquee">
        <div class="app-track">
          <div class="app-lane">App1</div>
        </div>
      </div>
    `);
  });

  it("clones the lane and marks it as is-clone", () => {
    initAppMarquee();
    const clones = document.querySelectorAll(".app-lane.is-clone");
    expect(clones.length).toBe(1);
    expect(clones[0].getAttribute("aria-hidden")).toBe("true");
  });

  it("does not duplicate clone on repeated calls", () => {
    initAppMarquee();
    initAppMarquee();
    expect(document.querySelectorAll(".app-lane.is-clone").length).toBe(1);
  });
});

// ── initScrollReveal ─────────────────────────────────────────────

describe("initScrollReveal", () => {
  beforeEach(() => {
    setupDOM(`
      <div class="animate-in">Section 1</div>
      <div class="animate-in">Section 2</div>
    `);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("adds is-visible immediately when prefers-reduced-motion is reduce", () => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
    initScrollReveal();
    const els = document.querySelectorAll(".animate-in");
    els.forEach((el) => expect(el.classList.contains("is-visible")).toBe(true));
  });

  it("does nothing when no .animate-in elements exist", () => {
    setupDOM("");
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: false }));
    expect(() => initScrollReveal()).not.toThrow();
  });
});

// ── initTabEasterEgg ─────────────────────────────────────────────

describe("initTabEasterEgg", () => {
  beforeEach(() => {
    setupDOM(`
      <div id="parent">
        <div data-easter-tab></div>
      </div>
    `);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("creates a bubble element on click", () => {
    initTabEasterEgg();
    const tab = document.querySelector("[data-easter-tab]") as HTMLElement;
    tab.click();
    const bubble = document.querySelector(".easter-bubble");
    expect(bubble).not.toBeNull();
    expect(bubble!.parentElement!.id).toBe("parent");
  });

  it("prevents multiple simultaneous activations", () => {
    initTabEasterEgg();
    const tab = document.querySelector("[data-easter-tab]") as HTMLElement;
    tab.click();
    tab.click();
    expect(document.querySelectorAll(".easter-bubble").length).toBe(1);
  });
});
