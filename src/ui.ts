// ── Savings calculator ────────────────────────────────

const WORKING_DAYS_PER_MONTH = 21;
const TYPING_WPM = 45;
const PROJECTED_DICTATION_WPM = 110;

export function computeSavings(hoursTypingPerDay: number, hourlyRate: number) {
  const wordsPerDay = Math.round(hoursTypingPerDay * 60 * TYPING_WPM);
  const projectedDictationHours = (wordsPerDay / PROJECTED_DICTATION_WPM) / 60;
  const dailyHoursSaved = Math.max(0, hoursTypingPerDay - projectedDictationHours);
  const monthlyHoursSaved = dailyHoursSaved * WORKING_DAYS_PER_MONTH;
  const monthlySavings = monthlyHoursSaved * hourlyRate;
  return { monthlySavings, monthlyHoursSaved, wordsPerDay };
}

export function initSavingsCalculator(): void {
  const hoursSlider = document.getElementById("typing-hours") as HTMLInputElement | null;
  const hoursLabel = document.getElementById("typing-hours-label");
  const hourlyRateInput = document.getElementById("hourly-rate") as HTMLInputElement | null;
  const monthlySavingsEl = document.getElementById("monthly-savings");
  const hoursSavedEl = document.getElementById("hours-saved");
  const wordsDayEl = document.getElementById("words-day");

  if (!hoursSlider || !monthlySavingsEl || !hoursSavedEl || !wordsDayEl) return;

  const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const numFmt = new Intl.NumberFormat("en-US");

  const update = () => {
    const hoursTypingPerDay = Math.min(Math.max(Number(hoursSlider.value) || 2, 0.5), 8);
    const parsedRate = Number(hourlyRateInput?.value);
    const hourlyRate = Math.min(Math.max(Number.isFinite(parsedRate) && parsedRate > 0 ? parsedRate : 30, 1), 100000);
    const { monthlySavings, monthlyHoursSaved, wordsPerDay } = computeSavings(hoursTypingPerDay, hourlyRate);

    if (hoursLabel) hoursLabel.textContent = `${hoursTypingPerDay.toFixed(0)}h`;
    monthlySavingsEl.textContent = fmt.format(monthlySavings);
    hoursSavedEl.textContent = `${Math.round(monthlyHoursSaved)} hours`;
    wordsDayEl.textContent = numFmt.format(wordsPerDay);
  };

  hoursSlider.addEventListener("input", update);
  hourlyRateInput?.addEventListener("input", update);
  update();
}

// ── Download buttons ─────────────────────────────────

export function initDownloadButtons(): void {
  let dmgUrl: string | null = null;

  document.querySelectorAll("[data-download]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      if (dmgUrl) { location.href = dmgUrl; return; }

      const fallback = "https://github.com/jyoutir/thinkur-web/releases/latest";
      try {
        const res = await fetch("https://api.github.com/repos/jyoutir/thinkur-web/releases/latest");
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        const asset = data.assets.find((a: { name: string }) => a.name.endsWith(".dmg"));
        if (asset?.browser_download_url) {
          dmgUrl = asset.browser_download_url;
          location.href = dmgUrl!;
        } else {
          location.href = fallback;
        }
      } catch {
        location.href = fallback;
      }
    });
  });
}

// ── GitHub stars ──────────────────────────────────────

export async function initGitHubStars(): Promise<void> {
  const badges = document.querySelectorAll("[data-github-stars]");
  if (!badges.length) return;

  const CACHE_KEY = "thinkur_stars";
  const CACHE_TTL = 3600000;
  const fmt = new Intl.NumberFormat("en-US");
  const setAll = (text: string) => badges.forEach((b) => { b.textContent = text; });

  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
    if (cached.count && Date.now() - cached.ts < CACHE_TTL) {
      setAll(`(${fmt.format(cached.count)})`);
      return;
    }
  } catch {}

  try {
    const res = await fetch("https://api.github.com/repos/jyoutir/thinkur");
    if (!res.ok) return;
    const data = await res.json();
    if (data.stargazers_count > 0) {
      setAll(`(${fmt.format(data.stargazers_count)})`);
      localStorage.setItem(CACHE_KEY, JSON.stringify({ count: data.stargazers_count, ts: Date.now() }));
    }
  } catch {}
}

