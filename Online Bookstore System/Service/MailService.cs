//using Online_Bookstore_System.Dto.OrderDto;
//using Online_Bookstore_System.IService;
//using Online_Bookstore_System.Model;
//using System.Net;
//using System.Net.Mail;
//using System.Text;
//using static System.Net.WebRequestMethods;

//namespace Online_Bookstore_System.Service
//{
//    public class MailService : IMailService
//    {
//        private readonly SmtpClient _smtpClient;
//        private readonly string _fromEmail;


//        public MailService()
//        {
//            _smtpClient = new SmtpClient
//            {
//                Host = Environment.GetEnvironmentVariable("SMTP_HOST") ?? throw new InvalidOperationException("SMTP_HOST is not set"),
//                Port = int.Parse(Environment.GetEnvironmentVariable("SMTP_PORT") ?? throw new InvalidOperationException("SMTP_PORT is not set")),
//                UseDefaultCredentials = false,
//                Credentials = new NetworkCredential(
//                    Environment.GetEnvironmentVariable("SMTP_USERNAME") ?? throw new InvalidOperationException("SMTP_USERNAME is not set"),
//                    Environment.GetEnvironmentVariable("SMTP_PASSWORD") ?? throw new InvalidOperationException("SMTP_PASSWORD is not set")),
//                EnableSsl = true,
//                DeliveryMethod = SmtpDeliveryMethod.Network
//            };


//            _fromEmail = Environment.GetEnvironmentVariable("FROM_EMAIL") ?? throw new InvalidOperationException("FROM_EMAIL is not set");
//        }


//        public async Task SendOrderMail(OrderMailDto mailDto)
//        {
//            var subject = "Your Bookstore Order Confirmation & Claim Code";

//            var body = new StringBuilder();
//            body.AppendLine($"Hi {mailDto.FullName},<br><br>");
//            body.AppendLine("Thank you for your order at Online Bookstore System!<br><br>");
//            body.AppendLine("🧾 <strong>Order Summary:</strong><br>");
//            body.AppendLine($"- Order Date: {mailDto.OrderDate:MMMM d, yyyy}<br>");
//            body.AppendLine($"- Total Books: {mailDto.TotalBooks}<br>");
//            body.AppendLine($"- Subtotal: ${mailDto.Subtotal:F2}<br>");
//            body.AppendLine($"- Discount Applied: ${mailDto.Discount:F2}<br>");
//            body.AppendLine($"- Final Amount: ${mailDto.FinalAmount:F2}<br><br>");
//            body.AppendLine($"📌 <strong>Your Claim Code: <span style='color:blue'>{mailDto.ClaimCode}</span></strong><br>");
//            body.AppendLine("Please keep this code safe. It may be required to claim or verify your order in future communications.<br><br>");
//            body.AppendLine("Thanks again,<br>");
//            body.AppendLine("Online Bookstore System Team");

//            var message = new MailMessage
//            {
//                From = new MailAddress(_fromEmail),
//                Subject = subject,
//                Body = body.ToString(),
//                IsBodyHtml = true
//            };

//            message.To.Add(mailDto.ToEmail);

//            try
//            {
//                await _smtpClient.SendMailAsync(message);
//            }
//            catch (Exception ex)
//            {
//                throw new InvalidOperationException("Error sending email", ex);
//            }
//            finally
//            {
//                message.Dispose();
//            }
//        }


//        public async Task SendOtpMail(string toEmail, string fullName, string Otp)
//        {
//            var body = $"<html><body><p>Hello {fullName},</p><p>Your OTP for verification is: <strong>{Otp}</strong></p></body></html>";

//            var message = new MailMessage
//            {
//                From = new MailAddress(_fromEmail),
//                Subject = "BookVault Registration OTP",
//                Body = body,
//                IsBodyHtml = true
//            };

//            message.To.Add(toEmail);

//            try
//            {
//                await _smtpClient.SendMailAsync(message);

//            }
//            catch (Exception ex)
//            {

//                throw new InvalidOperationException("Error sending email", ex);
//            }
//            finally
//            {

//                message.Dispose();
//            }
//        }

//        public async Task SendResetMail(string toEmail, string fullName, string reset_url)
//        {
//            var body = $"Welcome {fullName},<br/><br/>Click the link below to set your password:<br/><a href='{reset_url}'>Set Password</a>";


//            var message = new MailMessage
//            {
//                From = new MailAddress(_fromEmail),
//                Subject = "Set Your Password for Bookstore Staff Portal",
//                Body = body,
//                IsBodyHtml = true
//            };

