// ── Types ─────────────────────────────────────────────

export type DemoPhase = "idle" | "listening" | "processing" | "success";

function assertNever(x: never): never {
  throw new Error("Unexpected value: " + x);
}

interface DemoScenario {
  title: string;
  icon: string;
  latency: string;
  clean: string;
  renderBody: () => string;
}

type DemoScenarioKey = "terminal" | "firefox" | "messages" | "slack" | "notes";

// Mutable glow state — read by cloud.ts
export const demoGlow = { phase: "idle" as DemoPhase, changedAt: 0 };

// ── Scenarios ─────────────────────────────────────────
// NOTE: renderBody() returns static developer-authored HTML templates.
// These are NOT user-supplied — they are compile-time constants for the demo UI.

const DEMO_SCENARIOS: Record<DemoScenarioKey, DemoScenario> = {
  terminal: {
    title: "Terminal",
    icon: "./assets/icons/terminal.png",
    latency: "2.1ms",

    clean: "Can you check the deploy status, then restart the worker?",
    renderBody: () => `
      <div class="preview-terminal">
        <p class="terminal-command"><span class="prompt">ops@macbook % </span>claude --dangerously-skip-permissions</p>
        <p class="terminal-live" data-role="live-line"><span class="prompt">ops@macbook % </span><span data-role="live-text"></span><span class="type-caret" data-role="caret"></span></p>
      </div>
    `
  },
  firefox: {
    title: "Firefox",
    icon: "./assets/icons/firefox.png",
    latency: "2.4ms",

    clean: "Dear Sarah, thanks for the update. We can ship Tuesday afternoon.",
    renderBody: () => `
      <div class="preview-firefox">
        <div class="browser-toolbar">
          <div class="browser-nav" aria-hidden="true">
            <span class="browser-nav-btn">\u2039</span>
            <span class="browser-nav-btn">\u203a</span>
            <span class="browser-nav-btn">\u21bb</span>
          </div>
          <div class="browser-url-wrap">
            <span class="browser-lock" aria-hidden="true"></span>
            <p class="browser-url">mail.google.com/mail/u/0/#inbox?compose=new</p>
          </div>
        </div>
        <div class="browser-card">
          <p class="mail-row"><span>To</span><span>sarah@company.com</span></p>
          <p class="mail-row"><span>Subject</span><span>Project update</span></p>
          <p class="mail-live" data-role="live-line"><span data-role="live-text"></span><span class="type-caret" data-role="caret"></span></p>
        </div>
      </div>
    `
  },
  messages: {
    title: "Messages",
    icon: "./assets/icons/messages.png",
    latency: "1.9ms",

    clean: "Thursday works for me. Does 2:00 PM work for everyone?",
    renderBody: () => `
      <div class="preview-messages">
        <div class="messages-head">
          <span class="messages-avatar" aria-hidden="true"></span>
          <div class="messages-meta">
            <p class="messages-name">Sarah</p>
            <p class="messages-time">10:42 AM</p>
          </div>
        </div>
        <div class="chat-thread">
          <p class="bubble bubble-in">Can we move the sync to later this week?</p>
          <p class="bubble bubble-out" data-role="live-line"><span data-role="live-text"></span><span class="type-caret" data-role="caret"></span></p>
        </div>
        <p class="chat-input">iMessage</p>
      </div>
    `
  },
  slack: {
    title: "Slack",
    icon: "./assets/icons/slack.png",
    latency: "2.2ms",

    clean: "1. Check logs\n2. Restart API\n3. Post status in #backend",
    renderBody: () => `
      <div class="preview-slack">
        <div class="slack-sidebar">
          <span class="slack-workspace">thinkur</span>
          <span># build</span>
          <span># backend</span>
          <span># design</span>
          <span># product</span>
        </div>
        <div class="slack-main">
          <p class="slack-channel"># backend</p>
          <p class="slack-message"><span class="slack-avatar" aria-hidden="true">A</span><span class="slack-meta">Alice \u00b7 10:38 AM</span></p>
          <p class="slack-copy">Can someone check the deployment status?</p>
          <p class="slack-live" data-role="live-line"><span data-role="live-text"></span><span class="type-caret" data-role="caret"></span></p>
        </div>
      </div>
    `
  },
  notes: {
    title: "Notes",
    icon: "./assets/icons/notes.png",
    latency: "2.0ms",

    clean: "Meeting moved to 2:30 PM on March 3. Send a recap to everyone.",
    renderBody: () => `
      <div class="preview-notes">
        <div class="notes-list">
          <span class="notes-list-label">Folders</span>
          <span>Launch</span>
          <span>Q2 goals</span>
          <span>Standup</span>
        </div>
        <div class="notes-editor">
          <div class="notes-toolbar">
            <span>Notes</span>
            <span>Updated now</span>
          </div>
          <p class="notes-title">Meeting Notes</p>
          <p class="notes-meta">February 22, 2026</p>
          <p class="notes-live" data-role="live-line"><span data-role="live-text"></span><span class="type-caret" data-role="caret"></span></p>
        </div>
      </div>
    `
  }
};

