import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CartService from "../../services/CartService";
import { useDispatch, useSelector } from "react-redux";

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, isLoading, error } = useSelector((state) => state?.cart);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    // Fetch cart items when component mounts
    const fetchCart = async () => {
      try {
        console.log("c");
        await CartService.getMyCart();
      } catch (error) {
        console.error("Failed to fetch cart:", error);
      }
    };

    fetchCart();
  }, []);
  console.log("first");
  const handleRemoveItem = async (bookId) => {
    try {
      await CartService.removeFromCart(bookId);
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  const handleQuantityChange = async (bookId, quantity) => {
    try {
      if (quantity < 1) return;

      // Remove item if quantity is 0
      if (quantity === 0) {
        await CartService.removeFromCart(bookId);
        return;
      }

      // Add to cart updates quantity if item exists
      await CartService.addToCart(bookId, quantity);
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    // This would redirect to checkout page in a real implementation
    console.log("Proceeding to checkout...");
    // For now just showing status for 2 seconds
    setTimeout(() => {
      setIsCheckingOut(false);
    }, 2000);
  };

  // Calculate cart summary
  const subtotal = CartService.getCartTotal();
  const orderDiscount = CartService.calculateOrderDiscount();
  const hasStackable = CartService.hasStackableDiscount();
  const orderDiscountAmount = subtotal * orderDiscount;
  const stackableDiscountAmount = hasStackable ? subtotal * 0.1 : 0;
  const totalDiscount = orderDiscountAmount + stackableDiscountAmount;
  const finalTotal = subtotal - totalDiscount;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-emerald-600 text-white py-3 px-6 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Bookstore</h1>
          <div className="flex space-x-4">
            <Link
              to="/users"
              className="px-4 py-2 bg-emerald-700 rounded-md hover:bg-emerald-800 transition"
            >
              Home
            </Link>
            <Link
              to="/cart"
              className="px-4 py-2 bg-white text-emerald-600 rounded-md hover:bg-gray-100 transition"
            >
              Cart
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Your Shopping Cart
        </h2>

        {isLoading ? (
          <div className="flex justify-center my-12">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              ></path>
            </svg>
            <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">
              Browse our collection and discover your next favorite book!
            </p>
            <Link
              to="/users"
              className="px-6 py-3 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b">
                  <h3 className="text-xl font-semibold">
                    Cart Items ({items.length})
                  </h3>
                </div>
                <ul className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <li
                      key={item.bookId}
                      className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                    >
                      <div className="w-20 h-28 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-lg font-medium text-gray-800">
                          {item.title}
                        </h4>
                        <p className="text-gray-600">{item.author}</p>
                        <div className="flex items-center mt-2">
                          <span className="text-lg font-semibold text-emerald-600">
                            ${item.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center border rounded-md">
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item.bookId,
                                item.quantity - 1
                              )
                            }
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                          >
                            -
                          </button>
                          <span className="px-4 py-1">{item.quantity}</span>
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item.bookId,
                                item.quantity + 1
                              )
                            }
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.bookId)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            ></path>
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>

                  {orderDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>5% Discount (5+ books)</span>
                      <span>-${orderDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {hasStackable && (
                    <div className="flex justify-between text-emerald-600">
                      <span>10% Member Discount</span>
                      <span>-${stackableDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-xl text-emerald-600">
                      ${finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={items.length === 0 || isCheckingOut}
                  className={`w-full py-3 rounded-md text-white font-medium transition ${
                    items.length === 0 || isCheckingOut
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  {isCheckingOut ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    "Proceed to Checkout"
                  )}
                </button>

                <div className="mt-6">
                  <h4 className="font-medium mb-2">Discount Information:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 5% discount on orders with 5+ books</li>
                    <li>• 10% member discount after 10 successful orders</li>
                    <li>• Discounts can be stacked for bigger savings</li>
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
