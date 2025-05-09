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
    }
}
