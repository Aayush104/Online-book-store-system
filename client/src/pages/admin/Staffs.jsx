import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiUser } from "react-icons/fi";
import AuthService from "../../services/AuthService";
import api from "../../services/api";
import { useToast } from "../../components/Toast";
import { useSelector } from "react-redux";
import { selectTheme } from "../../features/userSlice";

const Staffs = () => {
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
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    staffName: "",
    email: "",
    phoneNumber: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);

  // Fetch staff data
  const fetchStaffs = async () => {
    setLoading(true);
    try {
      // For development, using mock data
      // In production, uncomment this and use API call

      const response = await api.get(
        `https://localhost:7219/api/Auth/GetAllStaff`
      );
      console.log(response.isSuccess);
      if (response.isSuccess && response.data) {
        setStaffs(response.data || []);
        setTotalPages(response.data.totalPages || 1);
        setLoading(false);
      } else {
        showToast({
          type: "error",
          message: "Failed to fetch staff data",
        });
      }

      // Using mock data for now
    } catch (error) {
      console.error("Error fetching staff:", error);
      showToast({
        type: "error",
        message: "An error occurred while fetching staff data",
      });
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchStaffs();

    // Set initial dark mode state
    if (typeof document !== "undefined") {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    }
  }, []);

  // Also set up a mutation observer to track theme changes outside of Redux
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

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Open modal for creating new staff
  const openCreateModal = () => {
    setFormData({
      staffName: "",
      email: "",
      phoneNumber: "",
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  // Open modal for editing staff
  const openEditModal = (staff) => {
    setFormData({
      staffName: staff.staffName,
      email: staff.email,
      phoneNumber: staff.phoneNumber,
    });
    setEditingStaffId(staff.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Submit form to create/edit staff
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.staffName || !formData.email || !formData.phoneNumber) {
      showToast({
        type: "error",
        message: "Please fill all the required fields",
      });
      return;
    }

    try {
      if (isEditing) {
        // Update existing staff - for now, just mock the update
        showToast({
          type: "success",
          message: "Staff updated successfully",
        });
        const updatedStaffs = staffs.map((staff) =>
          staff.id === editingStaffId ? { ...staff, ...formData } : staff
        );
        setStaffs(updatedStaffs);
        closeModal();
      } else {
        // Create new staff using the AuthService
        const response = await AuthService.createStaff(formData);

        if (response && response.isSuccess) {
          showToast({
            type: "success",
            message: "Staff created successfully",
            title: "Success",
          });

          // Add the new staff to the list with mock data for display
          const newStaff = {
            id: staffs.length + 1,
            ...formData,
            role: "Staff Member",
            joinDate: new Date().toISOString().split("T")[0],
          };

          setStaffs([...staffs, newStaff]);
          closeModal();
        } else {
          showToast({
            type: "error",
            message: response?.message || "Failed to create staff",
            title: "Error",
          });
        }
      }
    } catch (error) {
      console.error("Error:", error);
      showToast({
        type: "error",
        message: error.message || "An error occurred",
        title: "Error",
      });
    }
  };

  // Delete staff
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        // For now, just mock the deletion
        const filteredStaffs = staffs.filter((staff) => staff.id !== id);
        setStaffs(filteredStaffs);
        showToast({
          type: "success",
          message: "Staff deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting staff:", error);
        showToast({
          type: "error",
          message: "An error occurred while deleting staff",
        });
      }
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    const filtered = mockStaffs.filter(
      (staff) =>
        staff.fullName.toLowerCase().includes(e.target.value.toLowerCase()) ||
        staff.email.toLowerCase().includes(e.target.value.toLowerCase()) ||
        staff.role.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setStaffs(filtered);
  };

  return (
    <div className="bg-[var(--background)] rounded-lg shadow p-6 transition-all duration-200">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">
          Staff Management
        </h1>
        <button
          onClick={openCreateModal}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            isDarkMode
              ? "bg-primary-600 hover:bg-primary-700 text-white"
              : "bg-primary-600 hover:bg-primary-500 text-white"
          }`}
        >
          <FiPlus className="mr-2" /> Add Staff
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
            placeholder="Search by name, email, or role"
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Staff List */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : staffs.length === 0 ? (
        <div className="text-center py-10">
          <div className="flex justify-center">
            <div className="bg-[var(--surface)] p-4 rounded-full">
              <FiUser className="text-[var(--text-secondary)] text-5xl" />
            </div>
          </div>
          <p className="text-[var(--text-primary)] text-lg mt-4">
            No staff members found.
          </p>
          <p className="text-[var(--text-secondary)] mt-1">
            {searchTerm
              ? "Try adjusting your search criteria."
              : "Add staff members to get started."}
          </p>
          <button
            onClick={openCreateModal}
            className={`mt-4 px-4 py-2 rounded-lg transition-colors ${
              isDarkMode
                ? "bg-primary-600 hover:bg-primary-700 text-white"
                : "bg-primary-600 hover:bg-primary-500 text-white"
            }`}
          >
            Add Your First Staff Member
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
                <th className="py-3 px-6 text-left">Name</th>
                <th className="py-3 px-6 text-left">Email</th>
                <th className="py-3 px-6 text-left">Phone</th>
                <th className="py-3 px-6 text-left">Role</th>
                <th className="py-3 px-6 text-left">Join Date</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[var(--text-primary)] text-sm">
              {staffs.map((staff) => (
                <tr
                  key={staff.id}
                  className={`border-b border-[var(--border)] ${
                    isDarkMode ? "hover:bg-neutral-800" : "hover:bg-neutral-50"
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
                          {staff.staffName?.charAt(0).toUpperCase() || "?"}
                        </div>
                      </div>
                      <span>{staff.staffName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-left">{staff.email}</td>
                  <td className="py-3 px-6 text-left">{staff.phoneNumber}</td>
                  <td className="py-3 px-6 text-left">
                    <span
                      className={`py-1 px-3 rounded-full text-xs ${
                        isDarkMode
                          ? "bg-primary-900 text-primary-400"
                          : "bg-primary-100 text-primary-600"
                      }`}
                    >
                      {staff.role || "Staff"}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-left">{staff.joinDate}</td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex justify-center items-center space-x-3">
                      <button
                        onClick={() => openEditModal(staff)}
                        className={`transition-colors ${
                          isDarkMode
                            ? "text-info-400 hover:text-info-300"
                            : "text-info-600 hover:text-info-800"
                        }`}
                      >
                        <FiEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(staff.id)}
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
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--surface)] rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                {isEditing ? "Edit Staff" : "Add New Staff"}
              </h2>
              <button
                onClick={closeModal}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-[var(--text-secondary)] text-sm font-medium mb-2">
                  Full Name*
                </label>
                <input
                  type="text"
                  name="staffName"
                  value={formData.staffName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-[var(--text-secondary)] text-sm font-medium mb-2">
                  Email Address*
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-[var(--text-secondary)] text-sm font-medium mb-2">
                  Phone Number*
                </label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter phone number"
                  required
                />
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

export default Staffs;
