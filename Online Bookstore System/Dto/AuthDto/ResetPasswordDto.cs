﻿namespace Online_Bookstore_System.Dto.AuthDto
{
    public class ResetPasswordDto
    {
        public string Email { get; set; }

        public string Token { get; set; }
        public string Password { get; set; }
    }
}
