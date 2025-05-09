// ThemeToggle.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";

const ThemeToggle = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(() => {
    if (typeof window !== "undefined") {
      if (localStorage.theme === "dark") return "dark";
      if (localStorage.theme === "light") return "light";
      return "system";
    }
    return "system";
  });

  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initial theme setup
  useEffect(() => {
    // Handle system preference for initial load
    if (currentTheme === "system") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      if (prefersDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
    // Handle explicit user preference
    else if (currentTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Apply theme change
  const applyTheme = (theme) => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else if (theme === "light") {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    } else if (theme === "system") {
      localStorage.removeItem("theme");
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      document.documentElement.classList.toggle("dark", prefersDark);
    }

    setCurrentTheme(theme);
    setIsOpen(false);
  };

  // Listen for system preference changes
  useEffect(() => {
    if (currentTheme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const handleChange = (e) => {
        document.documentElement.classList.toggle("dark", e.matches);
      };

      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
      }
      // Legacy support
      else {
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
      }
    }
  }, [currentTheme]);

  // Check if dark mode is active
  const isDarkMode = () => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Toggle Button - Adapts to Light/Dark mode */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 p-2 rounded-lg border transition-colors duration-200 ${
          isDarkMode()
            ? "bg-neutral-800 text-white border-neutral-700 hover:bg-neutral-700"
            : "bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-100"
        }`}
        aria-label="Select theme"
      >
        {currentTheme === "light" && (
          <SunIcon className="h-5 w-5 text-amber-500" />
        )}
        {currentTheme === "dark" && (
          <MoonIcon className="h-5 w-5 text-purple-500" />
        )}
        {currentTheme === "system" && (
          <ComputerDesktopIcon className="h-5 w-5 text-gray-500" />
        )}
        <span className="text-sm hidden sm:inline capitalize">
          {currentTheme}
        </span>
      </button>

      {/* Dropdown Menu - Always Light Mode */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-neutral-200">
          {/* Light Mode Option */}
          <button
            onClick={() => applyTheme("light")}
            className={`flex items-center w-full px-4 py-2 text-sm text-left text-neutral-800 hover:bg-neutral-100 ${
              currentTheme === "light" ? "bg-neutral-100" : ""
            }`}
          >
            <SunIcon className="h-5 w-5 mr-2 text-amber-500" />
            <span>Light</span>
          </button>

          {/* Dark Mode Option */}
          <button
            onClick={() => applyTheme("dark")}
            className={`flex items-center w-full px-4 py-2 text-sm text-left text-neutral-800 hover:bg-neutral-100 ${
              currentTheme === "dark" ? "bg-neutral-100" : ""
            }`}
          >
            <MoonIcon className="h-5 w-5 mr-2 text-purple-500" />
            <span>Dark</span>
          </button>

          {/* System Option */}
          <button
            onClick={() => applyTheme("system")}
            className={`flex items-center w-full px-4 py-2 text-sm text-left text-neutral-800 hover:bg-neutral-100 ${
              currentTheme === "system" ? "bg-neutral-100" : ""
            }`}
          >
            <ComputerDesktopIcon className="h-5 w-5 mr-2 text-gray-500" />
            <span>System</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
