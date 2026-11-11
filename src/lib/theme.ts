export function toggleTheme(): void {
  const dark = document.documentElement.classList.toggle("dark");
  try {
    localStorage.setItem("theme", dark ? "dark" : "light");
  } catch {
    // storage can be blocked
  }
}
