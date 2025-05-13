import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Import the navigation hook

const MobileMenu = ({ isOpen }) => {
  const navigate = useNavigate(); // Use React Router's navigate hook
  const navItems = ["Home", "Benefits", "Books", "About"];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-transparent backdrop-blur-lg"
        >
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="block px-3 py-2 text-[var(--text-primary)] hover:text-primary-600 dark:hover:text-primary-400 hover:bg-[var(--background)]/20"
                whileHover={{ x: 10 }}
                whileTap={{ scale: 0.95 }}
              >
                {item}
              </motion.a>
            ))}
            <div className="pt-4 pb-3 border-t border-[var(--border)]/20">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/login")} // Use the navigate function
                className="block w-full text-left px-3 py-2 text-[var(--text-primary)] hover:text-primary-600 dark:hover:text-primary-400 hover:bg-[var(--background)]/20"
              >
                Sign in
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/register")} // Use the navigate function
                className="block w-full text-left px-3 py-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50/20 dark:hover:bg-primary-900/20 rounded-md mt-2 font-medium"
              >
                Become a Member
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
