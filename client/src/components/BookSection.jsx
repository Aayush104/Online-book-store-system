import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRightIcon } from "lucide-react";
import BookCard from "./BookCard";

const API_BASE_URL = "https://localhost:7219";

const BooksSection = ({ onViewDetails, showLoginPrompt }) => {
  const [bestSellers, setBestSellers] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [specialDeals, setSpecialDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Fetch data from APIs
  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/Book/BestSellers`);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch best sellers: ${response.statusText}`
          );
        }
        const data = await response.json();
        setBestSellers(data.data || []);
      } catch (err) {
        console.error("Error fetching best sellers:", err);
        setError(err.message);
        setBestSellers([]);
      }
    };

    const fetchNewReleases = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/Book/NewReleases`);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch new releases: ${response.statusText}`
          );
        }
        const data = await response.json();
        setNewReleases(data.data || []);
      } catch (err) {
        console.error("Error fetching new releases:", err);
        setError(err.message);
        setNewReleases([]);
      }
    };

    const fetchSpecialDeals = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/Book/SpecialDeals`);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch special deals: ${response.statusText}`
          );
        }
        const data = await response.json();
        setSpecialDeals(data.data || []);
      } catch (err) {
        console.error("Error fetching special deals:", err);
        setError(err.message);
        setSpecialDeals([]);
      }
    };

    // Call all fetch functions
    const fetchAllData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchBestSellers(),
        fetchNewReleases(),
        fetchSpecialDeals(),
      ]);
      setIsLoading(false);
    };

    fetchAllData();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <section
        id="books"
        className="py-24 bg-[var(--surface)] border border-[var(--border)] rounded-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold font-display bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400 bg-clip-text text-transparent mb-4">
              Featured Books
            </h2>
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state - only show if we have no books in any category
  if (
    error &&
    !bestSellers?.length &&
    !newReleases?.length &&
    !specialDeals?.length
  ) {
    return (
      <section
        id="books"
        className="py-24 bg-[var(--surface)] border border-[var(--border)] rounded-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold font-display bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400 bg-clip-text text-transparent mb-4">
              Featured Books
            </h2>
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              <p>Sorry, we couldn't load the books. Please try again later.</p>
              <p className="text-sm mt-2">{error}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Check if we have any books to display
  const hasNoBooks =
    (!bestSellers || bestSellers.length === 0) &&
    (!newReleases || newReleases.length === 0) &&
    (!specialDeals || specialDeals.length === 0);

  return (
    <section
      id="books"
      className="py-24 bg-[var(--surface)] border border-[var(--border)] rounded-lg"
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerChildren}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <motion.div variants={fadeInUp} className="text-center mb-16">
          <h2 className="text-3xl font-bold font-display bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400 bg-clip-text text-transparent mb-4">
            Explore Our Collection
          </h2>
          <p className="text-xl text-[var(--text-secondary)]">
            Discover hand-picked books for every reading preference
          </p>
        </motion.div>

        {/* Show message if no books are available */}
        {hasNoBooks && (
          <motion.div variants={fadeInUp} className="text-center py-12">
            <p className="text-[var(--text-secondary)]">
              No books available at the moment. Please check back soon!
            </p>
          </motion.div>
        )}

        {/* Best Sellers Section - Only display if there are books */}
        {bestSellers && bestSellers.length > 0 && (
          <BookCategory
            title="Best Sellers"
            subtitle="Our most popular titles that readers love"
            books={bestSellers}
            viewAllLink="/bestsellers"
            onViewDetails={onViewDetails}
            showLoginPrompt={showLoginPrompt}
            fadeInUp={fadeInUp}
            scaleIn={scaleIn}
          />
        )}

        {/* New Releases Section - Only display if there are books */}
        {newReleases && newReleases.length > 0 && (
          <BookCategory
            title="New Releases"
            subtitle="Hot off the press and ready for your bookshelf"
            books={newReleases}
            viewAllLink="/new-releases"
            onViewDetails={onViewDetails}
            showLoginPrompt={showLoginPrompt}
            fadeInUp={fadeInUp}
            scaleIn={scaleIn}
          />
        )}

        {/* Special Deals Section - Only display if there are books */}
        {specialDeals && specialDeals.length > 0 && (
          <BookCategory
            title="Special Deals"
            subtitle="Limited-time offers at unbeatable prices"
            books={specialDeals}
            viewAllLink="/deals"
            onViewDetails={onViewDetails}
            showLoginPrompt={showLoginPrompt}
            fadeInUp={fadeInUp}
            scaleIn={scaleIn}
          />
        )}
      </motion.div>
    </section>
  );
};

// Book Category Component
const BookCategory = ({
  title,
  subtitle,
  books = [], // Default to empty array to be safe
  viewAllLink,
  onViewDetails,
  showLoginPrompt,
  fadeInUp,
  scaleIn,
}) => {
  // Make sure books is an array
  const booksArray = Array.isArray(books) ? books : [];

  // Display at most 4 books per category
  const displayBooks = booksArray.slice(0, 4);

  return (
    <div className="mb-16">
      <motion.div variants={fadeInUp} className="mb-8">
        <h3 className="text-2xl font-bold font-display text-[var(--text-primary)] mb-2">
          {title}
        </h3>
        <p className="text-[var(--text-secondary)]">{subtitle}</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {displayBooks.map((book, index) => (
          <motion.div key={book.bookId || `book-${index}`} variants={scaleIn}>
            <BookCard
              book={book}
              onViewDetails={onViewDetails}
              showLoginPrompt={showLoginPrompt}
            />
          </motion.div>
        ))}
      </div>

      <motion.div variants={fadeInUp} className="mt-8 text-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => showLoginPrompt(`browse all ${title.toLowerCase()}`)}
          className="inline-flex items-center px-6 py-3 border border-primary-600 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
        >
          View All {title}
          <ArrowRightIcon className="ml-2 h-5 w-5" />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default BooksSection;
