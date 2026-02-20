const HERO_MESSAGES = {
  prompt: "Press Shift+S and speak...",
  messy: "um, yeah so tell the team that we are launching, like, on tuesday...",
  clean: "Inform the team that we are launching on Tuesday."
};

const DEMO_SAMPLES = {
  formal: {
    raw: "hey uh can you send the launch note to the team by tuesday and make it sound sharp",
    clean: "Please send the launch note to the team by Tuesday and ensure the tone is polished."
  },
  chat: {
    raw: "um i will be there in like five minutes just grabbing coffee",
    clean: "i will be there in five minutes, just grabbing coffee."
  },
  code: {
    raw: "camel case get user name and if count less than ten open brace",
    clean: "getUserName and if count < 10 {"
  }
};

const GRID_COLUMNS = 3;
const GRID_ROWS = 6;
const MOBILE_UA_REGEX = /Android|iPhone|iPad|iPod|Mobile|IEMobile|Opera Mini/i;
const listeningIntervals = new WeakMap();
const modalElements = {
  modal: null,
  form: null,
  success: null,
  email: null,
  submit: null,
  submitLabel: ""
};

let mobileCtaMode = false;

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function buildPixelGrid(grid) {
  if (!grid || grid.children.length > 0) {
    return;
  }

  let idx = 0;
  for (let row = 0; row < GRID_ROWS; row += 1) {
    for (let col = 0; col < GRID_COLUMNS; col += 1) {
      const pixel = document.createElement("span");
      pixel.className = "pixel";
      pixel.style.setProperty("--idx", String(idx));
      pixel.style.setProperty("--col", String(col));
      pixel.style.setProperty("--row", String(row));
      pixel.dataset.col = String(col);
      pixel.dataset.row = String(row);
      pixel.dataset.active = "0";
      grid.appendChild(pixel);
      idx += 1;
    }
  }
}

function setGridLevels(grid, levels) {
  const pixels = grid.querySelectorAll(".pixel");
  pixels.forEach((pixel) => {
    const col = Number(pixel.dataset.col);
    const row = Number(pixel.dataset.row);
    const level = levels[col] || 0;
    const isActive = GRID_ROWS - row <= level;
    pixel.dataset.active = isActive ? "1" : "0";
  });
}

function stopEqualizer(grid) {
  const existing = listeningIntervals.get(grid);
  if (existing) {
    window.clearInterval(existing);
    listeningIntervals.delete(grid);
  }
  setGridLevels(grid, [0, 0, 0]);
}

function startEqualizer(grid) {
  stopEqualizer(grid);

  const animate = () => {
    const levels = Array.from({ length: GRID_COLUMNS }, () => 2 + Math.floor(Math.random() * 5));
    setGridLevels(grid, levels);
  };

  animate();
  const intervalId = window.setInterval(animate, 120);
  listeningIntervals.set(grid, intervalId);
}

function setGridState(grid, nextState) {
  if (!grid) {
    return;
  }

  if (nextState === "listening") {
    startEqualizer(grid);
  } else {
    stopEqualizer(grid);
  }

  grid.dataset.state = nextState;
}

function updateHeroStateLabel(labelElement, text, phase) {
  if (!labelElement) {
    return;
  }

  labelElement.textContent = text;
  if (phase === "processing") {
    labelElement.style.borderColor = "rgba(255, 214, 107, 0.55)";
    labelElement.style.color = "#ffeeb8";
    return;
  }

  labelElement.style.borderColor = "rgba(52, 199, 89, 0.45)";
  labelElement.style.color = "#6bff9d";
}

async function typeText(target, text, charDelay) {
  target.textContent = "";
  for (const char of text) {
    target.textContent += char;
    // Keep typing cadence human without locking the thread.
    await wait(charDelay);
  }
}

