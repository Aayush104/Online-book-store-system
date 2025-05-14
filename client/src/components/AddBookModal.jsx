import React, { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import {
  BookOpenIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  TagIcon,
  GlobeAltIcon,
  BookmarkIcon,
  ArchiveBoxIcon,
  PhotoIcon,
  CheckIcon,
  ArrowPathIcon,
  PencilIcon,
  TrashIcon,
  InformationCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import AdminBookService from "../services/AdminBookService";
import { useSelector } from "react-redux";
import { selectTheme } from "../features/userSlice";

const AddBookModal = ({ isOpen, onClose, bookToEdit = null }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [activeTab, setActiveTab] = useState("basic"); // "basic", "details", "pricing"
  const currentTheme = useSelector(selectTheme) || "light";
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

  // Update isDarkMode state whenever theme changes or DOM updates
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
  }, [currentTheme]);

  // Base class for all form inputs with dynamic theming
  const inputClassName = `w-full px-3 py-2.5 ${
    isDarkMode
      ? "bg-[#21242c] border-neutral-700 text-white focus:border-primary-500 focus:ring-primary-800/30 hover:border-primary-700"
      : "bg-white border-neutral-200 text-neutral-800 focus:border-primary-500 focus:ring-primary-200 hover:border-primary-300"
  } border rounded-lg shadow-sm focus:ring focus:ring-opacity-50 transition-all`;

  // Initial form state with capitalized field names (for adding new books)
  const [formData, setFormData] = useState({
    Title: "",
    ISBN: "",
    Description: "",
    Author: "",
    BookPhotoFile: null,
    Genre: "",
    Language: "",
    Format: "",
    Publisher: "",
    PublicationDate: format(new Date(), "yyyy-MM-dd"),
    Price: "",
    Stock: "",
    IsAvailableInLibrary: false,
    OnSale: false,
    DiscountPercentage: "",
    DiscountStartDate: "",
    DiscountEndDate: "",
    ExclusiveEdition: "",
  });

  // Helper function to format dates for the form
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      // Try to parse the date - it could be in various formats
      const date =
        typeof dateString === "string"
          ? parseISO(dateString)
          : new Date(dateString);
      return format(date, "yyyy-MM-dd");
    } catch (error) {
      console.error("Error parsing date:", error, dateString);
      return "";
    }
  };

  // Helper function to normalize keys from camelCase/lowercase to PascalCase
  // This handles converting between backend response format and form field names
  const normalizeKeys = (obj, toPascalCase = true) => {
    if (!obj) return {};

    const result = {};
    Object.entries(obj).forEach(([key, value]) => {
      // Convert the key format based on the toPascalCase parameter
      const normalizedKey = toPascalCase
        ? key.charAt(0).toUpperCase() + key.slice(1) // convert to PascalCase
        : key.charAt(0).toLowerCase() + key.slice(1); // convert to camelCase

      result[normalizedKey] = value;
    });
    return result;
  };

  // Load book data if in edit mode
  useEffect(() => {
    if (bookToEdit) {
      // Extract the relevant fields from the book data
      const { id, bookPhoto, createdAt, updatedAt, ...rest } = bookToEdit;

      // Convert lowercase/camelCase keys to PascalCase for the form
      const normalizedData = normalizeKeys(rest, true);

      // Format dates properly for the form inputs
      const formattedData = {
        ...normalizedData,
        PublicationDate: formatDateForInput(normalizedData.PublicationDate),
        DiscountStartDate: normalizedData.DiscountStartDate
          ? formatDateForInput(normalizedData.DiscountStartDate)
          : "",
        DiscountEndDate: normalizedData.DiscountEndDate
          ? formatDateForInput(normalizedData.DiscountEndDate)
          : "",
      };

      setFormData(formattedData);

      if (bookPhoto) {
        setPreviewImage(bookPhoto);
      }
    } else {
      resetForm();
    }
  }, [bookToEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file" && files[0]) {
      setFormData({ ...formData, [name]: files[0] });
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(files[0]);
    } else if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    const requiredFields = [
      "ISBN",
      "Genre",
      "Format",
      "Title",
      "Author",
      "PublicationDate",
      "Stock",
      "Price",
      "Publisher",
      "Language",
      "Description",
    ];

    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      setError(
        `The following fields are required: ${missingFields.join(", ")}`
      );
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Create a direct FormData object
      const formDataToSend = new FormData();

      // Add each field to the FormData object
      // Convert keys based on whether we're in edit mode or add mode
      Object.entries(formData).forEach(([key, value]) => {
        // Skip null, undefined, or empty string values
        if (value === null || value === undefined || value === "") {
          return;
        }

        // Convert the key format based on the edit mode
        const formattedKey = bookToEdit
          ? key.charAt(0).toLowerCase() + key.slice(1) // convert to camelCase for edit mode
          : key; // keep as is (PascalCase) for add mode

        // Date fields need special handling
        if (
          (key === "PublicationDate" ||
            key === "DiscountStartDate" ||
            key === "DiscountEndDate") &&
          value
        ) {
          const date = new Date(value);
          formDataToSend.append(formattedKey, date.toISOString());
        }
        // Files need special handling
        else if (value instanceof File) {
          formDataToSend.append(formattedKey, value);
        }
        // Boolean values need to be converted to strings
        else if (typeof value === "boolean") {
          formDataToSend.append(formattedKey, value.toString());
        }
        // All other values can be added directly
        else {
          formDataToSend.append(formattedKey, value);
        }
      });

      // Send the request directly without any further processing
      let response;

      if (bookToEdit) {
        response = await AdminBookService.updateExistingBook(
          bookToEdit.bookId,
          formDataToSend
        );
      } else {
        response = await AdminBookService.addNewBook(formDataToSend);
      }

      if (response.isSuccess) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose(true); // Pass true to indicate success
        }, 1500);
      } else {
        setError(response.message || "Operation failed");
      }
    } catch (err) {
      console.error("Error in form submission:", err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      Title: "",
      ISBN: "",
      Description: "",
      Author: "",
      BookPhotoFile: null,
      Genre: "",
      Language: "",
      Format: "",
      Publisher: "",
      PublicationDate: format(new Date(), "yyyy-MM-dd"),
      Price: "",
      Stock: "",
      IsAvailableInLibrary: false,
      OnSale: false,
      DiscountPercentage: "",
      DiscountStartDate: "",
      DiscountEndDate: "",
      ExclusiveEdition: "",
    });
    setPreviewImage(null);
    setActiveTab("basic");
    setError(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "basic":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="flex items-start space-x-4">
                <div
                  className={`flex-shrink-0 h-48 w-36 relative rounded-xl overflow-hidden shadow-md ${
                    isDarkMode ? "border-neutral-700" : "border-neutral-200"
                  } border transition-all hover:shadow-lg group`}
                >
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Book preview"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div
                      className={`h-full w-full ${
                        isDarkMode
                          ? "bg-gradient-to-br from-neutral-700 to-neutral-800"
                          : "bg-gradient-to-br from-neutral-100 to-neutral-200"
                      } flex items-center justify-center`}
                    >
                      <BookOpenIcon
                        className={`${
                          isDarkMode ? "text-neutral-500" : "text-neutral-400"
                        } h-16 w-16`}
                      />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-3 rounded-lg cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 inline-flex items-center shadow-md text-sm">
                      <PhotoIcon className="w-4 h-4 mr-2" />
                      {previewImage ? "Change Image" : "Upload Cover"}
                      <input
                        type="file"
                        name="BookPhotoFile"
                        onChange={handleChange}
                        accept="image/*"
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <label className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-3 rounded-lg cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 inline-flex items-center shadow-md text-sm">
                      <PhotoIcon className="w-4 h-4 mr-2" />
                      {previewImage ? "Change Image" : "Upload Cover"}
                      <input
                        type="file"
                        name="BookPhotoFile"
                        onChange={handleChange}
                        accept="image/*"
                        className="sr-only"
                      />
                    </label>
                    <p
                      className={`text-xs ${
                        isDarkMode ? "text-neutral-400" : "text-neutral-500"
                      } mt-1`}
                    >
                      JPG or PNG, max 5MB
                    </p>
                  </div>

                  <div className="group">
                    <label
                      className={`block text-sm font-medium ${
                        isDarkMode
                          ? "text-neutral-300 group-hover:text-primary-400"
                          : "text-neutral-700 group-hover:text-primary-600"
                      } mb-1.5 transition-colors`}
                    >
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="Title"
                      value={formData.Title || ""}
                      onChange={handleChange}
                      required
                      className={inputClassName}
                      placeholder="Book title"
                    />
                  </div>

                  <div className="group">
                    <label
                      className={`block text-sm font-medium ${
                        isDarkMode
                          ? "text-neutral-300 group-hover:text-primary-400"
                          : "text-neutral-700 group-hover:text-primary-600"
                      } mb-1.5 transition-colors`}
                    >
                      Author <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="Author"
                      value={formData.Author || ""}
                      onChange={handleChange}
                      required
                      className={inputClassName}
                      placeholder="Author name"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 group">
                <label
                  className={`block text-sm font-medium ${
                    isDarkMode
                      ? "text-neutral-300 group-hover:text-primary-400"
                      : "text-neutral-700 group-hover:text-primary-600"
                  } mb-1.5 transition-colors`}
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="Description"
                  value={formData.Description || ""}
                  onChange={handleChange}
                  required
                  rows="5"
                  className={inputClassName}
                  placeholder="Book description..."
                ></textarea>
              </div>
            </div>

            <div className="space-y-4">
              <div className="group">
                <div className="flex items-center mb-1.5">
                  <BookmarkIcon className="w-4 h-4 mr-1.5 text-primary-600 dark:text-primary-500" />
                  <label
                    className={`block text-sm font-medium ${
                      isDarkMode
                        ? "text-neutral-300 group-hover:text-primary-400"
                        : "text-neutral-700 group-hover:text-primary-600"
                    } transition-colors`}
                  >
                    ISBN <span className="text-red-500">*</span>
                  </label>
                </div>
                <input
                  type="text"
                  name="ISBN"
                  value={formData.ISBN || formData.isbn || ""}
                  onChange={handleChange}
                  required
                  className={inputClassName}
                  placeholder="ISBN number"
                />
              </div>

              <div className="group">
                <div className="flex items-center mb-1.5">
                  <TagIcon className="w-4 h-4 mr-1.5 text-primary-600 dark:text-primary-500" />
                  <label
                    className={`block text-sm font-medium ${
                      isDarkMode
                        ? "text-neutral-300 group-hover:text-primary-400"
                        : "text-neutral-700 group-hover:text-primary-600"
                    } transition-colors`}
                  >
                    Genre <span className="text-red-500">*</span>
                  </label>
                </div>
                <input
                  type="text"
                  name="Genre"
                  value={formData.Genre || ""}
                  onChange={handleChange}
                  required
                  className={inputClassName}
                  placeholder="e.g. Fiction, Science, etc."
                />
              </div>

              <div className="group">
                <div className="flex items-center mb-1.5">
                  <GlobeAltIcon className="w-4 h-4 mr-1.5 text-primary-600 dark:text-primary-500" />
                  <label
                    className={`block text-sm font-medium ${
                      isDarkMode
                        ? "text-neutral-300 group-hover:text-primary-400"
                        : "text-neutral-700 group-hover:text-primary-600"
                    } transition-colors`}
                  >
                    Language <span className="text-red-500">*</span>
                  </label>
                </div>
                <input
                  type="text"
                  name="Language"
                  value={formData.Language || ""}
                  onChange={handleChange}
                  required
                  className={inputClassName}
                  placeholder="e.g. English, Spanish, etc."
                />
              </div>

              <div className="group">
                <div className="flex items-center mb-1.5">
                  <ArchiveBoxIcon className="w-4 h-4 mr-1.5 text-primary-600 dark:text-primary-500" />
                  <label
                    className={`block text-sm font-medium ${
                      isDarkMode
                        ? "text-neutral-300 group-hover:text-primary-400"
                        : "text-neutral-700 group-hover:text-primary-600"
                    } transition-colors`}
                  >
                    Format <span className="text-red-500">*</span>
                  </label>
                </div>
                <select
                  name="Format"
                  value={formData.Format || ""}
                  onChange={handleChange}
                  required
                  className={`${inputClassName} appearance-none bg-no-repeat bg-right pr-10`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundSize: "1.5em 1.5em",
                  }}
                >
                  <option value="">Select Format</option>
                  <option value="Paperback">Paperback</option>
                  <option value="Hardcover">Hardcover</option>
                  <option value="Signed">Signed Edition</option>
                  <option value="Limited">Limited Edition</option>
                  <option value="First">First Edition</option>
                  <option value="Collector">Collector's Edition</option>
                  <option value="Deluxe">Deluxe Edition</option>
                </select>
              </div>

              <div className="group">
                <div className="flex items-center mb-1.5">
                  <BookmarkIcon className="w-4 h-4 mr-1.5 text-primary-600 dark:text-primary-500" />
                  <label
                    className={`block text-sm font-medium ${
                      isDarkMode
                        ? "text-neutral-300 group-hover:text-primary-400"
                        : "text-neutral-700 group-hover:text-primary-600"
                    } transition-colors`}
                  >
                    Exclusive Edition{" "}
                    <span
                      className={`${
                        isDarkMode ? "text-neutral-400" : "text-neutral-500"
                      } text-xs font-normal`}
                    >
                      (Optional)
                    </span>
                  </label>
                </div>
                <input
                  type="text"
                  name="ExclusiveEdition"
                  value={formData.ExclusiveEdition || ""}
                  onChange={handleChange}
                  className={inputClassName}
                  placeholder="Special edition details"
                />
              </div>
            </div>
          </div>
        );
      case "details":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="group">
                <div className="flex items-center mb-1.5">
                  <BookOpenIcon className="w-4 h-4 mr-1.5 text-primary-600 dark:text-primary-500" />
                  <label
                    className={`block text-sm font-medium ${
                      isDarkMode
                        ? "text-neutral-300 group-hover:text-primary-400"
                        : "text-neutral-700 group-hover:text-primary-600"
                    } transition-colors`}
                  >
                    Publisher <span className="text-red-500">*</span>
                  </label>
                </div>
                <input
                  type="text"
                  name="Publisher"
                  value={formData.Publisher || ""}
                  onChange={handleChange}
                  required
                  className={inputClassName}
                  placeholder="Publisher name"
                />
              </div>

              <div className="group">
                <div className="flex items-center mb-1.5">
                  <CalendarIcon className="w-4 h-4 mr-1.5 text-primary-600 dark:text-primary-500" />
                  <label
                    className={`block text-sm font-medium ${
                      isDarkMode
                        ? "text-neutral-300 group-hover:text-primary-400"
                        : "text-neutral-700 group-hover:text-primary-600"
                    } transition-colors`}
                  >
                    Publication Date <span className="text-red-500">*</span>
                  </label>
                </div>
                <input
                  type="date"
                  name="PublicationDate"
                  value={formData.PublicationDate || ""}
                  onChange={handleChange}
                  required
                  className={inputClassName}
                />
              </div>

              <div
                className={`p-4 rounded-lg ${
                  isDarkMode
                    ? "border-neutral-700 bg-neutral-800 hover:border-primary-700"
                    : "border-neutral-200 bg-neutral-50 hover:border-primary-300"
                } border group transition-all hover:shadow-md`}
              >
                <div className="flex items-center">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      id="IsAvailableInLibrary"
                      name="IsAvailableInLibrary"
                      checked={formData.IsAvailableInLibrary || false}
                      onChange={handleChange}
                      className={`h-5 w-5 text-primary-600 focus:ring-primary-500 rounded transition-colors ${
                        isDarkMode ? "border-neutral-600" : "border-neutral-300"
                      }`}
                    />
                    <div className="absolute bg-primary-600 w-5 h-5 rounded opacity-10 scale-0 group-hover:scale-150 group-hover:opacity-0 transition-all duration-300"></div>
                  </div>
                  <label
                    htmlFor="IsAvailableInLibrary"
                    className={`ml-2.5 block text-sm ${
                      isDarkMode
                        ? "text-neutral-300 group-hover:text-primary-400"
                        : "text-neutral-700 group-hover:text-primary-600"
                    } transition-colors`}
                  >
                    Available in physical library
                  </label>
                </div>
                <p
                  className={`text-xs ${
                    isDarkMode ? "text-neutral-400" : "text-neutral-500"
                  } mt-2 ml-7.5`}
                >
                  Check this if the book is available for browsing in your
                  physical store location
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="group">
                <div className="flex items-center mb-1.5">
                  <CurrencyDollarIcon className="w-4 h-4 mr-1.5 text-primary-600 dark:text-primary-500" />
                  <label
                    className={`block text-sm font-medium ${
                      isDarkMode
                        ? "text-neutral-300 group-hover:text-primary-400"
                        : "text-neutral-700 group-hover:text-primary-600"
                    } transition-colors`}
                  >
                    Price <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-primary-600 dark:text-primary-400 font-medium sm:text-sm">
                      $
                    </span>
                  </div>
                  <input
                    type="number"
                    name="Price"
                    value={formData.Price || ""}
                    onChange={handleChange}
                    required
                    min="0.01"
                    step="0.01"
                    className={`${inputClassName} pl-7`}
                    placeholder="0.00"
                  />
                </div>
                <p
                  className={`text-xs ${
                    isDarkMode ? "text-neutral-400" : "text-neutral-500"
                  } mt-1.5 ml-1`}
                >
                  Set the regular price before any discounts
                </p>
              </div>

              <div className="group">
                <div className="flex items-center mb-1.5">
                  <ArchiveBoxIcon className="w-4 h-4 mr-1.5 text-primary-600 dark:text-primary-500" />
                  <label
                    className={`block text-sm font-medium ${
                      isDarkMode
                        ? "text-neutral-300 group-hover:text-primary-400"
                        : "text-neutral-700 group-hover:text-primary-600"
                    } transition-colors`}
                  >
                    Stock <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    name="Stock"
                    value={formData.Stock || ""}
                    onChange={handleChange}
                    required
                    min="0"
                    className={inputClassName}
                    placeholder="Quantity available"
                  />
                  {formData.Stock === "0" && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-500 dark:text-amber-400">
                      <ExclamationCircleIcon className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <p
                  className={`text-xs ${
                    isDarkMode ? "text-neutral-400" : "text-neutral-500"
                  } mt-1.5 ml-1`}
                >
                  Enter the number of copies available for purchase
                </p>
              </div>

              <div
                className={`p-4 ${
                  isDarkMode
                    ? "bg-primary-900/20 border-primary-800 text-primary-300"
                    : "bg-primary-50 border-primary-100 text-primary-700"
                } rounded-lg border mt-4`}
              >
                <div className="flex items-center mb-2">
                  <InformationCircleIcon className="h-5 w-5 mr-2" />
                  <h4 className="font-medium text-sm">Book Details Tips</h4>
                </div>
                <ul
                  className={`text-xs ${
                    isDarkMode ? "text-primary-400" : "text-primary-600"
                  } space-y-1 ml-7`}
                >
                  <li>Complete all required fields for better searchability</li>
                  <li>Set stock to 0 if the book is out of stock</li>
                  <li>Use the Pricing tab to set up promotional discounts</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case "pricing":
        return (
          <div className="space-y-6">
            <div
              className={`p-6 ${
                isDarkMode
                  ? "bg-gradient-to-br from-neutral-800 to-neutral-700 border-neutral-700"
                  : "bg-gradient-to-br from-primary-50 to-white border-primary-100"
              } rounded-xl border shadow-sm hover:shadow-md transition-all`}
            >
              <div className="flex items-center mb-5">
                <div
                  className={`h-10 w-10 rounded-full ${
                    isDarkMode ? "bg-primary-900/50" : "bg-primary-100"
                  } flex items-center justify-center mr-3`}
                >
                  <CurrencyDollarIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3
                  className={`font-medium text-lg ${
                    isDarkMode ? "text-neutral-200" : "text-neutral-900"
                  }`}
                >
                  Promotional Pricing
                </h3>
              </div>

              <div
                className={`flex items-center p-4 mb-6 rounded-lg ${
                  isDarkMode
                    ? "bg-black/20 border-primary-800"
                    : "bg-white/80 border-primary-200"
                } border`}
              >
                <div className="relative flex items-center group">
                  <input
                    type="checkbox"
                    id="OnSale"
                    name="OnSale"
                    checked={formData.OnSale || false}
                    onChange={handleChange}
                    className={`h-5 w-5 text-primary-600 focus:ring-primary-500 ${
                      isDarkMode ? "border-neutral-600" : "border-neutral-300"
                    } rounded transition-colors`}
                  />
                  <div className="absolute bg-primary-600 w-5 h-5 rounded opacity-10 scale-0 group-hover:scale-150 group-hover:opacity-0 transition-all duration-300"></div>
                </div>
                <label
                  htmlFor="OnSale"
                  className={`ml-2.5 block text-sm font-medium ${
                    isDarkMode
                      ? "text-neutral-300 group-hover:text-primary-400"
                      : "text-neutral-700 group-hover:text-primary-600"
                  } transition-colors`}
                >
                  Set book on sale
                </label>
              </div>

              {formData.OnSale && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="group">
                    <label
                      className={`block text-sm font-medium ${
                        isDarkMode
                          ? "text-neutral-300 group-hover:text-primary-400"
                          : "text-neutral-700 group-hover:text-primary-600"
                      } mb-1.5 transition-colors`}
                    >
                      Discount Percentage
                    </label>
                    <div className="relative rounded-lg shadow-sm">
                      <input
                        type="number"
                        name="DiscountPercentage"
                        value={formData.DiscountPercentage || ""}
                        onChange={handleChange}
                        min="1"
                        max="100"
                        className={`${inputClassName} pr-12`}
                        placeholder="0-100%"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span
                          className={`${
                            isDarkMode ? "text-primary-400" : "text-primary-600"
                          } font-medium`}
                        >
                          %
                        </span>
                      </div>
                    </div>
                    {formData.DiscountPercentage && formData.Price && (
                      <div
                        className={`mt-3 p-3 ${
                          isDarkMode
                            ? "bg-primary-900/30 border-primary-800"
                            : "bg-primary-100 border-primary-200"
                        } rounded-lg border flex justify-between items-center`}
                      >
                        <div>
                          <p
                            className={`text-sm ${
                              isDarkMode
                                ? "text-primary-300"
                                : "text-primary-800"
                            } font-medium`}
                          >
                            Sale price:
                          </p>
                          <p
                            className={`text-xs ${
                              isDarkMode
                                ? "text-primary-400"
                                : "text-primary-600"
                            }`}
                          >
                            After {formData.DiscountPercentage}% discount
                          </p>
                        </div>
                        <div
                          className={`text-xl font-bold ${
                            isDarkMode ? "text-primary-300" : "text-primary-700"
                          }`}
                        >
                          $
                          {(
                            formData.Price -
                            (formData.Price * formData.DiscountPercentage) / 100
                          ).toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="group">
                      <label
                        className={`block text-sm font-medium ${
                          isDarkMode
                            ? "text-neutral-300 group-hover:text-primary-400"
                            : "text-neutral-700 group-hover:text-primary-600"
                        } mb-1.5 transition-colors`}
                      >
                        Start Date
                      </label>
                      <input
                        type="date"
                        name="DiscountStartDate"
                        value={formData.DiscountStartDate || ""}
                        onChange={handleChange}
                        className={inputClassName}
                      />
                    </div>
                    <div className="group">
                      <label
                        className={`block text-sm font-medium ${
                          isDarkMode
                            ? "text-neutral-300 group-hover:text-primary-400"
                            : "text-neutral-700 group-hover:text-primary-600"
                        } mb-1.5 transition-colors`}
                      >
                        End Date
                      </label>
                      <input
                        type="date"
                        name="DiscountEndDate"
                        value={formData.DiscountEndDate || ""}
                        onChange={handleChange}
                        className={inputClassName}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div
              className={`p-5 ${
                isDarkMode
                  ? "bg-neutral-800 border-neutral-700"
                  : "bg-neutral-50 border-neutral-200"
              } rounded-xl border shadow-sm mt-5`}
            >
              <div className="flex items-center mb-4">
                <InformationCircleIcon
                  className={`w-5 h-5 ${
                    isDarkMode ? "text-neutral-400" : "text-neutral-500"
                  } mr-2`}
                />
                <h3
                  className={`font-medium ${
                    isDarkMode ? "text-neutral-300" : "text-neutral-700"
                  }`}
                >
                  Pricing Tips
                </h3>
              </div>
              <ul
                className={`space-y-2 text-sm ${
                  isDarkMode ? "text-neutral-400" : "text-neutral-600"
                } ml-7 list-disc`}
              >
                <li>Set competitive prices based on market research</li>
                <li>
                  Plan your discount periods around holidays or special events
                </li>
                <li>
                  Limited-time discounts can create urgency and boost sales
                </li>
                <li>
                  Remember that orders of 5+ books automatically receive 5%
                  discount
                </li>
              </ul>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const isFormComplete = () => {
    const requiredFields = [
      "Title",
      "ISBN",
      "Description",
      "Author",
      "Genre",
      "Language",
      "Format",
      "Publisher",
      "PublicationDate",
      "Price",
      "Stock",
    ];

    // For edit mode, we don't require a new photo
    if (!bookToEdit && !formData.BookPhotoFile && !previewImage) {
      return false;
    }

    // Check each required field
    const missingFields = [];
    for (const field of requiredFields) {
      const value = formData[field];
      if (value === null || value === undefined || value === "") {
        missingFields.push(field);
      }
    }

    return missingFields.length === 0;
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 ${
        isDarkMode ? "bg-black/70" : "bg-neutral-900/60"
      } z-50 flex justify-center items-center p-4 backdrop-blur-sm`}
    >
      <div
        className={`${
          isDarkMode ? "bg-[#21242c]" : "bg-white"
        } rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col`}
      >
        {/* Header */}
        <div
          className={`flex justify-between items-center p-5 border-b ${
            isDarkMode
              ? "border-neutral-700 bg-primary-600"
              : "border-neutral-200 bg-primary-600"
          } text-white`}
        >
          <h3 className="text-xl font-bold flex items-center">
            <BookOpenIcon className="w-6 h-6 mr-2" />
            {bookToEdit ? "Edit Book" : "Add New Book"}
          </h3>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-white hover:text-neutral-200 transition-colors p-1 rounded-full hover:bg-white/10"
            aria-label="Close"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Status messages */}
        {error && (
          <div
            className={`${
              isDarkMode
                ? "bg-red-900/20 text-red-100"
                : "bg-red-50 text-red-900"
            } border-l-4 border-red-500 p-4 flex items-start animate-fadeIn`}
          >
            <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div
            className={`${
              isDarkMode
                ? "bg-primary-900/20 text-primary-100"
                : "bg-primary-50 text-primary-900"
            } border-l-4 border-primary-500 p-4 animate-fadeIn`}
          >
            <div className="flex items-center">
              <CheckIcon
                className={`w-5 h-5 mr-2 ${
                  isDarkMode ? "text-primary-400" : "text-primary-600"
                }`}
              />
              <p>
                {bookToEdit
                  ? "Book updated successfully!"
                  : "Book added successfully!"}
              </p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div
          className={`px-5 py-3 border-b ${
            isDarkMode
              ? "border-neutral-700 bg-[#21242c]"
              : "border-neutral-200 bg-white"
          }`}
        >
          <nav className="flex space-x-4" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("basic")}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === "basic"
                  ? `text-white bg-primary-600 shadow-md`
                  : `${
                      isDarkMode
                        ? "text-neutral-300 hover:bg-neutral-700 hover:text-primary-400"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-primary-600"
                    }`
              }`}
            >
              Basic Info
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === "details"
                  ? `text-white bg-primary-600 shadow-md`
                  : `${
                      isDarkMode
                        ? "text-neutral-300 hover:bg-neutral-700 hover:text-primary-400"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-primary-600"
                    }`
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab("pricing")}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === "pricing"
                  ? `text-white bg-primary-600 shadow-md`
                  : `${
                      isDarkMode
                        ? "text-neutral-300 hover:bg-neutral-700 hover:text-primary-400"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-primary-600"
                    }`
              }`}
            >
              Pricing
            </button>
          </nav>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-5">{renderTabContent()}</div>

          {/* Form Actions */}
          <div
            className={`px-5 py-4 ${
              isDarkMode
                ? "bg-[#21242c] border-neutral-700"
                : "bg-neutral-50 border-neutral-200"
            } border-t rounded-b-lg flex justify-between items-center`}
          >
            <div className="flex items-center">
              {isFormComplete() ? (
                <div
                  className={`flex items-center ${
                    isDarkMode ? "text-primary-400" : "text-primary-600"
                  }`}
                >
                  <CheckIcon className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">
                    Ready to {bookToEdit ? "update" : "add"}
                  </span>
                </div>
              ) : (
                <div
                  className={`flex items-center ${
                    isDarkMode ? "text-amber-400" : "text-amber-600"
                  }`}
                >
                  <ExclamationCircleIcon className="w-5 h-5 mr-2" />
                  <span className="text-sm">Complete all required fields</span>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className={`px-4 py-2.5 border rounded-lg shadow-sm text-sm font-medium transition-all hover:shadow inline-flex items-center ${
                  isDarkMode
                    ? "border-neutral-600 text-neutral-200 bg-neutral-700 hover:bg-neutral-600"
                    : "border-neutral-200 text-neutral-700 bg-white hover:bg-neutral-50"
                }`}
              >
                <ArrowPathIcon className="w-4 h-4 mr-1.5" />
                Reset
              </button>
              <button
                type="submit"
                disabled={loading || !isFormComplete()}
                className={`px-5 py-2.5 rounded-lg shadow-sm text-sm font-medium text-white transition-all inline-flex items-center ${
                  loading || !isFormComplete()
                    ? `${
                        isDarkMode ? "bg-primary-600/50" : "bg-primary-400"
                      } cursor-not-allowed opacity-70`
                    : `${
                        isDarkMode
                          ? "bg-primary-600 hover:bg-primary-700"
                          : "bg-primary-600 hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      } hover:shadow-lg`
                }`}
              >
                {loading ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                    {bookToEdit ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  <>
                    {bookToEdit ? (
                      <>
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Update Book
                      </>
                    ) : (
                      <>
                        <CheckIcon className="w-4 h-4 mr-2" />
                        Add Book
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBookModal;
