import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Import the navigation hook
import DesktopNav from "./DesktopNav";
import MobileMenu from "./MobileMenu";
import RightActions from "./RightActions";
import { useSelector } from "react-redux";
import { selectTheme } from "../features/userSlice";

// Import logo images directly from assets
import darkLogo from "../assets/dark.png";
import lightLogo from "../assets/light.png";

const Header = ({ isScrolled, mobileMenuOpen, setMobileMenuOpen }) => {
  const navigate = useNavigate(); // Use React Router's navigate hook
  const theme = useSelector(selectTheme);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Update isDarkMode state whenever theme changes or on initial render
  useEffect(() => {
    if (typeof document !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    }
  }, [theme]);

  // Add MutationObserver to track DOM changes for theme
  useEffect(() => {
    if (typeof document !== "undefined" && window.MutationObserver) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.type === "attributes" &&
            mutation.attributeName === "class"
          ) {
            setIsDarkMode(document.documentElement.classList.contains("dark"));
          }
        });
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });

      return () => {
        observer.disconnect();
      };
    }
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-transparent backdrop-blur-sm shadow-lg"
          : "bg-transparent"
      }`}
      style={{ position: "fixed", top: 0, left: 0, right: 0 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Logo isDarkMode={isDarkMode} />

          {/* Desktop Navigation */}
          <DesktopNav />

          {/* Right side buttons - Now we don't pass navigate, it uses useNavigate internally */}
          <RightActions
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />
        </div>
      </div>

      {/* Mobile menu - Also should use useNavigate internally */}
      <MobileMenu isOpen={mobileMenuOpen} />
    </motion.nav>
  );
};

// Logo Component
const Logo = ({ isDarkMode }) => {
  const navigate = useNavigate(); // Use React Router's navigate hook

  return (
    <motion.div
      className="flex items-center cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate("/")} // Navigate to home page when logo is clicked
    >
      <div className="flex items-center">
        {/* Use the appropriate logo based on theme */}
        <img
          src={isDarkMode ? lightLogo : darkLogo}
          alt="BookVerse Logo"
          className="h-10"
        />
      </div>
    </motion.div>
  );
};

export default Header;
