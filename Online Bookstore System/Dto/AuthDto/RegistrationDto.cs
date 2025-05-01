using System.ComponentModel.DataAnnotations;

namespace Online_Bookstore_System.Dto.AuthDto
{
    public class RegistrationDto
    {
        [Required]
        public string FullName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [MinLength(6)]
        public string Password { get; set; }

        [Required]
        [Phone]
        public string PhoneNumber { get; set; }

        [Required]
        public string Address { get; set; }
    }
}