//            message.To.Add(toEmail);

//            try
//            {
//                await _smtpClient.SendMailAsync(message);

//            }
//            catch (Exception ex)
//            {

//                throw new InvalidOperationException("Error sending email", ex);
//            }
//            finally
//            {

//                message.Dispose();
//            }
//        }
//    }
//}


using Online_Bookstore_System.Dto.OrderDto;
using Online_Bookstore_System.IService;
using Online_Bookstore_System.Model;
using System.Net;
using System.Net.Mail;
using System.Text;
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

        private string GetEmailBaseTemplate(string contentHtml)
        {
            return $@"<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>BookVault - Email</title>
    <style>
        /* Base Styles */
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
        }}
        
        .email-container {{
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: hidden;
        }}
        
        /* Header */
        .email-header {{
            background-color: #1a365d;
            color: white;
            padding: 25px 30px;
            text-align: center;
        }}
        
        .logo {{
            font-size: 24px;
            font-weight: bold;
            margin: 0;
            letter-spacing: 1px;
        }}
        
        .tagline {{
            font-size: 14px;
            margin-top: 5px;
            opacity: 0.9;
        }}
        
        /* Content */
        .email-content {{
            padding: 30px;
            background-color: #ffffff;
        }}
        
        .greeting {{
            font-size: 18px;
            font-weight: 500;
            margin-bottom: 15px;
        }}
        
        .message {{
            margin-bottom: 25px;
            color: #555;
        }}
        
        /* Order Summary */
        .order-summary {{
            background-color: #f7fafc;
            border-radius: 6px;
            padding: 20px;
            margin-bottom: 25px;
            border-left: 4px solid #4299e1;
        }}
        
        .summary-title {{
            font-weight: 600;
            font-size: 16px;
            margin-top: 0;
            margin-bottom: 15px;
            color: #2c5282;
        }}
        
        .summary-item {{
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 15px;
        }}
        
        .total-row {{
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
            margin-top: 8px;
            font-weight: 600;
            color: #2d3748;
        }}
        
        /* Claim Code Section */
        .highlight-section {{
            background-color: #ebf8ff;
            border-radius: 6px;
            padding: 20px;
            margin-bottom: 25px;
            text-align: center;
            border: 1px dashed #63b3ed;
        }}
        
        .highlight-code {{
            font-family: monospace;
            font-size: 24px;
            font-weight: 600;
            color: #2b6cb0;
            letter-spacing: 2px;
            padding: 8px 15px;
            background-color: white;
            border-radius: 4px;
            display: inline-block;
            margin: 10px 0;
        }}
        
        /* CTA Button */
        .cta-button {{
            display: block;
            background-color: #3182ce;
            color: white;

            text-decoration: none;
            padding: 14px 25px;
            text-align: center;
            border-radius: 6px;
            font-weight: 600;
            margin: 25px 0;
            transition: background-color 0.2s;
        }}
        
        .cta-button:hover {{
            background-color: #2c5282;
        }}
        
        /* Footer */
        .email-footer {{
            background-color: #edf2f7;
            padding: 20px 30px;
            font-size: 13px;
            color: #718096;
            text-align: center;
        }}
        
        .footer-links {{
            margin-bottom: 10px;
        }}
        
        .footer-links a {{
            color: #4a5568;
            text-decoration: none;
            margin: 0 8px;
        }}
        
        .footer-links a:hover {{
            text-decoration: underline;
        }}
        
        .copyright {{
            margin-top: 10px;
        }}
        
        /* Responsive Styles */
        @media only screen and (max-width: 600px) {{
            .email-container {{
                width: 100%;
                border-radius: 0;
            }}
            
            .email-header, .email-content, .email-footer {{
                padding: 20px 15px;
            }}
        }}
    </style>
</head>
<body>
    <div class='email-container'>
        <!-- Header -->
        <div class='email-header'>
            <h1 class='logo'>BookVault</h1>
            <div class='tagline'>Your Premier Literary Destination</div>
        </div>
        
        <!-- Content -->
        <div class='email-content'>
            {contentHtml}
        </div>
        
        <!-- Footer -->
        <div class='email-footer'>
            <div class='footer-links'>
                <a href='#'>Visit Website</a> | 
                <a href='#'>My Account</a> | 
                <a href='#'>Contact Us</a>
            </div>
            <div>
                BookVault, Dulari-5, SundarHaraicha, Morang, Nepal
            </div>
            <div class='copyright'>
                &copy; {DateTime.Now.Year} BookVault. All rights reserved.
            </div>
        </div>
    </div>
