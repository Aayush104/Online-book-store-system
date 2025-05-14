import React, { useState, useEffect } from "react";
import {
  BookOpen,
  ShoppingCart,
  Users,
  UserCheck,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Calendar,
  Star,
  Bookmark,
  BarChart2,
  ShoppingBag,
  Clock,
  ChevronRight,
  Tag,
  Bell,
  Activity,
  Plus,
} from "lucide-react";
import StatsService from "../../services/StatsService";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalOrders: 0,
    totalStaff: 0,
    totalPublicUsers: 0,
    cartsCount: 0,
    wishlistCount: 0,
    revenue: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

  // Sample data for static displays
  const recentOrders = [
    {
      id: "ORD-001",
      customerName: "John Doe",
      date: "2025-05-13",
      status: "Pending",
      amount: 35.99,
    },
    {
      id: "ORD-002",
      customerName: "Jane Smith",
      date: "2025-05-12",
      status: "Completed",
      amount: 29.5,
    },
    {
      id: "ORD-003",
      customerName: "Robert Brown",
      date: "2025-05-11",
      status: "Pending",
      amount: 49.95,
    },
  ];

  const lowStockBooks = [
    { id: 1, title: "The Great Adventure", author: "J. R. Smith", stock: 2 },
    { id: 2, title: "Science Today", author: "Mary Johnson", stock: 1 },
  ];

  const recentReviews = [
    {
      bookTitle: "The Universe Explained",
      user: "Mark Wilson",
      rating: 5,
      date: "2025-05-10",
    },
    {
      bookTitle: "Modern Art History",
      user: "Sarah Adams",
      rating: 4,
      date: "2025-05-09",
    },
  ];

  // Genre data
  const genreData = [
    { name: "Fiction", value: 35, color: "#3182CE" },
    { name: "Non-Fiction", value: 25, color: "#38A169" },
    { name: "Science", value: 15, color: "#805AD5" },
    { name: "Biography", value: 15, color: "#DD6B20" },
    { name: "History", value: 10, color: "#E53E3E" },
  ];

  // Update isDarkMode state whenever theme changes
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);

    // Set up observer to detect theme changes in DOM
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

    return () => observer.disconnect();
  }, []);

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch from actual API
        const dashboardResponse = await StatsService.getAdminDashboardStats();
        const cartsWishlistResponse =
          await StatsService.getCartsAndWishlistCount();

        // Combine data
        setStats({
          totalBooks: dashboardResponse.data.totalBooks || 0,
          totalOrders: dashboardResponse.data.totalOrders || 0,
          totalStaff: dashboardResponse.data.totalStaff || 0,
          totalPublicUsers: dashboardResponse.data.totalPublicUsers || 0,
          cartsCount: cartsWishlistResponse.data?.cartsCount || 0,
          wishlistCount: cartsWishlistResponse.data?.wishlistCount || 0,
          revenue: dashboardResponse.data.revenue || 0,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Fallback to sample data if API fails
        setStats({
          totalBooks: 2,
          totalOrders: 3,
          totalStaff: 2,
          totalPublicUsers: 1,
          cartsCount: 5,
          wishlistCount: 8,
          revenue: 299.99,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Card component for reusability
  const StatCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    color = "primary",
  }) => (
    <div
      className={`rounded-xl p-6 ${
        isDarkMode
          ? "bg-[#21242c] border border-neutral-700"
          : "bg-white border border-neutral-200"
      } shadow-sm flex items-center transition-all hover:shadow-md`}
    >
      <div
        className={`rounded-full p-3 ${
          isDarkMode ? `bg-${color}-900/30` : `bg-${color}-100`
        } mr-4`}
      >
        <Icon className={`h-6 w-6 text-${color}-600`} />
      </div>
      <div>
        <p className="text-[var(--text-secondary)] text-sm">{title}</p>
        <h3 className="text-2xl font-bold text-[var(--text-primary)]">
          {value}
        </h3>
        <p className={`text-xs text-${color}-600 mt-1`}>{subtitle}</p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-[var(--text-secondary)]">
          Loading dashboard...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header with Date */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Dashboard Overview
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Monitor your store performance and manage operations
          </p>
        </div>
        <div
          className={`flex items-center px-4 py-2 rounded-lg ${
            isDarkMode
              ? "bg-[#21242c] border border-neutral-700"
              : "bg-white border border-neutral-200"
          }`}
        >
          <Calendar className="w-4 h-4 text-primary-600 mr-2" />
          <span className="text-sm text-[var(--text-secondary)]">
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={BookOpen}
          title="Total Books"
          value={stats.totalBooks}
          subtitle="Catalog Items"
          color="primary"
        />

        <StatCard
          icon={ShoppingCart}
          title="Total Orders"
          value={stats.totalOrders}
          subtitle="Processed Orders"
          color="primary"
        />

        <StatCard
          icon={Users}
          title="Staff Members"
          value={stats.totalStaff}
          subtitle="Active Personnel"
          color="primary"
        />

        <StatCard
          icon={UserCheck}
          title="Members"
          value={stats.totalPublicUsers}
          subtitle="Registered Users"
          color="primary"
        />
      </div>

      {/* Secondary Stats with Alternative Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Overview */}
        <div
          className={`col-span-2 rounded-xl p-6 ${
            isDarkMode
              ? "bg-[#21242c] border border-neutral-700"
              : "bg-white border border-neutral-200"
          } shadow-sm`}
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Weekly Overview
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Orders and revenue trends
              </p>
            </div>
            <div
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                isDarkMode
                  ? "bg-primary-900/30 text-primary-400"
                  : "bg-primary-100 text-primary-700"
              }`}
            >
              <TrendingUp className="w-3 h-3 inline mr-1" />
              +12.5% from last week
            </div>
          </div>

          {/* Simple bar chart alternative */}
          <div className="space-y-5">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-sm text-[var(--text-secondary)]">
                  Monday
                </span>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  $120
                </span>
              </div>
              <div className="h-2.5 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-600 rounded-full"
                  style={{ width: "40%" }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-sm text-[var(--text-secondary)]">
                  Tuesday
                </span>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  $90
                </span>
              </div>
              <div className="h-2.5 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-600 rounded-full"
                  style={{ width: "30%" }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-sm text-[var(--text-secondary)]">
                  Wednesday
                </span>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  $150
                </span>
              </div>
              <div className="h-2.5 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-600 rounded-full"
                  style={{ width: "50%" }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-sm text-[var(--text-secondary)]">
                  Thursday
                </span>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  $210
                </span>
              </div>
              <div className="h-2.5 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-600 rounded-full"
                  style={{ width: "70%" }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-sm text-[var(--text-secondary)]">
                  Friday
                </span>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  $180
                </span>
              </div>
              <div className="h-2.5 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-600 rounded-full"
                  style={{ width: "60%" }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-sm text-[var(--text-secondary)]">
                  Saturday
                </span>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  $300
                </span>
              </div>
              <div className="h-2.5 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-600 rounded-full"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-sm text-[var(--text-secondary)]">
                  Sunday
                </span>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  $240
                </span>
              </div>
              <div className="h-2.5 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-600 rounded-full"
                  style={{ width: "80%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Genre Distribution */}
        <div
          className={`rounded-xl p-6 ${
            isDarkMode
              ? "bg-[#21242c] border border-neutral-700"
              : "bg-white border border-neutral-200"
          } shadow-sm`}
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Book Categories
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Distribution by genre
              </p>
            </div>
            <BarChart2 className="w-5 h-5 text-primary-600" />
          </div>

          {/* Simple visual distribution */}
          <div className="space-y-3 mb-6">
            {genreData.map((genre, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-[var(--text-secondary)]">
                    {genre.name}
                  </span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {genre.value}%
                  </span>
                </div>
                <div className="h-2.5 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${genre.value}%`,
                      backgroundColor: genre.color,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div
              className={`px-3 py-2 rounded-lg ${
                isDarkMode ? "bg-neutral-800" : "bg-neutral-100"
              } flex items-center justify-between`}
            >
              <span className="text-sm text-[var(--text-secondary)]">
                Carts
              </span>
              <span className="font-medium text-primary-600">
                {stats.cartsCount}
              </span>
            </div>
            <div
              className={`px-3 py-2 rounded-lg ${
                isDarkMode ? "bg-neutral-800" : "bg-neutral-100"
              } flex items-center justify-between`}
            >
              <span className="text-sm text-[var(--text-secondary)]">
                Wishlists
              </span>
              <span className="font-medium text-primary-600">
                {stats.wishlistCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity and Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div
          className={`rounded-xl ${
            isDarkMode
              ? "bg-[#21242c] border border-neutral-700"
              : "bg-white border border-neutral-200"
          } shadow-sm overflow-hidden`}
        >
          <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Recent Orders
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Latest customer purchases
              </p>
            </div>
            <button
              className={`p-2 rounded-lg ${
                isDarkMode ? "hover:bg-neutral-700" : "hover:bg-neutral-100"
              } text-[var(--text-secondary)] transition-colors`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {recentOrders.map((order) => (
              <div key={order.id} className="px-6 py-4 hover:bg-[var(--hover)]">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-[var(--text-primary)]">
                      {order.customerName}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {order.id}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        order.status === "Pending"
                          ? isDarkMode
                            ? "bg-amber-900/30 text-amber-400"
                            : "bg-amber-100 text-amber-700"
                          : isDarkMode
                          ? "bg-green-900/30 text-green-400"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {order.status}
                    </span>
                    <p className="mt-1 font-medium text-[var(--text-primary)]">
                      ${order.amount}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex items-center text-xs text-[var(--text-secondary)]">
                  <Clock className="w-3 h-3 mr-1" />
                  {order.date}
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 py-3 bg-[var(--surface)]">
            <button className="w-full py-2 text-center text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All Orders
            </button>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div
          className={`rounded-xl ${
            isDarkMode
              ? "bg-[#21242c] border border-neutral-700"
              : "bg-white border border-neutral-200"
          } shadow-sm overflow-hidden`}
        >
          <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Low Stock Alert
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Books needing restock
              </p>
            </div>
            <div
              className={`p-2 rounded-full ${
                isDarkMode ? "bg-amber-900/30" : "bg-amber-100"
              }`}
            >
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {lowStockBooks.map((book) => (
              <div key={book.id} className="px-6 py-4 hover:bg-[var(--hover)]">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium text-[var(--text-primary)]">
                      {book.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {book.author}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 h-fit rounded-full ${
                      book.stock < 2
                        ? isDarkMode
                          ? "bg-red-900/30 text-red-400"
                          : "bg-red-100 text-red-700"
                        : isDarkMode
                        ? "bg-amber-900/30 text-amber-400"
                        : "bg-amber-100 text-amber-700"
                    } text-xs font-medium`}
                  >
                    {book.stock} in stock
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 py-4">
            <button
              className={`w-full py-2 px-4 rounded-lg text-sm font-medium ${
                isDarkMode
                  ? "bg-primary-600 hover:bg-primary-700 text-white"
                  : "bg-primary-600 hover:bg-primary-700 text-white"
              } flex items-center justify-center`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Restock Inventory
            </button>
          </div>
        </div>

        {/* Recent Reviews */}
        <div
          className={`rounded-xl ${
            isDarkMode
              ? "bg-[#21242c] border border-neutral-700"
              : "bg-white border border-neutral-200"
          } shadow-sm overflow-hidden`}
        >
          <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Latest Reviews
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Customer feedback
              </p>
            </div>
            <div
              className={`p-2 rounded-full ${
                isDarkMode ? "bg-primary-900/30" : "bg-primary-100"
              }`}
            >
              <Star className="w-5 h-5 text-primary-600" />
            </div>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {recentReviews.map((review, index) => (
              <div key={index} className="px-6 py-4 hover:bg-[var(--hover)]">
                <div>
                  <h3 className="font-medium text-[var(--text-primary)]">
                    {review.bookTitle}
                  </h3>
                  <div className="flex justify-between mt-1">
                    <p className="text-sm text-[var(--text-secondary)]">
                      by {review.user}
                    </p>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? "text-amber-500 fill-amber-500"
                              : "text-neutral-400"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-[var(--text-secondary)]">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    {review.date}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 py-3 bg-[var(--surface)]">
            <button className="w-full py-2 text-center text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All Reviews
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div
        className={`rounded-xl p-6 ${
          isDarkMode
            ? "bg-[#21242c] border border-neutral-700"
            : "bg-white border border-neutral-200"
        } shadow-sm`}
      >
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <button
            className={`p-4 rounded-lg flex flex-col items-center justify-center ${
              isDarkMode
                ? "bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
                : "bg-neutral-50 hover:bg-neutral-100 border border-neutral-200"
            } transition-colors`}
          >
            <div
              className={`p-3 rounded-full ${
                isDarkMode ? "bg-primary-900/30" : "bg-primary-100"
              } mb-3`}
            >
              <BookOpen className="w-6 h-6 text-primary-600" />
            </div>
            <span className="text-sm font-medium text-[var(--text-primary)]">
              Add New Book
            </span>
          </button>

          <button
            className={`p-4 rounded-lg flex flex-col items-center justify-center ${
              isDarkMode
                ? "bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
                : "bg-neutral-50 hover:bg-neutral-100 border border-neutral-200"
            } transition-colors`}
          >
            <div
              className={`p-3 rounded-full ${
                isDarkMode ? "bg-primary-900/30" : "bg-primary-100"
              } mb-3`}
            >
              <ShoppingBag className="w-6 h-6 text-primary-600" />
            </div>
            <span className="text-sm font-medium text-[var(--text-primary)]">
              Process Order
            </span>
          </button>

          <button
            className={`p-4 rounded-lg flex flex-col items-center justify-center ${
              isDarkMode
                ? "bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
                : "bg-neutral-50 hover:bg-neutral-100 border border-neutral-200"
            } transition-colors`}
          >
            <div
              className={`p-3 rounded-full ${
                isDarkMode ? "bg-primary-900/30" : "bg-primary-100"
              } mb-3`}
            >
              <Tag className="w-6 h-6 text-primary-600" />
            </div>
            <span className="text-sm font-medium text-[var(--text-primary)]">
              Add Discount
            </span>
          </button>

          <button
            className={`p-4 rounded-lg flex flex-col items-center justify-center ${
              isDarkMode
                ? "bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
                : "bg-neutral-50 hover:bg-neutral-100 border border-neutral-200"
            } transition-colors`}
          >
            <div
              className={`p-3 rounded-full ${
                isDarkMode ? "bg-primary-900/30" : "bg-primary-100"
              } mb-3`}
            >
              <Bell className="w-6 h-6 text-primary-600" />
            </div>
            <span className="text-sm font-medium text-[var(--text-primary)]">
              Create Announcement
            </span>
          </button>
        </div>
      </div>

      {/* Real-time Activity */}
      <div
        className={`rounded-xl p-6 ${
          isDarkMode
            ? "bg-[#21242c] border border-neutral-700"
            : "bg-white border border-neutral-200"
        } shadow-sm`}
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Real-time Activity
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Live order feed
            </p>
          </div>
          <div
            className={`px-3 py-1.5 rounded-lg flex items-center ${
              isDarkMode
                ? "bg-primary-900/30 text-primary-400"
                : "bg-primary-100 text-primary-700"
            }`}
          >
            <Activity className="w-4 h-4 mr-1.5" />
            <span className="text-xs font-medium">LIVE</span>
          </div>
        </div>

        <div className="space-y-3">
          <div
            className={`p-4 rounded-lg ${
              isDarkMode ? "bg-neutral-800" : "bg-neutral-50"
            } flex items-center`}
          >
            <div
              className={`p-2 rounded-full ${
                isDarkMode ? "bg-green-900/30" : "bg-green-100"
              } mr-3`}
            >
              <ShoppingCart className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-primary)]">
                <span className="font-medium">John D.</span> purchased{" "}
                <span className="font-medium">The Art of Programming</span>
              </p>
              <p className="text-xs text-[var(--text-secondary)]">Just now</p>
            </div>
          </div>

          <div
            className={`p-4 rounded-lg ${
              isDarkMode ? "bg-neutral-800" : "bg-neutral-50"
            } flex items-center`}
          >
            <div
              className={`p-2 rounded-full ${
                isDarkMode ? "bg-blue-900/30" : "bg-blue-100"
              } mr-3`}
            >
              <Bookmark className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-primary)]">
                <span className="font-medium">Maria S.</span> added{" "}
                <span className="font-medium">Cloud Atlas</span> to wishlist
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                2 minutes ago
              </p>
            </div>
          </div>

          <div
            className={`p-4 rounded-lg ${
              isDarkMode ? "bg-neutral-800" : "bg-neutral-50"
            } flex items-center`}
          >
            <div
              className={`p-2 rounded-full ${
                isDarkMode ? "bg-purple-900/30" : "bg-purple-100"
              } mr-3`}
            >
              <Star className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-primary)]">
                <span className="font-medium">Alex T.</span> reviewed{" "}
                <span className="font-medium">The Alchemist</span> with 5 stars
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                15 minutes ago
              </p>
            </div>
          </div>

          <div
            className={`p-4 rounded-lg ${
              isDarkMode ? "bg-neutral-800" : "bg-neutral-50"
            } flex items-center`}
          >
            <div
              className={`p-2 rounded-full ${
                isDarkMode ? "bg-green-900/30" : "bg-green-100"
              } mr-3`}
            >
              <ShoppingCart className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-primary)]">
                <span className="font-medium">Robert J.</span> purchased{" "}
                <span className="font-medium">Modern Physics</span>
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                25 minutes ago
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-[var(--border)]">
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center">
            View all activity
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          className={`col-span-2 rounded-xl p-6 ${
            isDarkMode
              ? "bg-[#21242c] border border-neutral-700"
              : "bg-white border border-neutral-200"
          } shadow-sm`}
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Financial Summary
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Store performance metrics
              </p>
            </div>
            <div
              className={`px-3 py-1.5 rounded-lg ${
                isDarkMode ? "bg-neutral-800" : "bg-neutral-100"
              } text-[var(--text-secondary)] text-sm`}
            >
              Last 30 days
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div
              className={`p-4 rounded-lg ${
                isDarkMode ? "bg-neutral-800" : "bg-neutral-50"
              } border ${
                isDarkMode ? "border-neutral-700" : "border-neutral-200"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Total Revenue
                  </p>
                  <h3 className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                    ${stats.revenue ? stats.revenue.toFixed(2) : "0.00"}
                  </h3>
                </div>
                <div
                  className={`p-2 rounded-full ${
                    isDarkMode ? "bg-green-900/30" : "bg-green-100"
                  }`}
                >
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div
                className={`mt-3 text-xs flex items-center ${
                  isDarkMode ? "text-green-400" : "text-green-600"
                }`}
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>+15% from last month</span>
              </div>
            </div>

            <div
              className={`p-4 rounded-lg ${
                isDarkMode ? "bg-neutral-800" : "bg-neutral-50"
              } border ${
                isDarkMode ? "border-neutral-700" : "border-neutral-200"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Avg. Order Value
                  </p>
                  <h3 className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                    $42.50
                  </h3>
                </div>
                <div
                  className={`p-2 rounded-full ${
                    isDarkMode ? "bg-blue-900/30" : "bg-blue-100"
                  }`}
                >
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div
                className={`mt-3 text-xs flex items-center ${
                  isDarkMode ? "text-green-400" : "text-green-600"
                }`}
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>+8% from last month</span>
              </div>
            </div>

            <div
              className={`p-4 rounded-lg ${
                isDarkMode ? "bg-neutral-800" : "bg-neutral-50"
              } border ${
                isDarkMode ? "border-neutral-700" : "border-neutral-200"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Conversion Rate
                  </p>
                  <h3 className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                    4.8%
                  </h3>
                </div>
                <div
                  className={`p-2 rounded-full ${
                    isDarkMode ? "bg-purple-900/30" : "bg-purple-100"
                  }`}
                >
                  <Activity className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div
                className={`mt-3 text-xs flex items-center ${
                  isDarkMode ? "text-amber-400" : "text-amber-600"
                }`}
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>+2.1% from last month</span>
              </div>
            </div>
          </div>

          {/* Monthly Revenue Chart Alternative */}
          <div
            className={`p-4 rounded-lg ${
              isDarkMode ? "bg-neutral-800" : "bg-neutral-50"
            } border ${
              isDarkMode ? "border-neutral-700" : "border-neutral-200"
            }`}
          >
            <h3 className="text-md font-medium text-[var(--text-primary)] mb-4">
              Monthly Revenue
            </h3>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm text-[var(--text-secondary)]">
                    January
                  </span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    $1,200
                  </span>
                </div>
                <div className="h-5 w-full bg-neutral-200 dark:bg-neutral-700 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-lg"
                    style={{ width: "43%" }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm text-[var(--text-secondary)]">
                    February
                  </span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    $1,800
                  </span>
                </div>
                <div className="h-5 w-full bg-neutral-200 dark:bg-neutral-700 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-lg"
                    style={{ width: "64%" }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm text-[var(--text-secondary)]">
                    March
                  </span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    $1,400
                  </span>
                </div>
                <div className="h-5 w-full bg-neutral-200 dark:bg-neutral-700 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-lg"
                    style={{ width: "50%" }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm text-[var(--text-secondary)]">
                    April
                  </span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    $2,200
                  </span>
                </div>
                <div className="h-5 w-full bg-neutral-200 dark:bg-neutral-700 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-lg"
                    style={{ width: "79%" }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm text-[var(--text-secondary)]">
                    May
                  </span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    $2,800
                  </span>
                </div>
                <div className="h-5 w-full bg-neutral-200 dark:bg-neutral-700 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-lg"
                    style={{ width: "100%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div
          className={`rounded-xl ${
            isDarkMode
              ? "bg-[#21242c] border border-neutral-700"
              : "bg-white border border-neutral-200"
          } shadow-sm overflow-hidden`}
        >
          <div className="px-6 py-4 border-b border-[var(--border)]">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Top Performers
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Best-selling books
            </p>
          </div>

          <div className="divide-y divide-[var(--border)]">
            <div className="px-6 py-4 hover:bg-[var(--hover)]">
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded ${
                    isDarkMode ? "bg-neutral-800" : "bg-neutral-100"
                  } flex items-center justify-center mr-3 flex-shrink-0`}
                >
                  <span className="text-lg font-bold text-primary-600">#1</span>
                </div>
                <div>
                  <h3 className="font-medium text-[var(--text-primary)]">
                    The Art of Programming
                  </h3>
                  <div className="flex items-center">
                    <div className="text-sm text-[var(--text-secondary)]">
                      Fiction
                    </div>
                    <div className="mx-2 text-[var(--text-secondary)]">•</div>
                    <div className="text-sm text-primary-600">32 sold</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 hover:bg-[var(--hover)]">
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded ${
                    isDarkMode ? "bg-neutral-800" : "bg-neutral-100"
                  } flex items-center justify-center mr-3 flex-shrink-0`}
                >
                  <span className="text-lg font-bold text-primary-600">#2</span>
                </div>
                <div>
                  <h3 className="font-medium text-[var(--text-primary)]">
                    The Alchemist
                  </h3>
                  <div className="flex items-center">
                    <div className="text-sm text-[var(--text-secondary)]">
                      Fantasy
                    </div>
                    <div className="mx-2 text-[var(--text-secondary)]">•</div>
                    <div className="text-sm text-primary-600">28 sold</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 hover:bg-[var(--hover)]">
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded ${
                    isDarkMode ? "bg-neutral-800" : "bg-neutral-100"
                  } flex items-center justify-center mr-3 flex-shrink-0`}
                >
                  <span className="text-lg font-bold text-primary-600">#3</span>
                </div>
                <div>
                  <h3 className="font-medium text-[var(--text-primary)]">
                    Modern Physics
                  </h3>
                  <div className="flex items-center">
                    <div className="text-sm text-[var(--text-secondary)]">
                      Science
                    </div>
                    <div className="mx-2 text-[var(--text-secondary)]">•</div>
                    <div className="text-sm text-primary-600">21 sold</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 hover:bg-[var(--hover)]">
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded ${
                    isDarkMode ? "bg-neutral-800" : "bg-neutral-100"
                  } flex items-center justify-center mr-3 flex-shrink-0`}
                >
                  <span className="text-lg font-bold text-primary-600">#4</span>
                </div>
                <div>
                  <h3 className="font-medium text-[var(--text-primary)]">
                    Cloud Atlas
                  </h3>
                  <div className="flex items-center">
                    <div className="text-sm text-[var(--text-secondary)]">
                      Sci-Fi
                    </div>
                    <div className="mx-2 text-[var(--text-secondary)]">•</div>
                    <div className="text-sm text-primary-600">18 sold</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 hover:bg-[var(--hover)]">
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded ${
                    isDarkMode ? "bg-neutral-800" : "bg-neutral-100"
                  } flex items-center justify-center mr-3 flex-shrink-0`}
                >
                  <span className="text-lg font-bold text-primary-600">#5</span>
                </div>
                <div>
                  <h3 className="font-medium text-[var(--text-primary)]">
                    The Last Kingdom
                  </h3>
                  <div className="flex items-center">
                    <div className="text-sm text-[var(--text-secondary)]">
                      History
                    </div>
                    <div className="mx-2 text-[var(--text-secondary)]">•</div>
                    <div className="text-sm text-primary-600">15 sold</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-3 bg-[var(--surface)]">
            <button className="w-full py-2 text-center text-primary-600 hover:text-primary-700 text-sm font-medium">
              View Full Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
