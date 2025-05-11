using Online_Bookstore_System.Data;
using Online_Bookstore_System.IRepository;
using Online_Bookstore_System.Model;

namespace Online_Bookstore_System.Repository
{
    public class AuthRepository : IAuthRepository
    {
        private readonly AppDbContext _appDbContext;

        public AuthRepository(AppDbContext appDbContext)
        {
            _appDbContext = appDbContext;
        }

        public async Task<bool> UpdateStaffStatus(ApplicationUser user)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user));

         
            user.EmailConfirmed = !user.EmailConfirmed;

            _appDbContext.Users.Update(user);
            await _appDbContext.SaveChangesAsync();

            return true;
        }
    }
}
