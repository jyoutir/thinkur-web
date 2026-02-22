const WORKING_DAYS_PER_MONTH = 22;
const SPEED_MULTIPLIER = 4;
const DEFAULT_WPM = 40;

const DEMO_CONTENT = {
  terminal: {
    context: "Terminal",
    raw: "um can you check the deploy status then restart the worker",
    clean: "Can you check the deploy status, then restart the worker?"
  },
  firefox: {
    context: "Firefox",
    raw: "dear sarah comma thanks for the update period we can ship tuesday",
    clean: "Dear Sarah, thanks for the update. We can ship Tuesday."
  },
  messages: {
    context: "Messages",
    raw: "yeah i'll be there in ten minutes just grabbing coffee",
    clean: "i'll be there in ten minutes, just grabbing coffee."
  },
  slack: {
    context: "Slack",
    raw: "first check logs second restart api third post status",
    clean: "1. Check logs\n2. Restart API\n3. Post status"
  },
  notes: {
    context: "Notes",
    raw: "meeting moved to two thirty pm on march third",
    clean: "Meeting moved to 2:30 PM on March 3rd."
  }
};

function clampNumber(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
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
    wordsDayEl.textContent = new Intl.NumberFormat("en-US").format(wordsPerDay);

    hourlyRateError.hidden = !hasRateError;
  };

  hoursSlider.addEventListener("input", update);
  hourlyRateInput.addEventListener("input", update);
  update();
}

function initDemoContextSwitcher() {
  const buttons = document.querySelectorAll("[data-demo-key]");
  const contextEl = document.getElementById("demo-context");
  const rawEl = document.getElementById("demo-raw");
  const cleanEl = document.getElementById("demo-clean");

  if (!buttons.length || !contextEl || !rawEl || !cleanEl) {
    return;
  }

  const setContext = (key) => {
    const next = DEMO_CONTENT[key];
    if (!next) {
      return;
    }

    buttons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.demoKey === key);
    });

    contextEl.textContent = next.context;
    rawEl.textContent = next.raw;
    cleanEl.textContent = next.clean;
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      setContext(button.dataset.demoKey || "terminal");
    });
  });

  const defaultKey = Array.from(buttons).find((button) => button.classList.contains("is-active"))?.dataset.demoKey;
  setContext(defaultKey || "terminal");
}

document.addEventListener("DOMContentLoaded", () => {
  initDemoContextSwitcher();
  initSavingsCalculator();
});
