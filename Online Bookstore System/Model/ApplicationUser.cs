using Microsoft.AspNetCore.Identity;

namespace Online_Bookstore_System.Model
{
    public class ApplicationUser : IdentityUser
    {
        public string? FullName { get; set; }    
    }
}