async function startHeroLoop() {
  const grid = document.getElementById("hero-grid");
  const textElement = document.getElementById("hero-text");
  const stateLabel = document.getElementById("hero-state-label");

  if (!grid || !textElement || !stateLabel) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    setGridState(grid, "idle");
    updateHeroStateLabel(stateLabel, "Ready", "idle");
    textElement.textContent = HERO_MESSAGES.clean;
    return;
  }

  while (document.body.contains(grid)) {
    if (document.hidden) {
      await wait(320);
      continue;
    }

    setGridState(grid, "idle");
    updateHeroStateLabel(stateLabel, "Idle", "idle");
    textElement.textContent = HERO_MESSAGES.prompt;
    await wait(820);

    setGridState(grid, "listening");
    updateHeroStateLabel(stateLabel, "Listening", "listening");
    await typeText(textElement, HERO_MESSAGES.messy, 18);
    await wait(280);

    setGridState(grid, "processing");
    updateHeroStateLabel(stateLabel, "Processing", "processing");
    await wait(820);

    setGridState(grid, "success");
    updateHeroStateLabel(stateLabel, "Polished", "success");
    textElement.textContent = HERO_MESSAGES.clean;
    await wait(1450);
  }
}

function initThemeToggle() {
  const button = document.getElementById("theme-toggle");
  if (!button) {
    return;
  }

  const root = document.documentElement;
  const stored = window.localStorage.getItem("thinkur-theme");
  if (stored === "dark" || stored === "light") {
    root.setAttribute("data-theme", stored);
  }

  const setButtonLabel = () => {
    const activeTheme = root.getAttribute("data-theme") || "dark";
    button.textContent = activeTheme === "dark" ? "Light" : "Dark";
  };

  setButtonLabel();
  button.addEventListener("click", () => {
    const activeTheme = root.getAttribute("data-theme") || "dark";
    const nextTheme = activeTheme === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", nextTheme);
    window.localStorage.setItem("thinkur-theme", nextTheme);
    setButtonLabel();
  });
}

function swapText(element, text) {
  if (!element) {
    return;
  }

  element.classList.add("is-updating");
  window.setTimeout(() => {
    element.textContent = text;
    element.classList.remove("is-updating");
  }, 120);
}

function setActiveDemoTab(tabs, sampleKey) {
  tabs.forEach((tab) => {
    const active = tab.dataset.sample === sampleKey;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", active ? "true" : "false");
  });
}

function initDemoTabs() {
  const tabs = Array.from(document.querySelectorAll(".demo-tab"));
  const raw = document.getElementById("demo-raw");
  const clean = document.getElementById("demo-clean");
  const container = document.querySelector(".demo-shell");

  if (!tabs.length || !raw || !clean) {
    return;
  }

  let activeKey = "formal";
  let autoCycle = null;
  const order = Object.keys(DEMO_SAMPLES);

  const render = (key) => {
    const sample = DEMO_SAMPLES[key];
    if (!sample) {
      return;
    }
    swapText(raw, sample.raw);
    swapText(clean, sample.clean);
  };

  const startAutoCycle = () => {
    if (autoCycle) {
      window.clearInterval(autoCycle);
    }
    autoCycle = window.setInterval(() => {
      const currentIndex = order.indexOf(activeKey);
      const nextIndex = (currentIndex + 1) % order.length;
      activeKey = order[nextIndex];
      setActiveDemoTab(tabs, activeKey);
      render(activeKey);
    }, 6200);
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const nextKey = tab.dataset.sample;
      if (!nextKey || nextKey === activeKey) {
        return;
      }
      activeKey = nextKey;
      setActiveDemoTab(tabs, activeKey);
      render(activeKey);
      startAutoCycle();
    });
  });

  if (container) {
    container.addEventListener("mouseenter", () => {
      if (autoCycle) {
        window.clearInterval(autoCycle);
      }
    });
    container.addEventListener("mouseleave", startAutoCycle);
  }

  setActiveDemoTab(tabs, activeKey);
  render(activeKey);
  startAutoCycle();
}