// ── GitHub downloads ─────────────────────────────────

export async function initGitHubDownloads(): Promise<void> {
  const badges = document.querySelectorAll("[data-github-downloads]");
  if (!badges.length) return;

  const CACHE_KEY = "thinkur_downloads";
  const CACHE_TTL = 3600000;
  const fmt = new Intl.NumberFormat("en-US");
  const setAll = (text: string) => badges.forEach((b) => { b.textContent = text; });

  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
    if (cached.count != null && Date.now() - cached.ts < CACHE_TTL) {
      setAll(`${fmt.format(cached.count)}+ downloads`);
      return;
    }
  } catch {}

  try {
    const res = await fetch("https://api.github.com/repos/jyoutir/thinkur-web/releases");
    if (!res.ok) return;
    const releases = await res.json();
    let total = 0;
    for (const release of releases) {
      for (const asset of release.assets || []) {
        total += asset.download_count || 0;
      }
    }
    if (total > 0) {
      setAll(`${fmt.format(total)}+ downloads`);
      localStorage.setItem(CACHE_KEY, JSON.stringify({ count: total, ts: Date.now() }));
    }
  } catch {}
}

// ── App marquee ──────────────────────────────────────

export function initAppMarquee(): void {
  const marquee = document.querySelector(".app-marquee");
  const track = marquee?.querySelector(".app-track");
  const lane = track?.querySelector(".app-lane");
  if (!marquee || !track || !lane) return;
  if (track.querySelector(".app-lane.is-clone")) return;

  const clone = lane.cloneNode(true) as HTMLElement;
  clone.classList.add("is-clone");
  clone.setAttribute("aria-hidden", "true");
  track.append(clone);

  const syncWidth = () => {
    const firstLane = track.querySelector(".app-lane");
    if (!firstLane) return;
    const laneWidth = Math.ceil(firstLane.getBoundingClientRect().width + 12);
    (track as HTMLElement).style.setProperty("--lane-width", `${laneWidth}px`);
  };

  syncWidth();
  requestAnimationFrame(syncWidth);
  window.addEventListener("resize", syncWidth, { passive: true });
}

// ── Scroll reveal ────────────────────────────────────

export function initScrollReveal(): void {
  const els = document.querySelectorAll(".animate-in");
  if (!els.length) return;

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
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

// ── Easter egg ───────────────────────────────────────

export function initTabEasterEgg(): void {
  const tab = document.querySelector("[data-easter-tab]") as HTMLElement | null;
  if (!tab) return;

  let active = false;
  const phrases = [
    "Hey, you found the easter egg!",
    "thinkur turns your voice into text like this.",
    "No cloud. No subscription. Just your Mac.",
    "4x faster than typing. Try it.",
    "This is what dictation feels like.",
  ];

  tab.addEventListener("click", () => {
    if (active) return;
    active = true;
    tab.style.transform = "scale(0.92)";
    setTimeout(() => (tab.style.transform = ""), 120);

    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    const bubble = document.createElement("div");
    bubble.className = "easter-bubble";
    bubble.textContent = "";
    tab.parentElement!.appendChild(bubble);

    requestAnimationFrame(() => bubble.classList.add("is-visible"));

    let i = 0;
    const type = () => {
      if (i < phrase.length) {
        bubble.textContent = phrase.slice(0, ++i);
        setTimeout(type, 28 + Math.random() * 32);
      } else {
        setTimeout(() => {
          bubble.classList.remove("is-visible");
          setTimeout(() => { bubble.remove(); active = false; }, 300);
        }, 2000);
      }
    };
    type();
  });
}
