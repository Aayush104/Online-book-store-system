import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import ThemeToggle from "../components/ThemeToggle";
import {
  BookOpen,
  BarChart3,
  Users,
  Megaphone,
  Settings,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";
import { selectTheme, logoutUser } from "../features/userSlice";

const AdminLayout = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [greeting, setGreeting] = useState("");
  const theme = useSelector(selectTheme);
  const [isDarkMode, setIsDarkMode] = useState(false);

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
    name: "Admin User",
    role: "Administrator",
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

  // Navigation items
  const navItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <BarChart3 size={20} />,
    },
    {
      name: "Books",
      path: "/admin/books",
      icon: <BookOpen size={20} />,
    },
    {
      name: "Staffs",
      path: "/admin/staffs",
      icon: <Users size={20} />,
    },
    {
      name: "Announcements",
      path: "/admin/announcements",
      icon: <Megaphone size={20} />,
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: <Settings size={20} />,
    },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const getCurrentPageTitle = () => {
    const currentPath = location.pathname;
    if (currentPath === "/admin") return "Dashboard";
    if (currentPath.includes("/books")) return "Books";
    if (currentPath.includes("/staffs")) return "Staffs";
    if (currentPath.includes("/announcements")) return "Announcements";
    if (currentPath.includes("/settings")) return "Settings";
    return "Admin";
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
                Admin Panel
              </div>
            </div>
          )}
          <button className="ml-auto lg:hidden" onClick={toggleMobileMenu}>
            <X size={20} className="text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === "/admin"}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => `
                    flex items-center p-3 rounded-lg
                    transition-colors text-sm font-medium
                    ${
                      isActive
                        ? "bg-primary-600 text-white"
                        : isDarkMode
                        ? "text-gray-400 hover:bg-neutral-700 hover:text-white"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                    }
                  `}
                >
                  <span className={`${collapsed ? "mx-auto" : "mr-3"}`}>
                    {item.icon}
                  </span>
                  {!collapsed && <span>{item.name}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
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
                <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center">
                  <User size={18} className="text-white" />
                </div>
                <div className="ml-3">
                  <p
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-white" : "text-neutral-900"
                    }`}
                  >
                    Admin User
                  </p>
                  <p className="text-xs text-primary-600 dark:text-primary-400">
                    Administrator
                  </p>
                </div>
              </>
            ) : (
              <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center">
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
        {/* Topbar */}
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
                {greeting}, {user.name}
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <div className="relative">
              <div
                className={`flex items-center justify-center h-8 w-8 rounded-full ${
                  isDarkMode
                    ? "bg-neutral-800 text-white"
                    : "bg-white text-neutral-800 border border-neutral-200"
                }`}
              >
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs text-white">
                  2
                </span>
                <Bell size={16} />
              </div>
            </div>

            {/* User Button */}
            <div
              className={`flex items-center gap-2 p-2 rounded-lg border transition-colors duration-200 ${
                isDarkMode
                  ? "bg-neutral-800 text-white border-neutral-700 hover:bg-neutral-700"
                  : "bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-100"
              }`}
            >
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary-600 text-white">
                <User size={16} />
              </div>
              <span className="text-sm">Admin</span>
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

export default AdminLayout;
