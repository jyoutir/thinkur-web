// ── Feature card stack ────────────────────────────────

class FeatureCardStack {
  private track: HTMLElement;
  private carousel: HTMLElement | null;
  private cards: HTMLElement[];
  private dots: HTMLElement[];
  private activeIndex = 0;
  private total: number;
  private autoTimer: ReturnType<typeof setInterval> | null = null;
  private isDragging = false;
  private isExpanded = false;
  private dragStartX = 0;
  private dragDeltaX = 0;
  private velocity = 0;
  private lastDragX = 0;
  private lastDragTime = 0;
  private isMobile: boolean;
  private reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  private readonly DRAG_THRESHOLD = 50;
  private readonly VELOCITY_THRESHOLD = 0.5;
  private readonly AUTO_INTERVAL = 5000;

  constructor(trackEl: HTMLElement, dotEls: HTMLElement[]) {
    this.track = trackEl;
    this.carousel = trackEl.closest(".feature-carousel");
    this.cards = Array.from(trackEl.querySelectorAll(".feature-card"));
    this.dots = dotEls;
    this.total = this.cards.length;
    this.isMobile = innerWidth <= 960;

    window.addEventListener("resize", () => {
      const was = this.isMobile;
      this.isMobile = innerWidth <= 960;
      if (was !== this.isMobile) this.updatePositions();
    }, { passive: true });

    this.bindEvents();
    this.updatePositions();
    this.updateDots();
    if (!this.reducedMotion) this.startAuto();
  }

