using Microsoft.IdentityModel.Tokens;
using Online_Bookstore_System.IService;
using Online_Bookstore_System.Model;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Online_Bookstore_System.Service
{
    public class TokenService : ITokenService
    {
        public string GenerateToken(ApplicationUser user, List<string> roles)
        {
            var claims = new List<Claim>
            {
                new Claim("userId", user.Id.ToString()),
                new Claim("Name", user.FullName),
                new Claim("Email", user.Email),


            };


            foreach (var role in roles)
            {
                claims.Add(new Claim("Role", role));
            }


            var JWT_SECRET = Environment.GetEnvironmentVariable("JWT_SECRET");
            var JWT_ISSUER = Environment.GetEnvironmentVariable("JWT_ISSUER");
            var JWT_AUDIENCE = Environment.GetEnvironmentVariable("JWT_AUDIENCE");

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(JWT_SECRET));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: JWT_ISSUER,
                audience: JWT_AUDIENCE,
                claims: claims,
                expires: DateTime.Now.AddMonths(1),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
    

