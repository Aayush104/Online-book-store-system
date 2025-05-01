namespace Online_Bookstore_System.DataSecurity
{
    public class DataSecurityProvider
    {
        public string securityKey = Environment.GetEnvironmentVariable("SECURITY_KEY");
    }
}
