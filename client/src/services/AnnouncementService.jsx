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

export const getActiveAnnouncements = async () => {
  logDebug("Fetching active announcements");

  try {
    const response = await api.get("/Announcement");
    logDebug("Active announcements response:", response);
    return response;
  } catch (error) {
    logDebug("Fetch announcements error:", error);
    throw error;
  }
};

export const getAllAnnouncements = async () => {
  logDebug("Fetching all announcements");
  checkToken();

  try {
    const response = await api.get("/Announcement/all");
    logDebug("All announcements response:", response);
    return response;
  } catch (error) {
    logDebug("Fetch all announcements error:", error);
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
      announcementData,
      {
        headers: { "Content-Type": "application/json" },
      }
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
    const response = await api.put(`/Announcement/${id}`, announcementData, {
      headers: { "Content-Type": "application/json" },
    });

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
  getActiveAnnouncements,
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};

export default AnnouncementService;
