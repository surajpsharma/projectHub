"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop } from "lucide-react";
import { Button } from "./ui/button";

export function ThemeToggle() {
  const { setTheme } = useTheme();
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        className="h-9 w-9 rounded-md border border-gray-200 dark:border-gray-800 flex items-center justify-center"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 z-50 py-1">
          <button
            onClick={() => {
              setTheme("light");
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Sun className="h-4 w-4" />
            <span>Light</span>
          </button>
          <button
            onClick={() => {
              setTheme("dark");
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Moon className="h-4 w-4" />
            <span>Dark</span>
          </button>
          <button
            onClick={() => {
              setTheme("system");
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Laptop className="h-4 w-4" />
            <span>System</span>
          </button>
        </div>
      )}
    </div>
  );
}
