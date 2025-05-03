using Online_Bookstore_System.IService;
using System.Net;
using System.Net.Mail;
using static System.Net.WebRequestMethods;

namespace Online_Bookstore_System.Service
{
    public class MailService : IMailService
    {
        private readonly SmtpClient _smtpClient;
        private readonly string _fromEmail;


        public MailService()
        {
            _smtpClient = new SmtpClient
            {
                Host = Environment.GetEnvironmentVariable("SMTP_HOST") ?? throw new InvalidOperationException("SMTP_HOST is not set"),
                Port = int.Parse(Environment.GetEnvironmentVariable("SMTP_PORT") ?? throw new InvalidOperationException("SMTP_PORT is not set")),
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(
                    Environment.GetEnvironmentVariable("SMTP_USERNAME") ?? throw new InvalidOperationException("SMTP_USERNAME is not set"),
                    Environment.GetEnvironmentVariable("SMTP_PASSWORD") ?? throw new InvalidOperationException("SMTP_PASSWORD is not set")),
                EnableSsl = true,
                DeliveryMethod = SmtpDeliveryMethod.Network
            };


            _fromEmail = Environment.GetEnvironmentVariable("FROM_EMAIL") ?? throw new InvalidOperationException("FROM_EMAIL is not set");
        }
        public async Task SendOtpMail(string toEmail, string fullName, string Otp)
        {
            var body = $"<html><body><p>Hello {fullName},</p><p>Your OTP for verification is: <strong>{Otp}</strong></p></body></html>";

            var message = new MailMessage
            {
                From = new MailAddress(_fromEmail),
                Subject = "BookVault Registration OTP",
                Body = body,
                IsBodyHtml = true
            };

            message.To.Add(toEmail);

            try
            {
                await _smtpClient.SendMailAsync(message);

            }
            catch (Exception ex)
            {

                throw new InvalidOperationException("Error sending email", ex);
            }
            finally
            {

                message.Dispose();
            }
        }

        public async Task SendResetMail(string toEmail, string fullName, string reset_url)
        {
            var body = $"Welcome {fullName},<br/><br/>Click the link below to set your password:<br/><a href='{reset_url}'>Set Password</a>";


            var message = new MailMessage
            {
                From = new MailAddress(_fromEmail),
                Subject = "Set Your Password for Bookstore Staff Portal",
                Body = body,
                IsBodyHtml = true
            };

            message.To.Add(toEmail);

            try
            {
                await _smtpClient.SendMailAsync(message);

            }
            catch (Exception ex)
            {

                throw new InvalidOperationException("Error sending email", ex);
            }
            finally
            {

                message.Dispose();
            }
        }
    }
}
