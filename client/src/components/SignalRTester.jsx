// src/components/SignalRTester.jsx
import React, { useState, useEffect } from "react";
import signalRService from "../services/signalRService";

const SignalRTester = () => {
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [testMessage, setTestMessage] = useState("");
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Initialize connection
    const initConnection = async () => {
      setConnectionStatus("Connecting...");
      try {
        await signalRService.initConnection();
        setConnectionStatus("Connected");
      } catch (error) {
        setConnectionStatus("Connection failed");
        console.error("Connection failed:", error);
      }
    };

    initConnection();

    // Set up listeners
    const testMessageUnsubscribe = signalRService.addListener(
      "testMessage",
      (message) => {
        setTestMessage(message);
      }
    );

    const notificationUnsubscribe = signalRService.addListener(
      "notification",
      (notification) => {
        setNotifications((prev) => [notification, ...prev]);
      }
    );

    // Clean up
    return () => {
      testMessageUnsubscribe();
      notificationUnsubscribe();
    };
  }, []);

  const handleTestConnection = async () => {
    setConnectionStatus("Testing...");
    const success = await signalRService.testConnection();
    setConnectionStatus(success ? "Connected" : "Test failed");
  };

  return (
    <div className="p-4 border rounded-lg shadow-md max-w-xl mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">SignalR Connection Tester</h2>

      <div className="mb-4">
        <p>
          Status:{" "}
          <span
            className={`font-bold ${
              connectionStatus === "Connected"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {connectionStatus}
          </span>
        </p>
      </div>

      <div className="mb-4">
        <button
          onClick={handleTestConnection}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Connection
        </button>
      </div>

      {testMessage && (
        <div className="mb-4 p-3 bg-gray-100 rounded">
          <h3 className="font-bold">Test Message Response:</h3>
          <p>{testMessage}</p>
        </div>
      )}

      <div>
        <h3 className="font-bold mb-2">Notifications:</h3>
        {notifications.length === 0 ? (
          <p className="text-gray-500">No notifications received yet.</p>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification, index) => (
              <div
                key={index}
                className="p-3 bg-blue-50 rounded border border-blue-200"
              >
                <p className="font-bold">{notification.title}</p>
                <p>{notification.description}</p>
                <p className="text-xs text-gray-500">
                  {new Date(notification.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SignalRTester;
