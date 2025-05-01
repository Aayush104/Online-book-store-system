namespace Online_Bookstore_System.Dto.AuthDto
{
    public class OtpVerificationDto
    {
        public string UserId { get; set; }

        public string Otp { get; set; }

        public string Purpose { get; set; }
    }
}