</body>
</html>";
        }

        public async Task SendOrderMail(OrderMailDto mailDto)
        {
            var subject = "Your BookVault Order Confirmation & Claim Code";

            // Create order email content
            var contentHtml = new StringBuilder();
            contentHtml.Append($"<div class='greeting'>Hi {mailDto.FullName},</div>");
            contentHtml.Append("<div class='message'>Thank you for your order at BookVault! We're delighted to confirm that your literary treasures are on their way to you.</div>");

            // Order Summary Section
            contentHtml.Append("<div class='order-summary'>");
            contentHtml.Append("<h3 class='summary-title'>Order Summary</h3>");
            contentHtml.Append($"<div class='summary-item'><span>Order Date:</span><span>{mailDto.OrderDate:MMMM d, yyyy}</span></div>");
            contentHtml.Append($"<div class='summary-item'><span>Total Books:</span><span>{mailDto.TotalBooks}</span></div>");
            contentHtml.Append($"<div class='summary-item'><span>Subtotal:</span><span>${mailDto.Subtotal:F2}</span></div>");
            contentHtml.Append($"<div class='summary-item'><span>Discount Applied:</span><span>${mailDto.Discount:F2}</span></div>");
            contentHtml.Append($"<div class='summary-item total-row'><span>Final Amount:</span><span>${mailDto.FinalAmount:F2}</span></div>");
            contentHtml.Append("</div>");

            // Claim Code Section
            contentHtml.Append("<div class='highlight-section'>");
            contentHtml.Append("<p><strong>Your Unique Claim Code</strong></p>");
            contentHtml.Append($"<div class='highlight-code'>{mailDto.ClaimCode}</div>");
            contentHtml.Append("<p>Please keep this code safe. You may need it to verify your order in future communications.</p>");
            contentHtml.Append("</div>");

            // Closing
            contentHtml.Append("<div class='message'>If you have any questions about your order, please don't hesitate to contact our customer service team. We're here to help!</div>");
            contentHtml.Append("<a href='#' class='cta-button'>Track Your Order</a>");
            contentHtml.Append("<div class='message'>Happy reading!<br>The BookVault Team</div>");

            // Combine with base template
            var body = GetEmailBaseTemplate(contentHtml.ToString());

            var message = new MailMessage
            {
                From = new MailAddress(_fromEmail),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };

            message.To.Add(mailDto.ToEmail);

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

        public async Task SendOtpMail(string toEmail, string fullName, string Otp)
        {
            var subject = "BookVault - Your Verification Code";

            // Create OTP email content
            var contentHtml = new StringBuilder();
            contentHtml.Append($"<div class='greeting'>Hello {fullName},</div>");
            contentHtml.Append("<div class='message'>Thank you for registering with BookVault. To complete your registration, please use the verification code below:</div>");

            // OTP Code Section
            contentHtml.Append("<div class='highlight-section'>");
            contentHtml.Append("<p><strong>Your Verification Code</strong></p>");
            contentHtml.Append($"<div class='highlight-code'>{Otp}</div>");
            contentHtml.Append("<p>This code will expire in 5 minutes for security purposes.</p>");
            contentHtml.Append("</div>");

            // Closing
            contentHtml.Append("<div class='message'>If you did not request this code, please ignore this email or contact our support team.</div>");
            contentHtml.Append("<div class='message'>Welcome to BookVault!<br>The BookVault Team</div>");

            // Combine with base template
            var body = GetEmailBaseTemplate(contentHtml.ToString());

            var message = new MailMessage
            {
                From = new MailAddress(_fromEmail),
                Subject = subject,
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
            var subject = "Set Your Password for BookVault Staff Portal";

            // Create password reset email content
            var contentHtml = new StringBuilder();
            contentHtml.Append($"<div class='greeting'>Welcome {fullName},</div>");
            contentHtml.Append("<div class='message'>You have been invited to join the BookVault Staff Portal. To get started, you'll need to set your password using the link below.</div>");

            // Action Button
            contentHtml.Append($"<a href='{reset_url}' class='cta-button'>Set Your Password</a>");

            // Security Note
            contentHtml.Append("<div class='message'><strong>Note:</strong> This link will expire in 48 hours for security reasons. If you need a new link after that time, please contact your administrator.</div>");

            // Closing
            contentHtml.Append("<div class='message'>We're excited to have you on board!<br>The BookVault Management Team</div>");

            // Combine with base template
            var body = GetEmailBaseTemplate(contentHtml.ToString());

            var message = new MailMessage
            {
                From = new MailAddress(_fromEmail),
                Subject = subject,
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