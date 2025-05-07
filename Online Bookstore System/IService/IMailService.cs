using Online_Bookstore_System.Dto.OrderDto;

namespace Online_Bookstore_System.IService
{
    public interface IMailService
    {
        Task SendOtpMail(string toEmail, string fullName, string Otp);
        Task SendResetMail(string toEmail, string fullName, string reset_url);
        Task SendOrderMail(OrderMailDto mailDto);
    }
}
