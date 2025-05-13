import React, { useState, useEffect } from "react";
import { useToast } from "../components/Toast";

// Import all components
import Header from "../components/Header";
import HeroSection from "../components/Hero";
import MemberBenefits from "../components/MemberBenefits";
import FeaturesSection from "../components/FeaturesSection";
import BooksSection from "../components/BookSection";
import AboutSection from "../components/AboutSection";
import NewsletterSection from "../components/NewsletterSection";
import Footer from "../components/Footer";
import BookDetailsModal from "../components/BookDetailsModal";

// Import icons for stats, features and benefits
import {
  BookOpen,
  Sparkles,
  ShieldCheck,
  Bolt,
  Star,
  Users,
  RotateCcw,
  Truck,
  Bookmark,
  ClipboardList,
  Tag,
  MessageSquare,
  Bell,
  ShoppingCart,
} from "lucide-react";

const Landing = () => {
  // State
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  // Show login prompt for member actions
  const showLoginPrompt = (action) => {
    showToast({
      type: "warning",
      title: "Login Required",
      message: `Please login or register to ${action}`,
      duration: 4000,
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

  // Data for the various sections
  const stats = [
    {
      label: "Books Available",
      value: "10K+",
      icon: <BookOpen className="h-6 w-6" />,
    },
    {
      label: "Active Members",
      value: "50K+",
      icon: <Users className="h-6 w-6" />,
    },
    {
      label: "Authors",
      value: "5K+",
      icon: <Sparkles className="h-6 w-6" />,
    },
    {
      label: "Daily Visitors",
      value: "20K+",
      icon: <Bolt className="h-6 w-6" />,
    },
  ];

  const features = [
    {
      icon: <Truck className="h-6 w-6" />,
      title: "In-Store Pickup",
      description: "Order online and pick up at our store",
    },
    {
      icon: <RotateCcw className="h-6 w-6" />,
      title: "Easy Returns",
      description: "30-day return policy for all items",
    },
    {
      icon: <ShieldCheck className="h-6 w-6" />,
      title: "Secure Payment",
      description: "100% secure payment processing",
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Best Quality",
      description: "Authenticated and quality checked books",
    },
  ];

  const memberBenefits = [
    {
      icon: <Bookmark className="h-6 w-6" />,
      title: "Bookmark Books",
      description:
        "Save your favorite books to your whitelist and track availability",
    },
    {
      icon: <ShoppingCart className="h-6 w-6" />,
      title: "Shopping Cart",
      description: "Add books to cart and manage your orders",
    },
    {
      icon: <ClipboardList className="h-6 w-6" />,
      title: "Order Management",
      description: "Place and cancel orders with ease",
    },
    {
      icon: <Tag className="h-6 w-6" />,
      title: "Exclusive Discounts",
      description: "5% off on 5+ books, 10% stackable discount after 10 orders",
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Write Reviews",
      description: "Share your thoughts and rate purchased books",
    },
    {
      icon: <Bell className="h-6 w-6" />,
      title: "Email Notifications",
      description: "Get order confirmations and claim codes via email",
    },
  ];

  // Mock navigation (to be replaced with actual router navigation in your app)
  const navigate = (path) => {
    showToast({
      type: "info",
      title: "Navigation",
      message: `Navigating to ${path}`,
      duration: 2000,
    });
  };

  // Handle opening the book details modal
  const handleViewBookDetails = (book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  // Handle closing the book details modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] transition-colors duration-200">
      {/* Header/Navigation */}
      <Header
        isScrolled={isScrolled}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        navigate={navigate}
      />

      {/* Main Content - Added extra padding-top to account for fixed navbar */}
      <div className="pt-16">
        {/* Hero Section */}
        <HeroSection navigate={navigate} stats={stats} />

        {/* Member Benefits Section */}
        <MemberBenefits benefits={memberBenefits} />

        {/* Features Section */}
        <FeaturesSection features={features} />

        {/* Books Section - Now uses API endpoints instead of static data */}
        <BooksSection
          onViewDetails={handleViewBookDetails}
          showLoginPrompt={showLoginPrompt}
        />

        {/* About Section */}
        <AboutSection />

        {/* Newsletter Section */}
        <NewsletterSection showLoginPrompt={showLoginPrompt} />
      </div>

      {/* Footer */}
      <Footer />

      {/* Book Details Modal - Only rendered when needed */}
      {selectedBook && (
        <BookDetailsModal
          book={selectedBook}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Landing;
