import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Heart,
  Search,
  User,
  Library,
  Menu,
  X,
  LogOut,
  Settings,
  Package,
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import Footer from "../components/Footer";
import { Outlet } from "react-router";

const UserLayout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlistCount, setWishlistCount] = useState(15);
  const [cartCount, setCartCount] = useState(2);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Mock user data (this would come from your auth system)
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "/api/placeholder/40/40",
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleSearch = () => {
    // Search functionality would be implemented here
    console.log("Searching for:", searchQuery);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleLogout = () => {
    // Clear local storage and redirect to login
    localStorage.clear();
    window.location.href = "/login";
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest(".user-dropdown")) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
      {/* Navbar */}
      <header className="bg-white dark:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-700 sticky top-0 z-50">
        <div className="mx-auto px-3 sm:px-4 py-2 max-w-[85vw]">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center">
              <a href="/" className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-emerald-600 rounded-lg text-white">
                  <Library size={20} />
                </div>
                <div className="ml-2">
                  <span className="font-bold text-xl text-black dark:text-white">
                    BookHaven
                  </span>
                  <span className="block text-[10px] text-neutral-500 dark:text-neutral-400 -mt-1">
                    Book store website
                  </span>
                </div>
              </a>
            </div>

            {/* Search Bar */}
            <div className="hidden md:block flex-1 max-w-2xl mx-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search over 30 million book titles"
                  className="w-full pl-4 pr-10 py-2 rounded-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  onClick={handleSearch}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  <Search size={18} />
                </button>
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <div className="hidden md:block">
                <ThemeToggle />
              </div>

              {/* Wishlist */}
              <a
                href="/user/whitelist"
                className="relative p-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </a>

              {/* Cart */}
              <a
                href="/user/cart"
                className="relative p-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </a>

              {/* User Profile Dropdown */}
              <div className="hidden md:block relative user-dropdown">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center focus:outline-none"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-neutral-200 dark:border-neutral-700">
                    <img
                      src={user.avatar}
                      alt="User avatar"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
                      <a
                        href="/user/settings"
                        className="block hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg p-2 -m-2 transition-colors"
                      >
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">
                          {user.name}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {user.email}
                        </p>
                      </a>
                    </div>

                    {/* Profile Actions */}
                    <div className="px-2 py-2">
                      <a
                        href="/user/orders"
                        className="flex items-center px-2 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md transition-colors"
                      >
                        <Package
                          size={18}
                          className="mr-3 text-neutral-500 dark:text-neutral-400"
                        />
                        My Orders
                      </a>

                      <a
                        href="/user/settings"
                        className="flex items-center px-2 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md transition-colors"
                      >
                        <Settings
                          size={18}
                          className="mr-3 text-neutral-500 dark:text-neutral-400"
                        />
                        Settings
                      </a>

                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-2 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md transition-colors"
                      >
                        <LogOut size={18} className="mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden text-neutral-600 dark:text-neutral-300 focus:outline-none"
                onClick={toggleMenu}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden mt-2 mb-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search over 30 million book titles"
                className="w-full pl-4 pr-10 py-2 rounded-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={handleSearch}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                <Search size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 absolute w-full left-0 shadow-lg">
            {/* User Info (Mobile) */}
            <div className="flex items-center p-4 border-b border-neutral-200 dark:border-neutral-700">
              <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-neutral-200 dark:border-neutral-700">
                <img
                  src={user.avatar}
                  alt="User avatar"
                  className="h-full w-full object-cover"
                />
              </div>
              <a href="/user/settings" className="ml-3">
                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                  {user.name}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {user.email}
                </p>
              </a>
              <div className="ml-auto">
                <ThemeToggle />
              </div>
            </div>

            {/* Navigation Categories */}
            <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
              <h3 className="font-medium text-sm text-neutral-500 dark:text-neutral-400 uppercase mb-2">
                Categories
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="/fiction"
                  className="py-2 px-3 bg-neutral-100 dark:bg-neutral-700 rounded-lg text-sm text-neutral-700 dark:text-neutral-200"
                >
                  Fiction
                </a>
                <a
                  href="/non-fiction"
                  className="py-2 px-3 bg-neutral-100 dark:bg-neutral-700 rounded-lg text-sm text-neutral-700 dark:text-neutral-200"
                >
                  Non-Fiction
                </a>
                <a
                  href="/sci-fi"
                  className="py-2 px-3 bg-neutral-100 dark:bg-neutral-700 rounded-lg text-sm text-neutral-700 dark:text-neutral-200"
                >
                  Sci-Fi
                </a>
                <a
                  href="/mystery"
                  className="py-2 px-3 bg-neutral-100 dark:bg-neutral-700 rounded-lg text-sm text-neutral-700 dark:text-neutral-200"
                >
                  Mystery
                </a>
                <a
                  href="/biography"
                  className="py-2 px-3 bg-neutral-100 dark:bg-neutral-700 rounded-lg text-sm text-neutral-700 dark:text-neutral-200"
                >
                  Biography
                </a>
                <a
                  href="/history"
                  className="py-2 px-3 bg-neutral-100 dark:bg-neutral-700 rounded-lg text-sm text-neutral-700 dark:text-neutral-200"
                >
                  History
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
              <h3 className="font-medium text-sm text-neutral-500 dark:text-neutral-400 uppercase mb-2">
                Quick Links
              </h3>
              <nav className="space-y-2">
                <a
                  href="/books"
                  className="block py-2 text-neutral-700 dark:text-neutral-200"
                >
                  All Books
                </a>
                <a
                  href="/bestsellers"
                  className="block py-2 text-neutral-700 dark:text-neutral-200"
                >
                  Bestsellers
                </a>
                <a
                  href="/new-releases"
                  className="block py-2 text-neutral-700 dark:text-neutral-200"
                >
                  New Releases
                </a>
                <a
                  href="/deals"
                  className="block py-2 text-neutral-700 dark:text-neutral-200"
                >
                  Deals & Discounts
                </a>
              </nav>
            </div>

            {/* Account Links */}
            <div className="px-4 py-3">
              <h3 className="font-medium text-sm text-neutral-500 dark:text-neutral-400 uppercase mb-2">
                Account
              </h3>
              <nav className="space-y-2">
                <a
                  href="/user/settings"
                  className="flex items-center py-2 text-neutral-700 dark:text-neutral-200"
                >
                  <Settings size={18} className="mr-3 text-neutral-500" />
                  Settings
                </a>
                <a
                  href="/user/orders"
                  className="flex items-center py-2 text-neutral-700 dark:text-neutral-200"
                >
                  <Package size={18} className="mr-3 text-neutral-500" />
                  My Orders
                </a>
                <a
                  href="/user/whitelist"
                  className="flex items-center py-2 text-neutral-700 dark:text-neutral-200"
                >
                  <Heart size={18} className="mr-3 text-neutral-500" />
                  Wishlist
                  {wishlistCount > 0 && (
                    <span className="ml-2 bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </a>
                <a
                  href="/user/cart"
                  className="flex items-center py-2 text-neutral-700 dark:text-neutral-200"
                >
                  <ShoppingCart size={18} className="mr-3 text-neutral-500" />
                  Cart
                  {cartCount > 0 && (
                    <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {cartCount}
                    </span>
                  )}
                </a>
                <button
                  onClick={handleLogout}
                  className="flex items-center py-2 text-red-600 dark:text-red-400 w-full"
                >
                  <LogOut size={18} className="mr-3" />
                  Logout
                </button>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto px-3 sm:px-4 py-6 max-w-7xl">
        <Outlet />
      </main>

      {/* Footer Component */}
      <Footer />
    </div>
  );
};

export default UserLayout;
