import React, { useState, useEffect } from "react";
import api from "../services/api";

// Simple component to display active announcements
const AnnouncementBanner = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  // Function to check for real-time announcements from SignalR
  useEffect(() => {
    // Set up connection to SignalR hub
    const connectToSignalR = async () => {
      const connection = new signalR.HubConnectionBuilder()
        .withUrl("/notificationhub")
        .withAutomaticReconnect()
        .build();

      // Handler for receiving notifications
      connection.on("ReceiveNotification", (notification) => {
        if (notification.type === "announcement") {
          // Add new announcement to the list
          setAnnouncements((prev) => {
            // Check if this announcement already exists
            const exists = prev.some((a) => a.id === notification.id);
            if (!exists) {
              // Add to the beginning of the list
              return [
                {
                  id: notification.id,
                  title: notification.title,
                  description: notification.description,
                  timestamp: notification.timestamp,
                },
                ...prev,
              ];
            }
            return prev;
          });

          // Show the banner by resetting dismissed state
          setDismissed(false);

          // Set focus to the new announcement
          setActiveIndex(0);
        }
      });

      // Start the connection
      try {
        await connection.start();
        console.log("SignalR connected");
      } catch (err) {
        console.error("SignalR connection error:", err);
      }

      // Clean up on unmount
      return () => {
        if (connection.state === "Connected") {
          connection.stop();
        }
      };
    };

    // Initial fetch of active announcements
    const fetchAnnouncements = async () => {
      try {
        const response = await api.get("/api/Announcement");
        if (response.data && response.data.length > 0) {
          setAnnouncements(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
      }
    };

    fetchAnnouncements();
    connectToSignalR();

    // Check local storage for dismissed state
    const dismissedTime = localStorage.getItem("announcementDismissed");
    if (dismissedTime) {
      // If dismissed less than 1 hour ago, keep dismissed
      const now = new Date().getTime();
      if (now - parseInt(dismissedTime) < 60 * 60 * 1000) {
        setDismissed(true);
      } else {
        localStorage.removeItem("announcementDismissed");
      }
    }

    // Auto-rotate announcements every 5 seconds if more than one
    let rotationInterval;
    if (announcements.length > 1) {
      rotationInterval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % announcements.length);
      }, 5000);
    }

    return () => {
      if (rotationInterval) clearInterval(rotationInterval);
    };
  }, [announcements.length]);

  // If no announcements or dismissed, don't render
  if (announcements.length === 0 || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(
      "announcementDismissed",
      new Date().getTime().toString()
    );
  };

  const activeAnnouncement = announcements[activeIndex];

  return (
    <div className="bg-blue-600 text-white w-full py-3">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        <div className="flex-1">
          <span className="font-bold">{activeAnnouncement.title}</span>
          {" - "}
          <span>{activeAnnouncement.description}</span>
        </div>

        <div className="flex items-center space-x-2">
          {announcements.length > 1 && (
            <>
              <button
                onClick={() =>
                  setActiveIndex((prev) =>
                    prev === 0 ? announcements.length - 1 : prev - 1
                  )
                }
                className="p-1 opacity-75 hover:opacity-100 transition-opacity focus:outline-none"
              >
                <i className="fas fa-chevron-left text-sm"></i>
              </button>

              <div className="flex space-x-1">
                {announcements.map((_, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${
                      idx === activeIndex
                        ? "bg-white"
                        : "bg-white bg-opacity-50"
                    }`}
                  ></div>
                ))}
              </div>

              <button
                onClick={() =>
                  setActiveIndex((prev) => (prev + 1) % announcements.length)
                }
                className="p-1 opacity-75 hover:opacity-100 transition-opacity focus:outline-none"
              >
                <i className="fas fa-chevron-right text-sm"></i>
              </button>
            </>
          )}

          <button
            onClick={handleDismiss}
            className="p-1 opacity-75 hover:opacity-100 transition-opacity focus:outline-none"
          >
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
