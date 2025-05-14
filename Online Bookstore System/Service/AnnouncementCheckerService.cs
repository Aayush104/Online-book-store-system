using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Online_Bookstore_System.Data;
using Online_Bookstore_System.Hubs;
using Online_Bookstore_System.IRepository;
using System;
using System.Threading;
using System.Threading.Tasks;

public class AnnouncementCheckerService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IHubContext<Notificationhub> _hubContext;
    private readonly ILogger<AnnouncementCheckerService> _logger;


    public AnnouncementCheckerService(
        IServiceProvider serviceProvider,
        IHubContext<Notificationhub> hubContext,
        ILogger<AnnouncementCheckerService> logger)
    {
        _serviceProvider = serviceProvider;
        _hubContext = hubContext;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
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

                var now = DateTime.UtcNow;

                var expiredAnnouncements = await dbContext.Announces
                    .Where(a => a.IsAnnounced && !a.Expired && a.AnnouncemnetEndDateTime < now)
                    .ToListAsync();

                foreach (var expired in expiredAnnouncements)
                {

                    await _hubContext.Clients.All.SendAsync("RemoveAnnouncement", new
                    {
                        id = expired.Id.ToString()
                    });


                    expired.Expired = true;
                    dbContext.Announces.Update(expired);
                }

                await dbContext.SaveChangesAsync();

                await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in AnnouncementCheckerService");
            Console.WriteLine($"Error in AnnouncementCheckerService: {ex.Message}");
        }
    }
}

