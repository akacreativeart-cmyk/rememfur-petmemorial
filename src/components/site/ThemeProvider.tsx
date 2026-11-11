import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { MoonStar, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

type Theme = "light" | "dark";
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({ theme: "light", toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem("rememfur:theme"); } catch { /* Storage can be unavailable. */ }
    setTheme(saved === "light" ? "light" : "dark");
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("galaxy-mode", theme === "dark");
  }, [theme]);
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try { localStorage.setItem("rememfur:theme", next); } catch { /* Keep the toggle usable. */ }
  };
  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <div className="theme-content">{children}</div>
    </ThemeContext.Provider>
  );
}

export function ThemeToggle() {
  const { theme, toggle } = useContext(ThemeContext);
  const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
  return <Button variant="ghost" size="icon" className="shrink-0" aria-label={label} title={label} onClick={toggle}>{theme === "dark" ? <Sun /> : <MoonStar />}</Button>;
}