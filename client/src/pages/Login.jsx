import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { login } from "../services/AuthService";
import { selectLoading, selectError } from "../features/userSlice";
import { useToast } from "../components/Toast";
import {
  EnvelopeIcon,
  LockClosedIcon,
  BookOpenIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

// Image slides with quotes
const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1920&auto=format&fit=crop",
    quote: "Books are the quietest and most constant of friends.",
    author: "Charles W. Eliot",
    alt: "Stack of books with morning light",
  },
  {
    image:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1920&auto=format&fit=crop",
    quote:
      "Reading is a conversation. All books talk. But a good book listens as well.",
    author: "Mark Haddon",
    alt: "Open books in a library",
  },
  {
    image:
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1920&auto=format&fit=crop",
    quote:
      "The reading of all good books is like a conversation with the finest minds of past centuries.",
    author: "René Descartes",
    alt: "Books on a wooden desk",
  },
];

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const { showToast } = useToast();

  // Form states
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [formErrors, setFormErrors] = useState({});

  // Show message from registration redirect
  useEffect(() => {
    if (location.state?.message) {
      showToast({
        type: "success",
        title: "Success",
        message: location.state.message,
        duration: 5000,
      });
      // Clear the message after showing to prevent infinite loops
      navigate(location.pathname, { replace: true });
    }
  }, [location.state?.message, navigate, showToast]);

  // Auto-rotate slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Handle redux error state
  useEffect(() => {
    if (error) {
      showToast({
        type: "error",
        title: "Error",
        message: error,
        duration: 5000,
      });
    }
  }, [error, showToast]);

  // Handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Email is invalid";
    if (!formData.password) errors.password = "Password is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await login(formData.email, formData.password);

      if (response.isSuccess) {
        showToast({
          type: "success",
          title: "Welcome back!",
          message: "Login successful",
          duration: 3000,
        });

        localStorage.setItem("token", response.data);
        const userRole = JSON.parse(atob(response.data.split(".")[1])).Role;
        const userName = JSON.parse(atob(response.data.split(".")[1])).Name;
        const userEmail = JSON.parse(atob(response.data.split(".")[1])).Email;
        const userId = JSON.parse(atob(response.data.split(".")[1])).UserId;
        console.log(userRole);
        // Redirect to dashboard or home

        if (userRole == "PublicUser") {
          navigate("/user");
        } else if (userRole == "Admin") {
          navigate("/admin");
        } else if (userRole == "Staff") {
          navigate("/staff");
        } else {
          navigate("/login");
        }
      }
    } catch (error) {
      console.error("Login failed:", error);

      // If you want to show a custom message here, you can
      let errorMessage = "Login failed. Please check your credentials.";
      if (error.response) {
        errorMessage =
          error.response.data?.message || error.response.data || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      showToast({
        type: "error",
        title: "Login Failed",
        message: errorMessage,
        duration: 5000,
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-neutral-50 dark:bg-neutral-900">
      <div className="flex h-screen">
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <BookOpenIcon className="h-8 w-8 text-emerald-600" />
                <span className="text-2xl font-display font-bold text-neutral-900 dark:text-neutral-100">
                  BookHaven
                </span>
              </div>
            </div>

            <div className="p-8 rounded-2xl">
              <h2 className="text-2xl font-display font-bold text-center text-neutral-900 dark:text-neutral-100 mb-6">
                Welcome Back
              </h2>
              <p className="text-center text-neutral-600 dark:text-neutral-400 mb-8">
                Login to access your library
              </p>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      placeholder="john@example.com"
                    />
                  </div>
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {formErrors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-10 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {formErrors.password}
                    </p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="rememberMe"
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-neutral-300 rounded"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-neutral-700 dark:text-neutral-300"
                    >
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <button
                      type="button"
                      onClick={() => navigate("/forgot-password")}
                      className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 border border-transparent rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </form>

              {/* Register Link */}
              <div className="mt-8 text-center">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Don't have an account?{" "}
                  <button
                    onClick={() => navigate("/register")}
                    className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
                  >
                    Create one now
                  </button>
                </p>
              </div>
            </div>

            {/* Back to home link */}
            <div className="mt-8 text-center">
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to home
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Image Carousel */}
        <div className="hidden lg:flex lg:w-1/2 relative">
          {/* Image Slider */}
          <div className="absolute inset-0">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              >
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className="h-full w-full object-cover"
                />
                {/* Overlay with theme colors */}
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 via-emerald-800/50 to-emerald-700/30" />
              </div>
            ))}
          </div>

          {/* Content Overlay */}
          <div className="relative z-10 flex flex-col justify-between h-full p-12 text-white">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <BookOpenIcon className="h-8 w-8" />
              <span className="text-2xl font-display font-bold">BookHaven</span>
            </div>

            {/* Quote Section */}
            <div className="max-w-lg mx-auto text-center">
              <div className="mb-8">
                <p className="text-3xl font-display font-light italic mb-4">
                  "{slides[currentSlide].quote}"
                </p>
                <p className="text-lg font-body font-medium">
                  — {slides[currentSlide].author}
                </p>
              </div>

              {/* Slide Indicators */}
              <div className="flex justify-center space-x-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? "w-8 bg-white"
                        : "bg-white/50 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Bottom Info */}
            <div className="text-center">
              <p className="text-sm text-white/80">
                Discover your next favorite book
              </p>
              <p className="text-xs text-white/60 mt-2">
                Join thousands of readers in our community
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
