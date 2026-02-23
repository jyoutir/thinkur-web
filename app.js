const WORKING_DAYS_PER_MONTH = 22;
const SPEED_MULTIPLIER = 4;
const DEFAULT_WPM = 40;

const DEMO_PHASE = {
  IDLE: "idle",
  LISTENING: "listening",
  PROCESSING: "processing",
  SUCCESS: "success"
};

const DEMO_SCENARIOS = {
  terminal: {
    title: "Terminal",
    icon: "./assets/icons/terminal.png",
    latency: "2.1ms",
    raw: "um can you check the deploy status then restart the worker",
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
    raw: "dear sarah comma thanks for the update period we can ship tuesday afternoon",
    clean: "Dear Sarah, thanks for the update. We can ship Tuesday afternoon.",
    renderBody: () => `
      <div class="preview-firefox">
        <div class="browser-toolbar">
          <div class="browser-nav" aria-hidden="true">
            <span class="browser-nav-btn">‹</span>
            <span class="browser-nav-btn">›</span>
            <span class="browser-nav-btn">↻</span>
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
    raw: "yeah um thursday works for me uh does two pm work for everyone",
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
    raw: "first check logs second restart api third post status in backend",
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
          <p class="slack-message"><span class="slack-avatar" aria-hidden="true">A</span><span class="slack-meta">Alice · 10:38 AM</span></p>
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
    raw: "meeting moved to two thirty pm on march third and send recap to everyone",
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

function renderWindowShell(scenario) {
  return `
    <article class="window-frame" data-phase="${DEMO_PHASE.IDLE}" aria-label="${scenario.title} preview">
      <div class="window-bar">
        <div class="window-left">
          <div class="window-controls" aria-hidden="true">
            <span class="window-dot"></span><span class="window-dot"></span><span class="window-dot"></span>
          </div>
          <div class="window-app">
            <img src="${scenario.icon}" alt="" width="16" height="16" />
            <p class="window-title">${scenario.title}</p>
          </div>
        </div>
        <div class="window-status">
          <span class="pixel-spinner" data-spinner data-cols="4" data-rows="2" aria-hidden="true"></span>
          <span class="window-phase" data-role="phase-label">Ready</span>
        </div>
      </div>
      <div class="preview-body">${scenario.renderBody()}</div>
    </article>
  `;
}

function clampNumber(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0
  }).format(value);
}

function computeSavings(hoursTypingPerDay, hourlyRate) {
  const dailyHoursSaved = hoursTypingPerDay * (1 - 1 / SPEED_MULTIPLIER);
  const monthlyHoursSaved = dailyHoursSaved * WORKING_DAYS_PER_MONTH;
  const monthlySavings = monthlyHoursSaved * hourlyRate;
  const wordsPerDay = Math.round(hoursTypingPerDay * 60 * DEFAULT_WPM);

  return {
    monthlySavings,
    monthlyHoursSaved,
    wordsPerDay
  };
}

function initSavingsCalculator() {
  const hoursSlider = document.getElementById("typing-hours");
  const hoursLabel = document.getElementById("typing-hours-label");
  const hourlyRateInput = document.getElementById("hourly-rate");
  const hourlyRateError = document.getElementById("hourly-rate-error");

  const monthlySavingsEl = document.getElementById("monthly-savings");
  const hoursSavedEl = document.getElementById("hours-saved");
  const wordsDayEl = document.getElementById("words-day");

  if (
    !hoursSlider ||
    !hoursLabel ||
    !hourlyRateInput ||
    !hourlyRateError ||
    !monthlySavingsEl ||
    !hoursSavedEl ||
    !wordsDayEl
  ) {
    return;
  }

  const update = () => {
    const hoursTypingPerDay = clampNumber(Number(hoursSlider.value) || 2, 0.5, 8);
    const parsedRate = Number(hourlyRateInput.value);
    const hasRateError = !Number.isFinite(parsedRate) || parsedRate <= 0;
    const hourlyRate = clampNumber(hasRateError ? 50 : parsedRate, 1, 100000);

    const { monthlySavings, monthlyHoursSaved, wordsPerDay } = computeSavings(hoursTypingPerDay, hourlyRate);

    hoursLabel.textContent = `${hoursTypingPerDay.toFixed(1)}h / day`;
    monthlySavingsEl.textContent = formatCurrency(monthlySavings);
    hoursSavedEl.textContent = `${Math.round(monthlyHoursSaved)} hours`;
    wordsDayEl.textContent = new Intl.NumberFormat("en-GB").format(wordsPerDay);

    hourlyRateError.hidden = !hasRateError;
  };

  hoursSlider.addEventListener("input", update);
  hourlyRateInput.addEventListener("input", update);
  update();
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInCubic(t) {
  return t * t * t;
}

class PixelSpinner {
  constructor(element) {
    this.element = element;
    this.cols = Math.max(1, Number(element.dataset.cols) || 4);
    this.rows = Math.max(1, Number(element.dataset.rows) || 2);

    this.state = DEMO_PHASE.IDLE;
    this.running = false;
    this.epoch = performance.now();
    this.rafId = null;
    this.frameTimer = null;
    this.blinkTimer = null;
    this.blinkPixel = -1;
    this.blinkStartedAt = 0;

    this.perimeterOrder = [];
    this.perimeterIndexMap = [];
    this.interiorMask = [];
    this.cells = [];

    this.buildGrid();
    this.rebuildCache();
    this.tick = this.tick.bind(this);
  }

  buildGrid() {
    this.element.innerHTML = "";
    this.element.style.setProperty("--cols", String(this.cols));

    for (let row = 0; row < this.rows; row += 1) {
      for (let col = 0; col < this.cols; col += 1) {
        const cell = document.createElement("span");
        cell.className = "pixel-cell";
        cell.dataset.row = String(row);
        cell.dataset.col = String(col);
        this.element.append(cell);
        this.cells.push(cell);
      }
    }
  }

  rebuildCache() {
    const size = this.rows * this.cols;

    this.perimeterOrder = [];
    for (let col = 0; col < this.cols; col += 1) {
      this.perimeterOrder.push(col);
    }
    for (let row = 1; row < this.rows; row += 1) {
      this.perimeterOrder.push(row * this.cols + (this.cols - 1));
    }
    for (let col = this.cols - 2; col >= 0; col -= 1) {
      this.perimeterOrder.push((this.rows - 1) * this.cols + col);
    }
    for (let row = this.rows - 2; row >= 1; row -= 1) {
      this.perimeterOrder.push(row * this.cols);
    }

    this.perimeterIndexMap = Array(size).fill(-1);
    this.perimeterOrder.forEach((index, position) => {
      if (index < size) {
        this.perimeterIndexMap[index] = position;
      }
    });

    this.interiorMask = Array(size).fill(false);
    if (this.rows >= 3 && this.cols >= 3) {
      for (let row = 1; row < this.rows - 1; row += 1) {
        for (let col = 1; col < this.cols - 1; col += 1) {
          this.interiorMask[row * this.cols + col] = true;
        }
      }
    }
  }

  cycleDuration() {
    switch (this.state) {
      case DEMO_PHASE.LISTENING:
        return 1.4;
      case DEMO_PHASE.PROCESSING:
        return 0.7;
      case DEMO_PHASE.SUCCESS:
        return 1.8;
      default:
        return 4.0;
    }
  }

  updateIntervalFps() {
    switch (this.state) {
      case DEMO_PHASE.LISTENING:
        return 30;
      case DEMO_PHASE.PROCESSING:
        return 20;
      default:
        return 30;
    }
  }

  setState(nextState) {
    if (this.state === nextState) {
      return;
    }

    this.state = nextState;
    this.epoch = performance.now();

    if (this.state === DEMO_PHASE.IDLE) {
      this.scheduleBlink();
    } else {
      this.clearBlink();
    }
  }

  start() {
    if (this.running) {
      return;
    }

    this.running = true;
    this.epoch = performance.now();
    if (this.state === DEMO_PHASE.IDLE) {
      this.scheduleBlink();
    }
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop() {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.frameTimer) {
      clearTimeout(this.frameTimer);
      this.frameTimer = null;
    }
    this.clearBlink();
  }

  clearBlink() {
    if (this.blinkTimer) {
      clearTimeout(this.blinkTimer);
      this.blinkTimer = null;
    }
    this.blinkPixel = -1;
    this.blinkStartedAt = 0;
  }

  scheduleBlink() {
    if (this.blinkTimer || this.state !== DEMO_PHASE.IDLE) {
      return;
    }

    const delay = 800 + Math.random() * 1200;
    this.blinkTimer = window.setTimeout(() => {
      this.blinkTimer = null;
      this.blinkPixel = Math.floor(Math.random() * this.cells.length);
      this.blinkStartedAt = performance.now();

      window.setTimeout(() => {
        if (this.state === DEMO_PHASE.IDLE) {
          this.blinkPixel = -1;
          this.blinkStartedAt = 0;
          this.scheduleBlink();
        }
      }, 900);
    }, delay);
  }

  blinkContribution(index, now) {
    if (index !== this.blinkPixel || !this.blinkStartedAt) {
      return 0;
    }

    const elapsed = (now - this.blinkStartedAt) / 1000;
    if (elapsed <= 0) {
      return 0;
    }

    if (elapsed < 0.2) {
      return easeOutCubic(elapsed / 0.2) * 0.7;
    }
    if (elapsed < 0.8) {
      return (1 - easeInCubic((elapsed - 0.2) / 0.6)) * 0.7;
    }
    return 0;
  }

  colorForState() {
    switch (this.state) {
      case DEMO_PHASE.LISTENING:
      case DEMO_PHASE.SUCCESS:
        return [52, 199, 89];
      case DEMO_PHASE.PROCESSING:
        return [244, 244, 246];
      default:
        return [180, 182, 191];
    }
  }

  glowForState(index) {
    const isInterior = this.interiorMask[index];

    switch (this.state) {
      case DEMO_PHASE.IDLE:
        return index === this.blinkPixel ? 1.4 : 0.35;
      case DEMO_PHASE.LISTENING:
        return 0.55;
      case DEMO_PHASE.PROCESSING:
        return isInterior ? 0.2 : 1.15;
      case DEMO_PHASE.SUCCESS:
        return 1.75;
      default:
        return 0.5;
    }
  }

  listeningBrightness(row, col, phase) {
    const normalizedWave = (Math.sin((phase + col * 0.15) * Math.PI * 2) + 1) / 2;
    const rowRatio = this.rows === 1 ? 0 : (this.rows - 1 - row) / (this.rows - 1);
    const threshold = 0.18 + rowRatio * 0.45;

    if (normalizedWave <= threshold) {
      return 0.08;
    }

    const level = (normalizedWave - threshold) / (1 - threshold);
    return 0.25 + level * 0.75;
  }

  processingBrightness(index, phase) {
    if (this.interiorMask[index]) {
      return 0.06;
    }

    const perimeterIndex = this.perimeterIndexMap[index];
    if (perimeterIndex < 0 || this.perimeterOrder.length === 0) {
      return 0;
    }

    const pixelPhase = perimeterIndex / this.perimeterOrder.length;
    const diff = ((phase - pixelPhase + 1) % 1 + 1) % 1;
    const distance = Math.min(diff, 1 - diff);
    const spread = 0.1;

    return Math.exp(-Math.pow(distance / spread, 2));
  }

  successBrightness(phase) {
    const t = Math.min(phase, 1);
    if (t < 0.15) {
      return easeOutCubic(t / 0.15);
    }
    if (t < 0.45) {
      return 1;
    }

    const fadeT = (t - 0.45) / 0.55;
    return 1 - easeInCubic(fadeT) * 0.7;
  }

  brightnessFor(row, col, index, phase, now) {
    switch (this.state) {
      case DEMO_PHASE.IDLE: {
        const breath = 0.15 + 0.07 * Math.sin(phase * Math.PI * 2);
        return breath + this.blinkContribution(index, now);
      }
      case DEMO_PHASE.LISTENING:
        return this.listeningBrightness(row, col, phase);
      case DEMO_PHASE.PROCESSING:
        return this.processingBrightness(index, phase);
      case DEMO_PHASE.SUCCESS:
        return this.successBrightness(phase);
      default:
        return 0.15;
    }
  }

  tick(now) {
    if (!this.running) {
      return;
    }

    const elapsed = (now - this.epoch) / 1000;
    const phase = ((elapsed / this.cycleDuration()) % 1 + 1) % 1;
    const [red, green, blue] = this.colorForState();

    for (let index = 0; index < this.cells.length; index += 1) {
      const row = Math.floor(index / this.cols);
      const col = index % this.cols;
      const brightness = clampNumber(this.brightnessFor(row, col, index, phase, now), 0, 1);
      const glow = this.glowForState(index);
      const cell = this.cells[index];

      cell.style.opacity = brightness.toFixed(3);
      cell.style.backgroundColor = `rgb(${red}, ${green}, ${blue})`;

      if (brightness <= 0.01) {
        cell.style.boxShadow = "none";
      } else {
        const glowAlpha = clampNumber(0.12 + glow * 0.38 * brightness, 0, 0.95);
        cell.style.boxShadow = `0 0 ${2 + glow * 5}px rgba(${red}, ${green}, ${blue}, ${glowAlpha.toFixed(3)})`;
      }
    }

    const frameDelay = 1000 / this.updateIntervalFps();
    this.frameTimer = window.setTimeout(() => {
      this.rafId = requestAnimationFrame(this.tick);
    }, frameDelay);
  }
}

class DemoPlayback {
  constructor(previewEl) {
    this.previewEl = previewEl;
    this.activeKey = "terminal";
    this.token = 0;
    this.controlTimers = [];
    this.pendingWaits = new Set();
    this.spinners = [];
    this.refs = null;
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  clearControlTimers() {
    this.controlTimers.forEach((timer) => window.clearTimeout(timer));
    this.controlTimers = [];
  }

  clearPendingWaits() {
    this.pendingWaits.forEach((waiter) => {
      window.clearTimeout(waiter.timer);
      waiter.resolve(false);
    });
    this.pendingWaits.clear();
  }

  clearSpinners() {
    this.spinners.forEach((spinner) => spinner.stop());
    this.spinners = [];
  }

  stop() {
    this.token += 1;
    this.clearControlTimers();
    this.clearPendingWaits();
    this.clearSpinners();
  }

  setScenario(key) {
    const nextKey = DEMO_SCENARIOS[key] ? key : "terminal";
    this.activeKey = nextKey;
    this.stop();
    this.previewEl.classList.add("is-swapping");

    const swapTimer = window.setTimeout(() => {
      const scenario = DEMO_SCENARIOS[this.activeKey];
      this.previewEl.innerHTML = renderWindowShell(scenario);
      this.previewEl.classList.remove("is-swapping");

      this.refs = {
        frame: this.previewEl.querySelector(".window-frame"),
        liveText: this.previewEl.querySelector("[data-role='live-text']"),
        liveLine: this.previewEl.querySelector("[data-role='live-line']"),
        phaseLabel: this.previewEl.querySelector("[data-role='phase-label']"),
        caret: this.previewEl.querySelector("[data-role='caret']")
      };

      this.spinners = Array.from(this.previewEl.querySelectorAll("[data-spinner]")).map((element) => {
        const spinner = new PixelSpinner(element);
        spinner.start();
        return spinner;
      });

      this.run(this.token + 1);
    }, 100);

    this.controlTimers.push(swapTimer);
  }

  setSpinnerState(state) {
    this.spinners.forEach((spinner) => {
      spinner.setState(state);
    });
  }

  setPhase(phase, scenario) {
    if (!this.refs) {
      return;
    }

    this.refs.frame?.setAttribute("data-phase", phase);

    if (this.refs.phaseLabel) {
      if (phase === DEMO_PHASE.LISTENING) {
        this.refs.phaseLabel.textContent = "Listening...";
      } else if (phase === DEMO_PHASE.PROCESSING) {
        this.refs.phaseLabel.textContent = "Processing 0.1s";
      } else if (phase === DEMO_PHASE.SUCCESS) {
        this.refs.phaseLabel.textContent = `Inserted in ${scenario.latency}`;
      } else {
        this.refs.phaseLabel.textContent = "Ready";
      }
    }

    if (this.refs.liveLine) {
      this.refs.liveLine.classList.toggle("is-listening", phase === DEMO_PHASE.LISTENING);
      this.refs.liveLine.classList.toggle("is-processing", phase === DEMO_PHASE.PROCESSING);
      this.refs.liveLine.classList.toggle("is-emphasis", phase === DEMO_PHASE.SUCCESS);
    }

    if (this.refs.caret) {
      this.refs.caret.classList.toggle("is-hidden", phase === DEMO_PHASE.IDLE || phase === DEMO_PHASE.SUCCESS);
    }

    this.setSpinnerState(phase);
  }

  waitFor(ms, token) {
    return new Promise((resolve) => {
      const waiter = {
        timer: 0,
        resolve: () => {}
      };

      waiter.resolve = (value) => {
        if (!this.pendingWaits.has(waiter)) {
          return;
        }
        this.pendingWaits.delete(waiter);
        resolve(value);
      };

      waiter.timer = window.setTimeout(() => {
        waiter.resolve(token === this.token);
      }, ms);

      this.pendingWaits.add(waiter);
    });
  }

  async run(token) {
    this.token = token;
    const scenario = DEMO_SCENARIOS[this.activeKey];

    if (!scenario || !this.refs) {
      return;
    }

    if (this.reducedMotion) {
      this.setPhase(DEMO_PHASE.SUCCESS, scenario);
      if (this.refs.liveText) {
        this.refs.liveText.textContent = scenario.clean;
      }
      return;
    }

    while (token === this.token) {
      if (this.refs.liveText) {
        this.refs.liveText.textContent = "";
      }

      this.setPhase(DEMO_PHASE.IDLE, scenario);
      if (!(await this.waitFor(560, token))) {
        return;
      }

      this.setPhase(DEMO_PHASE.LISTENING, scenario);
      if (this.refs.liveText) {
        this.refs.liveText.textContent = "";
      }
      const listeningMs = Math.round(1350 + Math.random() * 700);
      if (!(await this.waitFor(listeningMs, token))) {
        return;
      }

      this.setPhase(DEMO_PHASE.PROCESSING, scenario);
      if (this.refs.liveText) {
        this.refs.liveText.textContent = "";
      }
      if (!(await this.waitFor(100, token))) {
        return;
      }

      this.setPhase(DEMO_PHASE.SUCCESS, scenario);
      if (this.refs.liveText) {
        this.refs.liveText.textContent = scenario.clean;
      }

      if (!(await this.waitFor(1400, token))) {
        return;
      }

      this.setPhase(DEMO_PHASE.IDLE, scenario);
      if (this.refs.liveText) {
        this.refs.liveText.textContent = "";
      }
      if (!(await this.waitFor(840, token))) {
        return;
      }
    }
  }
}

function initDemoContextSwitcher() {
  const buttons = Array.from(document.querySelectorAll("[data-demo-key]"));
  const previewEl = document.getElementById("app-preview");

  if (!buttons.length || !previewEl) {
    return;
  }

  const playback = new DemoPlayback(previewEl);

  const setActive = (key) => {
    buttons.forEach((button) => {
      const isActive = button.dataset.demoKey === key;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
    });

    playback.setScenario(key);
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      setActive(button.dataset.demoKey || "terminal");
    });
  });

  const requestedKey = new URLSearchParams(window.location.search).get("demo");
  const defaultKey = buttons.find((button) => button.classList.contains("is-active"))?.dataset.demoKey || "terminal";
  const initialKey = requestedKey && DEMO_SCENARIOS[requestedKey] ? requestedKey : defaultKey;
  setActive(initialKey);

  window.addEventListener("beforeunload", () => {
    playback.stop();
  });
}

function initThemeToggle() {
  const root = document.documentElement;
  const button = document.getElementById("theme-toggle");

  if (!button) {
    return;
  }

  const storedTheme = window.localStorage.getItem("theme");
  const queryTheme = new URLSearchParams(window.location.search).get("theme");
  const initialTheme = queryTheme === "light" || queryTheme === "dark" ? queryTheme : storedTheme;

  if (initialTheme === "light" || initialTheme === "dark") {
    root.setAttribute("data-theme", initialTheme);
    window.localStorage.setItem("theme", initialTheme);
  }

  const updateButton = () => {
    const isLight = root.getAttribute("data-theme") === "light";
    button.textContent = isLight ? "Dark mode" : "Light mode";
    button.setAttribute("aria-pressed", String(isLight));
  };

  button.addEventListener("click", () => {
    const isLight = root.getAttribute("data-theme") === "light";
    const nextTheme = isLight ? "dark" : "light";
    root.setAttribute("data-theme", nextTheme);
    window.localStorage.setItem("theme", nextTheme);
    updateButton();
  });

  updateButton();
}

function initAppMarquee() {
  const marquee = document.querySelector(".app-marquee");
  const track = marquee?.querySelector(".app-track");
  const lane = track?.querySelector(".app-lane");

  if (!marquee || !track || !lane) {
    return;
  }

  const hasClone = track.querySelector(".app-lane.is-clone");
  if (hasClone) {
    return;
  }

  const clone = lane.cloneNode(true);
  clone.classList.add("is-clone");
  clone.setAttribute("aria-hidden", "true");
  track.append(clone);

  const syncWidth = () => {
    const firstLane = track.querySelector(".app-lane");
    if (!firstLane) {
      return;
    }
    const laneWidth = Math.ceil(firstLane.getBoundingClientRect().width + 12);
    track.style.setProperty("--lane-width", `${laneWidth}px`);
  };

  syncWidth();
  window.requestAnimationFrame(syncWidth);
  window.addEventListener("resize", syncWidth, { passive: true });
}

function initDownloadButtons() {
  let dmgUrl = null;
  document.querySelectorAll("[data-download]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      if (dmgUrl) {
        window.location.href = dmgUrl;
        return;
      }
      const fallback = "https://github.com/jyoutir/thinkur-web/releases/latest";
      try {
        const res = await fetch("https://api.github.com/repos/jyoutir/thinkur-web/releases/latest");
        if (!res.ok) throw new Error(res.status);
        const data = await res.json();
        const asset = data.assets.find((a) => a.name.endsWith(".dmg"));
        if (asset && asset.browser_download_url) {
          dmgUrl = asset.browser_download_url;
          window.location.href = dmgUrl;
        } else {
          window.location.href = fallback;
        }
      } catch {
        window.location.href = fallback;
      }
    });
  });
}

// ── Simplex 2D noise (self-contained, no deps) ──────────────────────────────

const SimplexNoise = (() => {
  const F2 = 0.5 * (Math.sqrt(3) - 1);
  const G2 = (3 - Math.sqrt(3)) / 6;
  const grad = [[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];

  function build(seed) {
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    let s = seed | 0;
    for (let i = 255; i > 0; i--) {
      s = (s * 16807 + 0) & 0x7fffffff;
      const j = s % (i + 1);
      [p[i], p[j]] = [p[j], p[i]];
    }
    const perm = new Uint8Array(512);
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
    return perm;
  }

  return function (seed) {
    const perm = build(seed || 42);
    return function noise2D(x, y) {
      const s = (x + y) * F2;
      const i = Math.floor(x + s), j = Math.floor(y + s);
      const t = (i + j) * G2;
      const x0 = x - (i - t), y0 = y - (j - t);
      const i1 = x0 > y0 ? 1 : 0, j1 = x0 > y0 ? 0 : 1;
      const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
      const x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
      const ii = i & 255, jj = j & 255;
      let n = 0;
      let t0 = 0.5 - x0*x0 - y0*y0;
      if (t0 > 0) { t0 *= t0; const g = grad[perm[ii + perm[jj]] % 8]; n += t0 * t0 * (g[0]*x0 + g[1]*y0); }
      let t1 = 0.5 - x1*x1 - y1*y1;
      if (t1 > 0) { t1 *= t1; const g = grad[perm[ii + i1 + perm[jj + j1]] % 8]; n += t1 * t1 * (g[0]*x1 + g[1]*y1); }
      let t2 = 0.5 - x2*x2 - y2*y2;
      if (t2 > 0) { t2 *= t2; const g = grad[perm[ii + 1 + perm[jj + 1]] % 8]; n += t2 * t2 * (g[0]*x2 + g[1]*y2); }
      return 70 * n;
    };
  };
})();

// ── Bayer 4x4 dithering matrix ───────────────────────────────────────────────

const BAYER4 = [
  [ 0, 8, 2,10],
  [12, 4,14, 6],
  [ 3,11, 1, 9],
  [15, 7,13, 5]
];

// ── Cloud background ─────────────────────────────────────────────────────────

function initCloudBackground() {
  const W = 280, H = 160;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  canvas.className = "cloud-canvas";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);

  const ctx = canvas.getContext("2d");
  const imgData = ctx.createImageData(W, H);
  const data = imgData.data;
  const noise = SimplexNoise(37);
  const noise2 = SimplexNoise(91);

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lastFrame = 0;

  function render(time) {
    const root = document.documentElement;
    const isLight = root.getAttribute("data-theme") === "light";
    const on = isLight ? [20, 20, 35] : [255, 255, 255];
    const drift = time * 0.000025;

    for (let y = 0; y < H; y++) {
      // vertical fade — clouds denser near top, thin at bottom
      const yRatio = y / H;
      const verticalFade = 1.0 - yRatio * yRatio * 0.7;

      for (let x = 0; x < W; x++) {
        // large cloud shapes (low frequency)
        const nx = x * 0.008 + drift;
        const ny = y * 0.012;
        const base = noise(nx, ny);

        // medium detail
        const med = noise(nx * 2.5 + 7.3, ny * 2.5 + 3.1) * 0.4;

        // fine detail (wispy edges)
        const fine = noise2(nx * 5.0 + 2.7, ny * 5.0 + 8.4) * 0.18;

        // combine: push toward cloud-like distribution
        // base noise gives big puffy shapes, med/fine add texture
        let val = base + med + fine; // range roughly -1.58 to 1.58

        // shape into clouds: use a bias so only the peaks form clouds
        // this creates clear sky (off) with distinct cloud blobs (on)
        val = val * verticalFade;

        // cloud threshold — only values above this become visible pixels
        // higher = fewer/smaller clouds, lower = more coverage
        const cloudCutoff = 0.25;
        const density = Math.max(0, (val - cloudCutoff) / (1.58 - cloudCutoff));

        // bayer dithering on the density value
        const bayerThreshold = BAYER4[y & 3][x & 3] / 16;
        const on_px = density > bayerThreshold;

        const idx = (y * W + x) * 4;
        data[idx]     = on[0];
        data[idx + 1] = on[1];
        data[idx + 2] = on[2];
        data[idx + 3] = on_px ? 255 : 0;
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }

  function loop(time) {
    if (time - lastFrame >= 66) {
      lastFrame = time;
      render(time);
    }
    requestAnimationFrame(loop);
  }

  if (reducedMotion) {
    render(0);
  } else {
    render(0);
    requestAnimationFrame(loop);
  }
}

// ── Scroll reveal ────────────────────────────────────────────────────────────

function initScrollReveal() {
  const els = document.querySelectorAll(".animate-in");
  if (!els.length) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion) {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
  );

  els.forEach((el) => observer.observe(el));
}

document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initAppMarquee();
  initDemoContextSwitcher();
  initSavingsCalculator();
  initDownloadButtons();
  initCloudBackground();
  initScrollReveal();
});
