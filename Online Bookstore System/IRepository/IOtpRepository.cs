using Online_Bookstore_System.Model;

namespace Online_Bookstore_System.IRepository
{
    public interface IOtpRepository
    {
        Task AddOtp(Otp otp);
        Task<Otp> GetLatestOtp(string UserId, string Purpose);

        Task UpdateOtp(Otp otp);
    }
}
