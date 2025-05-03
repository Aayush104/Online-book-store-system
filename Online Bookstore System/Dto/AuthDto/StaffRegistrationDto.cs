using System.ComponentModel.DataAnnotations;

namespace Online_Bookstore_System.Dto.AuthDto
{
    public class StaffRegistrationDto
    {
        [Required]
        public string FullName { get; set; }

        [Required, EmailAddress]
        public string Email { get; set; }

        [Required]
        public string PhoneNumber { get; set; }
    }
}
