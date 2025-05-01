using Online_Bookstore_System.DataSecurity;
using Online_Bookstore_System.IService;
using Online_Bookstore_System.Service;

namespace Online_Bookstore_System.Extension
{
    public static class ServiceExtension
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IMailService, MailService>();
            services.AddScoped<IOtpService, OtpService>();
            services.AddScoped<DataSecurityProvider>();
            return services;
        }
    }
}
