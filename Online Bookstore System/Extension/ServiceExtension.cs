using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Online_Bookstore_System.DataSecurity;
using Online_Bookstore_System.IService;
using Online_Bookstore_System.Service;
using System.Security.Claims;
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
            services.AddScoped<IWhiteListService, WhiteListService>();
            services.AddScoped<DataSecurityProvider>();

            var JWT_SECRET = Environment.GetEnvironmentVariable("JWT_SECRET") ?? "YourFallbackSecretKey";
            var JWT_ISSUER = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? "YourIssuer";
            var JWT_AUDIENCE = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? "YourAudience";

            var key = Encoding.UTF8.GetBytes(JWT_SECRET);

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = false;
                options.SaveToken = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,

                    ValidIssuer = JWT_ISSUER,
                    ValidAudience = JWT_AUDIENCE,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    RoleClaimType = ClaimTypes.Role
                };
            });

            return services;
        }
    }
}
