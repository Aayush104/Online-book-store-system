import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import CartService from "../../services/CartService";
import OrderService from "../../services/OrderService";
import { useToast } from "../../components/Toast";
import { selectTheme } from "../../features/userSlice";
import {
  ArrowLeftIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";

const Cart = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Initialize local state
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [editingQuantity, setEditingQuantity] = useState(null);
  const [tempQuantity, setTempQuantity] = useState("");
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    // Fetch cart items when component mounts
    const fetchCart = async () => {
      try {
        setIsLoading(true);
        const response = await CartService.getMyCart();

        if (response.isSuccess && response.data) {
          setItems(response.data || []);
        } else {
          throw new Error(response.message || "Failed to load cart");
        }
      } catch (error) {
        console.error("Failed to fetch cart:", error);
        setError(
          error.message || "Failed to load your cart. Please try again."
        );

        // Only redirect on 401 errors
        if (error.response?.status === 401) {
          navigate("/login", {
            state: { message: "Please log in again to view your cart" },
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, [navigate]);

  const handleRemoveItem = async (bookId) => {
    try {
      const response = await CartService.removeFromCart(bookId);

      if (response.isSuccess) {
        // Update local state after successful removal
        setItems(items.filter((item) => item.bookId !== bookId));
        showToast({
          type: "success",
          title: "Item Removed",
          message: "Book has been removed from your cart",
          duration: 3000,
        });
      } else {
        throw new Error(response.message || "Failed to remove item");
      }
    } catch (error) {
      console.error("Failed to remove item:", error);
      showToast({
        type: "error",
        title: "Error",
        message: error.message || "Failed to remove item from cart",
        duration: 4000,
      });
    }
  };

  const handleQuantityChange = async (bookId, quantity) => {
    try {
      // Handle zero or negative quantity
      if (quantity <= 0) {
        await handleRemoveItem(bookId);
        return;
      }

      // Add to cart updates quantity if item exists
      const response = await CartService.addToCart(bookId, quantity);

      if (response.isSuccess) {
        // Update the quantity in local state
        setItems(
          items.map((item) =>
            item.bookId === bookId ? { ...item, quantity: quantity } : item
          )
        );

        showToast({
          type: "success",
          title: "Cart Updated",
          message: "Quantity has been updated",
          duration: 2000,
        });
      } else {
        throw new Error(response.message || "Failed to update quantity");
      }
    } catch (error) {
      console.error("Failed to update quantity:", error);
      showToast({
        type: "error",
        title: "Error",
        message: error.message || "Failed to update quantity",
        duration: 4000,
      });
    }
  };

  const startEditingQuantity = (bookId, currentQuantity) => {
    setEditingQuantity(bookId);
    setTempQuantity(currentQuantity.toString());
  };

  const commitQuantityEdit = (bookId) => {
    const newQuantity = parseInt(tempQuantity, 10);
    if (!isNaN(newQuantity)) {
      handleQuantityChange(bookId, newQuantity);
    }
    setEditingQuantity(null);
  };

  const handleQuantityInputKeyDown = (e, bookId) => {
    if (e.key === "Enter") {
      commitQuantityEdit(bookId);
    } else if (e.key === "Escape") {
      setEditingQuantity(null);
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      showToast({
        type: "warning",
        title: "Empty Cart",
        message: "Your cart is empty. Please add items before checking out.",
        duration: 3000,
      });
      return;
    }

    setIsCheckingOut(true);
    try {
      // Format the data for the API according to the schema
      const orderItems = items.map((item) => ({
        bookId: item.bookId,
        quantity: item.quantity,
        unitPrice: item.price,
      }));

      // Create the payload
      const orderData = {
        items: orderItems,
      };

      // Place the order
      const response = await OrderService.placeOrder(items);

      if (response.isSuccess) {
        setOrderComplete(true);
        setOrderDetails(response.data);

        showToast({
          type: "success",
          title: "Order Placed Successfully",
          message: "Check your email for the claim code and order details.",
          duration: 5000,
        });
        navigate("/user/orders");
        // Clear the cart items since order is placed
        setItems([]);
      } else {
        throw new Error(response.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Failed to place order:", error);
      showToast({
        type: "error",
        title: "Checkout Failed",
        message:
          error.message ||
          "There was an error processing your order. Please try again.",
        duration: 4000,
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Calculate cart summary
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);
  const orderDiscount = totalQuantity >= 5 ? 0.05 : 0;
  const hasStackable = CartService.hasStackableDiscount();
  const orderDiscountAmount = subtotal * orderDiscount;
  const stackableDiscountAmount = hasStackable ? subtotal * 0.1 : 0;
  const totalDiscount = orderDiscountAmount + stackableDiscountAmount;
  const finalTotal = subtotal - totalDiscount;

  // If order is complete, show the order confirmation
  if (orderComplete && orderDetails) {
    return (
      <div className="min-h-screen w-full bg-[var(--background)]">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto bg-[var(--surface)] rounded-lg shadow-lg p-8 border border-[var(--border)]">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-success-100 dark:bg-success-900 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-success-600 dark:text-success-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-center text-[var(--text-primary)] mb-2">
              Order Confirmed!
            </h1>

            <p className="text-center text-[var(--text-secondary)] mb-6">
              Thank you for your order. We've sent a confirmation email with
              your claim code.
            </p>

            <div className="border border-[var(--border)] rounded-lg p-4 mb-6">
              <h2 className="font-semibold text-[var(--text-primary)] mb-3">
                Order Summary
              </h2>

              <div className="space-y-2 text-[var(--text-secondary)]">
                <div className="flex justify-between">
                  <span>Order Number:</span>
                  <span className="font-medium text-[var(--text-primary)]">
                    #{orderDetails.orderId}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Claim Code:</span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {orderDetails.claimCode}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {new Date(orderDetails.orderDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-medium text-[var(--text-primary)]">
                    ${orderDetails.totalAmount.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-300">
                    Pending Pickup
                  </span>
                </div>
              </div>
            </div>

            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Please visit our store with your membership ID and the claim code
              above to pick up your books.
            </p>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => navigate("/user/orders")}
                className="flex-1 py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                View My Orders
              </button>

              <button
                onClick={() => navigate("/user")}
                className="flex-1 py-2 px-4 bg-[var(--background)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[var(--background)]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] text-center lg:text-left font-display">
            Your Shopping Cart
          </h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center my-12">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-[var(--surface)] rounded-lg shadow p-6 text-center border border-[var(--border)]">
            <p className="text-lg font-medium text-error-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-[var(--surface)] rounded-lg border border-[var(--border)] p-8 text-center">
            <h3 className="text-xl font-semibold mb-2 text-[var(--text-primary)]">
              Your cart is empty
            </h3>
            <p className="text-[var(--text-secondary)] mb-6">
              Browse our collection and discover your next favorite book!
            </p>
            <button
              onClick={() => navigate("/user")}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors font-medium"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left - Cart Items */}
            <div className="lg:col-span-2">
              <h2 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
                Cart Items ({items.length})
              </h2>

              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.bookId}
                    className="flex items-center p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)]"
                  >
                    {/* Book image */}
                    <div className="w-20 h-24 flex-shrink-0 mr-4 bg-neutral-100 dark:bg-neutral-600 rounded overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                          <img
                            src="/api/placeholder/80/96"
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    {/* Book details */}
                    <div className="flex-grow">
                      <h3 className="font-medium text-[var(--text-primary)]">
                        {item.title}
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {item.author}
                      </p>
                      <p className="text-primary-600 dark:text-primary-400 font-semibold mt-1">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center space-x-3">
                      {editingQuantity === item.bookId ? (
                        <div className="flex items-center">
                          <input
                            type="number"
                            value={tempQuantity}
                            onChange={(e) => setTempQuantity(e.target.value)}
                            onBlur={() => commitQuantityEdit(item.bookId)}
                            onKeyDown={(e) =>
                              handleQuantityInputKeyDown(e, item.bookId)
                            }
                            className="w-16 h-9 text-center border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text-primary)] focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                            min="1"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item.bookId,
                                item.quantity - 1
                              )
                            }
                            className="w-8 h-8 flex items-center justify-center rounded-l border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]"
                            aria-label="Decrease quantity"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <div
                            className="w-12 h-8 flex items-center justify-center border-t border-b border-[var(--border)] text-[var(--text-primary)] cursor-pointer"
                            onClick={() =>
                              startEditingQuantity(item.bookId, item.quantity)
                            }
                          >
                            {item.quantity}
                          </div>
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item.bookId,
                                item.quantity + 1
                              )
                            }
                            className="w-8 h-8 flex items-center justify-center rounded-r border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]"
                            aria-label="Increase quantity"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => handleRemoveItem(item.bookId)}
                        className="text-error-600 dark:text-error-400 hover:text-error-700 dark:hover:text-error-300 p-1 rounded-full hover:bg-error-50 dark:hover:bg-error-900/20"
                        aria-label="Remove item"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue shopping button */}
              <div className="mt-6">
                <button
                  onClick={() => navigate("/user")}
                  className="inline-flex items-center text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to shopping
                </button>
              </div>
            </div>

            {/* Right - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[var(--surface)] rounded-lg border border-[var(--border)] p-6 sticky top-4">
                <h2 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
                  Order Summary
                </h2>

                <div className="space-y-3 text-[var(--text-primary)]">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">
                      Subtotal
                    </span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>

                  {orderDiscount > 0 && (
                    <div className="flex justify-between text-success-600 dark:text-success-400">
                      <span>5% Discount (5+ books)</span>
                      <span>-${orderDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {hasStackable && (
                    <div className="flex justify-between text-success-600 dark:text-success-400">
                      <span>10% Member Discount</span>
                      <span>-${stackableDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t border-[var(--border)] pt-3 mt-3 flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-xl text-primary-600 dark:text-primary-400">
                      ${finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut || items.length === 0}
                  className="w-full py-3 px-4 mt-6 border border-transparent rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {isCheckingOut ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    "Place Order"
                  )}
                </button>

                <div className="mt-6 p-4 rounded-lg bg-primary-50 dark:bg-neutral-700 border border-primary-100 dark:border-neutral-600">
                  <h3 className="font-medium mb-2 text-[var(--text-primary)] dark:text-primary-400 text-sm">
                    Order Information
                  </h3>
                  <ul className="text-sm space-y-2 text-[var(--text-secondary)] dark:text-primary-300">
                    <li className="flex items-start">
                      <span className="mr-2 text-primary-500 dark:text-primary-400">
                        •
                      </span>
                      <span>Orders can be picked up in-store only</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-primary-500 dark:text-primary-400">
                        •
                      </span>
                      <span>
                        You'll receive a claim code via email after ordering
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-primary-500 dark:text-primary-400">
                        •
                      </span>
                      <span>
                        Present your member ID and claim code at the store to
                        complete your purchase
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-primary-500 dark:text-primary-400">
                        •
                      </span>
                      <span>Orders can be cancelled before pickup</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-primary-50 dark:bg-neutral-700 border border-primary-100 dark:border-neutral-600">
                  <h3 className="font-medium mb-2 text-[var(--text-primary)] dark:text-primary-400 text-sm">
                    Discount Information
                  </h3>
                  <ul className="text-sm space-y-2 text-[var(--text-secondary)] dark:text-primary-300">
                    <li className="flex items-start">
                      <span className="mr-2 text-primary-500 dark:text-primary-400">
                        •
                      </span>
                      <span>5% discount on orders with 5+ books</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-primary-500 dark:text-primary-400">
                        •
                      </span>
                      <span>
                        10% member discount after 10 successful orders
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-primary-500 dark:text-primary-400">
                        •
                      </span>
                      <span>Discounts can be stacked for bigger savings</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
