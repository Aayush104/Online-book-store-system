import React from "react";
import { motion } from "framer-motion";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

const HeroSection = ({ navigate, stats }) => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const scaleIn = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/80 to-purple-50/90 dark:from-gray-900/90 dark:via-gray-900/80 dark:to-purple-950/90" />
        <img
          src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2940&auto=format&fit=crop"
          alt="Library"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerChildren}
          className="max-w-3xl"
        >
          <motion.h1
            variants={fadeInUp}
            className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Discover Your Next
            <motion.span
              className="bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent block"
              variants={fadeInUp}
            >
              Great Adventure
            </motion.span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-xl text-gray-600 dark:text-gray-300 mb-8"
          >
            Explore thousands of books from classic literature to modern
            bestsellers. Join our exclusive membership for amazing benefits!
          </motion.p>

          <HeroButtons navigate={navigate} />

          {/* Stats */}
          <StatsList
            stats={stats}
            staggerChildren={staggerChildren}
            scaleIn={scaleIn}
          />
        </motion.div>
      </div>
    </section>
  );
};

const HeroButtons = ({ navigate }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: "easeOut" },
        },
      }}
      className="flex flex-col sm:flex-row gap-4"
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/register")}
        className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        Become a Member
        <ArrowRightIcon className="ml-2 h-5 w-5" />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() =>
          document
            .getElementById("books")
            .scrollIntoView({ behavior: "smooth" })
        }
        className="inline-flex items-center justify-center px-8 py-4 border border-purple-600 dark:border-purple-400 text-base font-medium rounded-lg text-purple-600 dark:text-purple-400 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300"
      >
        Browse Collection
      </motion.button>
    </motion.div>
  );
};

const StatsList = ({ stats, staggerChildren, scaleIn }) => {
  return (
    <motion.div
      variants={staggerChildren}
      className="grid grid-cols-2 sm:grid-cols-4 gap-8 mt-16"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          variants={scaleIn}
          className="text-center"
          whileHover={{ y: -5 }}
        >
          <motion.div
            className="flex items-center justify-center text-purple-600 dark:text-purple-400 mb-2"
            whileHover={{ scale: 1.1 }}
          >
            {stat.icon}
          </motion.div>
          <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
            {stat.value}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {stat.label}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default HeroSection;
