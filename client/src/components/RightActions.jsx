import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Import the navigation hook
import ThemeToggle from "./ThemeToggle";
import { Menu, X } from "lucide-react";

const RightActions = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  // Use React Router's navigate hook instead of the passed navigate prop
  const navigate = useNavigate();

  return (
    <div className="flex items-center space-x-4">
      <ThemeToggle />
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/login")}
        className="hidden md:inline-flex text-[var(--text-primary)] hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
      >
        Sign in
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/register")}
        className="hidden md:inline-flex bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 dark:from-primary-600 dark:to-indigo-600 dark:hover:from-primary-700 dark:hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
      >
        Become a Member
      </motion.button>

      {/* Mobile menu button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background)] dark:hover:bg-[var(--surface)]"
      >
        {mobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </motion.button>
    </div>
  );
};

export default RightActions;
