using Microsoft.AspNetCore.Identity;
using Online_Bookstore_System.Model;

namespace Online_Bookstore_System.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAdminAsync(IServiceProvider serviceProvider)
        {
            var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

            // Roles and fixed IDs
            var roles = new List<(string Id, string Name)>
            {
                ("b3e23d8c-905f-4bcf-9ef6-27c6b4a235fa", "Admin"),
                ("f69ad00d-43d9-4d63-a496-4b0aa8f1b37b", "Staff"),
                ("91b5a2e0-1c4a-4db8-a74f-f706303cc258", "PublicUser"),
            };

            foreach (var (id, name) in roles)
            {
                var role = await roleManager.FindByNameAsync(name);
                if (role == null)
                {
                    await roleManager.CreateAsync(new IdentityRole
                    {
                        Id = id,
                        Name = name,
                        NormalizedName = name.ToUpper()
                    });
                }
            }

            // Admin user
            var adminId = "754ea22b-c181-4069-9f95-be2ea98f24e8";
            var adminEmail = "Admin123@gmail.com";
            var adminPassword = "Admin@123";

            var adminUser = await userManager.FindByEmailAsync(adminEmail);
            if (adminUser == null)
            {
                var user = new ApplicationUser
                {
                    Id = adminId,
                    UserName = "Admin",
                    NormalizedUserName = "ADMIN",
                    FullName = "Admin",
                    Email = adminEmail,
                    NormalizedEmail = adminEmail.ToUpper(),
                    EmailConfirmed = true,
                    PhoneNumber = "9876543210"
                };

                var result = await userManager.CreateAsync(user, adminPassword);
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(user, "Admin");
                }
            }
            else
            {
                // Ensure role assignment exists
                if (!await userManager.IsInRoleAsync(adminUser, "Admin"))
                {
                    await userManager.AddToRoleAsync(adminUser, "Admin");
                }
            }
        }
    }
    }
