import React from "react";
import { motion } from "framer-motion";

const NewsletterSection = ({ showLoginPrompt }) => {
  return (
    <section className="py-24 bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-700 dark:to-indigo-700 border-t border-b border-primary-500 dark:border-primary-800">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.3,
            },
          },
        }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.6, ease: "easeOut" },
            },
          }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold font-display text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter for the latest book releases, exclusive
            offers, and reading recommendations.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="max-w-md mx-auto"
          >
            <button
              onClick={() => showLoginPrompt("subscribe to our newsletter")}
              className="w-full bg-white text-primary-600 hover:bg-primary-50 px-6 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
            >
              Subscribe to Newsletter
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default NewsletterSection;