// ── Rendering ─────────────────────────────────────────

// All values are developer-authored constants from DEMO_SCENARIOS, not user input.
function renderWindowShell(scenario: DemoScenario): string {
  return `<article class="window-frame" data-phase="idle" aria-label="${scenario.title} preview">
    <div class="window-bar">
      <div class="window-left">
        <div class="window-controls" aria-hidden="true">
          <span class="window-dot"></span><span class="window-dot"></span><span class="window-dot"></span>
        </div>
        <div class="window-app">
          <img src="${scenario.icon}" alt="" width="16" height="16">
          <p class="window-title">${scenario.title}</p>
        </div>
      </div>
      <div class="window-status">
        <span class="pixel-spinner" data-spinner data-cols="4" data-rows="2" aria-hidden="true"></span>
        <span class="window-phase" data-role="phase-label">Ready</span>
      </div>
    </div>
    <div class="preview-body">${scenario.renderBody()}</div>
  </article>`;
}

// ── Easing ────────────────────────────────────────────

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeInCubic(t: number): number {
  return t * t * t;
}

// ── Pixel spinner ─────────────────────────────────────

class PixelSpinner {
  private element: HTMLElement;
  private cols: number;
  private rows: number;
  private state: DemoPhase = "idle";
  private running = false;
  private epoch = performance.now();
  private rafId: number | null = null;
  private frameTimer: ReturnType<typeof setTimeout> | null = null;
  private blinkTimer: ReturnType<typeof setTimeout> | null = null;
  private blinkPixel = -1;
  private blinkStartedAt = 0;
  private perimeterOrder: number[] = [];
  private perimeterIndexMap: number[] = [];
  private interiorMask: boolean[] = [];
  private cells: HTMLElement[] = [];

  constructor(element: HTMLElement) {
    this.element = element;
    this.cols = Math.max(1, Number(element.dataset.cols) || 4);
    this.rows = Math.max(1, Number(element.dataset.rows) || 2);
    this.buildGrid();
    this.rebuildCache();
    this.tick = this.tick.bind(this);
  }

