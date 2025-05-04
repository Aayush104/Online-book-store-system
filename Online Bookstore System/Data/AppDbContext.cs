using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Online_Bookstore_System.Model;
using System.Reflection.Emit;

namespace Online_Bookstore_System.Data
{
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        
        
        }

        public DbSet<ApplicationUser> Users { get; set; }
        public DbSet<Otp> Otps { get; set; }
        public DbSet<Book> Books { get; set; }


        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Otp>()
               .HasOne(o => o.User)
               .WithMany(u => u.Otps)
               .HasForeignKey(o => o.UserId)
               .OnDelete(DeleteBehavior.Cascade);

            builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        }
    }
}
