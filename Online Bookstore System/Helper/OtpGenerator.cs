namespace Online_Bookstore_System.Helper
{
    public class OtpGenerator
    {
        private static readonly Random R = new Random();

        public static string GenerateOtp(int length = 6)
        {
            const string chars = "0123456789";
            char[] otp = new char[length];   //6 ota length ko otp banauney

            for (int i = 0; i < length; i++)
            {
                otp[i] = chars[R.Next(chars.Length)]; ///char ko length 10 xa so teti vitra ko number ko otp banauney 

            }

            return new string(otp);

        }
    }
}
