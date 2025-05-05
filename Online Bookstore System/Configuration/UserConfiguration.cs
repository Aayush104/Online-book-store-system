//using Microsoft.AspNetCore.Identity;
//using Microsoft.EntityFrameworkCore;
//using Microsoft.EntityFrameworkCore.Metadata.Builders;
//using Online_Bookstore_System.Model;

//namespace Online_Bookstore_System.Configuration
//{
//    public class UserConfiguration : IEntityTypeConfiguration<ApplicationUser>
//    {
//        public void Configure(EntityTypeBuilder<ApplicationUser> builder)
//        {

//            var hasher = new PasswordHasher<ApplicationUser>();

//            builder.HasData(

//                new ApplicationUser
//                {
//                    Id = "754ea22b-c181-4069-9f95-be2ea98f24e8",
//                    UserName = "Admin",
//                    NormalizedUserName = "ADMIN",
//                    FullName = "Admin",
//                    Email = "Admin123@gmail.com",
//                    NormalizedEmail = "ADMIN123@GMAIL.COM",
//                    EmailConfirmed = true,
//                    PasswordHash = hasher.HashPassword(null, "Admin@123"),
//                    PhoneNumber = "9876543210",

//                }

//                );

//            builder.HasKey( x => x.Id );    
//        }

//    }
//}
