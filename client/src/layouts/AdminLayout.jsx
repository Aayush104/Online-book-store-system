import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import ThemeToggle from "../components/ThemeToggle";
import {
  BookOpenIcon,
  ChartBarIcon,
  UserGroupIcon,
  MegaphoneIcon,
  Cog6ToothIcon,
  BellIcon,
  UserIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const AdminLayout = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [greeting, setGreeting] = useState("");

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

  // Navigation items
  const navItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <ChartBarIcon className="w-5 h-5" />,
    },
    {
      name: "Books",
      path: "/admin/books",
      icon: <BookOpenIcon className="w-5 h-5" />,
    },
    {
      name: "Staffs",
      path: "/admin/staffs",
      icon: <UserGroupIcon className="w-5 h-5" />,
    },
    {
      name: "Announcements",
      path: "/admin/announcements",
      icon: <MegaphoneIcon className="w-5 h-5" />,
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: <Cog6ToothIcon className="w-5 h-5" />,
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
    <div className="min-h-screen w-full bg-neutral-50 dark:bg-neutral-900">
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
          transition-all duration-300 ease-in-out bg-white dark:bg-neutral-800 
          border-r border-neutral-200 dark:border-neutral-700 flex flex-col h-screen
        `}
      >
        {/* Logo & App Name */}
        <div className="h-16 flex items-center px-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
            <BookOpenIcon className="h-6 w-6 text-white" />
          </div>
          {!collapsed && (
            <div className="ml-3">
              <div className="text-base font-display font-bold text-neutral-900 dark:text-neutral-100">
                BookHaven
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400">
                Admin Panel
              </div>
            </div>
          )}
          <button className="ml-auto lg:hidden" onClick={toggleMobileMenu}>
            <XMarkIcon className="h-6 w-6 text-neutral-500 dark:text-neutral-400" />
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
                        ? "bg-emerald-600 text-white"
                        : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
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
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
          <div
            className={`flex ${collapsed ? "justify-center" : "items-center"}`}
          >
            {!collapsed ? (
              <>
                <div className="w-9 h-9 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {user.name}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    {user.role}
                  </p>
                </div>
              </>
            ) : (
              <div className="w-9 h-9 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            )}
          </div>

          {/* Collapse Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`mt-4 w-full flex ${
              collapsed ? "justify-center" : ""
            } items-center py-2.5 px-3 text-sm 
            text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 
            rounded-lg transition-colors border border-neutral-200 dark:border-neutral-700`}
          >
            <ArrowLeftOnRectangleIcon
              className={`w-5 h-5 ${collapsed ? "" : "mr-2"} ${
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
        <header className="h-16 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10 shadow-sm">
          {/* Left Side: Mobile menu toggle and Title/Greeting */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 mr-2 rounded-md text-neutral-600 hover:bg-neutral-100
               dark:text-neutral-300 dark:hover:bg-neutral-700"
              onClick={toggleMobileMenu}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            {/* Title + Greeting */}
            <div>
              <h1 className="text-lg font-display font-bold text-neutral-900 dark:text-neutral-100">
                {getCurrentPageTitle()}
              </h1>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                {greeting}, Admin
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <button
              className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 relative"
              aria-label="Notifications"
            >
              <BellIcon className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
              <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-emerald-600 text-xs text-white flex items-center justify-center transform -translate-y-1/4 translate-x-1/4 font-medium">
                2
              </span>
            </button>

            {/* User Button */}
            <div className="flex items-center">
              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors">
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200 hidden sm:inline-block pr-1">
                  Admin
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Container */}
        <main className="flex-1 p-4 md:p-6 bg-neutral-50 dark:bg-neutral-900 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
