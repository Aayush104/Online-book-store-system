import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import ThemeToggle from "../components/ThemeToggle";
import {
  BookOpen,
  ShoppingBag,
  BarChart3,
  Clock,
  CheckCircle,
  Search,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Package,
  List,
  Settings,
} from "lucide-react";
import { selectTheme, logoutUser } from "../features/userSlice";

const StaffLayout = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [greeting, setGreeting] = useState("");
  const theme = useSelector(selectTheme);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [unreadNotifications, setUnreadNotifications] = useState(3);

  // Update isDarkMode state whenever theme changes
  useEffect(() => {
    if (typeof document !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    }
  }, [theme]);

  // Add MutationObserver to track DOM changes for theme
  useEffect(() => {
    if (typeof document !== "undefined" && window.MutationObserver) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.type === "attributes" &&
            mutation.attributeName === "class"
          ) {
            setIsDarkMode(document.documentElement.classList.contains("dark"));
          }
        });
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });

      return () => {
        observer.disconnect();
      };
    }
  }, []);

  // Get user from Redux store
  const user = useSelector((state) => state.user?.currentUser) || {
    name: "Staff User",
    role: "Staff Member",
  };

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good Morning");
    } else if (hour < 18) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    window.location.href = "/login";
  };

  // Handle search for claim code
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to orders page with search term
      window.location.href = `/staff/orders?search=${encodeURIComponent(
        searchTerm
      )}`;
    }
  };

  // Navigation items - staff specific (removed Book Inventory, Schedule, Help Center)
  const navItems = [
    {
      name: "Dashboard",
      path: "/staff",
      icon: <BarChart3 size={20} />,
      exact: true,
    },
    {
      name: "Orders",
      path: "/staff/orders",
      icon: <ShoppingBag size={20} />,
      exact: false,
    },
    {
      name: "Settings",
      path: "/staff/settings",
      icon: <Settings size={20} />,
      exact: false,
    },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const getCurrentPageTitle = () => {
    const currentPath = location.pathname;
    if (currentPath === "/staff") return "Dashboard";
    if (currentPath.includes("/staff/orders/pending")) return "Pending Orders";
    if (currentPath.includes("/staff/orders/fulfilled"))
      return "Fulfilled Orders";
    if (currentPath.includes("/staff/orders")) return "Orders";
    if (currentPath.includes("/staff/settings")) return "Settings";
    return "Staff Portal";
  };

  // Get current date in readable format
  const getCurrentDate = () => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date().toLocaleDateString(undefined, options);
  };

  // Stats for quick actions - updated for better relevance
  const stats = [
    {
      name: "Pending Pickups",
      value: 12,
      icon: <Clock className="h-5 w-5 text-warning-500" />,
    },
    {
      name: "Processed Today",
      value: 24,
      icon: <CheckCircle className="h-5 w-5 text-success-500" />,
    },
    {
      name: "Orders This Week",
      value: 87,
      icon: <ShoppingBag className="h-5 w-5 text-primary-500" />,
    },
  ];

  // Improved function to check if a path is active
  const isPathActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  return (
    <div className="min-h-screen w-full bg-[var(--background)] text-[var(--text-primary)] transition-colors duration-200">
      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={toggleMobileMenu}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} 
          ${collapsed ? "w-20" : "w-64"} 
          fixed inset-y-0 left-0 z-30 lg:translate-x-0
          transition-all duration-300 ease-in-out 
          ${
            isDarkMode
              ? "bg-[#21242c] border-r border-neutral-700"
              : "bg-white border-r border-neutral-200"
          }
          flex flex-col h-screen
        `}
      >
        {/* Logo & App Name */}
        <div
          className={`h-16 flex items-center px-4 ${
            isDarkMode
              ? "border-b border-neutral-700"
              : "border-b border-neutral-200"
          }`}
        >
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <BookOpen size={20} className="text-white" />
          </div>
          {!collapsed && (
            <div className="ml-3">
              <div
                className={`text-base font-display font-bold ${
                  isDarkMode ? "text-white" : "text-neutral-900"
                }`}
              >
                BookHaven
              </div>
              <div className="text-xs text-primary-600 dark:text-primary-400">
                Staff Portal
              </div>
            </div>
          )}
          <button className="ml-auto lg:hidden" onClick={toggleMobileMenu}>
            <X size={20} className="text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* Quick search for claim codes - Enhanced with better styling */}
        {!collapsed && (
          <div className="px-4 py-3">
            <form onSubmit={handleSearch}>
              <label
                htmlFor="claimCodeSearch"
                className="block text-xs font-medium mb-1 text-[var(--text-secondary)]"
              >
                Quick Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search
                    size={16}
                    className={
                      isDarkMode ? "text-neutral-500" : "text-neutral-400"
                    }
                  />
                </div>
                <input
                  id="claimCodeSearch"
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter claim code..."
                  className={`
                    block w-full pl-10 pr-3 py-2 border rounded-lg text-sm
                    ${
                      isDarkMode
                        ? "bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500 focus:ring-primary-500 focus:border-primary-500"
                        : "bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:ring-primary-500 focus:border-primary-500"
                    }
                  `}
                />
              </div>
              <div className="mt-1 text-xs text-[var(--text-secondary)]">
                Find orders by claim code instantly
              </div>
            </form>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path} className="space-y-1">
                <NavLink
                  to={item.path}
                  end={item.exact}
                  onClick={() => setMobileMenuOpen(false)}
                  className={
                    isPathActive(item.path, item.exact)
                      ? `flex items-center p-3 rounded-lg transition-colors text-sm font-medium
                         bg-primary-600 text-white`
                      : `flex items-center p-3 rounded-lg transition-colors text-sm font-medium
                         ${
                           isDarkMode
                             ? "text-gray-400 hover:bg-neutral-700 hover:text-white"
                             : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                         }`
                  }
                >
                  <span className={`${collapsed ? "mx-auto" : "mr-3"}`}>
                    {item.icon}
                  </span>
                  {!collapsed && <span className="flex-1">{item.name}</span>}

                  {/* Badge for orders count */}
                  {!collapsed && item.name === "Orders" && (
                    <span className="px-2 py-0.5 ml-auto text-xs rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                      12
                    </span>
                  )}
                </NavLink>

                {/* Sub items - only render if not collapsed and item has subitems */}
                {!collapsed && item.subItems && item.subItems.length > 0 && (
                  <ul className="ml-7 space-y-1 mt-1">
                    {item.subItems.map((subItem) => (
                      <li key={subItem.path}>
                        <NavLink
                          to={subItem.path}
                          end={subItem.exact}
                          onClick={() => setMobileMenuOpen(false)}
                          className={
                            isPathActive(subItem.path, subItem.exact)
                              ? `flex items-center p-2 rounded-md transition-colors text-xs font-medium
                                 bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200`
                              : `flex items-center p-2 rounded-md transition-colors text-xs font-medium
                                 ${
                                   isDarkMode
                                     ? "text-gray-400 hover:bg-neutral-700 hover:text-white"
                                     : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                                 }`
                          }
                        >
                          <span className="mr-2">{subItem.icon}</span>
                          <span className="flex-1">{subItem.name}</span>

                          {/* Add badges for pending and fulfilled */}
                          {subItem.name === "Pending Pickup" && (
                            <span className="px-1.5 py-0.5 text-xs rounded-full bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200">
                              12
                            </span>
                          )}
                          {subItem.name === "Fulfilled" && (
                            <span className="px-1.5 py-0.5 text-xs rounded-full bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200">
                              24
                            </span>
                          )}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          {/* Divider */}
          <div
            className={`my-4 border-t ${
              isDarkMode ? "border-neutral-700" : "border-neutral-200"
            }`}
          ></div>

          {/* Logout Button - Moved from dropdown to sidebar for easy access */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center p-3 rounded-lg text-sm font-medium
              ${
                isDarkMode
                  ? "text-gray-400 hover:bg-neutral-700 hover:text-white"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              }`}
          >
            <LogOut size={20} className={`${collapsed ? "mx-auto" : "mr-3"}`} />
            {!collapsed && <span>Log Out</span>}
          </button>
        </nav>

        {/* User Profile at Bottom */}
        <div
          className={`p-4 ${
            isDarkMode
              ? "border-t border-neutral-700"
              : "border-t border-neutral-200"
          }`}
        >
          <div
            className={`flex ${collapsed ? "justify-center" : "items-center"}`}
          >
            {!collapsed ? (
              <>
                <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center overflow-hidden">
                  <User size={18} className="text-white" />
                </div>
                <div className="ml-3">
                  <p
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-white" : "text-neutral-900"
                    }`}
                  >
                    {user.name}
                  </p>
                  <p className="text-xs text-primary-600 dark:text-primary-400">
                    {user.role}
                  </p>
                </div>
              </>
            ) : (
              <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center overflow-hidden">
                <User size={18} className="text-white" />
              </div>
            )}
          </div>

          {/* Collapse Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`mt-4 w-full flex ${
              collapsed ? "justify-center" : ""
            } items-center py-2.5 px-3 text-sm 
            ${
              isDarkMode
                ? "text-gray-400 hover:bg-neutral-700 hover:text-white border border-neutral-700"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 border border-neutral-200"
            }
            rounded-lg transition-colors`}
          >
            <ChevronLeft
              size={18}
              className={`${collapsed ? "" : "mr-2"} ${
                collapsed ? "transform rotate-180" : ""
              }`}
            />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`flex flex-col ${
          collapsed ? "lg:ml-20" : "lg:ml-64"
        } transition-all duration-300 min-h-screen`}
      >
        {/* Topbar - Enhanced with better styling */}
        <header className="h-16 bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10 shadow-sm">
          {/* Left Side: Mobile menu toggle and Title/Greeting */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 mr-2 rounded-md text-[var(--text-secondary)] hover:bg-neutral-100
               dark:hover:bg-neutral-700"
              onClick={toggleMobileMenu}
            >
              <Menu size={20} />
            </button>

            {/* Title + Greeting */}
            <div>
              <h1 className="text-lg font-display font-bold text-[var(--text-primary)]">
                {getCurrentPageTitle()}
              </h1>
              <p className="text-xs text-[var(--text-secondary)]">
                {greeting}, {user.name} • {getCurrentDate()}
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-4">
            {/* Quick Action Button */}
            <button
              onClick={() => (window.location.href = "/staff/orders/pending")}
              className="hidden md:flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-300 dark:hover:bg-primary-900/50 transition-colors"
            >
              <Clock size={16} className="mr-1.5" />
              <span>Process Pending</span>
              <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-primary-100 text-primary-800 dark:bg-primary-800 dark:text-primary-200">
                12
              </span>
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications - Enhanced with dropdown */}
            <div className="relative group">
              <button
                className={`flex items-center justify-center h-8 w-8 rounded-full ${
                  isDarkMode
                    ? "bg-neutral-800 text-white hover:bg-neutral-700"
                    : "bg-white text-neutral-800 border border-neutral-200 hover:bg-neutral-100"
                }`}
              >
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs text-white">
                    {unreadNotifications}
                  </span>
                )}
                <Bell size={16} />
              </button>

              {/* Notification Dropdown */}
              <div className="absolute right-0 mt-2 w-72 bg-[var(--surface)] rounded-lg shadow-lg border border-[var(--border)] py-2 z-50 hidden group-hover:block">
                <div className="px-4 py-2 border-b border-[var(--border)] flex justify-between items-center">
                  <h3 className="font-medium text-sm text-[var(--text-primary)]">
                    Notifications
                  </h3>
                  <button className="text-xs text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300">
                    Mark all as read
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <div className="px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 border-l-2 border-primary-500">
                    <p className="text-xs font-medium text-[var(--text-secondary)]">
                      Just now
                    </p>
                    <p className="text-sm text-[var(--text-primary)]">
                      New order #1234 is ready for pickup
                    </p>
                  </div>
                  <div className="px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 border-l-2 border-primary-500">
                    <p className="text-xs font-medium text-[var(--text-secondary)]">
                      30 minutes ago
                    </p>
                    <p className="text-sm text-[var(--text-primary)]">
                      Customer Jane Smith arrived for pickup
                    </p>
                  </div>
                  <div className="px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 border-l-2 border-primary-500">
                    <p className="text-xs font-medium text-[var(--text-secondary)]">
                      2 hours ago
                    </p>
                    <p className="text-sm text-[var(--text-primary)]">
                      Order #1208 was successfully processed
                    </p>
                  </div>
                </div>
                <div className="px-4 py-2 border-t border-[var(--border)]">
                  <a
                    href="/staff/notifications"
                    className="text-xs text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    View all notifications
                  </a>
                </div>
              </div>
            </div>

            {/* User Button - Enhanced with dropdown */}
            <div className="relative group">
              <button
                className={`flex items-center gap-2 p-2 rounded-lg border transition-colors duration-200 ${
                  isDarkMode
                    ? "bg-neutral-800 text-white border-neutral-700 hover:bg-neutral-700"
                    : "bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-100"
                }`}
              >
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary-600 text-white">
                  <User size={16} />
                </div>
                <span className="text-sm hidden sm:inline-block">
                  {user.role}
                </span>
              </button>

              {/* User Dropdown */}
              <div className="absolute right-0 mt-2 w-56 bg-[var(--surface)] rounded-lg shadow-lg border border-[var(--border)] py-2 z-50 hidden group-hover:block">
                <div className="px-4 py-3 border-b border-[var(--border)]">
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {user.name}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {user.role}
                  </p>
                </div>
                <a
                  href="/staff/settings"
                  className="block px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  Settings
                </a>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-error-600 dark:text-error-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Container */}
        <main className="flex-1 p-4 md:p-6 bg-[var(--background)] overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
