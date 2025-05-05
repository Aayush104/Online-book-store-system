import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BookCard from "../components/BookCard";
import ThemeToggle from "../components/ThemeToggle";
import { useToast } from "../components/Toast";
import {
  BookOpenIcon,
  SparklesIcon,
  ShieldCheckIcon,
  BoltIcon,
  StarIcon,
  ArrowRightIcon,
  ShoppingCartIcon,
  Bars3Icon,
  XMarkIcon,
  UserGroupIcon,
  ArrowPathIcon,
  TruckIcon,
  BookmarkIcon,
  ClipboardDocumentListIcon,
  TagIcon,
  ChatBubbleBottomCenterTextIcon,
  BellAlertIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

// Static book data
const staticBooks = [
  {
    bookId: 1,
    title: "The Midnight Library",
    isbn: "978-0735221094",
    description:
      "Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.",
    author: "Matt Haig",
    genre: "Fiction",
    language: "English",
    bookPhoto:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop",
    format: "Hardcover",
    publisher: "Viking",
    publicationDate: new Date("2020-09-29"),
    price: 25.99,
    stock: 150,
    isAvailableInLibrary: true,
    onSale: true,
    discountPercentage: 20,
    discountStartDate: new Date("2024-01-01"),
    discountEndDate: new Date("2024-12-31"),
    exclusiveEdition: "First Edition",
    addedDate: new Date("2024-01-15"),
    rating: 4.5,
    reviewCount: 1250,
  },
  {
    bookId: 2,
    title: "Atomic Habits",
    isbn: "978-0735211292",
    description:
      "No matter your goals, Atomic Habits offers a proven framework for improving--every day. James Clear reveals practical strategies to form good habits.",
    author: "James Clear",
    genre: "Self-Help",
    language: "English",
    bookPhoto:
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800&auto=format&fit=crop",
    format: "Paperback",
    publisher: "Avery",
    publicationDate: new Date("2018-10-16"),
    price: 16.99,
    stock: 200,
    isAvailableInLibrary: true,
    onSale: false,
    discountPercentage: null,
    discountStartDate: null,
    discountEndDate: null,
    exclusiveEdition: null,
    addedDate: new Date("2024-01-10"),
    rating: 4.8,
    reviewCount: 3420,
  },
  {
    bookId: 3,
    title: "The Seven Husbands of Evelyn Hugo",
    isbn: "978-1501161933",
    description:
      "Aging and reclusive Hollywood movie icon Evelyn Hugo is finally ready to tell the truth about her glamorous and scandalous life.",
    author: "Taylor Jenkins Reid",
    genre: "Romance",
    language: "English",
    bookPhoto:
      "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=800&auto=format&fit=crop",
    format: "Paperback",
    publisher: "Atria Books",
    publicationDate: new Date("2017-06-13"),
    price: 14.99,
    stock: 175,
    isAvailableInLibrary: true,
    onSale: true,
    discountPercentage: 15,
    discountStartDate: new Date("2024-02-01"),
    discountEndDate: new Date("2024-03-31"),
    exclusiveEdition: "Book Club Edition",
    addedDate: new Date("2024-01-20"),
    rating: 4.6,
    reviewCount: 2150,
  },
  {
    bookId: 4,
    title: "Dune",
    isbn: "978-0441013593",
    description:
      "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world.",
    author: "Frank Herbert",
    genre: "Science Fiction",
    language: "English",
    bookPhoto:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=800&auto=format&fit=crop",
    format: "Hardcover",
    publisher: "Ace",
    publicationDate: new Date("1965-08-01"),
    price: 29.99,
    stock: 120,
    isAvailableInLibrary: true,
    onSale: false,
    discountPercentage: null,
    discountStartDate: null,
    discountEndDate: null,
    exclusiveEdition: "Deluxe Edition",
    addedDate: new Date("2024-01-05"),
    rating: 4.7,
    reviewCount: 1890,
  },
  {
    bookId: 5,
    title: "Project Hail Mary",
    isbn: "978-0593135204",
    description:
      "Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the earth itself will perish.",
    author: "Andy Weir",
    genre: "Science Fiction",
    language: "English",
    bookPhoto:
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop",
    format: "Hardcover",
    publisher: "Ballantine Books",
    publicationDate: new Date("2021-05-04"),
    price: 27.99,
    stock: 95,
    isAvailableInLibrary: true,
    onSale: true,
    discountPercentage: 10,
    discountStartDate: new Date("2024-02-15"),
    discountEndDate: new Date("2024-03-15"),
    exclusiveEdition: "Signed Edition",
    addedDate: new Date("2024-02-01"),
    rating: 4.9,
    reviewCount: 980,
  },
  {
    bookId: 6,
    title: "The Psychology of Money",
    isbn: "978-0857197689",
    description:
      "Timeless lessons on wealth, greed, and happiness. A book about money, but really about human behavior and psychology.",
    author: "Morgan Housel",
    genre: "Business",
    language: "English",
    bookPhoto:
      "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?q=80&w=800&auto=format&fit=crop",
    format: "Paperback",
    publisher: "Harriman House",
    publicationDate: new Date("2020-09-08"),
    price: 19.99,
    stock: 85,
    isAvailableInLibrary: true,
    onSale: false,
    discountPercentage: null,
    discountStartDate: null,
    discountEndDate: null,
    exclusiveEdition: null,
    addedDate: new Date("2024-01-25"),
    rating: 4.7,
    reviewCount: 2840,
  },
];

// Statistics data
const stats = [
  {
    label: "Books Available",
    value: "10K+",
    icon: <BookOpenIcon className="h-6 w-6" />,
  },
  {
    label: "Active Members",
    value: "50K+",
    icon: <UserGroupIcon className="h-6 w-6" />,
  },
  {
    label: "Authors",
    value: "5K+",
    icon: <SparklesIcon className="h-6 w-6" />,
  },
  {
    label: "Daily Visitors",
    value: "20K+",
    icon: <BoltIcon className="h-6 w-6" />,
  },
];

// Features data
const features = [
  {
    icon: <TruckIcon className="h-6 w-6" />,
    title: "In-Store Pickup",
    description: "Order online and pick up at our store",
  },
  {
    icon: <ArrowPathIcon className="h-6 w-6" />,
    title: "Easy Returns",
    description: "30-day return policy for all items",
  },
  {
    icon: <ShieldCheckIcon className="h-6 w-6" />,
    title: "Secure Payment",
    description: "100% secure payment processing",
  },
  {
    icon: <StarIcon className="h-6 w-6" />,
    title: "Best Quality",
    description: "Authenticated and quality checked books",
  },
];

// Member benefits data
const memberBenefits = [
  {
    icon: <BookmarkIcon className="h-6 w-6" />,
    title: "Bookmark Books",
    description:
      "Save your favorite books to your whitelist and track availability",
  },
  {
    icon: <ShoppingCartIcon className="h-6 w-6" />,
    title: "Shopping Cart",
    description: "Add books to cart and manage your orders",
  },
  {
    icon: <ClipboardDocumentListIcon className="h-6 w-6" />,
    title: "Order Management",
    description: "Place and cancel orders with ease",
  },
  {
    icon: <TagIcon className="h-6 w-6" />,
    title: "Exclusive Discounts",
    description: "5% off on 5+ books, 10% stackable discount after 10 orders",
  },
  {
    icon: <ChatBubbleBottomCenterTextIcon className="h-6 w-6" />,
    title: "Write Reviews",
    description: "Share your thoughts and rate purchased books",
  },
  {
    icon: <BellAlertIcon className="h-6 w-6" />,
    title: "Email Notifications",
    description: "Get order confirmations and claim codes via email",
  },
];

const Landing = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  // Mock navigation and routing functions
  const navigate = (path) => {
    showToast({
      type: "info",
      title: "Navigation",
      message: `Navigation to ${path}`,
      duration: 2000,
    });
  };

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Show login prompt for member actions
  const showLoginPrompt = (action) => {
    showToast({
      type: "warning",
      title: "Login Required",
      message: `Please login or register to ${action}`,
      duration: 4000,
    });
  };

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
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 dark:from-gray-900 dark:to-purple-950 transition-colors duration-500">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <motion.div
              className="flex items-center cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BookOpenIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                BookHaven
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {["Home", "Benefits", "Books", "About"].map((item) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors relative group"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 dark:bg-purple-400 transition-all duration-300 group-hover:w-full" />
                </motion.a>
              ))}
            </div>

            {/* Right side buttons */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/login")}
                className="hidden md:inline-flex text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Sign in
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/register")}
                className="hidden md:inline-flex bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Become a Member
              </motion.button>

              {/* Mobile menu button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-200"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800"
            >
              <div className="px-4 py-2 space-y-1">
                {["Home", "Benefits", "Books", "About"].map((item) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="block px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400"
                    whileHover={{ x: 10 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item}
                  </motion.a>
                ))}
                <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-800">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/login")}
                    className="block w-full text-left px-3 py-2 text-gray-700 dark:text-gray-200"
                  >
                    Sign in
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/register")}
                    className="block w-full text-left px-3 py-2 text-purple-600 dark:text-purple-400"
                  >
                    Become a Member
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/80 to-purple-50/90 dark:from-gray-900/90 dark:via-gray-900/80 dark:to-purple-950/90" />
          <img
            src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2940&auto=format&fit=crop"
            alt="Library"
            className="w-full h-full object-cover"
          />
        </div>

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

            <motion.div
              variants={fadeInUp}
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

            {/* Stats */}
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
          </motion.div>
        </div>
      </section>

      {/* Member Benefits Section */}
      <section
        id="benefits"
        className="py-24 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerChildren}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent mb-4">
              Exclusive Member Benefits
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Join BookHaven today and unlock amazing features to enhance your
              reading experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {memberBenefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                whileHover={{ y: -5, scale: 1.02 }}
                className="relative group bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100 dark:border-purple-900/30"
              >
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="h-12 w-12 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4"
                >
                  {benefit.icon}
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-purple-50 to-white dark:from-purple-950/30 dark:to-gray-900">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerChildren}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent mb-4">
              Why Choose BookHaven?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Your trusted source for quality books and excellent service
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                whileHover={{ y: -5, scale: 1.05 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="h-12 w-12 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4"
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Books Section */}
      <section id="books" className="py-24 bg-white dark:bg-gray-900">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerChildren}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent mb-4">
              Featured Books
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Discover our handpicked selection of must-read books
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {staticBooks.map((book, index) => (
              <motion.div key={book.bookId} variants={scaleIn} custom={index}>
                <BookCard
                  book={book}
                  onViewDetails={(book) => {
                    setSelectedBook(book);
                    setIsModalOpen(true);
                  }}
                  showLoginPrompt={showLoginPrompt}
                />
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeInUp} className="mt-12 text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => showLoginPrompt("browse the full collection")}
              className="inline-flex items-center px-6 py-3 border border-purple-600 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
            >
              View All Books
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="py-24 bg-gradient-to-b from-white to-purple-50 dark:from-gray-900 dark:to-purple-950/50"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerChildren}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeInUp}>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent mb-6">
                About BookHaven
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                At BookHaven, we believe in the transformative power of reading.
                Our mission is to make the world's best literature accessible to
                everyone, creating a community where readers can discover,
                share, and celebrate great books.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                With our innovative online reservation system and carefully
                curated collection, we're bridging the gap between traditional
                libraries and modern convenience, ensuring that everyone can
                find their next favorite read.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-purple-100 dark:border-purple-900/30"
                >
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent mb-2">
                    98%
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">
                    Customer Satisfaction
                  </div>
                </motion.div>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-purple-100 dark:border-purple-900/30"
                >
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent mb-2">
                    24/7
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">
                    Customer Support
                  </div>
                </motion.div>
              </div>
            </motion.div>
            <motion.div variants={scaleIn} className="relative">
              <motion.img
                whileHover={{ scale: 1.02 }}
                src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1600&auto=format&fit=crop"
                alt="Library interior"
                className="rounded-2xl shadow-2xl"
              />
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-6 -left-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-xl shadow-lg max-w-sm"
              >
                <p className="text-lg font-semibold mb-2">Join Our Community</p>
                <p className="text-sm opacity-90">
                  Connect with thousands of readers and share your literary
                  journey.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-700 dark:to-indigo-700">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerChildren}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <motion.div variants={fadeInUp} className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Stay Updated</h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter for the latest book releases,
              exclusive offers, and reading recommendations.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="max-w-md mx-auto"
            >
              <button
                onClick={() => showLoginPrompt("subscribe to our newsletter")}
                className="w-full bg-white text-purple-600 hover:bg-purple-50 px-6 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
              >
                Subscribe to Newsletter
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2 mb-4"
              >
                <BookOpenIcon className="h-8 w-8 text-purple-400" />
                <span className="text-xl font-bold">BookHaven</span>
              </motion.div>
              <p className="text-gray-400 mb-4">
                Your gateway to literary adventures. Discover, read, and share
                amazing books.
              </p>
              <div className="flex space-x-4">
                {["facebook", "twitter", "instagram"].map((social) => (
                  <motion.a
                    key={social}
                    href="#"
                    whileHover={{ y: -3 }}
                    className="text-gray-400 hover:text-purple-400 transition-colors"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {social === "facebook" && (
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      )}
                      {social === "twitter" && (
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      )}
                      {social === "instagram" && (
                        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                      )}
                    </svg>
                  </motion.a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {["Home", "Benefits", "Books", "About"].map((item) => (
                  <motion.li key={item} whileHover={{ x: 5 }}>
                    <a
                      href={`#${item.toLowerCase()}`}
                      className="text-gray-400 hover:text-purple-400 transition-colors"
                    >
                      {item}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Categories</h3>
              <ul className="space-y-2">
                {["Fiction", "Non-Fiction", "Science Fiction", "Romance"].map(
                  (category) => (
                    <motion.li key={category} whileHover={{ x: 5 }}>
                      <a
                        href="#"
                        className="text-gray-400 hover:text-purple-400 transition-colors"
                      >
                        {category}
                      </a>
                    </motion.li>
                  )
                )}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>123 Book Street</li>
                <li>Reading City, RC 12345</li>
                <li>Phone: (555) 123-4567</li>
                <li>Email: info@bookhaven.com</li>
              </ul>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400"
          >
            <p>
              &copy; {new Date().getFullYear()} BookHaven. All rights reserved.
            </p>
          </motion.div>
        </div>
      </footer>

      {/* Book Details Modal */}
      <AnimatePresence>
        {isModalOpen && selectedBook && (
          <BookDetailsModal
            book={selectedBook}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Book Details Modal Component
const BookDetailsModal = ({ book, isOpen, onClose }) => {
  if (!isOpen || !book) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <img
                src={book.bookPhoto}
                alt={book.title}
                className="w-full rounded-lg shadow-lg"
              />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {book.title}
              </h2>

              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                by {book.author}
              </p>

              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIconSolid
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(book.rating)
                        ? "text-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  ({book.reviewCount} reviews)
                </span>
              </div>

              <div className="mb-4">
                {book.discountPercentage ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-purple-600">
                      ${" "}
                      {(
                        book.price *
                        (1 - book.discountPercentage / 100)
                      ).toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      ${book.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-green-600 dark:text-green-400">
                      {book.discountPercentage}% off
                    </span>
                  </div>
                ) : (
                  <span className="text-xl font-bold text-purple-600">
                    ${book.price.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-6">
                <p className="text-sm">
                  <span className="font-medium">ISBN:</span>{" "}
                  <span className="text-gray-600 dark:text-gray-400">
                    {book.isbn}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="font-medium">Format:</span>{" "}
                  <span className="text-gray-600 dark:text-gray-400">
                    {book.format}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="font-medium">Publisher:</span>{" "}
                  <span className="text-gray-600 dark:text-gray-400">
                    {book.publisher}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="font-medium">Genre:</span>{" "}
                  <span className="text-gray-600 dark:text-gray-400">
                    {book.genre}
                  </span>
                </p>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {book.description}
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => onClose()}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  Add to Cart
                </button>
                <button
                  onClick={() => onClose()}
                  className="w-full border border-purple-600 text-purple-600 dark:text-purple-400 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center justify-center gap-2"
                >
                  <BookmarkIcon className="h-5 w-5" />
                  Add to Whitelist
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Landing;
