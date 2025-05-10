import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OrderService from "../../services/OrderService";
import ReviewService from "../../services/ReviewService";
import { useToast } from "../../components/Toast";
import { useSelector } from "react-redux";
import { selectTheme } from "../../features/userSlice";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TagIcon,
  BookOpenIcon,
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CalendarIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChatBubbleLeftRightIcon, // For review button
  StarIcon, // For review button
} from "@heroicons/react/24/outline";
import ReviewModal from "../../components/ReviewModal";

const Orders = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const theme = useSelector(selectTheme);

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [isProcessingCancel, setIsProcessingCancel] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [dateRangeFilter, setDateRangeFilter] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Review-related states
  const [reviewEligibility, setReviewEligibility] = useState({}); // Store eligibility by bookId
  const [checkingEligibility, setCheckingEligibility] = useState({}); // Store loading state by bookId
  const [showReviewModal, setShowReviewModal] = useState(false); // Control review modal visibility
  const [selectedBookForReview, setSelectedBookForReview] = useState(null); // Store book data for review

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [
    orders,
    searchQuery,
    statusFilter,
    sortBy,
    sortDirection,
    dateRangeFilter,
  ]);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Changed from getOrderById to getMyOrders to get all user orders
      const response = await OrderService.getOrderById();
      if (response.isSuccess && response.data) {
        console.log(response.data);
        setOrders(response.data);
        setFilteredOrders(response.data);
      } else {
        throw new Error(response.message || "Failed to load orders");
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setError(
        error.message || "Failed to load your orders. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    setIsProcessingCancel(orderId);
    try {
      const response = await OrderService.cancelOrder(orderId);
      if (response.isSuccess) {
        // Update the order status in local state
        setOrders(
          orders.map((order) =>
            order.orderId === orderId
              ? { ...order, status: "Cancelled" }
              : order
          )
        );
        showToast({
          type: "success",
          title: "Order Cancelled",
          message: "Your order has been successfully cancelled.",
          duration: 3000,
        });
        setShowCancelConfirm(null);
      } else {
        throw new Error(response.message || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Failed to cancel order:", error);
      showToast({
        type: "error",
        title: "Error",
        message:
          error.message || "Failed to cancel the order. Please try again.",
        duration: 4000,
      });
    } finally {
      setIsProcessingCancel(null);
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const confirmCancelOrder = (orderId) => {
    setShowCancelConfirm(orderId);
  };

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      toggleSortDirection();
    } else {
      setSortBy(newSortBy);
      setSortDirection("desc"); // Default to descending when changing sort field
    }
  };

  // Check if a user is eligible to review a book
  const checkReviewEligibility = async (bookId) => {
    // Skip if we've already checked or are currently checking
    if (
      reviewEligibility[bookId] !== undefined ||
      checkingEligibility[bookId]
    ) {
      return;
    }

    setCheckingEligibility((prev) => ({ ...prev, [bookId]: true }));

    try {
      const response = await ReviewService.checkReviewEligibility(bookId);
      setReviewEligibility((prev) => ({
        ...prev,
        [bookId]: response.isSuccess,
      }));
    } catch (error) {
      console.error("Failed to check review eligibility:", error);
      setReviewEligibility((prev) => ({ ...prev, [bookId]: false }));
    } finally {
      setCheckingEligibility((prev) => ({ ...prev, [bookId]: false }));
    }
  };

  // Open review modal for a specific book
  const openReviewModal = (book) => {
    setSelectedBookForReview(book);
    setShowReviewModal(true);
  };

  const applyFilters = () => {
    if (!orders.length) return;

    let filtered = [...orders];

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => {
        if (statusFilter === "pending") return order.status === "Pending";
        if (statusFilter === "completed") return order.status === "Completed";
        if (statusFilter === "cancelled") return order.status === "Cancelled";
        return true;
      });
    }

    // Apply date range filter
    if (dateRangeFilter !== "all") {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      const ninetyDaysAgo = new Date(today);
      ninetyDaysAgo.setDate(today.getDate() - 90);
      const startOfYear = new Date(today.getFullYear(), 0, 1);

      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.orderDate);
        if (dateRangeFilter === "30days") return orderDate >= thirtyDaysAgo;
        if (dateRangeFilter === "90days") return orderDate >= ninetyDaysAgo;
        if (dateRangeFilter === "thisYear") return orderDate >= startOfYear;
        return true;
      });
    }

    // Apply search filter - updated to check OrderItems instead of items
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (order) =>
          order.orderId.toString().includes(query) ||
          order.claimCode.toLowerCase().includes(query) ||
          (order.orderItems &&
            order.orderItems.some(
              (item) =>
                (item.title && item.title.toLowerCase().includes(query)) ||
                (item.author && item.author.toLowerCase().includes(query))
            ))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return sortDirection === "asc"
          ? new Date(a.orderDate) - new Date(b.orderDate)
          : new Date(b.orderDate) - new Date(a.orderDate);
      }
      if (sortBy === "amount") {
        return sortDirection === "asc"
          ? a.totalAmount - b.totalAmount
          : b.totalAmount - a.totalAmount;
      }
      if (sortBy === "items") {
        const aItems = a.orderItems ? a.orderItems.length : 0;
        const bItems = b.orderItems ? b.orderItems.length : 0;
        return sortDirection === "asc" ? aItems - bItems : bItems - aItems;
      }
      return 0;
    });

    setFilteredOrders(filtered);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSortBy("date");
    setSortDirection("desc");
    setDateRangeFilter("all");
    setShowFilters(false);
    setShowMobileFilters(false);
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status badge style based on order status - improved contrast for light mode
  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return {
          bgColor: "bg-warning-100 dark:bg-warning-900/30",
          textColor: "text-warning-800 dark:text-warning-300", // Darker text for better light mode contrast
          borderColor: "border-warning-300 dark:border-warning-800", // Darker border
          icon: <ClockIcon className="h-4 w-4 mr-1.5" />,
        };
      case "Completed":
        return {
          bgColor: "bg-success-100 dark:bg-success-900/30",
          textColor: "text-success-800 dark:text-success-300", // Darker text for better light mode contrast
          borderColor: "border-success-300 dark:border-success-800", // Darker border
          icon: <CheckCircleIcon className="h-4 w-4 mr-1.5" />,
        };
      case "Cancelled":
        return {
          bgColor: "bg-error-100 dark:bg-error-900/30",
          textColor: "text-error-800 dark:text-error-300", // Darker text for better light mode contrast
          borderColor: "border-error-300 dark:border-error-800", // Darker border
          icon: <XCircleIcon className="h-4 w-4 mr-1.5" />,
        };
      default:
        return {
          bgColor: "bg-neutral-100 dark:bg-neutral-700",
          textColor: "text-neutral-800 dark:text-neutral-300", // Darker text for better light mode contrast
          borderColor: "border-neutral-300 dark:border-neutral-600", // Darker border
          icon: <TagIcon className="h-4 w-4 mr-1.5" />,
        };
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--background)]">
      <div className="container mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] font-display mb-2">
            My Orders
          </h1>
          <p className="text-[var(--text-secondary)]">
            View and manage your order history
          </p>
        </div>

        {/* Filters and search - Desktop */}
        <div className="mb-6 hidden md:block">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-[var(--text-tertiary)]" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search orders..."
                  className="pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-64"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    <XMarkIcon className="h-5 w-5 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]" />
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                >
                  <FunnelIcon className="h-5 w-5 mr-2" />
                  Filters
                  {showFilters ? (
                    <ChevronUpIcon className="h-4 w-4 ml-2" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4 ml-2" />
                  )}
                </button>

                <button
                  onClick={resetFilters}
                  className="flex items-center px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                >
                  <ArrowPathIcon className="h-5 w-5 mr-2" />
                  Reset
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-[var(--text-secondary)]">
                Sort by:
              </span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                  <option value="items">Items</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDownIcon className="h-4 w-4 text-[var(--text-tertiary)]" />
                </div>
              </div>
              <button
                onClick={toggleSortDirection}
                className="p-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
              >
                {sortDirection === "asc" ? (
                  <ChevronUpIcon className="h-5 w-5" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Extended filters */}
          {showFilters && (
            <div className="p-4 border border-[var(--border)] rounded-lg bg-[var(--surface)] mb-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Order Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setStatusFilter("all")}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        statusFilter === "all"
                          ? "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300 border border-primary-200 dark:border-primary-800"
                          : "bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)]"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setStatusFilter("pending")}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        statusFilter === "pending"
                          ? "bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-300 border border-warning-300 dark:border-warning-800"
                          : "bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)]"
                      }`}
                    >
                      <ClockIcon className="h-4 w-4 inline mr-1" />
                      Pending
                    </button>
                    <button
                      onClick={() => setStatusFilter("completed")}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        statusFilter === "completed"
                          ? "bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300 border border-success-300 dark:border-success-800"
                          : "bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)]"
                      }`}
                    >
                      <CheckCircleIcon className="h-4 w-4 inline mr-1" />
                      Completed
                    </button>
                    <button
                      onClick={() => setStatusFilter("cancelled")}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        statusFilter === "cancelled"
                          ? "bg-error-100 text-error-700 dark:bg-error-900 dark:text-error-300 border border-error-300 dark:border-error-800"
                          : "bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)]"
                      }`}
                    >
                      <XCircleIcon className="h-4 w-4 inline mr-1" />
                      Cancelled
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Date Range
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setDateRangeFilter("all")}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        dateRangeFilter === "all"
                          ? "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300 border border-primary-200 dark:border-primary-800"
                          : "bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)]"
                      }`}
                    >
                      All Time
                    </button>
                    <button
                      onClick={() => setDateRangeFilter("30days")}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        dateRangeFilter === "30days"
                          ? "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300 border border-primary-200 dark:border-primary-800"
                          : "bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)]"
                      }`}
                    >
                      Last 30 Days
                    </button>
                    <button
                      onClick={() => setDateRangeFilter("90days")}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        dateRangeFilter === "90days"
                          ? "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300 border border-primary-200 dark:border-primary-800"
                          : "bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)]"
                      }`}
                    >
                      Last 90 Days
                    </button>
                    <button
                      onClick={() => setDateRangeFilter("thisYear")}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        dateRangeFilter === "thisYear"
                          ? "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300 border border-primary-200 dark:border-primary-800"
                          : "bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)]"
                      }`}
                    >
                      This Year
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters and search - Mobile */}
        <div className="mb-6 md:hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-[var(--text-tertiary)]" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders..."
                className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  <XMarkIcon className="h-5 w-5 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="ml-2 p-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text-primary)]"
            >
              <FunnelIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile filters */}
          {showMobileFilters && (
            <div className="p-4 border border-[var(--border)] rounded-lg bg-[var(--surface)] mb-4 animate-fadeIn">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Order Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setStatusFilter("all")}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        statusFilter === "all"
                          ? "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300 border border-primary-200 dark:border-primary-800"
                          : "bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)]"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setStatusFilter("pending")}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        statusFilter === "pending"
                          ? "bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-300 border border-warning-300 dark:border-warning-800"
                          : "bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)]"
                      }`}
                    >
                      <ClockIcon className="h-4 w-4 inline mr-1" />
                      Pending
                    </button>
                    <button
                      onClick={() => setStatusFilter("completed")}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        statusFilter === "completed"
                          ? "bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300 border border-success-300 dark:border-success-800"
                          : "bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)]"
                      }`}
                    >
                      <CheckCircleIcon className="h-4 w-4 inline mr-1" />
                      Completed
                    </button>
                    <button
                      onClick={() => setStatusFilter("cancelled")}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        statusFilter === "cancelled"
                          ? "bg-error-100 text-error-700 dark:bg-error-900 dark:text-error-300 border border-error-300 dark:border-error-800"
                          : "bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)]"
                      }`}
                    >
                      <XCircleIcon className="h-4 w-4 inline mr-1" />
                      Cancelled
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Date Range
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setDateRangeFilter("all")}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        dateRangeFilter === "all"
                          ? "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300 border border-primary-200 dark:border-primary-800"
                          : "bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)]"
                      }`}
                    >
                      All Time
                    </button>
                    <button
                      onClick={() => setDateRangeFilter("30days")}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        dateRangeFilter === "30days"
                          ? "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300 border border-primary-200 dark:border-primary-800"
                          : "bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)]"
                      }`}
                    >
                      Last 30 Days
                    </button>
                    <button
                      onClick={() => setDateRangeFilter("90days")}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        dateRangeFilter === "90days"
                          ? "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300 border border-primary-200 dark:border-primary-800"
                          : "bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)]"
                      }`}
                    >
                      Last 90 Days
                    </button>
                    <button
                      onClick={() => setDateRangeFilter("thisYear")}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        dateRangeFilter === "thisYear"
                          ? "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300 border border-primary-200 dark:border-primary-800"
                          : "bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)]"
                      }`}
                    >
                      This Year
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Sort By
                  </label>
                  <div className="flex items-center space-x-2">
                    <select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="flex-1 appearance-none pl-3 pr-8 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="date">Date</option>
                      <option value="amount">Amount</option>
                      <option value="items">Items</option>
                    </select>
                    <button
                      onClick={toggleSortDirection}
                      className="p-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text-primary)]"
                    >
                      {sortDirection === "asc" ? (
                        <ChevronUpIcon className="h-5 w-5" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border)]">
                  <button
                    onClick={resetFilters}
                    className="py-2 px-4 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                  >
                    Reset Filters
                  </button>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order list section */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[var(--text-secondary)] font-medium">
              Loading your orders...
            </p>
          </div>
        ) : error ? (
          <div className="bg-[var(--surface)] rounded-lg shadow p-6 text-center border border-[var(--border)]">
            <p className="text-lg font-medium text-error-600 mb-4">{error}</p>
            <button
              onClick={fetchOrders}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-[var(--surface)] rounded-lg shadow p-8 text-center border border-[var(--border)]">
            <div className="flex justify-center mb-4">
              <ShoppingBagIcon className="h-16 w-16 text-[var(--text-tertiary)]" />
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
              {searchQuery ||
              statusFilter !== "all" ||
              dateRangeFilter !== "all"
                ? "No orders match your filters"
                : "No orders found"}
            </h2>
            <p className="text-[var(--text-secondary)] mb-6">
              {searchQuery ||
              statusFilter !== "all" ||
              dateRangeFilter !== "all"
                ? "Try adjusting your filters or search query"
                : "Browse our collection and place your first order!"}
            </p>
            {searchQuery ||
            statusFilter !== "all" ||
            dateRangeFilter !== "all" ? (
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                Reset Filters
              </button>
            ) : (
              <button
                onClick={() => navigate("/user")}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                Browse Books
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusBadge = getStatusBadge(order.status);
              const isExpanded = expandedOrderId === order.orderId;
              const isConfirmingCancel = showCancelConfirm === order.orderId;
              const isProcessingThisOrder =
                isProcessingCancel === order.orderId;

              return (
                <div
                  key={order.orderId}
                  className={`bg-[var(--surface)] rounded-lg border ${
                    isExpanded
                      ? "border-primary-200 dark:border-primary-800 shadow-md"
                      : "border-[var(--border)]"
                  }`}
                >
                  {/* Order header */}
                  <div
                    className={`p-4 sm:p-5 ${
                      isExpanded ? "border-b border-[var(--border)]" : ""
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                      <div className="flex flex-col sm:flex-row sm:items-center mb-2 sm:mb-0">
                        <h3 className="font-medium text-[var(--text-primary)]">
                          Order #{order.orderId}
                        </h3>
                        <span className="hidden sm:block mx-2 text-[var(--text-tertiary)]">
                          •
                        </span>
                        <span className="text-sm text-[var(--text-secondary)]">
                          <CalendarIcon className="inline-block h-4 w-4 mr-1" />
                          {formatDate(order.orderDate)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge.bgColor} ${statusBadge.textColor} ${statusBadge.borderColor}`}
                        >
                          {statusBadge.icon}
                          {order.status}
                        </div>
                        <button
                          onClick={() => toggleExpand(order.orderId)}
                          className="p-1 hover:bg-[var(--surface-hover)] rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                          aria-label={isExpanded ? "Collapse" : "Expand"}
                        >
                          {isExpanded ? (
                            <ChevronUpIcon className="h-5 w-5 text-[var(--text-secondary)]" />
                          ) : (
                            <ChevronDownIcon className="h-5 w-5 text-[var(--text-secondary)]" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm mb-2">
                      <div>
                        <span className="text-[var(--text-tertiary)]">
                          Total Amount:
                        </span>{" "}
                        <span className="font-medium text-[var(--text-primary)]">
                          ${order.totalAmount.toFixed(2)}
                        </span>
                      </div>

                      <div>
                        <span className="text-[var(--text-tertiary)]">
                          Items:
                        </span>{" "}
                        <span className="font-medium text-[var(--text-primary)]">
                          {order.orderItems ? order.orderItems.length : 0}
                        </span>
                      </div>

                      <div>
                        <span className="text-[var(--text-tertiary)]">
                          Claim Code:
                        </span>{" "}
                        <span className="font-medium text-[var(--text-primary)]">
                          {order.claimCode}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {order.status === "Pending" && (
                        <>
                          {isConfirmingCancel ? (
                            <div className="w-full sm:w-auto animate-fadeIn">
                              <div className="p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg mb-2 flex items-start">
                                <ExclamationTriangleIcon className="h-5 w-5 text-error-600 dark:text-error-400 mr-2 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-error-800 dark:text-error-300">
                                  Are you sure you want to cancel this order?
                                  This action cannot be undone.
                                </p>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => setShowCancelConfirm(null)}
                                  className="flex-1 py-2 px-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] hover:bg-[var(--surface-hover)] text-sm font-medium"
                                >
                                  No, Keep Order
                                </button>
                                <button
                                  onClick={() =>
                                    handleCancelOrder(order.orderId)
                                  }
                                  disabled={isProcessingThisOrder}
                                  className="flex-1 py-2 px-3 bg-error-600 text-white rounded-lg hover:bg-error-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isProcessingThisOrder ? (
                                    <div className="flex items-center justify-center">
                                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                      Processing...
                                    </div>
                                  ) : (
                                    "Yes, Cancel Order"
                                  )}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => confirmCancelOrder(order.orderId)}
                              className="py-2 px-3 border border-error-300 dark:border-error-700 rounded-lg text-error-700 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 text-sm font-medium flex items-center"
                            >
                              <XCircleIcon className="h-4 w-4 mr-1.5" />
                              Cancel Order
                            </button>
                          )}
                        </>
                      )}

                      <button
                        onClick={() => toggleExpand(order.orderId)}
                        className="py-2 px-3 border border-[var(--border)] rounded-lg text-[var(--text-primary)] hover:bg-[var(--surface-hover)] text-sm font-medium flex items-center"
                      >
                        <DocumentTextIcon className="h-4 w-4 mr-1.5" />
                        {isExpanded ? "Hide Details" : "View Details"}
                      </button>
                    </div>
                  </div>

                  {/* Expanded order details */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 animate-fadeIn">
                      <h4 className="font-medium text-[var(--text-primary)] mb-3">
                        Order Items
                      </h4>

                      <div className="space-y-3 mb-4">
                        {/* Fixed to use orderItems instead of OrderItems */}
                        {order.orderItems &&
                          order.orderItems.map((item, index) => {
                            // Check review eligibility when order items are rendered
                            if (order.status === "Completed" && item.bookId) {
                              checkReviewEligibility(item.bookId);
                            }

                            return (
                              <div
                                key={`${order.orderId}-${item.bookId || index}`}
                                className="flex items-center py-2 border-b border-[var(--border)] last:border-b-0"
                              >
                                <div className="h-16 w-12 bg-neutral-100 dark:bg-neutral-700 rounded mr-3 flex-shrink-0 overflow-hidden">
                                  {item.photo ? (
                                    <img
                                      src={item.photo}
                                      alt={item.title}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center">
                                      <BookOpenIcon className="h-6 w-6 text-[var(--text-tertiary)]" />
                                    </div>
                                  )}
                                </div>

                                <div className="flex-grow min-w-0">
                                  <h5 className="font-medium text-[var(--text-primary)] truncate">
                                    {item.bookTitle}
                                  </h5>
                                  <p className="text-sm text-[var(--text-secondary)] truncate">
                                    {item.bookAuthor}
                                  </p>

                                  {/* Review button - only show for completed orders and eligible books */}
                                  {order.status === "Completed" &&
                                    item.bookId && (
                                      <div className="mt-1">
                                        {checkingEligibility[item.bookId] ? (
                                          <span className="text-xs text-[var(--text-tertiary)] italic">
                                            Checking review eligibility...
                                          </span>
                                        ) : reviewEligibility[item.bookId] ? (
                                          <button
                                            onClick={() =>
                                              openReviewModal({
                                                id: item.bookId,
                                                title: item.bookTitle,
                                                author: item.bookAuthor,
                                                image: item.photo,
                                              })
                                            }
                                            className="mt-1 inline-flex items-center text-xs px-2 py-1 bg-primary-50 text-primary-700 border border-primary-200 rounded-full hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400 dark:border-primary-800"
                                          >
                                            <StarIcon className="h-3 w-3 mr-1" />
                                            Write a Review
                                          </button>
                                        ) : null}
                                      </div>
                                    )}
                                </div>

                                <div className="flex-shrink-0 text-right ml-3">
                                  <div className="font-medium text-[var(--text-primary)]">
                                    $
                                    {item.unitPrice
                                      ? item.unitPrice.toFixed(2)
                                      : "0.00"}
                                  </div>
                                  <div className="text-sm text-[var(--text-tertiary)]">
                                    Qty: {item.quantity}
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                        {/* Show message if no items are available */}
                        {(!order.orderItems ||
                          order.orderItems.length === 0) && (
                          <div className="py-4 text-center text-[var(--text-secondary)]">
                            <p>No item details available for this order.</p>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-[var(--border)] pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-[var(--text-primary)] mb-2 flex items-center">
                              <InformationCircleIcon className="h-5 w-5 mr-1.5 text-[var(--text-tertiary)]" />
                              Order Information
                            </h4>
                            <div className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-3">
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-[var(--text-tertiary)]">
                                    Order ID:
                                  </span>
                                  <span className="text-[var(--text-primary)] font-medium">
                                    #{order.orderId}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-[var(--text-tertiary)]">
                                    Date:
                                  </span>
                                  <span className="text-[var(--text-primary)]">
                                    {formatDate(order.orderDate)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-[var(--text-tertiary)]">
                                    Status:
                                  </span>
                                  <span
                                    className={`${statusBadge.textColor} font-medium`}
                                  >
                                    {order.status}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-[var(--text-tertiary)]">
                                    Claim Code:
                                  </span>
                                  <span className="text-[var(--text-primary)] font-mono">
                                    {order.claimCode}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-[var(--text-primary)] mb-2">
                              Order Summary
                            </h4>
                            <div className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-3">
                              <div className="space-y-2 text-sm">
                                {/* Use totalAmount when subtotal not available */}
                                <div className="flex justify-between">
                                  <span className="text-[var(--text-tertiary)]">
                                    Subtotal:
                                  </span>
                                  <span className="text-[var(--text-primary)]">
                                    $
                                    {(
                                      order.subtotal || order.totalAmount
                                    ).toFixed(2)}
                                  </span>
                                </div>

                                {/* Show discount if available */}
                                {order.discountApplied > 0 && (
                                  <div className="flex justify-between text-success-600 dark:text-success-400">
                                    <span>Discount:</span>
                                    <span>
                                      -${order.discountApplied.toFixed(2)}
                                    </span>
                                  </div>
                                )}

                                {/* If there's a discounts array, show those instead */}
                                {order.discounts &&
                                  order.discounts.length > 0 &&
                                  order.discounts.map((discount, index) => (
                                    <div
                                      key={index}
                                      className="flex justify-between text-success-600 dark:text-success-400"
                                    >
                                      <span>
                                        {discount.description || "Discount"}:
                                      </span>
                                      <span>
                                        -${discount.amount.toFixed(2)}
                                      </span>
                                    </div>
                                  ))}

                                <div className="flex justify-between border-t border-[var(--border)] pt-2 font-medium">
                                  <span className="text-[var(--text-primary)]">
                                    Total:
                                  </span>
                                  <span className="text-[var(--text-primary)]">
                                    ${order.totalAmount.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {order.status !== "Cancelled" && (
                          <div className="mt-4 bg-info-50 dark:bg-info-900/20 rounded-lg p-3 border border-info-100 dark:border-info-800">
                            <div className="flex items-start">
                              <InformationCircleIcon className="h-5 w-5 text-info-600 dark:text-info-400 mr-2 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm text-info-800 dark:text-info-300 font-medium">
                                  Please visit our store with your membership ID
                                  and claim code to pick up your books.
                                </p>
                                {order.status === "Pending" && (
                                  <p className="text-xs text-info-600 dark:text-info-400 mt-1">
                                    Orders can be cancelled before pickup.
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {order.status === "Cancelled" && (
                          <div className="mt-4 bg-neutral-50 dark:bg-neutral-900/20 rounded-lg p-3 border border-neutral-100 dark:border-neutral-800">
                            <div className="flex items-start">
                              <XCircleIcon className="h-5 w-5 text-neutral-600 dark:text-neutral-400 mr-2 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm text-neutral-800 dark:text-neutral-300">
                                  This order has been cancelled.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal Component */}
      {showReviewModal && selectedBookForReview && (
        <ReviewModal
          book={selectedBookForReview}
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedBookForReview(null);
          }}
          onReviewSubmitted={() => {
            // After successful review submission, update the eligibility status
            if (selectedBookForReview && selectedBookForReview.id) {
              setReviewEligibility((prev) => ({
                ...prev,
                [selectedBookForReview.id]: false, // Set to false since they can't review again
              }));
            }
            setShowReviewModal(false);
            setSelectedBookForReview(null);
            showToast({
              type: "success",
              title: "Review Submitted",
              message: "Thank you for your review!",
              duration: 3000,
            });
          }}
        />
      )}
    </div>
  );
};

export default Orders;
