import React from "react";
import { motion } from "framer-motion";

const AboutSection = () => {
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
    <section
      id="about"
      className="py-24 bg-gradient-to-b from-[var(--surface)] to-primary-50 dark:from-[var(--surface)] dark:to-primary-950/50"
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerChildren}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <AboutContent />
          <AboutImage />
        </div>
      </motion.div>
    </section>
  );
};

const AboutContent = () => {
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
    >
      <h2 className="text-3xl font-bold font-display bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400 bg-clip-text text-transparent mb-6">
        About BookVerse
      </h2>
      <p className="text-lg text-[var(--text-secondary)] mb-6">
        At BookVerse, we believe in the transformative power of reading. Our
        mission is to make the world's best literature accessible to everyone,
        creating a community where readers can discover, share, and celebrate
        great books.
      </p>
      <p className="text-lg text-[var(--text-secondary)] mb-8">
        With our innovative online reservation system and carefully curated
        collection, we're bridging the gap between traditional libraries and
        modern convenience, ensuring that everyone can find their next favorite
        read.
      </p>
      <StatCards />
    </motion.div>
  );
};

const StatCards = () => {
  return (
    <div className="grid grid-cols-2 gap-6">
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-[var(--surface)] p-6 rounded-xl shadow-lg border border-[var(--border)]"
      >
        <div className="text-4xl font-bold font-display bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400 bg-clip-text text-transparent mb-2">
          98%
        </div>
        <div className="text-[var(--text-secondary)]">
          Customer Satisfaction
        </div>
      </motion.div>
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-[var(--surface)] p-6 rounded-xl shadow-lg border border-[var(--border)]"
      >
        <div className="text-4xl font-bold font-display bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400 bg-clip-text text-transparent mb-2">
          24/7
        </div>
        <div className="text-[var(--text-secondary)]">Customer Support</div>
      </motion.div>
    </div>
  );
};

const AboutImage = () => {
  return (
    <motion.div
      variants={{
        hidden: { scale: 0.8, opacity: 0 },
        visible: {
          scale: 1,
          opacity: 1,
          transition: { type: "spring", stiffness: 100, damping: 15 },
        },
      }}
      className="relative"
    >
      <motion.img
        whileHover={{ scale: 1.02 }}
        src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1600&auto=format&fit=crop"
        alt="Library interior"
        className="rounded-lg shadow-xl border border-[var(--border)]"
      />
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute -bottom-6 -left-6 bg-gradient-to-r from-primary-600 to-indigo-600 text-white p-6 rounded-xl shadow-lg max-w-sm"
      >
        <p className="text-lg font-semibold font-display mb-2">
          Join Our Community
        </p>
        <p className="text-sm opacity-90">
          Connect with thousands of readers and share your literary journey.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default AboutSection;
