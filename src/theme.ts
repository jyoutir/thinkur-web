export function initThemeToggle(): void {
  const root = document.documentElement;
  const button = document.getElementById("theme-toggle");
  if (!button) return;

  const storedTheme = localStorage.getItem("theme");
  const queryTheme = new URLSearchParams(location.search).get("theme");
  const initialTheme = queryTheme === "light" || queryTheme === "dark" ? queryTheme : storedTheme;

  if (initialTheme === "light" || initialTheme === "dark") {
    root.setAttribute("data-theme", initialTheme);
    localStorage.setItem("theme", initialTheme);
  }

  const updateLabel = () => {
    const isLight = root.getAttribute("data-theme") === "light";
    button.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
    button.setAttribute("aria-pressed", String(isLight));
  };

  button.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    updateLabel();
  });

  updateLabel();
}
