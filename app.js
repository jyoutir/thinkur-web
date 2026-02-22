const WORKING_DAYS_PER_MONTH = 22;
const SPEED_MULTIPLIER = 4;
const DEFAULT_WPM = 40;

const DEMO_PHASE = {
  IDLE: "idle",
  LISTENING: "listening",
  PROCESSING: "processing",
  SUCCESS: "success"
};

const PHASE_TEXT = {
  idle: "Ready",
  listening: "Listening...",
  processing: "Processing...",
  success: "Inserted"
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
        <p class="terminal-out"><span class="prompt">ops@macbook % </span>kubectl get deploy/worker -n prod</p>
        <p class="terminal-out"><span class="terminal-ok">worker</span> 3/3 Running 0 7d</p>
        <div class="terminal-pane">
          <p class="pane-label">dictated</p>
          <p class="terminal-line" data-role="raw-line"><span class="prompt">ops@macbook % </span><span data-role="raw"></span><span class="type-caret" data-role="raw-caret"></span></p>
          <p class="pane-label">inserted</p>
          <p class="terminal-clean" data-role="clean-line"><span class="prompt">ops@macbook % </span><span data-role="clean"></span></p>
        </div>
        <p class="preview-live is-hidden" data-role="live-inline">
          <span class="pixel-spinner is-mini" data-spinner data-cols="4" data-rows="2" aria-hidden="true"></span>
          <span data-role="phase-inline"></span>
        </p>
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
          <p class="pane-label">dictated draft</p>
          <p class="mail-draft" data-role="raw-line"><span data-role="raw"></span><span class="type-caret" data-role="raw-caret"></span></p>
          <p class="pane-label">inserted at cursor</p>
          <p class="mail-clean" data-role="clean-line"><span data-role="clean"></span></p>
          <p class="preview-live is-hidden" data-role="live-inline">
            <span class="pixel-spinner is-mini" data-spinner data-cols="4" data-rows="2" aria-hidden="true"></span>
            <span data-role="phase-inline"></span>
          </p>
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
          <p class="bubble">Can we move the sync to later this week?</p>
          <p class="bubble-reply" data-role="raw-line"><span data-role="raw"></span><span class="type-caret" data-role="raw-caret"></span></p>
          <p class="bubble-clean" data-role="clean-line"><span data-role="clean"></span></p>
          <p class="preview-live is-hidden" data-role="live-inline">
            <span class="pixel-spinner is-mini" data-spinner data-cols="4" data-rows="2" aria-hidden="true"></span>
            <span data-role="phase-inline"></span>
          </p>
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
          <p class="pane-label">dictated draft</p>
          <p class="slack-draft" data-role="raw-line"><span data-role="raw"></span><span class="type-caret" data-role="raw-caret"></span></p>
          <p class="pane-label">inserted message</p>
          <p class="slack-clean" data-role="clean-line"><span data-role="clean"></span></p>
          <p class="preview-live is-hidden" data-role="live-inline">
            <span class="pixel-spinner is-mini" data-spinner data-cols="4" data-rows="2" aria-hidden="true"></span>
            <span data-role="phase-inline"></span>
          </p>
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
          <p class="pane-label">dictated draft</p>
          <p class="notes-draft" data-role="raw-line"><span data-role="raw"></span><span class="type-caret" data-role="raw-caret"></span></p>
          <p class="pane-label">inserted text</p>
          <p class="notes-clean" data-role="clean-line"><span data-role="clean"></span></p>
          <p class="preview-live is-hidden" data-role="live-inline">
            <span class="pixel-spinner is-mini" data-spinner data-cols="4" data-rows="2" aria-hidden="true"></span>
            <span data-role="phase-inline"></span>
          </p>
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
            <img src="${scenario.icon}" alt="" width="14" height="14" />
            <p class="window-title">${scenario.title}</p>
          </div>
        </div>
        <div class="window-status">
          <span class="pixel-spinner" data-spinner data-cols="4" data-rows="2" aria-hidden="true"></span>
          <span data-role="phase-label">${PHASE_TEXT.idle}</span>
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
        phaseLabel: this.previewEl.querySelector("[data-role='phase-label']"),
        phaseInline: this.previewEl.querySelector("[data-role='phase-inline']"),
        raw: this.previewEl.querySelector("[data-role='raw']"),
        rawLine: this.previewEl.querySelector("[data-role='raw-line']"),
        rawCaret: this.previewEl.querySelector("[data-role='raw-caret']"),
        clean: this.previewEl.querySelector("[data-role='clean']"),
        cleanLine: this.previewEl.querySelector("[data-role='clean-line']"),
        liveInline: this.previewEl.querySelector("[data-role='live-inline']")
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

    const topText = phase === DEMO_PHASE.SUCCESS ? `Inserted in ${scenario.latency}` : PHASE_TEXT[phase];
    const inlineText = phase === DEMO_PHASE.SUCCESS ? "Inserted" : PHASE_TEXT[phase];

    if (this.refs.phaseLabel) {
      this.refs.phaseLabel.textContent = topText;
    }

    if (this.refs.phaseInline) {
      this.refs.phaseInline.textContent = inlineText;
    }

    if (this.refs.liveInline) {
      const isActive = phase !== DEMO_PHASE.IDLE;
      this.refs.liveInline.classList.toggle("is-hidden", !isActive);
    }

    if (this.refs.rawCaret) {
      const showCaret = phase === DEMO_PHASE.LISTENING;
      this.refs.rawCaret.classList.toggle("is-hidden", !showCaret);
    }

    if (this.refs.rawLine) {
      const dimRaw = phase === DEMO_PHASE.PROCESSING;
      this.refs.rawLine.classList.toggle("is-dim", dimRaw);
    }

    if (this.refs.cleanLine) {
      this.refs.cleanLine.classList.toggle("is-emphasis", phase === DEMO_PHASE.SUCCESS);
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

  async typeInto(element, text, token, baseDelay = 26) {
    if (!element) {
      return true;
    }

    element.textContent = "";

    for (let index = 1; index <= text.length; index += 1) {
      if (token !== this.token) {
        return false;
      }

      element.textContent = text.slice(0, index);

      const char = text[index - 1] || "";
      const punctuationPause = /[,.?!]/.test(char) ? 44 : char === " " ? 18 : 0;
      const jitter = (Math.random() - 0.5) * 14;
      const ok = await this.waitFor(Math.max(14, baseDelay + punctuationPause + jitter), token);
      if (!ok) {
        return false;
      }
    }

    return true;
  }

  async run(token) {
    this.token = token;
    const scenario = DEMO_SCENARIOS[this.activeKey];

    if (!scenario || !this.refs) {
      return;
    }

    if (this.reducedMotion) {
      this.setPhase(DEMO_PHASE.SUCCESS, scenario);
      if (this.refs.raw) {
        this.refs.raw.textContent = scenario.raw;
      }
      if (this.refs.clean) {
        this.refs.clean.textContent = scenario.clean;
      }
      return;
    }

    while (token === this.token) {
      if (this.refs.raw) {
        this.refs.raw.textContent = "";
      }
      if (this.refs.clean) {
        this.refs.clean.textContent = "";
      }

      this.setPhase(DEMO_PHASE.IDLE, scenario);
      if (!(await this.waitFor(680, token))) {
        return;
      }

      this.setPhase(DEMO_PHASE.LISTENING, scenario);
      const rawComplete = await this.typeInto(this.refs.raw, scenario.raw, token, 24);
      if (!rawComplete) {
        return;
      }

      if (!(await this.waitFor(140, token))) {
        return;
      }

      this.setPhase(DEMO_PHASE.PROCESSING, scenario);
      if (!(await this.waitFor(720, token))) {
        return;
      }

      this.setPhase(DEMO_PHASE.SUCCESS, scenario);
      const cleanComplete = await this.typeInto(this.refs.clean, scenario.clean, token, 12);
      if (!cleanComplete) {
        return;
      }

      if (!(await this.waitFor(900, token))) {
        return;
      }

      this.setPhase(DEMO_PHASE.IDLE, scenario);
      if (!(await this.waitFor(1300, token))) {
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

document.addEventListener("DOMContentLoaded", () => {
  initDemoContextSwitcher();
  initSavingsCalculator();
});
