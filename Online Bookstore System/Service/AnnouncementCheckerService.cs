using Microsoft.AspNetCore.SignalR;
using Online_Bookstore_System.Data;
using Online_Bookstore_System.Hubs;
using Online_Bookstore_System.IRepository;

public class AnnouncementCheckerService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IHubContext<Notificationhub> _hubContext;

    public AnnouncementCheckerService(IServiceProvider serviceProvider, IHubContext<Notificationhub> hubContext)
    {
        _serviceProvider = serviceProvider;
        _hubContext = hubContext;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using var scope = _serviceProvider.CreateScope();
            var announcementRepo = scope.ServiceProvider.GetRequiredService<IAnnouncementReposoitory>();
            var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var dueAnnouncements = await announcementRepo.GetUpcomingAnnouncement();

            foreach (var announce in dueAnnouncements)
            {
                var notificationObject = new
                {
                    type = "announcement",
                    content = $"{announce.Title}: {announce.Description}",
                    id = Guid.NewGuid().ToString(),
                    timestamp = DateTime.UtcNow,
                    title = announce.Title,
                    description = announce.Description
                };

                await _hubContext.Clients.All.SendAsync("ReceiveNotification", notificationObject);

               
                announce.IsAnnounced = true;
                dbContext.Announces.Update(announce);
                await dbContext.SaveChangesAsync();
            }

            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken); 
        }
    }
}
