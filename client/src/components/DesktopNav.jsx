import React from "react";
import { motion } from "framer-motion";

const DesktopNav = () => {
  const navItems = ["Home", "Benefits", "Books", "About"];

  return (
    <div className="hidden md:flex items-center space-x-8">
      {navItems.map((item) => (
        <motion.a
          key={item}
          href={`#${item.toLowerCase()}`}
          className="text-[var(--text-primary)] hover:text-primary-600 dark:hover:text-primary-400 transition-colors relative group font-medium"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          {item}
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 transition-all duration-300 group-hover:w-full" />
        </motion.a>
      ))}
    </div>
  );
};

export default DesktopNav;
