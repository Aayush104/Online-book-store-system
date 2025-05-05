// ThemeToggle.js
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme, selectTheme } from "../features/userSlice";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

const ThemeToggle = () => {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [theme]);

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-200"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <MoonIcon className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />
      ) : (
        <SunIcon className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />
      )}
    </button>
  );
};

export default ThemeToggle;
