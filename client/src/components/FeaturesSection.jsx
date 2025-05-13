import React from "react";
import { motion } from "framer-motion";

const FeaturesSection = ({ features }) => {
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
    <section className="py-24 bg-gradient-to-b from-primary-50 to-[var(--surface)] dark:from-primary-950/30 dark:to-[var(--surface)]">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerChildren}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <SectionHeader />
        <FeaturesGrid features={features} scaleIn={scaleIn} />
      </motion.div>
    </section>
  );
};

const SectionHeader = () => {
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
      className="text-center mb-16"
    >
      <h2 className="text-3xl font-bold font-display bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400 bg-clip-text text-transparent mb-4">
        Why Choose BookVerse?
      </h2>
      <p className="text-xl text-[var(--text-secondary)]">
        Your trusted source for quality books and excellent service
      </p>
    </motion.div>
  );
};

const FeaturesGrid = ({ features, scaleIn }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {features.map((feature, index) => (
        <FeatureCard key={index} feature={feature} scaleIn={scaleIn} />
      ))}
    </div>
  );
};

const FeatureCard = ({ feature, scaleIn }) => {
  return (
    <motion.div
      variants={scaleIn}
      whileHover={{ y: -5, scale: 1.05 }}
      className="bg-[var(--surface)] p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-[var(--border)]"
    >
      <motion.div
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.5 }}
        className="h-12 w-12 bg-gradient-to-r from-primary-100 to-indigo-100 dark:from-primary-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4"
      >
        {feature.icon}
      </motion.div>
      <h3 className="text-xl font-semibold font-display text-[var(--text-primary)] mb-2">
        {feature.title}
      </h3>
      <p className="text-[var(--text-secondary)]">{feature.description}</p>
    </motion.div>
  );
};

export default FeaturesSection;
