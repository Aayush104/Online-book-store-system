using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Online_Bookstore_System.DataSecurity;
using Online_Bookstore_System.IService;
using Online_Bookstore_System.Service;
using System.Text;

namespace Online_Bookstore_System.Extension
{
    public static class ServiceExtension
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IMailService, MailService>();
            services.AddScoped<IOtpService, OtpService>();
            services.AddScoped<ITokenService, TokenService>();
            services.AddScoped<IBookService, BookService>();
            services.AddScoped<IFileService, FileService>();
            services.AddScoped<DataSecurityProvider>();

            var JWT_SECRET = Environment.GetEnvironmentVariable("JWT_SECRET");
            var JWT_AUDIENCE = Environment.GetEnvironmentVariable("JWT_AUDIENCE");
            var JWT_ISSUER = Environment.GetEnvironmentVariable("JWT_ISSUER");

            // Configure authentication
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;

            })
            .AddJwtBearer(options =>
            {
                options.SaveToken = true;
                options.RequireHttpsMetadata = false;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidIssuer = JWT_ISSUER,
                    ValidAudience = JWT_AUDIENCE,
                    ClockSkew = TimeSpan.Zero,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(JWT_SECRET))
                };
            });
            return services;
        }
    }
}