function initRevealObserver() {
  const revealElements = Array.from(document.querySelectorAll(".reveal"));
  if (!revealElements.length) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lowComplexityViewport = window.matchMedia("(max-width: 760px)").matches;
  if (!("IntersectionObserver" in window) || reducedMotion || lowComplexityViewport) {
    revealElements.forEach((element) => {
      element.classList.add("is-visible");
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.16
    }
  );

  revealElements.forEach((element) => observer.observe(element));
}

function detectMobileMode() {
  return MOBILE_UA_REGEX.test(navigator.userAgent || "");
}

function openMobileModal() {
  if (!modalElements.modal) {
    return;
  }
  modalElements.modal.classList.remove("hidden");
  modalElements.modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  if (modalElements.email) {
    window.setTimeout(() => modalElements.email.focus(), 60);
  }
}

function resetMobileModal() {
  if (modalElements.form) {
    modalElements.form.reset();
    modalElements.form.classList.remove("hidden");
  }

  if (modalElements.success) {
    modalElements.success.classList.add("hidden");
  }

  if (modalElements.submit) {
    modalElements.submit.disabled = false;
    modalElements.submit.textContent = modalElements.submitLabel;
  }
}

function closeMobileModal() {
  if (!modalElements.modal) {
    return;
  }

  modalElements.modal.classList.add("hidden");
  modalElements.modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  resetMobileModal();
}

async function handleMobileFormSubmit(event) {
  event.preventDefault();

  if (!modalElements.email || !modalElements.submit || !modalElements.form || !modalElements.success) {
    return;
  }

  if (!modalElements.email.checkValidity()) {
    modalElements.email.reportValidity();
    return;
  }

  modalElements.submit.disabled = true;
  modalElements.submit.textContent = "Sending...";
  await wait(700);
  modalElements.form.classList.add("hidden");
  modalElements.success.classList.remove("hidden");
  await wait(1800);
  closeMobileModal();
}

function initMobileModal() {
  modalElements.modal = document.getElementById("mobile-modal");
  modalElements.form = document.getElementById("mobile-form");
  modalElements.success = document.getElementById("mobile-success");
  modalElements.email = document.getElementById("email-input");
  modalElements.submit = document.getElementById("mobile-submit");
  modalElements.submitLabel = modalElements.submit ? modalElements.submit.textContent : "";

  if (!modalElements.modal) {
    return;
  }

  const closeTriggers = Array.from(document.querySelectorAll("[data-close-modal]"));
  closeTriggers.forEach((trigger) => {
    trigger.addEventListener("click", closeMobileModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modalElements.modal.classList.contains("hidden")) {
      closeMobileModal();
    }
  });

  if (modalElements.form) {
    modalElements.form.addEventListener("submit", handleMobileFormSubmit);
  }
}

function initCtas() {
  const ctas = Array.from(document.querySelectorAll(".js-cta"));
  if (!ctas.length) {
    return;
  }

  mobileCtaMode = detectMobileMode();

  ctas.forEach((cta) => {
    const desktopLabel = cta.dataset.desktopLabel || cta.textContent.trim();
    const mobileLabel = cta.dataset.mobileLabel || "Send link to my Mac";
    const desktopHref = cta.dataset.desktopHref || "#pricing";

    if (mobileCtaMode) {
      cta.textContent = mobileLabel;
      cta.setAttribute("href", "#");
    } else {
      cta.textContent = desktopLabel;
      cta.setAttribute("href", desktopHref);
    }

    cta.addEventListener("click", (event) => {
      if (!mobileCtaMode) {
        return;
      }
      event.preventDefault();
      openMobileModal();
    });
  });
}

function initPixelGrids() {
  const grids = Array.from(document.querySelectorAll(".pixel-grid"));
  grids.forEach((grid) => {
    buildPixelGrid(grid);
    setGridState(grid, "idle");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initPixelGrids();
  initThemeToggle();
  initRevealObserver();
  initDemoTabs();
  initMobileModal();
  initCtas();
  startHeroLoop();
});
