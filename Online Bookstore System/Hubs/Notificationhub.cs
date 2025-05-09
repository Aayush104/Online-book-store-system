using Microsoft.AspNetCore.SignalR;

namespace Online_Bookstore_System.Hubs
{
    public class Notificationhub : Hub
    {
        public async Task SendNotification(string message)
        {
            await Clients.All.SendAsync("ReceiveNotification", message);
        }
    }
}
