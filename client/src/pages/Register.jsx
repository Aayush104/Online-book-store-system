import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { register, verifyOtp } from "../services/AuthService";
import { selectLoading, selectError, clearError } from "../features/userSlice";
import { useToast } from "../components/Toast";
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  BookOpenIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

// Country data
const countries = [
  { name: "Nepal", code: "NP", dialCode: "+977", flag: "🇳🇵" },
  { name: "United States", code: "US", dialCode: "+1", flag: "🇺🇸" },
  { name: "United Kingdom", code: "GB", dialCode: "+44", flag: "🇬🇧" },
  { name: "India", code: "IN", dialCode: "+91", flag: "🇮🇳" },
  { name: "Australia", code: "AU", dialCode: "+61", flag: "🇦🇺" },
  { name: "Canada", code: "CA", dialCode: "+1", flag: "🇨🇦" },
];

// Image slides with quotes
const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1920&auto=format&fit=crop",
    quote: "A room without books is like a body without a soul.",
    author: "Marcus Tullius Cicero",
    alt: "Library with beautiful bookshelves",
  },
  {
    image:
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1920&auto=format&fit=crop",
    quote: "Books are a uniquely portable magic.",
    author: "Stephen King",
    alt: "Person reading a book in a cozy corner",
  },
  {
    image:
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1920&auto=format&fit=crop",
    quote: "I have always imagined that Paradise will be a kind of library.",
    author: "Jorge Luis Borges",
    alt: "Grand library hall with sunlight",
  },
];

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const { showToast } = useToast();

  // Form states
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    address: "",
  });
  const [otp, setOtp] = useState("");
  const [formErrors, setFormErrors] = useState({});

  // Auto-rotate slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Handle errors with toast
  useEffect(() => {
    if (error) {
      showToast({
        type: "error",
        title: "Error",
        message: error,
        duration: 5000,
      });
      // Clear the error after showing
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, showToast, dispatch]);

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({
      ...prev,
      phoneNumber: value,
    }));
    if (formErrors.phoneNumber) {
      setFormErrors((prev) => ({
        ...prev,
        phoneNumber: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Email is invalid";
    if (!formData.password) errors.password = "Password is required";
    else if (formData.password.length < 6)
      errors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      errors.confirmPassword = "Passwords do not match";
    if (!formData.phoneNumber.trim())
      errors.phoneNumber = "Phone number is required";
    if (!formData.address.trim()) errors.address = "Address is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const registrationData = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phoneNumber: `${selectedCountry.dialCode}${formData.phoneNumber}`,
        address: formData.address,
      };

      const response = await register(registrationData);
      console.log(response.isSuccess);
      if (response.isSuccess && response.data) {
        setUserId(response.data);
        setStep(2);
        showToast({
          type: "success",
          title: "Success",
          message: "Account created successfully! Please verify your email.",
          duration: 5000,
        });
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration failed:", error);

      console.log(error);
      // Extract error message
      let errorMessage = "Registration failed";

      if (error.response) {
        errorMessage =
          error.response.data?.message || error.response.data || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      showToast({
        type: "error",
        title: "Registration Failed",
        message: errorMessage,
        duration: 5000,
      });
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setFormErrors({ otp: "OTP is required" });
      return;
    }

    try {
      const response = await verifyOtp(userId, otp, "Registration");
      if (response.isSuccess) {
        showToast({
          type: "success",
          title: "Success",
          message: "Email verified successfully! Redirecting to login...",
          duration: 3000,
        });
        setTimeout(() => {
          navigate("/login", {
            state: { message: "Registration successful! Please login." },
          });
        }, 2000);
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
      let errorMessage = "OTP verification failed";

      if (error.response) {
        errorMessage =
          error.response.data?.message || error.response.data || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      showToast({
        type: "error",
        title: "Verification Failed",
        message: errorMessage,
        duration: 5000,
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--background)]">
      <div className="flex h-screen">
        {/* Left Side - Image Carousel */}
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
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 via-primary-800/50 to-primary-700/30" />
              </div>
            ))}
          </div>

          {/* Content Overlay */}
          <div className="relative z-10 flex flex-col justify-between h-full p-12 text-white">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <BookOpenIcon className="h-8 w-8" />
              <span className="text-2xl font-display font-bold">BookVerse</span>
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

            {/* Bottom Stats */}
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-2xl font-display font-bold">10K+</div>
                <div className="text-sm opacity-80">Books</div>
              </div>
              <div>
                <div className="text-2xl font-display font-bold">50K+</div>
                <div className="text-sm opacity-80">Readers</div>
              </div>
              <div>
                <div className="text-2xl font-display font-bold">4.9</div>
                <div className="text-sm opacity-80">Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <BookOpenIcon className="h-8 w-8 text-primary-600" />
                <span className="text-2xl font-display font-bold text-[var(--text-primary)]">
                  BookHaven
                </span>
              </div>
            </div>

            <div className="bg-[var(--surface)] p-8 rounded-2xl border border-[var(--border)]">
              {/* Progress Steps */}
              <div className="flex items-center justify-center mb-6">
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                      step === 1 ? "bg-primary-600" : "bg-primary-500"
                    }`}
                  >
                    {step === 1 ? "1" : <CheckCircleIcon className="w-5 h-5" />}
                  </div>
                  <div
                    className={`w-16 h-0.5 mx-2 ${
                      step === 2 ? "bg-primary-600" : "bg-[var(--border)]"
                    }`}
                  />
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step === 2
                        ? "bg-primary-600 text-white"
                        : "bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)]"
                    }`}
                  >
                    2
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-display font-bold text-center text-[var(--text-primary)] mb-6">
                {step === 1 ? "Create Account" : "Verify Email"}
              </h2>

              {/* Registration Form */}
              {step === 1 && (
                <form onSubmit={handleRegister} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-secondary)]" />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                        placeholder="John Doe"
                      />
                    </div>
                    {formErrors.fullName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {formErrors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-secondary)]" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                        placeholder="john@example.com"
                      />
                    </div>
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Password Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-secondary)]" />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full pl-10 pr-10 py-2.5 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
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

                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-secondary)]" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="w-full pl-10 pr-10 py-2.5 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        >
                          {showConfirmPassword ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {formErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {formErrors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setIsCountryDropdownOpen(!isCountryDropdownOpen)
                        }
                        className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center text-[var(--text-primary)] hover:bg-[var(--background)] px-1 py-1 rounded"
                      >
                        <span className="mr-1">{selectedCountry.flag}</span>
                        <span>{selectedCountry.dialCode}</span>
                        <ChevronDownIcon className="h-4 w-4 ml-1" />
                      </button>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handlePhoneChange}
                        className="w-full pl-24 pr-4 py-2.5 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                        placeholder="Phone number"
                      />

                      {isCountryDropdownOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg">
                          {countries.map((country) => (
                            <button
                              key={country.code}
                              type="button"
                              onClick={() => {
                                setSelectedCountry(country);
                                setIsCountryDropdownOpen(false);
                              }}
                              className="w-full flex items-center px-4 py-2 hover:bg-[var(--background)] text-[var(--text-primary)]"
                            >
                              <span className="mr-2">{country.flag}</span>
                              <span className="flex-1 text-left">
                                {country.name}
                              </span>
                              <span className="text-[var(--text-secondary)]">
                                {country.dialCode}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {formErrors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {formErrors.phoneNumber}
                      </p>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                      Address
                    </label>
                    <div className="relative">
                      <MapPinIcon className="absolute left-3 top-3 h-5 w-5 text-[var(--text-secondary)]" />
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows="1"
                        className="w-full pl-10 pr-4 py-2.5 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none"
                        placeholder="Your address"
                      />
                    </div>
                    {formErrors.address && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {formErrors.address}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 border border-transparent rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </button>
                </form>
              )}

              {/* OTP Verification Form */}
              {step === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 mb-4">
                      <EnvelopeIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <p className="text-[var(--text-secondary)]">
                      We've sent a verification code to
                      <br />
                      <span className="font-medium text-[var(--text-primary)]">
                        {formData.email}
                      </span>
                    </p>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text-primary)] focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                      placeholder="000000"
                      maxLength="6"
                    />
                    {formErrors.otp && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 text-center">
                        {formErrors.otp}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 border border-transparent rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    {loading ? "Verifying..." : "Verify Email"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    ← Back to registration
                  </button>
                </form>
              )}

              {/* Divider */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--border)]"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[var(--surface)] text-[var(--text-secondary)]">
                      Already have an account?
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/login")}
                  className="mt-4 w-full py-3 px-4 border border-[var(--border)] rounded-lg text-[var(--text-primary)] bg-[var(--surface)] hover:bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 font-medium transition-colors"
                >
                  Sign in instead
                </button>
              </div>

              {/* Terms */}
              <p className="mt-6 text-center text-xs text-[var(--text-secondary)]">
                By creating an account, you agree to our{" "}
                <a
                  href="#"
                  className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