  private buildGrid(): void {
    this.element.textContent = "";
    this.element.style.setProperty("--cols", String(this.cols));
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const cell = document.createElement("span");
        cell.className = "pixel-cell";
        this.element.append(cell);
        this.cells.push(cell);
      }
    }
  }

  private rebuildCache(): void {
    const size = this.rows * this.cols;
    this.perimeterOrder = [];
    for (let col = 0; col < this.cols; col++) this.perimeterOrder.push(col);
    for (let row = 1; row < this.rows; row++) this.perimeterOrder.push(row * this.cols + (this.cols - 1));
    for (let col = this.cols - 2; col >= 0; col--) this.perimeterOrder.push((this.rows - 1) * this.cols + col);
    for (let row = this.rows - 2; row >= 1; row--) this.perimeterOrder.push(row * this.cols);

    this.perimeterIndexMap = Array(size).fill(-1);
    this.perimeterOrder.forEach((idx, pos) => { if (idx < size) this.perimeterIndexMap[idx] = pos; });

    this.interiorMask = Array(size).fill(false);
    if (this.rows >= 3 && this.cols >= 3) {
      for (let row = 1; row < this.rows - 1; row++)
        for (let col = 1; col < this.cols - 1; col++)
          this.interiorMask[row * this.cols + col] = true;
    }
  }

  private cycleDuration(): number {
    switch (this.state) {
      case "listening": return 1.4;
      case "processing": return 0.7;
      case "success": return 1.8;
      case "idle": return 4.0;
      default: { const _: never = this.state; return assertNever(_); }
    }
  }

  private updateIntervalFps(): number {
    switch (this.state) {
      case "listening": return 30;
      case "processing": return 20;
      case "idle": case "success": return 30;
      default: { const _: never = this.state; return assertNever(_); }
    }
  }

  setState(nextState: DemoPhase): void {
    if (this.state === nextState) return;
    this.state = nextState;
    this.epoch = performance.now();
    if (this.state === "idle") this.scheduleBlink();
    else this.clearBlink();
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.epoch = performance.now();
    if (this.state === "idle") this.scheduleBlink();
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
    if (this.rafId) { cancelAnimationFrame(this.rafId); this.rafId = null; }
    if (this.frameTimer) { clearTimeout(this.frameTimer); this.frameTimer = null; }
    this.clearBlink();
  }

  private clearBlink(): void {
    if (this.blinkTimer) { clearTimeout(this.blinkTimer); this.blinkTimer = null; }
    this.blinkPixel = -1;
    this.blinkStartedAt = 0;
  }

  private scheduleBlink(): void {
    if (this.blinkTimer || this.state !== "idle") return;
    this.blinkTimer = setTimeout(() => {
      this.blinkTimer = null;
      this.blinkPixel = Math.floor(Math.random() * this.cells.length);
      this.blinkStartedAt = performance.now();
      setTimeout(() => {
        if (this.state === "idle") {
          this.blinkPixel = -1;
          this.blinkStartedAt = 0;
          this.scheduleBlink();
        }
      }, 900);
    }, 800 + Math.random() * 1200);
  }

  private blinkContribution(index: number, now: number): number {
    if (index !== this.blinkPixel || !this.blinkStartedAt) return 0;
    const elapsed = (now - this.blinkStartedAt) / 1000;
    if (elapsed <= 0) return 0;
    if (elapsed < 0.2) return easeOutCubic(elapsed / 0.2) * 0.7;
    if (elapsed < 0.8) return (1 - easeInCubic((elapsed - 0.2) / 0.6)) * 0.7;
    return 0;
  }

  private colorForState(): [number, number, number] {
    switch (this.state) {
      case "listening": case "success": return [52, 199, 89];
      case "processing": return [244, 244, 246];
      case "idle": return [180, 182, 191];
      default: { const _: never = this.state; return assertNever(_); }
    }
  }

  private glowForState(index: number): number {
    switch (this.state) {
      case "idle": return index === this.blinkPixel ? 1.4 : 0.35;
      case "listening": return 0.55;
      case "processing": return this.interiorMask[index] ? 0.2 : 1.15;
      case "success": return 1.75;
      default: { const _: never = this.state; return assertNever(_); }
    }
  }

  private brightnessFor(row: number, col: number, index: number, phase: number, now: number): number {
    switch (this.state) {
      case "idle": {
        const breath = 0.15 + 0.07 * Math.sin(phase * Math.PI * 2);
        return breath + this.blinkContribution(index, now);
      }
      case "listening": {
        const normalizedWave = (Math.sin((phase + col * 0.15) * Math.PI * 2) + 1) / 2;
        const rowRatio = this.rows === 1 ? 0 : (this.rows - 1 - row) / (this.rows - 1);
        const threshold = 0.18 + rowRatio * 0.45;
        if (normalizedWave <= threshold) return 0.08;
        return 0.25 + ((normalizedWave - threshold) / (1 - threshold)) * 0.75;
      }
      case "processing": {
        if (this.interiorMask[index]) return 0.06;
        const pi = this.perimeterIndexMap[index];
        if (pi < 0 || this.perimeterOrder.length === 0) return 0;
        const diff = ((phase - pi / this.perimeterOrder.length + 1) % 1 + 1) % 1;
        const distance = Math.min(diff, 1 - diff);
        return Math.exp(-Math.pow(distance / 0.1, 2));
      }
      case "success": {
        const t = Math.min(phase, 1);
        if (t < 0.15) return easeOutCubic(t / 0.15);
        if (t < 0.45) return 1;
        return 1 - easeInCubic((t - 0.45) / 0.55) * 0.7;
      }
      default: { const _: never = this.state; return assertNever(_); }
    }
  }

  private tick(now: number): void {
    if (!this.running) return;
    const elapsed = (now - this.epoch) / 1000;
    const phase = ((elapsed / this.cycleDuration()) % 1 + 1) % 1;
    const [r, g, b] = this.colorForState();

    for (let i = 0; i < this.cells.length; i++) {
      const row = Math.floor(i / this.cols);
      const col = i % this.cols;
      const brightness = Math.min(Math.max(this.brightnessFor(row, col, i, phase, now), 0), 1);
      const glow = this.glowForState(i);
      const cell = this.cells[i];

      cell.style.opacity = brightness.toFixed(3);
      cell.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;

      if (brightness <= 0.01) {
        cell.style.boxShadow = "none";
      } else {
        const glowAlpha = Math.min(Math.max(0.12 + glow * 0.38 * brightness, 0), 0.95);
        cell.style.boxShadow = `0 0 ${2 + glow * 5}px rgba(${r}, ${g}, ${b}, ${glowAlpha.toFixed(3)})`;
      }
    }

    this.frameTimer = setTimeout(() => {
      this.rafId = requestAnimationFrame(this.tick);
    }, 1000 / this.updateIntervalFps());
  }
}

