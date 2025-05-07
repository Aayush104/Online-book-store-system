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
} from "@heroicons/react/24/outline";
import AdminBookService from "../services/AdminBookService";

const AddBookModal = ({ isOpen, onClose, bookToEdit = null }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [activeTab, setActiveTab] = useState("basic"); // "basic", "details", "pricing"

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

  // Debug log to see what's in bookToEdit
  useEffect(() => {
    console.log("Book to edit:", bookToEdit);
  }, [bookToEdit]);

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
      console.log("Loading book edit data:", bookToEdit);

      // Extract the relevant fields from the book data
      const { id, bookPhoto, createdAt, updatedAt, ...rest } = bookToEdit;

      // Convert lowercase/camelCase keys to PascalCase for the form
      const normalizedData = normalizeKeys(rest, true);
      console.log("Normalized data:", normalizedData);

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
      console.log("Formatted data being set in form:", formattedData);

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
      "IsAvailableInLibrary",
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

      // Debug log all entries
      console.log("FormData entries being sent:");
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      // Send the request directly without any further processing
      let response;

      console.log("book", bookToEdit);
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
                <div className="flex-shrink-0 h-40 w-28 relative border rounded-lg overflow-hidden shadow-sm border-neutral-200 dark:border-neutral-600 transition-all">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Book preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
                      <BookOpenIcon className="text-neutral-400 dark:text-neutral-500 h-16 w-16" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <label className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-md cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 inline-flex items-center shadow-sm text-sm">
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
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      JPG or PNG, max 5MB
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="Title"
                      value={formData.Title || ""}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-md shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200 dark:focus:ring-emerald-800 focus:ring-opacity-50 transition-colors"
                      placeholder="Book title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Author *
                    </label>
                    <input
                      type="text"
                      name="Author"
                      value={formData.Author || ""}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-md shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200 dark:focus:ring-emerald-800 focus:ring-opacity-50 transition-colors"
                      placeholder="Author name"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Description *
                </label>
                <textarea
                  name="Description"
                  value={formData.Description || ""}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-md shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200 dark:focus:ring-emerald-800 focus:ring-opacity-50 transition-colors"
                  placeholder="Book description..."
                ></textarea>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center mb-1">
                  <BookmarkIcon className="w-4 h-4 mr-1 text-emerald-500" />
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    ISBN *
                  </label>
                </div>
                <input
                  type="text"
                  name="ISBN"
                  value={formData.Isbn || ""}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-md shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200 dark:focus:ring-emerald-800 focus:ring-opacity-50 transition-colors"
                  placeholder="ISBN number"
                />
              </div>

              <div>
                <div className="flex items-center mb-1">
                  <TagIcon className="w-4 h-4 mr-1 text-emerald-500" />
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Genre *
                  </label>
                </div>
                <input
                  type="text"
                  name="Genre"
                  value={formData.Genre || ""}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-md shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200 dark:focus:ring-emerald-800 focus:ring-opacity-50 transition-colors"
                  placeholder="e.g. Fiction, Science, etc."
                />
              </div>

              <div>
                <div className="flex items-center mb-1">
                  <GlobeAltIcon className="w-4 h-4 mr-1 text-emerald-500" />
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Language *
                  </label>
                </div>
                <input
                  type="text"
                  name="Language"
                  value={formData.Language || ""}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-md shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200 dark:focus:ring-emerald-800 focus:ring-opacity-50 transition-colors"
                  placeholder="e.g. English, Spanish, etc."
                />
              </div>

              <div>
                <div className="flex items-center mb-1">
                  <ArchiveBoxIcon className="w-4 h-4 mr-1 text-emerald-500" />
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Format *
                  </label>
                </div>
                <select
                  name="Format"
                  value={formData.Format || ""}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-md shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200 dark:focus:ring-emerald-800 focus:ring-opacity-50 transition-colors"
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

              <div>
                <div className="flex items-center mb-1">
                  <BookmarkIcon className="w-4 h-4 mr-1 text-emerald-500" />
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Exclusive Edition (Optional)
                  </label>
                </div>
                <input
                  type="text"
                  name="ExclusiveEdition"
                  value={formData.ExclusiveEdition || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-md shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200 dark:focus:ring-emerald-800 focus:ring-opacity-50 transition-colors"
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
              <div>
                <div className="flex items-center mb-1">
                  <BookOpenIcon className="w-4 h-4 mr-1 text-emerald-500" />
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Publisher *
                  </label>
                </div>
                <input
                  type="text"
                  name="Publisher"
                  value={formData.Publisher || ""}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-md shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200 dark:focus:ring-emerald-800 focus:ring-opacity-50 transition-colors"
                  placeholder="Publisher name"
                />
              </div>

              <div>
                <div className="flex items-center mb-1">
                  <CalendarIcon className="w-4 h-4 mr-1 text-emerald-500" />
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Publication Date *
                  </label>
                </div>
                <input
                  type="date"
                  name="PublicationDate"
                  value={formData.PublicationDate || ""}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-md shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200 dark:focus:ring-emerald-800 focus:ring-opacity-50 transition-colors"
                />
              </div>

              <div className="flex items-center p-3 border border-neutral-200 dark:border-neutral-600 rounded-md bg-neutral-50 dark:bg-neutral-800">
                <input
                  type="checkbox"
                  id="IsAvailableInLibrary"
                  name="IsAvailableInLibrary"
                  checked={formData.IsAvailableInLibrary || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-neutral-300 dark:border-neutral-600 rounded"
                />
                <label
                  htmlFor="IsAvailableInLibrary"
                  className="ml-2 block text-sm text-neutral-700 dark:text-neutral-300"
                >
                  Available in physical library
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center mb-1">
                  <CurrencyDollarIcon className="w-4 h-4 mr-1 text-emerald-500" />
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Price *
                  </label>
                </div>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-neutral-500 dark:text-neutral-400 sm:text-sm">
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
                    className="w-full pl-7 pr-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-md shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200 dark:focus:ring-emerald-800 focus:ring-opacity-50 transition-colors"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center mb-1">
                  <ArchiveBoxIcon className="w-4 h-4 mr-1 text-emerald-500" />
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Stock *
                  </label>
                </div>
                <input
                  type="number"
                  name="Stock"
                  value={formData.Stock || ""}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-md shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200 dark:focus:ring-emerald-800 focus:ring-opacity-50 transition-colors"
                  placeholder="Quantity available"
                />
              </div>
            </div>
          </div>
        );
      case "pricing":
        return (
          <div className="space-y-6">
            <div className="p-5 bg-gradient-to-br from-emerald-50 to-white dark:from-neutral-700 dark:to-neutral-800 rounded-lg border border-emerald-100 dark:border-neutral-600 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <CurrencyDollarIcon className="w-5 h-5 text-emerald-500" />
                <h3 className="font-medium text-neutral-900 dark:text-neutral-200">
                  Promotional Pricing
                </h3>
              </div>

              <div className="flex items-center mb-4 pb-4 border-b border-emerald-100 dark:border-neutral-600">
                <input
                  type="checkbox"
                  id="OnSale"
                  name="OnSale"
                  checked={formData.OnSale || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-neutral-300 dark:border-neutral-600 rounded"
                />
                <label
                  htmlFor="OnSale"
                  className="ml-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Set book on sale
                </label>
              </div>

              {formData.OnSale && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Discount Percentage
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <input
                        type="number"
                        name="DiscountPercentage"
                        value={formData.DiscountPercentage || ""}
                        onChange={handleChange}
                        min="1"
                        max="100"
                        className="w-full pl-3 pr-10 py-2 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-md shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200 dark:focus:ring-emerald-800 focus:ring-opacity-50 transition-colors"
                        placeholder="0-100%"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-neutral-500 dark:text-neutral-400">
                          %
                        </span>
                      </div>
                    </div>
                    {formData.DiscountPercentage && formData.Price && (
                      <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">
                        Sale price: $
                        {(
                          formData.Price -
                          (formData.Price * formData.DiscountPercentage) / 100
                        ).toFixed(2)}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        name="DiscountStartDate"
                        value={formData.DiscountStartDate || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-md shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200 dark:focus:ring-emerald-800 focus:ring-opacity-50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        name="DiscountEndDate"
                        value={formData.DiscountEndDate || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-md shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200 dark:focus:ring-emerald-800 focus:ring-opacity-50 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const isFormComplete = () => {
    console.log("Checking if form is complete");
    console.log("Current form data:", formData);

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
      console.log("Form incomplete: missing photo in add mode");
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

    if (missingFields.length > 0) {
      console.log("Form incomplete, missing fields:", missingFields);
      return false;
    }

    console.log("Form is complete");
    return true;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-neutral-900/50 dark:bg-black/50 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-neutral-200 dark:border-neutral-700 bg-emerald-600 text-white">
          <h3 className="text-xl font-bold flex items-center">
            <BookOpenIcon className="w-6 h-6 mr-2" />
            {bookToEdit ? "Edit Book" : "Add New Book"}
          </h3>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-white hover:text-neutral-200 transition-colors"
            aria-label="Close"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Status messages */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-900 p-4 dark:bg-red-900/20 dark:text-red-100">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-900 p-4 dark:bg-emerald-900/20 dark:text-emerald-100">
            <div className="flex items-center">
              <CheckIcon className="w-5 h-5 mr-2" />
              <p>
                {bookToEdit
                  ? "Book updated successfully!"
                  : "Book added successfully!"}
              </p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-5 pt-3 border-b border-neutral-200 dark:border-neutral-700">
          <nav className="flex space-x-4" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("basic")}
              className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === "basic"
                  ? "text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500"
                  : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
              }`}
            >
              Basic Info
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === "details"
                  ? "text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500"
                  : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab("pricing")}
              className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === "pricing"
                  ? "text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500"
                  : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
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
          <div className="px-5 py-4 bg-neutral-50 dark:bg-neutral-700 border-t border-neutral-200 dark:border-neutral-600 rounded-b-lg flex justify-between items-center">
            <div className="flex items-center">
              <div
                className={`w-2 h-2 rounded-full mr-2 ${
                  isFormComplete() ? "bg-emerald-500" : "bg-red-500"
                }`}
              ></div>
              <span className="text-sm text-neutral-600 dark:text-neutral-300">
                {isFormComplete()
                  ? "All required fields completed"
                  : "Complete all required fields"}
              </span>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-2 border border-neutral-200 dark:border-neutral-600 rounded-md shadow-sm text-sm font-medium text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-600 transition-colors inline-flex items-center"
              >
                <ArrowPathIcon className="w-4 h-4 mr-1" />
                Reset
              </button>
              <button
                type="submit"
                disabled={loading || !isFormComplete()}
                className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white transition-colors inline-flex items-center ${
                  loading || !isFormComplete()
                    ? "bg-emerald-400 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
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
