using Microsoft.EntityFrameworkCore;
using Online_Bookstore_System.Data;
using Online_Bookstore_System.IRepository;
using Online_Bookstore_System.Model;

namespace Online_Bookstore_System.Repository
{
    public class OtpRepository : IOtpRepository
    {
 
        private readonly AppDbContext _context;

        public OtpRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task AddOtp(Otp otp)
        {
            await _context.Otps.AddAsync(otp);
            await _context.SaveChangesAsync();  
        }

        public async Task<Otp> GetLatestOtp(string userId, string purpose)
        {
            return await _context.Otps
                .Where(x => x.UserId == userId && x.Purpose == purpose && !x.IsUsed)
                .OrderByDescending(o => o.ExpiresAt)
                .FirstOrDefaultAsync();
        }

        public async Task UpdateOtp(Otp otpHash)
        {
            _context.Otps.Update(otpHash);
            await _context.SaveChangesAsync();
        }
    }
}
