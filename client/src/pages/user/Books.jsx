import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  Search,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Heart,
  ShoppingCart,
  Star,
} from "lucide-react";
import CartService from "../../services/CartService";
import WishlistService from "../../services/WishlistService";
import { useToast } from "../../components/Toast";

// Direct API URL instead of using BookService
const API_BASE_URL = "https://localhost:7219";

const Books = () => {
  const { showToast } = useToast();

  // State for user
  const [userId, setUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // State for books
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [specialDeals, setSpecialDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for hero carousel
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);

  // Hero slider data
  const heroSlides = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2070&auto=format&fit=crop",
      title: "Discover Your Next Great Read",
      subtitle: "Explore our vast collection of books from all genres",
      ctaText: "Browse Collection",
      ctaLink: "/books",
      color: "from-blue-600/90 to-indigo-800/90",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=2070&auto=format&fit=crop",
      title: "Limited Edition Releases",
      subtitle:
        "Get your hands on exclusive signed copies and special editions",
      ctaText: "View Exclusives",
      ctaLink: "/exclusives",
      color: "from-purple-600/90 to-indigo-800/90",
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=2066&auto=format&fit=crop",
      title: "Summer Reading Sale",
      subtitle: "Up to 40% off on selected titles this season",
      ctaText: "Shop Sale",
      ctaLink: "/deals",
      color: "from-primary-600/90 to-emerald-800/90",
    },
  ];

  // Animation variants
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
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  // Extract user ID from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = token.split(".")[1];
        const decodedPayload = JSON.parse(atob(payload));
        const extractedUserId =
          decodedPayload.UserId || decodedPayload.userId || decodedPayload.sub;
        setUserId(extractedUserId);
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Error parsing token:", error);
      }
    }
  }, []);

  // Fetch wishlist items if user is logged in
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!userId) return;

      try {
        const response = await WishlistService.getMyWishlist();
        if (response.isSuccess && response.data) {
          setWishlistItems(response.data.map((item) => item.bookId));
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
    };

    fetchWishlist();
  }, [userId]);

  // Fetch book data directly using fetch instead of BookService
  useEffect(() => {
    const fetchFeaturedBooks = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/Book/FeaturedBooks`);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch featured books: ${response.statusText}`
          );
        }
        const data = await response.json();
        setFeaturedBooks(data.data || []);
      } catch (err) {
        console.error("Error fetching featured books:", err);
        setFeaturedBooks([]);
      }
    };

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
        setSpecialDeals([]);
      }
    };

    // Call all fetch functions
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);

      try {
        await Promise.all([
          fetchFeaturedBooks(),
          fetchBestSellers(),
          fetchNewReleases(),
          fetchSpecialDeals(),
        ]);
      } catch (err) {
        console.error("Error fetching book data:", err);
        setError("Failed to load books. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Auto-rotate hero slider
  useEffect(() => {
    if (!autoplayEnabled) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [autoplayEnabled, heroSlides.length]);

  // Handle next/prev hero slide
  const goToSlide = (index) => {
    setCurrentSlide(index);
    setAutoplayEnabled(false);
    setTimeout(() => setAutoplayEnabled(true), 10000); // Resume autoplay after 10 seconds
  };

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    goToSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length);
  };

  // Add to cart handler
  const handleAddToCart = async (bookId) => {
    if (!isLoggedIn) {
      showToast({
        type: "info",
        message: "Please login to add items to your cart",
        title: "Authentication Required",
      });
      return;
    }

    try {
      setCartLoading(true);
      const response = await CartService.addToCart(bookId, 1);
      if (response.isSuccess) {
        showToast({
          type: "success",
          message: "Book added to cart successfully!",
          title: "Added to Cart",
        });
      }
    } catch (error) {
      showToast({
        type: "error",
        message: error.message || "Failed to add book to cart",
        title: "Error",
      });
    } finally {
      setCartLoading(false);
    }
  };

  // Add to wishlist handler
  const handleAddToWishlist = async (bookId) => {
    if (!isLoggedIn) {
      showToast({
        type: "info",
        message: "Please login to bookmark books",
        title: "Authentication Required",
      });
      return;
    }

    try {
      setWishlistLoading(true);

      // Check if book is already in wishlist
      const isInWishlist = wishlistItems.includes(bookId);

      if (isInWishlist) {
        // Remove from wishlist
        const response = await WishlistService.removeFromWishlist(bookId);
        if (response.isSuccess) {
          // Update local state
          setWishlistItems(wishlistItems.filter((id) => id !== bookId));
          showToast({
            type: "success",
            message: "Book removed from your bookmarks",
            title: "Removed from Bookmarks",
          });
        }
      } else {
        // Add to wishlist
        const response = await WishlistService.addToWishlist(bookId);
        if (response.isSuccess) {
          // Update local state
          setWishlistItems([...wishlistItems, bookId]);
          showToast({
            type: "success",
            message: "Book added to your bookmarks",
            title: "Bookmarked",
          });
        }
      }
    } catch (error) {
      showToast({
        type: "error",
        message: error.message || "Failed to update bookmarks",
        title: "Error",
      });
    } finally {
      setWishlistLoading(false);
    }
  };

  // Book card component
  const BookCard = ({ book }) => {
    const isBookmarked = wishlistItems.includes(book.bookId);
    const currentPrice =
      book.onSale && book.discountPercentage
        ? (book.price * (1 - book.discountPercentage / 100)).toFixed(2)
        : book.price;

    return (
      <div className="relative group bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden transition-all hover:shadow-lg hover:border-primary-500/30">
        {/* Book cover */}
        <div className="relative aspect-[2/3] bg-[var(--background)]">
          <img
            src={book.bookPhoto || "/api/placeholder/300/450"}
            alt={book.title}
            className="w-full h-full object-cover"
          />

          {/* Sale badge */}
          {book.onSale && book.discountPercentage && (
            <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
              {book.discountPercentage}% OFF
            </div>
          )}

          {/* Quick actions overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddToWishlist(book.bookId);
              }}
              disabled={wishlistLoading}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <Heart
                size={18}
                fill={isBookmarked ? "white" : "none"}
                className="text-white"
              />
            </button>
            <Link
              to={`/user/book/${book.bookId}`}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <Search size={18} className="text-white" />
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddToCart(book.bookId);
              }}
              disabled={cartLoading}
              className="w-10 h-10 rounded-full bg-primary-600 hover:bg-primary-700 flex items-center justify-center transition-colors"
            >
              <ShoppingCart size={18} className="text-white" />
            </button>
          </div>
        </div>

        {/* Book details */}
        <div className="p-4">
          <Link to={`/user/book/${book.bookId}`}>
            <h3 className="font-medium text-[var(--text-primary)] hover:text-primary-600 transition-colors line-clamp-1">
              {book.title}
            </h3>
          </Link>
          <p className="text-sm text-[var(--text-secondary)] line-clamp-1">
            {book.author}
          </p>

          {/* Rating */}
          <div className="flex items-center mt-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < Math.round(book.rating || 4)
                      ? "text-yellow-500"
                      : "text-gray-300"
                  }
                  fill={
                    i < Math.round(book.rating || 4) ? "currentColor" : "none"
                  }
                />
              ))}
              <span className="ml-1 text-xs text-[var(--text-secondary)]">
                ({book.reviewCount || 0})
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[var(--text-primary)]">
                ${currentPrice}
              </span>
              {book.onSale && book.discountPercentage && (
                <span className="text-sm text-[var(--text-secondary)] line-through">
                  ${book.price}
                </span>
              )}
            </div>

            {/* In stock badge */}
            {book.stock > 0 ? (
              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded">
                In Stock
              </span>
            ) : (
              <span className="text-xs px-2 py-0.5 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded">
                Out of Stock
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Book Category Section
  const BookCategorySection = ({ title, subtitle, books, viewAllLink }) => {
    if (!books || books.length === 0) return null;

    // Display max 4 books per section
    const displayBooks = books.slice(0, 4);

    return (
      <section className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              {title}
            </h2>
            <p className="text-[var(--text-secondary)]">{subtitle}</p>
          </div>
          <Link
            to={viewAllLink}
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
          >
            View All <ArrowRightIcon className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayBooks.map((book) => (
            <motion.div
              key={book.bookId}
              variants={scaleIn}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <BookCard book={book} />
            </motion.div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Carousel */}
      <section className="relative">
        <div className="relative h-[500px] md:h-[600px] overflow-hidden">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div
                className={`absolute inset-0 bg-gradient-to-r ${slide.color}`}
              />

              <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl mx-auto px-6 w-full">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={
                      index === currentSlide
                        ? { opacity: 1, y: 0 }
                        : { opacity: 0, y: 30 }
                    }
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-xl text-white"
                  >
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
                      {slide.title}
                    </h1>
                    <p className="text-lg sm:text-xl mb-8 text-white/90">
                      {slide.subtitle}
                    </p>
                    <Link
                      to={slide.ctaLink}
                      className="px-6 py-3 bg-white text-primary-800 font-medium rounded-lg hover:bg-primary-50 transition-colors"
                    >
                      {slide.ctaText}
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          ))}

          {/* Navigation buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors z-10"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors z-10"
          >
            <ChevronRight size={24} />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentSlide
                    ? "w-8 bg-white"
                    : "bg-white/50 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Categories Feature */}
      <section className="py-16 border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center">
            {/* Category 1 */}
            <div className="p-6 bg-[var(--surface)] rounded-lg border border-[var(--border)] hover:border-primary-500/30 hover:shadow-lg transition-all">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Fiction
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Explore imaginative stories
              </p>
            </div>

            {/* Category 2 */}
            <div className="p-6 bg-[var(--surface)] rounded-lg border border-[var(--border)] hover:border-primary-500/30 hover:shadow-lg transition-all">
              <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Non-Fiction
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Expand your knowledge
              </p>
            </div>

            {/* Category 3 */}
            <div className="p-6 bg-[var(--surface)] rounded-lg border border-[var(--border)] hover:border-primary-500/30 hover:shadow-lg transition-all">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Children's
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Books for young readers
              </p>
            </div>

            {/* Category 4 */}
            <div className="p-6 bg-[var(--surface)] rounded-lg border border-[var(--border)] hover:border-primary-500/30 hover:shadow-lg transition-all">
              <div className="w-16 h-16 mx-auto mb-4 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Academic
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Scholarly resources
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Books Sections */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={staggerChildren}
        className="max-w-7xl mx-auto px-4 sm:px-6 py-16"
      >
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-lg">
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* Featured Books Section */}
            <BookCategorySection
              title="Featured Books"
              subtitle="Handpicked selections from our catalogue"
              books={featuredBooks}
              viewAllLink="/books"
            />

            {/* Bestsellers Section */}
            <BookCategorySection
              title="Bestsellers"
              subtitle="Our most popular titles that readers love"
              books={bestSellers}
              viewAllLink="/bestsellers"
            />

            {/* New Releases Section */}
            <BookCategorySection
              title="New Releases"
              subtitle="Hot off the press and ready for your bookshelf"
              books={newReleases}
              viewAllLink="/new-releases"
            />

            {/* Special Deals Section */}
            <BookCategorySection
              title="Special Deals"
              subtitle="Limited-time offers at unbeatable prices"
              books={specialDeals}
              viewAllLink="/deals"
            />
          </>
        )}
      </motion.section>

      {/* Call to Action */}
      <section className="py-16 bg-[var(--surface)] border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
              Join Our Readers Community
            </h2>
            <p className="text-lg text-[var(--text-secondary)] mb-8">
              Subscribe to our newsletter for book recommendations, author
              interviews, and exclusive deals.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Books;
