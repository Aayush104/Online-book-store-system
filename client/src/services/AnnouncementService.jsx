import api from "./api";

// Simple debug logger
const logDebug = (message, data = null) => {
  console.log(`[AnnouncementService] ${message}`, data || "");
};

// Check authentication token
const checkToken = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    const error = new Error("Authentication required");
    error.isAuthError = true;
    throw error;
  }
};

// Get all announcements (general list)
export const getAnnouncements = async () => {
  logDebug("Fetching announcements");

  try {
    const response = await api.get("/Announcement");
    logDebug("Announcements response:", response);
    return response;
  } catch (error) {
    logDebug("Fetch announcements error:", error);
    throw error;
  }
};

// Get only active announcements (for public display)
export const getActiveAnnouncements = async () => {
  logDebug("Fetching active announcements");

  try {
    // Fixed path without /api prefix since axiosInstance already includes it
    const response = await api.get("/Announcement/active-announcements");
    logDebug("Active announcements response:", response);
    return response;
  } catch (error) {
    logDebug("Fetch active announcements error:", error);
    throw error;
  }
};

export const getAnnouncementById = async (id) => {
  logDebug("Fetching announcement by ID", id);
  checkToken();

  try {
    const response = await api.get(`/Announcement/${id}`);
    logDebug("Announcement details response:", response);
    return response;
  } catch (error) {
    logDebug("Fetch announcement details error:", error);
    throw error;
  }
};

export const createAnnouncement = async (announcementData) => {
  logDebug("Creating announcement", announcementData);
  checkToken();

  try {
    const response = await api.post(
      "/Announcement/SetAnnouncement",
      announcementData
    );
    logDebug("Create announcement response:", response);
    return response;
  } catch (error) {
    logDebug("Create announcement error:", error);
    throw error;
  }
};

export const updateAnnouncement = async (id, announcementData) => {
  logDebug("Updating announcement", { id, ...announcementData });
  checkToken();

  try {
    const response = await api.put(`/Announcement/${id}`, announcementData);
    logDebug("Update announcement response:", response);
    return response;
  } catch (error) {
    logDebug("Update announcement error:", error);
    throw error;
  }
};

export const deleteAnnouncement = async (id) => {
  logDebug("Deleting announcement", id);
  checkToken();

  try {
    const response = await api.delete(`/Announcement/${id}`);
    logDebug("Delete announcement response:", response);
    return response;
  } catch (error) {
    logDebug("Delete announcement error:", error);
    throw error;
  }
};

const AnnouncementService = {
  getAnnouncements,
  getActiveAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};

export default AnnouncementService;