// ── Demo playback ─────────────────────────────────────

interface DemoRefs {
  frame: HTMLElement;
  liveText: HTMLElement;
  liveLine: HTMLElement;
  phaseLabel: HTMLElement;
  caret: HTMLElement;
}

class DemoPlayback {
  private previewEl: HTMLElement;
  private activeKey: DemoScenarioKey = "terminal";
  private token = 0;
  private controlTimers: ReturnType<typeof setTimeout>[] = [];
  private pendingWaits = new Set<{ timer: ReturnType<typeof setTimeout>; resolve: (ok: boolean) => void }>();
  private spinners: PixelSpinner[] = [];
  private refs: DemoRefs | null = null;
  private reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  constructor(previewEl: HTMLElement) {
    this.previewEl = previewEl;
  }

  private clearAll(): void {
    this.controlTimers.forEach(clearTimeout);
    this.controlTimers = [];
    this.pendingWaits.forEach((w) => { clearTimeout(w.timer); w.resolve(false); });
    this.pendingWaits.clear();
    this.spinners.forEach((s) => s.stop());
    this.spinners = [];
  }

  stop(): void {
    this.token++;
    this.clearAll();
  }

  setScenario(key: string): void {
    const nextKey = (key in DEMO_SCENARIOS ? key : "terminal") as DemoScenarioKey;
    this.activeKey = nextKey;
    this.stop();
    this.previewEl.classList.add("is-swapping");

    const timer = setTimeout(() => {
      const scenario = DEMO_SCENARIOS[this.activeKey];
      // renderWindowShell returns static developer-authored markup, not user input
      this.previewEl.innerHTML = renderWindowShell(scenario); // eslint-disable-line no-unsanitized/property
      this.previewEl.classList.remove("is-swapping");

      this.refs = {
        frame: this.previewEl.querySelector(".window-frame")!,
        liveText: this.previewEl.querySelector("[data-role='live-text']")!,
        liveLine: this.previewEl.querySelector("[data-role='live-line']")!,
        phaseLabel: this.previewEl.querySelector("[data-role='phase-label']")!,
        caret: this.previewEl.querySelector("[data-role='caret']")!,
      };

      this.spinners = Array.from(this.previewEl.querySelectorAll<HTMLElement>("[data-spinner]")).map((el) => {
        const spinner = new PixelSpinner(el);
        spinner.start();
        return spinner;
      });

      this.run(this.token + 1);
    }, 100);

    this.controlTimers.push(timer);
  }

