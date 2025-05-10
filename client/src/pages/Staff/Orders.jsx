import React, { useState, useEffect, useCallback } from "react";
import {
  FiClock,
  FiCheck,
  FiSearch,
  FiRefreshCw,
  FiPackage,
  FiAlertCircle,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiArrowUp,
  FiArrowDown,
  FiBook,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiShoppingBag,
} from "react-icons/fi";
import OrderService from "../../services/OrderService";
import { useToast } from "../../components/Toast";
import { useSelector } from "react-redux";
import { selectTheme } from "../../features/userSlice";

const Orders = () => {
  // Custom toast hook
  const { showToast } = useToast();

  // Get theme from Redux store
  const theme = useSelector(selectTheme);

  // State to track dark mode
  const [isDarkMode, setIsDarkMode] = useState(false);

  // State variables
  const [pendingOrders, setPendingOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processingOrderId, setProcessingOrderId] = useState(null);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  // Stats state
  const [orderStats, setOrderStats] = useState({
    pendingCount: 0,
    completedTodayCount: 0,
    weeklyCount: 0,
    totalOrderValue: 0,
  });

  // Sort state
  const [sortField, setSortField] = useState("orderDate");
  const [sortDirection, setSortDirection] = useState("desc");

  // Filter state
  const [filters, setFilters] = useState({
    dateRange: "all",
    totalMin: "",
    totalMax: "",
    itemCount: "all",
  });

  // Update isDarkMode state whenever theme changes
  useEffect(() => {
    if (typeof document !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    }
  }, [theme]);

  // Same MutationObserver setup
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

  // Calculate order statistics
  const calculateOrderStats = useCallback(() => {
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get 7 days ago
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Count completed orders today
    const completedToday = completedOrders.filter(
      (order) => new Date(order.processedDate) >= today
    ).length;

    // Count all orders in the last 7 days
    const lastWeekOrders = [...pendingOrders, ...completedOrders].filter(
      (order) => new Date(order.orderDate) >= weekAgo
    ).length;

    // Calculate total value of all orders
    const totalValue = [...pendingOrders, ...completedOrders].reduce(
      (total, order) => total + parseFloat(order.totalAmount || 0),
      0
    );

    setOrderStats({
      pendingCount: pendingOrders.length,
      completedTodayCount: completedToday,
      weeklyCount: lastWeekOrders,
      totalOrderValue: totalValue,
    });
  }, [pendingOrders, completedOrders]);

  // Fetch pending orders from API
  const fetchPendingOrders = useCallback(async () => {
    try {
      const response = await OrderService.getAllPendingOrders();
      if (response && response.data) {
        setPendingOrders(response.data);
      } else {
        setPendingOrders([]);
      }
    } catch (error) {
      console.error("Error fetching pending orders:", error);
      showToast({
        type: "error",
        message: "Failed to fetch pending orders",
      });
      setPendingOrders([]);
    }
  }, [showToast]);

  // Fetch completed orders from API
  const fetchCompletedOrders = useCallback(async () => {
    try {
      const response = await OrderService.getAllCompletedOrders();
      if (response && response.data) {
        setCompletedOrders(response.data);
      } else {
        setCompletedOrders([]);
      }
    } catch (error) {
      console.error("Error fetching completed orders:", error);
      showToast({
        type: "error",
        message: "Failed to fetch completed orders",
      });
      setCompletedOrders([]);
    }
  }, [showToast]);

  // Load data on initial render
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPendingOrders(), fetchCompletedOrders()]);
      setLoading(false);
    };

    loadData();
  }, [fetchPendingOrders, fetchCompletedOrders]);

  // Update stats when orders change
  useEffect(() => {
    calculateOrderStats();
  }, [pendingOrders, completedOrders, calculateOrderStats]);

  // Handle search with claim code
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const response = await OrderService.getOrderByClaimCode(searchTerm);
      if (response && response.data) {
        setCurrentOrder(response.data);
        setIsModalOpen(true);
      } else {
        showToast({
          type: "error",
          message: "No order found with that claim code",
        });
      }
    } catch (error) {
      console.error("Error searching for order:", error);
      showToast({
        type: "error",
        message: "Failed to find order with that claim code",
      });
    } finally {
      setLoading(false);
    }
  };

  // Process order by claim code
  const processOrder = async (claimCode) => {
    if (!claimCode) return;

    setIsProcessing(true);
    setProcessingOrderId(claimCode);

    try {
      const response = await OrderService.completeOrderByClaimCode(claimCode);

      if (response && response.isSuccess) {
        showToast({
          type: "success",
          message: `Order ${claimCode} has been processed successfully`,
        });

        // Update the orders lists
        await Promise.all([fetchPendingOrders(), fetchCompletedOrders()]);

        // Close modal if open
        if (isModalOpen) {
          setIsModalOpen(false);
          setCurrentOrder(null);
        }
      } else {
        showToast({
          type: "error",
          message: response?.message || "Failed to process order",
        });
      }
    } catch (error) {
      console.error("Error processing order:", error);
      showToast({
        type: "error",
        message:
          error.message || "An error occurred while processing the order",
      });
    } finally {
      setIsProcessing(false);
      setProcessingOrderId(null);
    }
  };

  // Format date to readable string
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format short date (without time)
  const formatShortDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Close the order details modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentOrder(null);
  };

  // Get sorted and filtered orders
  const getSortedAndFilteredOrders = (orders) => {
    if (!orders || orders.length === 0) return [];

    // First apply filters
    let filteredOrders = [...orders];

    // Apply date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      let startDate;

      switch (filters.dateRange) {
        case "today":
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case "week":
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case "month":
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        filteredOrders = filteredOrders.filter(
          (order) => new Date(order.orderDate) >= startDate
        );
      }
    }

    // Apply price range filter
    if (filters.totalMin !== "") {
      const minAmount = parseFloat(filters.totalMin);
      filteredOrders = filteredOrders.filter(
        (order) => parseFloat(order.totalAmount) >= minAmount
      );
    }

    if (filters.totalMax !== "") {
      const maxAmount = parseFloat(filters.totalMax);
      filteredOrders = filteredOrders.filter(
        (order) => parseFloat(order.totalAmount) <= maxAmount
      );
    }

    // Apply item count filter
    if (filters.itemCount !== "all") {
      switch (filters.itemCount) {
        case "1":
          filteredOrders = filteredOrders.filter(
            (order) => order.orderItems.length === 1
          );
          break;
        case "2-5":
          filteredOrders = filteredOrders.filter(
            (order) =>
              order.orderItems.length >= 2 && order.orderItems.length <= 5
          );
          break;
        case "5+":
          filteredOrders = filteredOrders.filter(
            (order) => order.orderItems.length > 5
          );
          break;
        default:
          break;
      }
    }

    // Then sort
    return filteredOrders.sort((a, b) => {
      let valueA, valueB;

      // Handle different field types
      switch (sortField) {
        case "orderDate":
        case "processedDate":
          valueA = new Date(a[sortField] || 0).getTime();
          valueB = new Date(b[sortField] || 0).getTime();
          break;
        case "totalAmount":
          valueA = parseFloat(a.totalAmount);
          valueB = parseFloat(b.totalAmount);
          break;
        case "itemCount":
          valueA = a.orderItems.length;
          valueB = b.orderItems.length;
          break;
        default:
          valueA = a[sortField];
          valueB = b[sortField];
          break;
      }

      // Sort direction
      if (sortDirection === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  };

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, default to descending
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Sort indicator component
  const SortIndicator = ({ field }) => {
    if (sortField !== field) return null;

    return sortDirection === "asc" ? (
      <FiArrowUp className="ml-1 inline" />
    ) : (
      <FiArrowDown className="ml-1 inline" />
    );
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      dateRange: "all",
      totalMin: "",
      totalMax: "",
      itemCount: "all",
    });
  };

  // Apply filters
  const applyFilters = () => {
    setIsFilterMenuOpen(false);
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle process order from modal
  const handleProcessOrder = (claimCode) => {
    if (!claimCode) return;
    processOrder(claimCode);
  };

  // Get the actual orders to display based on active tab, sorting and filtering
  const displayOrders =
    activeTab === "pending"
      ? getSortedAndFilteredOrders(pendingOrders)
      : getSortedAndFilteredOrders(completedOrders);

  return (
    <div className="bg-[var(--background)] rounded-lg shadow p-6 transition-all duration-200">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div
          className={`p-4 rounded-lg ${
            isDarkMode ? "bg-neutral-800" : "bg-white"
          } shadow-sm`}
        >
          <div className="flex items-center">
            <div
              className={`rounded-full p-3 mr-3 ${
                isDarkMode
                  ? "bg-amber-900/30 text-amber-500"
                  : "bg-amber-100 text-amber-600"
              }`}
            >
              <FiClock size={20} />
            </div>
            <div>
              <p className="text-[var(--text-secondary)] text-sm">
                Pending Orders
              </p>
              <p className="text-[var(--text-primary)] text-xl font-semibold">
                {orderStats.pendingCount}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`p-4 rounded-lg ${
            isDarkMode ? "bg-neutral-800" : "bg-white"
          } shadow-sm`}
        >
          <div className="flex items-center">
            <div
              className={`rounded-full p-3 mr-3 ${
                isDarkMode
                  ? "bg-green-900/30 text-green-500"
                  : "bg-green-100 text-green-600"
              }`}
            >
              <FiCheck size={20} />
            </div>
            <div>
              <p className="text-[var(--text-secondary)] text-sm">
                Processed Today
              </p>
              <p className="text-[var(--text-primary)] text-xl font-semibold">
                {orderStats.completedTodayCount}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`p-4 rounded-lg ${
            isDarkMode ? "bg-neutral-800" : "bg-white"
          } shadow-sm`}
        >
          <div className="flex items-center">
            <div
              className={`rounded-full p-3 mr-3 ${
                isDarkMode
                  ? "bg-blue-900/30 text-blue-500"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              <FiCalendar size={20} />
            </div>
            <div>
              <p className="text-[var(--text-secondary)] text-sm">
                Orders This Week
              </p>
              <p className="text-[var(--text-primary)] text-xl font-semibold">
                {orderStats.weeklyCount}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`p-4 rounded-lg ${
            isDarkMode ? "bg-neutral-800" : "bg-white"
          } shadow-sm`}
        >
          <div className="flex items-center">
            <div
              className={`rounded-full p-3 mr-3 ${
                isDarkMode
                  ? "bg-purple-900/30 text-purple-500"
                  : "bg-purple-100 text-purple-600"
              }`}
            >
              <FiDollarSign size={20} />
            </div>
            <div>
              <p className="text-[var(--text-secondary)] text-sm">
                Total Value
              </p>
              <p className="text-[var(--text-primary)] text-xl font-semibold">
                {formatCurrency(orderStats.totalOrderValue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Header with repositioned search bar and added filter button */}
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">
          Order Management
        </h1>

        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          {/* Search Bar - Now more compact and placed alongside header controls */}
          <div className="relative">
            <form onSubmit={handleSearch} className="flex">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by claim code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-52 pl-8 pr-2 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                />
                <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]" />
              </div>
              <button
                type="submit"
                className={`ml-2 px-3 py-2 rounded-md transition-colors text-sm ${
                  isDarkMode
                    ? "bg-primary-600 hover:bg-primary-700 text-white"
                    : "bg-primary-600 hover:bg-primary-500 text-white"
                }`}
                disabled={loading || !searchTerm.trim()}
              >
                Process
              </button>
            </form>
          </div>

          {/* Filter Button */}
          <div className="relative">
            <button
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              className={`flex items-center px-3 py-2 rounded-lg transition-colors text-sm ${
                isDarkMode
                  ? "bg-neutral-700 hover:bg-neutral-600 text-white"
                  : "bg-neutral-200 hover:bg-neutral-300 text-neutral-800"
              } ${
                Object.values(filters).some((v) => v !== "" && v !== "all")
                  ? "ring-2 ring-primary-500"
                  : ""
              }`}
            >
              <FiFilter className="mr-1" /> Filter
            </button>

            {/* Filter Dropdown Menu */}
            {isFilterMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-[var(--surface)] border border-[var(--border)] z-10">
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-[var(--text-primary)]">
                      Filter Orders
                    </h3>
                    <button
                      onClick={() => setIsFilterMenuOpen(false)}
                      className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                      <FiX />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Date Range Filter */}
                    <div>
                      <label className="block text-sm text-[var(--text-secondary)] mb-1">
                        Date Range
                      </label>
                      <select
                        name="dateRange"
                        value={filters.dateRange}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--surface)] text-[var(--text-primary)] text-sm"
                      >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                      </select>
                    </div>

                    {/* Total Amount Range */}
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <label className="block text-sm text-[var(--text-secondary)] mb-1">
                          Min Amount ($)
                        </label>
                        <input
                          type="number"
                          name="totalMin"
                          value={filters.totalMin}
                          onChange={handleFilterChange}
                          min="0"
                          step="0.01"
                          placeholder="Min"
                          className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--surface)] text-[var(--text-primary)] text-sm"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm text-[var(--text-secondary)] mb-1">
                          Max Amount ($)
                        </label>
                        <input
                          type="number"
                          name="totalMax"
                          value={filters.totalMax}
                          onChange={handleFilterChange}
                          min="0"
                          step="0.01"
                          placeholder="Max"
                          className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--surface)] text-[var(--text-primary)] text-sm"
                        />
                      </div>
                    </div>

                    {/* Item Count Filter */}
                    <div>
                      <label className="block text-sm text-[var(--text-secondary)] mb-1">
                        Items in Order
                      </label>
                      <select
                        name="itemCount"
                        value={filters.itemCount}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--surface)] text-[var(--text-primary)] text-sm"
                      >
                        <option value="all">Any Number</option>
                        <option value="1">Single Item</option>
                        <option value="2-5">2-5 Items</option>
                        <option value="5+">More than 5 Items</option>
                      </select>
                    </div>

                    {/* Filter Actions */}
                    <div className="flex justify-between pt-2">
                      <button
                        onClick={resetFilters}
                        className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                          isDarkMode
                            ? "bg-neutral-700 hover:bg-neutral-600 text-white"
                            : "bg-neutral-200 hover:bg-neutral-300 text-neutral-800"
                        }`}
                      >
                        Reset
                      </button>
                      <button
                        onClick={applyFilters}
                        className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                          isDarkMode
                            ? "bg-primary-600 hover:bg-primary-700 text-white"
                            : "bg-primary-600 hover:bg-primary-500 text-white"
                        }`}
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() =>
              Promise.all([fetchPendingOrders(), fetchCompletedOrders()])
            }
            className={`flex items-center px-3 py-2 rounded-lg transition-colors text-sm ${
              isDarkMode
                ? "bg-neutral-700 hover:bg-neutral-600 text-white"
                : "bg-neutral-200 hover:bg-neutral-300 text-neutral-800"
            }`}
            disabled={loading}
          >
            <FiRefreshCw className={`mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-[var(--border)]">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex items-center pb-4 transition-colors ${
              activeTab === "pending"
                ? "border-b-2 border-primary-500 text-primary-500 font-medium"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <FiClock className="mr-2" /> Pending Orders ({pendingOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex items-center pb-4 transition-colors ${
              activeTab === "completed"
                ? "border-b-2 border-primary-500 text-primary-500 font-medium"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <FiCheck className="mr-2" /> Fulfilled Orders (
            {completedOrders.length})
          </button>
        </div>
      </div>

      {/* Applied Filters Chips */}
      {Object.values(filters).some((v) => v !== "" && v !== "all") && (
        <div className="mb-4 flex flex-wrap gap-2">
          {filters.dateRange !== "all" && (
            <div
              className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 
              ${
                isDarkMode
                  ? "bg-neutral-700 text-white"
                  : "bg-neutral-200 text-neutral-800"
              }`}
            >
              <FiCalendar size={12} />
              {filters.dateRange === "today" && "Today"}
              {filters.dateRange === "week" && "Last 7 days"}
              {filters.dateRange === "month" && "Last 30 days"}
              <button
                onClick={() => setFilters({ ...filters, dateRange: "all" })}
                className="ml-1"
              >
                <FiX size={12} />
              </button>
            </div>
          )}

          {(filters.totalMin !== "" || filters.totalMax !== "") && (
            <div
              className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 
              ${
                isDarkMode
                  ? "bg-neutral-700 text-white"
                  : "bg-neutral-200 text-neutral-800"
              }`}
            >
              <FiDollarSign size={12} />
              {filters.totalMin && filters.totalMax
                ? `$${filters.totalMin} - $${filters.totalMax}`
                : filters.totalMin
                ? `Min: $${filters.totalMin}`
                : `Max: $${filters.totalMax}`}
              <button
                onClick={() =>
                  setFilters({ ...filters, totalMin: "", totalMax: "" })
                }
                className="ml-1"
              >
                <FiX size={12} />
              </button>
            </div>
          )}

          {filters.itemCount !== "all" && (
            <div
              className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 
              ${
                isDarkMode
                  ? "bg-neutral-700 text-white"
                  : "bg-neutral-200 text-neutral-800"
              }`}
            >
              <FiShoppingBag size={12} />
              {filters.itemCount === "1" && "1 item"}
              {filters.itemCount === "2-5" && "2-5 items"}
              {filters.itemCount === "5+" && "5+ items"}
              <button
                onClick={() => setFilters({ ...filters, itemCount: "all" })}
                className="ml-1"
              >
                <FiX size={12} />
              </button>
            </div>
          )}

          <button
            onClick={resetFilters}
            className={`text-xs px-2 py-1 rounded-full
              ${
                isDarkMode
                  ? "text-neutral-400 hover:text-white"
                  : "text-neutral-600 hover:text-neutral-800"
              }`}
          >
            Clear all filters
          </button>
        </div>
      )}
      {/* Orders Table */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : displayOrders.length === 0 ? (
        <div className="text-center py-10">
          <div className="flex justify-center">
            <div className="bg-[var(--surface)] p-4 rounded-full">
              <FiPackage className="text-[var(--text-secondary)] text-5xl" />
            </div>
          </div>
          <p className="text-[var(--text-primary)] text-lg mt-4">
            {Object.values(filters).some((v) => v !== "" && v !== "all")
              ? "No orders match your filters"
              : activeTab === "pending"
              ? "No pending orders found"
              : "No fulfilled orders found"}
          </p>
          <p className="text-[var(--text-secondary)] mt-1">
            {Object.values(filters).some((v) => v !== "" && v !== "all")
              ? "Try adjusting your filter criteria"
              : activeTab === "pending"
              ? "All orders have been processed"
              : "Process pending orders to see them here"}
          </p>

          {Object.values(filters).some((v) => v !== "" && v !== "all") && (
            <button
              onClick={resetFilters}
              className={`mt-4 px-4 py-2 rounded-lg transition-colors text-sm ${
                isDarkMode
                  ? "bg-neutral-700 hover:bg-neutral-600 text-white"
                  : "bg-neutral-200 hover:bg-neutral-300 text-neutral-800"
              }`}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-[var(--surface)] rounded-lg overflow-hidden">
            <thead>
              <tr
                className={`${
                  isDarkMode ? "bg-neutral-800" : "bg-neutral-100"
                } text-[var(--text-secondary)] uppercase text-xs leading-normal`}
              >
                <th className="py-3 px-4 text-left">
                  <button
                    onClick={() => handleSort("orderId")}
                    className="flex items-center font-medium hover:text-primary-500"
                  >
                    Order # <SortIndicator field="orderId" />
                  </button>
                </th>
                <th className="py-3 px-4 text-left">Claim Code</th>
                <th className="py-3 px-4 text-left">
                  <button
                    onClick={() => handleSort("memberName")}
                    className="flex items-center font-medium hover:text-primary-500"
                  >
                    Member <SortIndicator field="memberName" />
                  </button>
                </th>
                <th className="py-3 px-4 text-left">
                  <button
                    onClick={() => handleSort("orderDate")}
                    className="flex items-center font-medium hover:text-primary-500"
                  >
                    Date <SortIndicator field="orderDate" />
                  </button>
                </th>
                <th className="py-3 px-4 text-left">
                  <button
                    onClick={() => handleSort("itemCount")}
                    className="flex items-center font-medium hover:text-primary-500"
                  >
                    Items <SortIndicator field="itemCount" />
                  </button>
                </th>
                <th className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleSort("totalAmount")}
                    className="flex items-center font-medium hover:text-primary-500 ml-auto"
                  >
                    Total <SortIndicator field="totalAmount" />
                  </button>
                </th>
                {activeTab === "completed" && (
                  <th className="py-3 px-4 text-left">
                    <button
                      onClick={() => handleSort("processedBy")}
                      className="flex items-center font-medium hover:text-primary-500"
                    >
                      Processed By <SortIndicator field="processedBy" />
                    </button>
                  </th>
                )}
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[var(--text-primary)] text-sm">
              {displayOrders.map((order) => (
                <tr
                  key={order.orderId}
                  className={`border-b border-[var(--border)] ${
                    isDarkMode ? "hover:bg-neutral-800" : "hover:bg-neutral-50"
                  } transition-colors`}
                >
                  <td className="py-3 px-4 text-left">#{order.orderId}</td>
                  <td className="py-3 px-4 text-left">
                    <span
                      className={`px-2 py-1 rounded-md font-medium ${
                        activeTab === "pending"
                          ? "bg-primary-100 text-primary-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {order.claimCode}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-left">
                    <div>
                      <div className="font-medium">{order.memberName}</div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        ID: {order.memberId}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-left">
                    {activeTab === "pending" ? (
                      formatDate(order.orderDate)
                    ) : (
                      <div>
                        <div>{formatShortDate(order.orderDate)}</div>
                        <div className="text-xs text-[var(--text-secondary)]">
                          Processed: {formatShortDate(order.processedDate)}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-left">
                    {order.orderItems?.length || 0} item(s)
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {formatCurrency(parseFloat(order.totalAmount || 0))}
                  </td>
                  {activeTab === "completed" && (
                    <td className="py-3 px-4 text-left">{order.processedBy}</td>
                  )}
                  <td className="py-3 px-4 text-center">
                    {activeTab === "pending" ? (
                      <button
                        onClick={() => processOrder(order.claimCode)}
                        disabled={
                          isProcessing && processingOrderId === order.claimCode
                        }
                        className={`px-3 py-1 rounded transition-colors ${
                          isDarkMode
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-green-600 hover:bg-green-500 text-white"
                        } ${
                          isProcessing && processingOrderId === order.claimCode
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        {isProcessing && processingOrderId === order.claimCode
                          ? "Processing..."
                          : "Process"}
                      </button>
                    ) : (
                      <span className="px-2 py-1 rounded-md bg-green-100 text-green-700">
                        Fulfilled
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Modal */}
      {isModalOpen && currentOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--surface)] rounded-lg shadow-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Order Details
              </h2>
              <button
                onClick={closeModal}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="mb-6">
              {/* Order Header Info */}
              <div className="bg-[var(--background)] rounded-lg p-4 mb-4">
                <div className="flex justify-between mb-4">
                  <div>
                    <p className="text-[var(--text-secondary)] text-sm">
                      Order ID
                    </p>
                    <p className="text-[var(--text-primary)] font-medium">
                      #
                      {Array.isArray(currentOrder)
                        ? currentOrder[0].orderId
                        : currentOrder.orderId}
                    </p>
                  </div>
                  <div>
                    <p className="text-[var(--text-secondary)] text-sm">
                      Claim Code
                    </p>
                    <p
                      className={`text-[var(--text-primary)] font-medium px-2 py-1 rounded-md inline-block ${
                        (Array.isArray(currentOrder)
                          ? currentOrder[0].status
                          : currentOrder.status) === "Pending"
                          ? "bg-primary-100 text-primary-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {Array.isArray(currentOrder)
                        ? currentOrder[0].claimCode
                        : currentOrder.claimCode}
                    </p>
                  </div>
                  <div>
                    <p className="text-[var(--text-secondary)] text-sm">
                      Status
                    </p>
                    <p
                      className={`font-medium px-2 py-1 rounded-md inline-block ${
                        (Array.isArray(currentOrder)
                          ? currentOrder[0].status
                          : currentOrder.status) === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {Array.isArray(currentOrder)
                        ? currentOrder[0].status
                        : currentOrder.status}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between mb-4">
                  <div>
                    <p className="text-[var(--text-secondary)] text-sm">
                      Member
                    </p>
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center mr-2 font-medium">
                        {(Array.isArray(currentOrder)
                          ? currentOrder[0].memberName
                          : currentOrder.memberName
                        )?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="text-[var(--text-primary)] font-medium">
                          {Array.isArray(currentOrder)
                            ? currentOrder[0].memberName
                            : currentOrder.memberName}
                        </p>
                        <p className="text-[var(--text-secondary)] text-xs">
                          ID:{" "}
                          {Array.isArray(currentOrder)
                            ? currentOrder[0].memberId
                            : currentOrder.memberId}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-[var(--text-secondary)] text-sm">
                      Order Date
                    </p>
                    <p className="text-[var(--text-primary)]">
                      {formatDate(
                        Array.isArray(currentOrder)
                          ? currentOrder[0].orderDate
                          : currentOrder.orderDate
                      )}
                    </p>
                    {(Array.isArray(currentOrder)
                      ? currentOrder[0].processedDate
                      : currentOrder.processedDate) && (
                      <p className="text-[var(--text-secondary)] text-xs">
                        Processed:{" "}
                        {formatDate(
                          Array.isArray(currentOrder)
                            ? currentOrder[0].processedDate
                            : currentOrder.processedDate
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <FiBook className="mr-2 text-[var(--text-secondary)]" />
                  <h3 className="font-medium text-[var(--text-primary)]">
                    Order Items
                  </h3>
                </div>
                <div className="bg-[var(--background)] rounded-md p-3 max-h-64 overflow-y-auto">
                  {(Array.isArray(currentOrder)
                    ? currentOrder[0].orderItems
                    : currentOrder.orderItems) &&
                  (Array.isArray(currentOrder)
                    ? currentOrder[0].orderItems.length
                    : currentOrder.orderItems.length) > 0 ? (
                    (Array.isArray(currentOrder)
                      ? currentOrder[0].orderItems
                      : currentOrder.orderItems
                    ).map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center mb-3 pb-3 border-b border-[var(--border)] last:border-0 last:mb-0 last:pb-0"
                      >
                        <div className="flex items-center">
                          {item.photo ? (
                            <img
                              src={item.photo}
                              alt={item.bookTitle}
                              className="w-10 h-14 object-cover rounded mr-3"
                            />
                          ) : (
                            <div className="w-10 h-14 bg-neutral-200 rounded flex items-center justify-center mr-3 text-neutral-500">
                              <FiBook size={18} />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-[var(--text-primary)]">
                              {item.bookTitle}
                            </p>
                            <p className="text-xs text-[var(--text-secondary)]">
                              {item.bookAuthor && `By ${item.bookAuthor}`}
                              {item.bookAuthor && item.isbn && " • "}
                              {item.isbn && `ISBN: ${item.isbn}`}
                            </p>
                            <p className="text-xs text-[var(--text-secondary)]">
                              Qty: {item.quantity} x{" "}
                              {formatCurrency(parseFloat(item.unitPrice || 0))}
                            </p>
                          </div>
                        </div>
                        <p className="font-medium text-[var(--text-primary)] whitespace-nowrap">
                          {formatCurrency(
                            parseFloat(item.quantity * item.unitPrice || 0)
                          )}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-[var(--text-secondary)] text-center py-4">
                      Item details not available
                    </p>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-[var(--background)] rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <p className="text-[var(--text-secondary)]">Subtotal</p>
                  <p className="text-[var(--text-primary)]">
                    {formatCurrency(
                      parseFloat(
                        (Array.isArray(currentOrder)
                          ? currentOrder[0].subtotal
                          : currentOrder.subtotal) ||
                          (Array.isArray(currentOrder)
                            ? currentOrder[0].totalAmount
                            : currentOrder.totalAmount) ||
                          0
                      )
                    )}
                  </p>
                </div>

                {((Array.isArray(currentOrder)
                  ? currentOrder[0].discountAmount
                  : currentOrder.discountAmount) || 0) > 0 && (
                  <div className="flex justify-between mb-2">
                    <p className="text-[var(--text-secondary)]">Discount</p>
                    <p className="text-green-600">
                      -
                      {formatCurrency(
                        parseFloat(
                          (Array.isArray(currentOrder)
                            ? currentOrder[0].discountAmount
                            : currentOrder.discountAmount) || 0
                        )
                      )}
                      {(Array.isArray(currentOrder)
                        ? currentOrder[0].discountPercentage
                        : currentOrder.discountPercentage) &&
                        ` (${
                          Array.isArray(currentOrder)
                            ? currentOrder[0].discountPercentage
                            : currentOrder.discountPercentage
                        }%)`}
                    </p>
                  </div>
                )}

                <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-[var(--border)]">
                  <p>Total</p>
                  <p>
                    {formatCurrency(
                      parseFloat(
                        (Array.isArray(currentOrder)
                          ? currentOrder[0].totalAmount
                          : currentOrder.totalAmount) || 0
                      )
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            {(Array.isArray(currentOrder)
              ? currentOrder[0].status
              : currentOrder.status) === "Pending" ? (
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    isDarkMode
                      ? "bg-neutral-700 hover:bg-neutral-600 text-[var(--text-primary)]"
                      : "bg-neutral-200 hover:bg-neutral-300 text-[var(--text-primary)]"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleProcessOrder(
                      Array.isArray(currentOrder)
                        ? currentOrder[0].claimCode
                        : currentOrder.claimCode
                    )
                  }
                  disabled={isProcessing}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    isDarkMode
                      ? "bg-primary-600 hover:bg-primary-700 text-white"
                      : "bg-primary-600 hover:bg-primary-500 text-white"
                  } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isProcessing ? (
                    <>
                      <FiRefreshCw className="inline mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiCheck className="inline mr-2" />
                      Process Order
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div>
                <div className="bg-green-100 text-green-800 px-4 py-3 rounded-md mb-4 flex items-start">
                  <FiCheck className="mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">This order has been processed</p>
                    <p className="text-sm">
                      Processed by{" "}
                      {Array.isArray(currentOrder)
                        ? currentOrder[0].processedBy
                        : currentOrder.processedBy}{" "}
                      on{" "}
                      {formatDate(
                        Array.isArray(currentOrder)
                          ? currentOrder[0].processedDate
                          : currentOrder.processedDate
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      isDarkMode
                        ? "bg-neutral-700 hover:bg-neutral-600 text-[var(--text-primary)]"
                        : "bg-neutral-200 hover:bg-neutral-300 text-[var(--text-primary)]"
                    }`}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
