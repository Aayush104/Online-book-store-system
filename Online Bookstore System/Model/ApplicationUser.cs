using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace Online_Bookstore_System.Model
{
    public class ApplicationUser : IdentityUser
    {
        [Required]
        public string FullName { get; set; }  
        public string? Address { get; set; }

        public virtual ICollection<Otp> Otps { get; set; } = new List<Otp>();



    }
}