  private setPhase(phase: DemoPhase, scenario: DemoScenario): void {
    if (!this.refs) return;
    this.refs.frame.setAttribute("data-phase", phase);

    switch (phase) {
      case "listening": this.refs.phaseLabel.textContent = "Listening..."; break;
      case "processing": this.refs.phaseLabel.textContent = "Processing 0.1s"; break;
      case "success": this.refs.phaseLabel.textContent = `Inserted in ${scenario.latency}`; break;
      case "idle": this.refs.phaseLabel.textContent = "Ready"; break;
      default: { const _: never = phase; assertNever(_); }
    }

    this.refs.liveLine.classList.toggle("is-listening", phase === "listening");
    this.refs.liveLine.classList.toggle("is-processing", phase === "processing");
    this.refs.liveLine.classList.toggle("is-emphasis", phase === "success");
    this.refs.caret.classList.toggle("is-hidden", phase === "idle" || phase === "success");

    this.spinners.forEach((s) => s.setState(phase));
    demoGlow.phase = phase;
    demoGlow.changedAt = performance.now();
  }

  private waitFor(ms: number, token: number): Promise<boolean> {
    return new Promise((resolve) => {
      const waiter = { timer: 0 as unknown as ReturnType<typeof setTimeout>, resolve: (_: boolean) => {} };
      waiter.resolve = (ok: boolean) => {
        this.pendingWaits.delete(waiter);
        resolve(ok);
      };
      waiter.timer = setTimeout(() => waiter.resolve(token === this.token), ms);
      this.pendingWaits.add(waiter);
    });
  }

  private async run(token: number): Promise<void> {
    this.token = token;
    const scenario = DEMO_SCENARIOS[this.activeKey];
    if (!this.refs) return;

    if (this.reducedMotion) {
      this.setPhase("success", scenario);
      this.refs.liveText.textContent = scenario.clean;
      return;
    }

    while (token === this.token) {
      this.refs.liveText.textContent = "";
      this.setPhase("idle", scenario);
      if (!(await this.waitFor(560, token))) return;

      this.setPhase("listening", scenario);
      this.refs.liveText.textContent = "";
      if (!(await this.waitFor(1350 + Math.random() * 700, token))) return;

      this.setPhase("processing", scenario);
      this.refs.liveText.textContent = "";
      if (!(await this.waitFor(100, token))) return;

      this.setPhase("success", scenario);
      this.refs.liveText.textContent = scenario.clean;
      if (!(await this.waitFor(1400, token))) return;

      this.setPhase("idle", scenario);
      this.refs.liveText.textContent = "";
      if (!(await this.waitFor(840, token))) return;
    }
  }
}

// ── Init ──────────────────────────────────────────────

export function initDemo(): void {
  const buttons = Array.from(document.querySelectorAll<HTMLElement>("[data-demo-key]"));
  const previewEl = document.getElementById("app-preview");
  if (!buttons.length || !previewEl) return;

  const playback = new DemoPlayback(previewEl);

  const setActive = (key: string) => {
    buttons.forEach((btn) => {
      const isActive = btn.dataset.demoKey === key;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-selected", String(isActive));
    });
    playback.setScenario(key);
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => setActive(btn.dataset.demoKey || "terminal"));
  });

  const tabsContainer = buttons[0]?.parentElement;
  if (tabsContainer) {
    const checkEnd = () => {
      const atEnd = tabsContainer.scrollLeft + tabsContainer.clientWidth >= tabsContainer.scrollWidth - 4;
      tabsContainer.classList.toggle("is-scrolled-end", atEnd);
    };
    tabsContainer.addEventListener("scroll", checkEnd, { passive: true });
    checkEnd();
  }

  const requestedKey = new URLSearchParams(location.search).get("demo");
  const defaultKey = buttons.find((b) => b.classList.contains("is-active"))?.dataset.demoKey || "terminal";
  setActive(requestedKey && requestedKey in DEMO_SCENARIOS ? requestedKey : defaultKey);

  window.addEventListener("beforeunload", () => playback.stop());
}
