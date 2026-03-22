import { describe, it, expect, beforeEach } from "vitest";
import { initThemeToggle } from "./theme";

function createToggleButton(): void {
  const btn = document.createElement("button");
  btn.id = "theme-toggle";
  document.body.appendChild(btn);
}

describe("initThemeToggle", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-theme");
    document.body.textContent = "";
    localStorage.clear();
    history.replaceState(null, "", "/");
  });

  it("does nothing when the toggle button is missing", () => {
    initThemeToggle();
    expect(document.documentElement.getAttribute("data-theme")).toBeNull();
  });

  it("sets aria-label to 'Switch to light mode' when theme is dark", () => {
    document.documentElement.setAttribute("data-theme", "dark");
    createToggleButton();
    initThemeToggle();
    const btn = document.getElementById("theme-toggle")!;
    expect(btn.getAttribute("aria-label")).toBe("Switch to light mode");
  });

  it("sets aria-label to 'Switch to dark mode' when theme is light", () => {
    document.documentElement.setAttribute("data-theme", "light");
    createToggleButton();
    initThemeToggle();
    const btn = document.getElementById("theme-toggle")!;
    expect(btn.getAttribute("aria-label")).toBe("Switch to dark mode");
  });

  it("toggles from dark to light on click", () => {
    document.documentElement.setAttribute("data-theme", "dark");
    createToggleButton();
    initThemeToggle();
    document.getElementById("theme-toggle")!.click();
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("toggles from light to dark on click", () => {
    document.documentElement.setAttribute("data-theme", "light");
    createToggleButton();
    initThemeToggle();
    document.getElementById("theme-toggle")!.click();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("updates aria-label after toggling", () => {
    document.documentElement.setAttribute("data-theme", "dark");
    createToggleButton();
    initThemeToggle();
    const btn = document.getElementById("theme-toggle")!;
    btn.click();
    expect(btn.getAttribute("aria-label")).toBe("Switch to dark mode");
  });

  it("updates aria-pressed after toggling", () => {
    document.documentElement.setAttribute("data-theme", "dark");
    createToggleButton();
    initThemeToggle();
    const btn = document.getElementById("theme-toggle")!;
    expect(btn.getAttribute("aria-pressed")).toBe("false");
    btn.click();
    expect(btn.getAttribute("aria-pressed")).toBe("true");
  });

  it("applies stored theme from localStorage", () => {
    localStorage.setItem("theme", "light");
    createToggleButton();
    initThemeToggle();
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("URL param ?theme=light overrides stored dark theme", () => {
    localStorage.setItem("theme", "dark");
    history.replaceState(null, "", "/?theme=light");
    createToggleButton();
    initThemeToggle();
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("URL param ?theme=dark overrides stored light theme", () => {
    localStorage.setItem("theme", "light");
    history.replaceState(null, "", "/?theme=dark");
    createToggleButton();
    initThemeToggle();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("ignores invalid URL param values", () => {
    history.replaceState(null, "", "/?theme=neon");
    createToggleButton();
    initThemeToggle();
    expect(document.documentElement.getAttribute("data-theme")).toBeNull();
  });
});
