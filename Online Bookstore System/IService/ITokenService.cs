
using Online_Bookstore_System.Model;
namespace Online_Bookstore_System.IService

{
    public interface ITokenService
    {
        string GenerateToken(ApplicationUser user, List<string> roles);
    }

}
