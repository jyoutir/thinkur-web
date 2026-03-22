import { demoGlow } from "./demo";

// ── Simplex 2D noise ──────────────────────────────────

const SimplexNoise = (() => {
  const F2 = 0.5 * (Math.sqrt(3) - 1);
  const G2 = (3 - Math.sqrt(3)) / 6;
  const grad: [number, number][] = [[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];

  function build(seed: number): Uint8Array {
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

  return function (seed?: number) {
    const perm = build(seed || 42);
    return function noise2D(x: number, y: number): number {
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

// ── Bayer 8x8 dithering matrix ────────────────────────

const BAYER8 = [
  [ 0, 32,  8, 40,  2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44,  4, 36, 14, 46,  6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [ 3, 35, 11, 43,  1, 33,  9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47,  7, 39, 13, 45,  5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21]
] as const;

// ── Cloud background ──────────────────────────────────

export function initCloudBackground(): void {
  const W = 400, H = 240;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  canvas.className = "cloud-canvas";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);

  const ctx = canvas.getContext("2d")!;
  const imgData = ctx.createImageData(W, H);
  const buf32 = new Uint32Array(imgData.data.buffer);
  const noise = SimplexNoise(37);

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lastFrame = 0;

  const bayerFlat = new Float64Array(64);
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      bayerFlat[(r << 3) | c] = BAYER8[r][c] / 64;

  const vertBias = new Float64Array(H);
  for (let y = 0; y < H; y++)
    vertBias[y] = 1.0 - 0.25 * Math.sin((y / H) * Math.PI);

  const cloudField = new Float32Array(W * H);
  let fieldTime = -Infinity;

  let mouseX = -1, mouseY = -1;
  let smoothMouseX = -1, smoothMouseY = -1;
  let hueAccum = 0;
  const HOVER_OUTER = 80;
  const HOVER_OUTER_SQ = HOVER_OUTER * HOVER_OUTER;

  window.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / innerWidth) * W;
    mouseY = (e.clientY / innerHeight) * H;
  }, { passive: true });

  window.addEventListener("mouseleave", () => { mouseX = -1; mouseY = -1; });

  document.addEventListener("touchmove", (e) => {
    const touch = e.touches[0];
    if (touch) {
      mouseX = (touch.clientX / innerWidth) * W;
      mouseY = (touch.clientY / innerHeight) * H;
    }
  }, { passive: true });

  document.addEventListener("touchend", () => { mouseX = -1; mouseY = -1; }, { passive: true });

  let hR = 0, hG = 0, hB = 0;
  function hslCalc(h: number, s: number, l: number): void {
    const a = s * Math.min(l, 1 - l);
    const h12 = h * 12;
    const k0 = (h12) % 12;
    const k8 = (8 + h12) % 12;
    const k4 = (4 + h12) % 12;
    hR = ((l - a * Math.max(-1, Math.min(k0 - 3, 9 - k0, 1))) * 255 + 0.5) | 0;
    hG = ((l - a * Math.max(-1, Math.min(k8 - 3, 9 - k8, 1))) * 255 + 0.5) | 0;
    hB = ((l - a * Math.max(-1, Math.min(k4 - 3, 9 - k4, 1))) * 255 + 0.5) | 0;
  }

  function pack(r: number, g: number, b: number, a: number): number {
    return (a << 24) | (b << 16) | (g << 8) | r;
  }

  function fbmWarp(x: number, y: number): number {
    return noise(x, y) * 0.5 + noise(x * 2, y * 2) * 0.25 + noise(x * 4, y * 4) * 0.125;
  }

  function fbm(x: number, y: number): number {
    return noise(x, y) * 0.5
      + noise(x * 2, y * 2) * 0.25
      + noise(x * 4, y * 4) * 0.125;
  }

  let demoEl: HTMLElement | null = null;

  function updateField(time: number): void {
    const drift = time * 0.000018;
    for (let y = 0; y < H; y++) {
      const bias = vertBias[y];
      const ny = y * 0.006;
      const row = y * W;
      for (let x = 0; x < W; x++) {
        const nx = x * 0.005 + drift;
        const wX = fbmWarp(nx, ny) * 1.1;
        const wY = fbmWarp(nx + 5.2, ny + 1.3) * 1.1;
        let v = fbm(nx + wX, ny + wY);
        v = (v + 0.5) * bias;
        v = v > 0.08 ? (v - 0.08) * 1.0869565217 : 0;
        v = v < 0 ? 0 : v > 1 ? 1 : v;
        v = v * v * (3 - 2 * v);
        v = v * v * (3 - 2 * v);
        cloudField[row + x] = v;
      }
    }
    fieldTime = time;
  }

  function render(time: number): void {
    if (document.hidden) return;
    if (time - fieldTime >= 200) updateField(time);

    const root = document.documentElement;
    const isLight = root.getAttribute("data-theme") === "light";
    const onPacked = isLight ? pack(20, 20, 35, 255) : pack(255, 255, 255, 255);

    if (mouseX >= 0) {
      if (smoothMouseX < 0) { smoothMouseX = mouseX; smoothMouseY = mouseY; }
      const dx = mouseX - smoothMouseX;
      const dy = mouseY - smoothMouseY;
      hueAccum += Math.sqrt(dx * dx + dy * dy) * 0.0015;
      smoothMouseX += dx * 0.55;
      smoothMouseY += dy * 0.55;
    } else {
      smoothMouseX = -1;
      smoothMouseY = -1;
    }

    const hoverActive = smoothMouseX >= 0;
    const hoverSat = isLight ? 0.85 : 0.95;
    const hoverLit = isLight ? 0.45 : 0.58;
    let demoCX = -1, demoCY = -1, demoElapsed = 0;
    const demoPhase = demoGlow.phase;
    const demoActive = demoPhase !== "idle";
    let demoMaxRadSq = 0;
    let demoPacked = 0;

    if (demoActive) {
      if (!demoEl) demoEl = document.getElementById("app-preview");
      if (demoEl) {
        const r = demoEl.getBoundingClientRect();
        demoCX = ((r.left + r.width / 2) / innerWidth) * W;
        demoCY = ((r.top + r.height / 2) / innerHeight) * H;
      }
      demoElapsed = (time - demoGlow.changedAt) / 1000;

      if (demoPhase === "listening") {
        hslCalc(0.38, 0.75, isLight ? 0.42 : 0.58);
        demoMaxRadSq = 4225;
      } else if (demoPhase === "success") {
        hslCalc(0.36, 0.85, isLight ? 0.48 : 0.65);
        const mr = demoElapsed * 130 + 20;
        demoMaxRadSq = mr * mr;
      } else {
        hslCalc(0.58, 0.5, isLight ? 0.45 : 0.6);
        demoMaxRadSq = 1225;
      }
      demoPacked = pack(hR, hG, hB, 255);
    }

    for (let y = 0; y < H; y++) {
      const bayerRow = (y & 7) << 3;
      const rowOffset = y * W;

      for (let x = 0; x < W; x++) {
        const pi = rowOffset + x;
        const threshold = bayerFlat[bayerRow | (x & 7)];

        if (cloudField[pi] > threshold) { buf32[pi] = onPacked; continue; }

        if (hoverActive) {
          const dx = x - smoothMouseX;
          const dy = y - smoothMouseY;
          const distSq = dx * dx + dy * dy;
          if (distSq < HOVER_OUTER_SQ) {
            const dist = Math.sqrt(distSq);
            const glow = Math.min((1 - dist / HOVER_OUTER) ** 2 * 1.4, 0.92);
            if (glow > threshold) {
              const hue = ((Math.atan2(dy, dx) / (Math.PI * 2) + 0.5) + hueAccum) % 1;
              hslCalc(hue, hoverSat, hoverLit);
              buf32[pi] = pack(hR, hG, hB, 255);
              continue;
            }
          }
        }

        if (demoActive && demoCX >= 0) {
          const dx = x - demoCX;
          const dy = y - demoCY;
          const distSq = dx * dx + dy * dy;
          if (distSq < demoMaxRadSq) {
            const dist = Math.sqrt(distSq);
            let intensity = 0;

            if (demoPhase === "listening") {
              const breathRadius = 55 + 10 * Math.sin(demoElapsed * 2.5);
              if (dist < breathRadius) intensity = (1 - dist / breathRadius) ** 2 * 0.7;
            } else if (demoPhase === "success") {
              const distFromRing = Math.abs(dist - demoElapsed * 130);
              if (distFromRing < 20 && demoElapsed < 1.2)
                intensity = (1 - distFromRing / 20) ** 2 * Math.max(0, 1 - demoElapsed / 1.2) * 0.85;
            } else if (dist < 35) {
              intensity = (1 - dist / 35) ** 2 * 0.4 * (0.6 + 0.4 * Math.sin(demoElapsed * 8));
            }

            if (intensity > threshold) { buf32[pi] = demoPacked; continue; }
          }
        }

        buf32[pi] = 0;
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }

  function loop(time: number): void {
    if (document.hidden) { lastFrame = time; requestAnimationFrame(loop); return; }
    if (time - lastFrame >= 100) { lastFrame = time; render(time); }
    requestAnimationFrame(loop);
  }

  render(0);
  if (!reducedMotion) requestAnimationFrame(loop);
}