  private bindEvents(): void {
    this.cards.forEach((card, i) => {
      card.addEventListener("click", () => {
        if (!this.isDragging && i !== this.activeIndex) this.goTo(i);
      });
    });

    this.dots.forEach((dot) => {
      dot.addEventListener("click", () => this.goTo(Number(dot.dataset.goto)));
    });

    const expandBtn = document.getElementById("feature-expand-btn");
    const closeBtn = document.getElementById("feature-close-btn");
    if (expandBtn) expandBtn.addEventListener("click", () => this.expand());
    if (closeBtn) closeBtn.addEventListener("click", () => this.collapse());

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isExpanded) { this.collapse(); return; }
      if (!this.isInView() && !this.isExpanded) return;
      if (e.key === "ArrowRight") { e.preventDefault(); this.next(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); this.prev(); }
    });

    if (this.carousel) {
      this.carousel.addEventListener("click", (e) => {
        if (this.isExpanded && e.target === this.carousel) this.collapse();
      });
    }

    this.track.addEventListener("pointerdown", (e) => this.onDragStart(e));
    this.track.addEventListener("pointermove", (e) => this.onDragMove(e));
    this.track.addEventListener("pointerup", () => this.onDragEnd());
    this.track.addEventListener("pointercancel", () => this.onDragEnd());

    this.track.addEventListener("scrollend", () => this.syncFromScroll());
    let scrollTimer: ReturnType<typeof setTimeout>;
    this.track.addEventListener("scroll", () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => this.syncFromScroll(), 120);
    }, { passive: true });

    this.track.addEventListener("mouseenter", () => this.pauseAuto());
    this.track.addEventListener("mouseleave", () => this.startAuto());
    this.track.addEventListener("focusin", () => this.pauseAuto());
    this.track.addEventListener("focusout", () => this.startAuto());
  }

  private expand(): void {
    if (!this.carousel) return;
    this.isExpanded = true;
    this.carousel.classList.add("is-expanded");
    this.pauseAuto();
    document.body.style.overflow = "hidden";
    this.cards.forEach((card) => {
      const img = card.querySelector<HTMLImageElement>("img[data-src]");
      if (img) { img.src = img.dataset.src!; img.removeAttribute("data-src"); }
    });
  }

  private collapse(): void {
    if (!this.carousel) return;
    this.isExpanded = false;
    this.carousel.classList.remove("is-expanded");
    document.body.style.overflow = "";
    this.startAuto();
  }

  private onDragStart(e: PointerEvent): void {
    if (this.isMobile) return;
    this.isDragging = true;
    this.dragStartX = e.clientX;
    this.lastDragX = e.clientX;
    this.lastDragTime = performance.now();
    this.velocity = 0;
    this.pauseAuto();
    this.track.setPointerCapture(e.pointerId);
  }

  private onDragMove(e: PointerEvent): void {
    if (!this.isDragging) return;
    const now = performance.now();
    const dt = now - this.lastDragTime;
    this.dragDeltaX = e.clientX - this.dragStartX;
    if (dt > 0) this.velocity = (e.clientX - this.lastDragX) / dt;
    this.lastDragX = e.clientX;
    this.lastDragTime = now;

    const front = this.cards[this.activeIndex];
    if (front) {
      const d = this.dragDeltaX * 0.4;
      front.style.transition = "none";
      front.style.transform = `translateY(0) rotate(${d * 0.02}deg) scale(1) translateX(${d}px)`;
    }
  }

  private onDragEnd(): void {
    if (!this.isDragging) return;
    this.isDragging = false;

    const front = this.cards[this.activeIndex];
    if (front) { front.style.transition = ""; front.style.transform = ""; }

    if (Math.abs(this.dragDeltaX) > this.DRAG_THRESHOLD || Math.abs(this.velocity) > this.VELOCITY_THRESHOLD) {
      if (this.dragDeltaX < 0 || this.velocity < -this.VELOCITY_THRESHOLD) this.next();
      else this.prev();
    } else {
      this.updatePositions();
    }
    this.dragDeltaX = 0;
    this.startAuto();
  }

  private goTo(index: number): void {
    this.activeIndex = ((index % this.total) + this.total) % this.total;
    this.updatePositions();
    this.updateDots();
    this.pauseAuto();
    this.startAuto();
  }

  private next(): void { this.goTo(this.activeIndex + 1); }
  private prev(): void { this.goTo(this.activeIndex - 1); }

  private updatePositions(): void {
    if (this.isMobile) { this.loadActiveGif(); return; }
    this.cards.forEach((card, i) => {
      const offset = ((i - this.activeIndex) % this.total + this.total) % this.total;
      card.dataset.position = String(offset);
      card.style.transform = "";
      card.style.transition = "";
    });
    this.loadActiveGif();
  }

  private loadActiveGif(): void {
    const card = this.cards[this.activeIndex];
    if (!card) return;
    const img = card.querySelector<HTMLImageElement>("img[data-src]");
    if (img) { img.src = img.dataset.src!; img.removeAttribute("data-src"); }
  }

  private updateDots(): void {
    this.dots.forEach((dot, i) => dot.classList.toggle("is-active", i === this.activeIndex));
  }

  private syncFromScroll(): void {
    if (!this.isMobile) return;
    const rect = this.track.getBoundingClientRect();
    const center = rect.left + rect.width / 2;
    let closest = 0, closestDist = Infinity;
    this.cards.forEach((card, i) => {
      const cr = card.getBoundingClientRect();
      const dist = Math.abs(cr.left + cr.width / 2 - center);
      if (dist < closestDist) { closestDist = dist; closest = i; }
    });
    this.activeIndex = closest;
    this.updateDots();
    this.loadActiveGif();
  }

  private startAuto(): void {
    if (this.reducedMotion) return;
    this.pauseAuto();
    this.autoTimer = setInterval(() => this.next(), this.AUTO_INTERVAL);
  }

  private pauseAuto(): void {
    if (this.autoTimer) { clearInterval(this.autoTimer); this.autoTimer = null; }
  }

  private isInView(): boolean {
    const r = this.track.getBoundingClientRect();
    return r.top < innerHeight && r.bottom > 0;
  }
}

// ── Init ──────────────────────────────────────────────

export function initFeatureCards(): void {
  const track = document.querySelector<HTMLElement>("[data-feature-track]");
  const dots = Array.from(document.querySelectorAll<HTMLElement>(".feature-dot"));
  if (!track || !dots.length) return;

  const section = document.querySelector(".section-features");
  if (!section) { new FeatureCardStack(track, dots); return; }

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      new FeatureCardStack(track, dots);
      observer.disconnect();
    }
  }, { threshold: 0.05 });
  observer.observe(section);
}

export function initDemoVideo(): void {
  const video = document.getElementById("demo-video") as HTMLVideoElement | null;
  const btn = document.getElementById("demo-play-btn");
  if (!video || !btn) return;

  const toggle = () => {
    if (video.paused) { video.play(); btn.classList.add("is-hidden"); }
    else { video.pause(); btn.classList.remove("is-hidden"); }
  };

  btn.addEventListener("click", toggle);
  video.addEventListener("click", toggle);
  video.addEventListener("ended", () => btn.classList.remove("is-hidden"));
}
