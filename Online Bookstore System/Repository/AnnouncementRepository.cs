using Microsoft.EntityFrameworkCore;
using Online_Bookstore_System.Data;
using Online_Bookstore_System.IRepository;
using Online_Bookstore_System.Model;

namespace Online_Bookstore_System.Repository
{
    public class AnnouncementRepository : IAnnouncementReposoitory
    {
        private readonly AppDbContext _dbContext;
        public AnnouncementRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task DoAnnounceAsync(Announce announce)
        {
            await _dbContext.Announces.AddAsync(announce);
            await _dbContext.SaveChangesAsync();
        }

        public async Task<List<Announce>> GetActiveAnnouncementsAsync()
        {

            var allAnnouncements = await _dbContext.Announces
                .Select(a => new
                {
                    Entity = a,
                    Start = a.AnnouncemnetDateTime,
                    End = a.AnnouncemnetEndDateTime,
                    Flag = a.IsAnnounced
                })
                .ToListAsync();


            //var announcemnet = await _dbContext.Announces.Where(x => x.Expired == false).ToListAsync();


            DateTime nowUtc = DateTime.UtcNow;
            Console.WriteLine($"[DEBUG] nowUtc: {nowUtc:o}");


            var active = allAnnouncements
                .Where(a =>
                {
                    Console.WriteLine(
                        $"[DEBUG] AnnounceID={a.Entity.Id}  " +
                        $"Start={a.Start:o}  End={a.End:o}  Flag={a.Flag}");
                    return a.Start <= nowUtc
                        && a.End >= nowUtc
                        && a.Flag;
                })
                .Select(a => a.Entity)
                .ToList();


            return active;
        }


        public async Task<List<Announce>> GetUpcomingAnnouncement()
        {
            return await _dbContext.Announces
                .Where(x => x.IsAnnounced == false && x.AnnouncemnetDateTime <= DateTime.UtcNow)
                   .ToListAsync();
        }

    }
}
