import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiBell } from "react-icons/fi";
import AnnouncementService from "../../services/AnnouncementService";
import { useToast } from "../../components/Toast";
import { useSelector } from "react-redux";
import { selectTheme } from "../../features/userSlice";

const AnnouncementManagement = () => {
  // Use custom toast
  const { showToast } = useToast();

  // Get theme from Redux store
  const theme = useSelector(selectTheme);

  // State to track dark mode - will update when theme changes
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Update isDarkMode state whenever theme changes
  useEffect(() => {
    if (typeof document !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    }
  }, [theme]); // Re-run when theme changes in Redux store

  // State variables
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    announcementDateTime: new Date().toISOString().slice(0, 16),
    endDateTime: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState(null);

  // Set up a mutation observer to track theme changes outside of Redux
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

  // Fetch announcements data
  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      // Try to fetch from API
      const response = await AnnouncementService.getAllAnnouncements();
      if (response && response.data) {
        setAnnouncements(Array.isArray(response.data) ? response.data : []);
      } else {
        showToast({
          type: "error",
          message: "Failed to fetch announcements data",
        });
        setAnnouncements([]);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
      showToast({
        type: "error",
        message: "An error occurred while fetching announcement data",
      });
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchAnnouncements();

    // Set initial dark mode state
    if (typeof document !== "undefined") {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    }
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Open modal for creating new announcement
  const openCreateModal = () => {
    setFormData({
      title: "",
      description: "",
      announcementDateTime: new Date().toISOString().slice(0, 16),
      endDateTime: "",
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  // Open modal for editing announcement
  const openEditModal = (announcement) => {
    const formatDate = (dateString) => {
      if (!dateString) return "";
      try {
        const date = new Date(dateString);
        // Check if the date is valid before converting to ISO string
        if (isNaN(date.getTime())) return "";
        return date.toISOString().slice(0, 16);
      } catch (error) {
        console.error("Error formatting date:", error);
        return "";
      }
    };

    setFormData({
      title: announcement.title || "",
      description: announcement.description || "",
      announcementDateTime:
        formatDate(announcement.announcementDateTime) ||
        new Date().toISOString().slice(0, 16),
      endDateTime: formatDate(announcement.endDateTime) || "",
    });
    setEditingAnnouncementId(announcement.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Convert local date to UTC for submission
  const prepareFormDataForSubmission = (data) => {
    const preparedData = { ...data };

    // Convert announcementDateTime to UTC
    if (preparedData.announcementDateTime) {
      const localDate = new Date(preparedData.announcementDateTime);
      if (!isNaN(localDate.getTime())) {
        // Create a new UTC date string
        preparedData.announcementDateTime = localDate.toISOString();
      }
    }

    // Convert endDateTime to UTC if present
    if (preparedData.endDateTime) {
      const localEndDate = new Date(preparedData.endDateTime);
      if (!isNaN(localEndDate.getTime())) {
        // Create a new UTC date string
        preparedData.endDateTime = localEndDate.toISOString();
      } else {
        // If invalid, set to null (not empty string)
        preparedData.endDateTime = null;
      }
    } else {
      // If empty string, set to null
      preparedData.endDateTime = null;
    }

    return preparedData;
  };

  // Submit form to create/edit announcement
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.description ||
      !formData.announcementDateTime
    ) {
      showToast({
        type: "error",
        message: "Please fill all the required fields",
      });
      return;
    }

    try {
      // Prepare data with UTC dates for PostgreSQL
      const submissionData = prepareFormDataForSubmission(formData);

      // Log the data being sent for debugging
      console.log("Submitting data:", submissionData);

      if (isEditing) {
        // Update existing announcement
        await AnnouncementService.updateAnnouncement(
          editingAnnouncementId,
          submissionData
        );
        showToast({
          type: "success",
          message: "Announcement updated successfully",
        });
      } else {
        // Create new announcement
        const response = await AnnouncementService.createAnnouncement(
          submissionData
        );
        if (response && response.data) {
          showToast({
            type: "success",
            message: "Announcement created successfully",
            title: "Success",
          });
        } else {
          showToast({
            type: "error",
            message: response?.message || "Failed to create announcement",
            title: "Error",
          });
        }
      }
      closeModal();
      fetchAnnouncements();
    } catch (error) {
      console.error("Error:", error);
      showToast({
        type: "error",
        message:
          error.message || "An error occurred. PostgreSQL requires UTC dates.",
        title: "Error",
      });
    }
  };

  // Delete announcement
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        await AnnouncementService.deleteAnnouncement(id);
        showToast({
          type: "success",
          message: "Announcement deleted successfully",
        });
        fetchAnnouncements();
      } catch (error) {
        console.error("Error deleting announcement:", error);
        showToast({
          type: "error",
          message: "An error occurred while deleting the announcement",
        });
      }
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim() === "") {
      fetchAnnouncements();
      return;
    }

    const filtered = announcements.filter(
      (announcement) =>
        (announcement.title &&
          announcement.title
            .toLowerCase()
            .includes(e.target.value.toLowerCase())) ||
        (announcement.description &&
          announcement.description
            .toLowerCase()
            .includes(e.target.value.toLowerCase()))
    );
    setAnnouncements(filtered);
  };

  // Helper to format dates nicely
  const formatDateTime = (dateString) => {
    if (!dateString) return "No end date";

    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return "Invalid date";

      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  // Helper to determine announcement status
  const getStatus = (announcement) => {
    try {
      const now = new Date();
      const startDate = announcement.announcementDateTime
        ? new Date(announcement.announcementDateTime)
        : null;
      const endDate = announcement.endDateTime
        ? new Date(announcement.endDateTime)
        : null;

      // Check if dates are valid
      if (!startDate || isNaN(startDate.getTime())) {
        return {
          text: "Invalid Date",
          colorClass: isDarkMode
            ? "bg-red-900 text-red-400"
            : "bg-red-100 text-red-600",
        };
      }

      if (startDate > now) {
        return {
          text: "Scheduled",
          colorClass: isDarkMode
            ? "bg-yellow-900 text-yellow-400"
            : "bg-yellow-100 text-yellow-600",
        };
      } else if (!endDate || endDate >= now) {
        return {
          text: "Active",
          colorClass: isDarkMode
            ? "bg-green-900 text-green-400"
            : "bg-green-100 text-green-600",
        };
      } else {
        return {
          text: "Expired",
          colorClass: isDarkMode
            ? "bg-neutral-800 text-neutral-400"
            : "bg-neutral-100 text-neutral-600",
        };
      }
    } catch (error) {
      return {
        text: "Unknown",
        colorClass: isDarkMode
          ? "bg-neutral-800 text-neutral-400"
          : "bg-neutral-100 text-neutral-600",
      };
    }
  };

  return (
    <div className="bg-[var(--background)] rounded-lg shadow p-6 transition-all duration-200">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">
          Announcement Management
        </h1>
        <button
          onClick={openCreateModal}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            isDarkMode
              ? "bg-primary-600 hover:bg-primary-700 text-white"
              : "bg-primary-600 hover:bg-primary-500 text-white"
          }`}
        >
          <FiPlus className="mr-2" /> Add Announcement
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <FiSearch className="text-[var(--text-secondary)]" />
          </span>
          <input
            type="text"
            placeholder="Search announcements by title or description"
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-10">
          <div className="flex justify-center">
            <div className="bg-[var(--surface)] p-4 rounded-full">
              <FiBell className="text-[var(--text-secondary)] text-5xl" />
            </div>
          </div>
          <p className="text-[var(--text-primary)] text-lg mt-4">
            No announcements found.
          </p>
          <p className="text-[var(--text-secondary)] mt-1">
            {searchTerm
              ? "Try adjusting your search criteria."
              : "Add announcements to get started."}
          </p>
          <button
            onClick={openCreateModal}
            className={`mt-4 px-4 py-2 rounded-lg transition-colors ${
              isDarkMode
                ? "bg-primary-600 hover:bg-primary-700 text-white"
                : "bg-primary-600 hover:bg-primary-500 text-white"
            }`}
          >
            Create Your First Announcement
          </button>
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
                <th className="py-3 px-6 text-left">Title</th>
                <th className="py-3 px-6 text-left">Description</th>
                <th className="py-3 px-6 text-left">Start Date</th>
                <th className="py-3 px-6 text-left">End Date</th>
                <th className="py-3 px-6 text-left">Status</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[var(--text-primary)] text-sm">
              {announcements.map((announcement) => {
                const status = getStatus(announcement);
                return (
                  <tr
                    key={announcement.id || Math.random().toString()}
                    className={`border-b border-[var(--border)] ${
                      isDarkMode
                        ? "hover:bg-neutral-800"
                        : "hover:bg-neutral-50"
                    } transition-colors`}
                  >
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="mr-2">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                              isDarkMode
                                ? "bg-primary-900 text-primary-400"
                                : "bg-primary-100 text-primary-600"
                            }`}
                          >
                            <FiBell size={16} />
                          </div>
                        </div>
                        <span className="font-medium">
                          {announcement.title || "Untitled"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-left">
                      <div className="truncate max-w-xs">
                        {announcement.description || "No description"}
                      </div>
                    </td>
                    <td className="py-3 px-6 text-left">
                      {formatDateTime(announcement.announcementDateTime)}
                    </td>
                    <td className="py-3 px-6 text-left">
                      {formatDateTime(announcement.endDateTime)}
                    </td>
                    <td className="py-3 px-6 text-left">
                      <span
                        className={`py-1 px-3 rounded-full text-xs ${status.colorClass}`}
                      >
                        {status.text}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-center">
                      <div className="flex justify-center items-center space-x-3">
                        <button
                          onClick={() => openEditModal(announcement)}
                          className={`transition-colors ${
                            isDarkMode
                              ? "text-info-400 hover:text-info-300"
                              : "text-info-600 hover:text-info-800"
                          }`}
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(announcement.id)}
                          className={`transition-colors ${
                            isDarkMode
                              ? "text-error-400 hover:text-error-300"
                              : "text-error-600 hover:text-error-800"
                          }`}
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Announcement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--surface)] rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                {isEditing ? "Edit Announcement" : "Add New Announcement"}
              </h2>
              <button
                onClick={closeModal}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-[var(--text-secondary)] text-sm font-medium mb-2">
                  Title*
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter announcement title"
                  required
                  maxLength={100}
                />
                <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                  A short, attention-grabbing title (max 100 characters)
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-[var(--text-secondary)] text-sm font-medium mb-2">
                  Description*
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter announcement details"
                  required
                  maxLength={500}
                ></textarea>
                <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                  Detailed message for your announcement (max 500 characters)
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-[var(--text-secondary)] text-sm font-medium mb-2">
                    Start Date & Time*
                  </label>
                  <input
                    type="datetime-local"
                    name="announcementDateTime"
                    value={formData.announcementDateTime}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                  <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                    When to start displaying
                  </p>
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] text-sm font-medium mb-2">
                    End Date & Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    name="endDateTime"
                    value={formData.endDateTime}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                    Leave empty for no end date
                  </p>
                </div>
              </div>

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
                  type="submit"
                  className={`px-4 py-2 rounded-md transition-colors ${
                    isDarkMode
                      ? "bg-primary-600 hover:bg-primary-700 text-white"
                      : "bg-primary-600 hover:bg-primary-500 text-white"
                  }`}
                >
                  {isEditing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementManagement;
