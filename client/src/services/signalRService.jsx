import * as signalR from "@microsoft/signalr";

class SignalRService {
  constructor() {
    this.connection = null;
    this.connectionPromise = null;
    this.notificationListeners = [];
  }

  // Initialize the connection to the SignalR hub
  async initConnection() {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        // Create a new SignalR connection
        this.connection = new signalR.HubConnectionBuilder()
          .withUrl("/notificationhub") // Make sure this matches your backend hub URL
          .withAutomaticReconnect([0, 1000, 5000, 10000]) // Reconnection policy
          .configureLogging(signalR.LogLevel.Information)
          .build();

        // Set up the event handler for receiving notifications
        this.connection.on("ReceiveNotification", (notification) => {
          console.log("Received notification:", notification);
          // Notify all listeners about the notification
          this.notifyListeners(notification);
        });

        // Start the connection
        this.connection
          .start()
          .then(() => {
            console.log("SignalR Connected");
            resolve(this.connection);
          })
          .catch((err) => {
            console.error("SignalR Connection Error: ", err);
            this.connectionPromise = null;
            reject(err);
          });
      } catch (err) {
        console.error("SignalR Setup Error: ", err);
        this.connectionPromise = null;
        reject(err);
      }
    });

    return this.connectionPromise;
  }

  // Add a listener for notifications
  addNotificationListener(listener) {
    this.notificationListeners.push(listener);
    return () => this.removeNotificationListener(listener);
  }

  // Remove a notification listener
  removeNotificationListener(listener) {
    const index = this.notificationListeners.indexOf(listener);
    if (index !== -1) {
      this.notificationListeners.splice(index, 1);
    }
  }

  // Notify all listeners about a notification
  notifyListeners(notification) {
    this.notificationListeners.forEach((listener) => {
      try {
        listener(notification);
      } catch (error) {
        console.error("Error in notification listener:", error);
      }
    });
  }

  // Close the connection
  async stopConnection() {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log("SignalR Disconnected");
      } catch (err) {
        console.error("SignalR Disconnection Error: ", err);
      } finally {
        this.connection = null;
        this.connectionPromise = null;
      }
    }
  }
}

// Create a singleton instance
const signalRService = new SignalRService();
export default signalRService;
