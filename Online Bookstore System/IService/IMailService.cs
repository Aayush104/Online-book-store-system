namespace Online_Bookstore_System.IService
{
    public interface IMailService
    {
        Task SendOtpMail(string toEmail, string fullName, string Otp);
    }
}
