import React from "react";
import { motion } from "framer-motion";

const MemberBenefits = ({ benefits }) => {
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
      id="benefits"
      className="py-24 bg-[var(--surface)]/50 dark:bg-[var(--surface)]/50 backdrop-blur-sm border-t border-b border-[var(--border)]"
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerChildren}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <SectionHeader />
        <BenefitsGrid benefits={benefits} scaleIn={scaleIn} />
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
        Exclusive Member Benefits
      </h2>
      <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto">
        Join BookVerse today and unlock amazing features to enhance your reading
        experience
      </p>
    </motion.div>
  );
};

const BenefitsGrid = ({ benefits, scaleIn }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {benefits.map((benefit, index) => (
        <BenefitCard key={index} benefit={benefit} scaleIn={scaleIn} />
      ))}
    </div>
  );
};

const BenefitCard = ({ benefit, scaleIn }) => {
  return (
    <motion.div
      variants={scaleIn}
      whileHover={{ y: -5, scale: 1.02 }}
      className="relative group bg-[var(--surface)] p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-[var(--border)]"
    >
      <motion.div
        whileHover={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ duration: 0.5 }}
        className="h-12 w-12 bg-gradient-to-r from-primary-100 to-indigo-100 dark:from-primary-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4"
      >
        {benefit.icon}
      </motion.div>
      <h3 className="text-xl font-semibold font-display text-[var(--text-primary)] mb-2">
        {benefit.title}
      </h3>
      <p className="text-[var(--text-secondary)]">{benefit.description}</p>
    </motion.div>
  );
};

export default MemberBenefits;
