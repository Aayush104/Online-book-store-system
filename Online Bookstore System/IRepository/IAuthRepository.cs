using Online_Bookstore_System.Dto.AuthDto;
using Online_Bookstore_System.Model;

namespace Online_Bookstore_System.IRepository
{
    public interface IAuthRepository
    {
        Task<bool> UpdateStaffStatus(ApplicationUser user);


    }
}
