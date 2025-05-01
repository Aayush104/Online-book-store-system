using Online_Bookstore_System.IRepository;
using Online_Bookstore_System.IService;
using Online_Bookstore_System.Repository;
using Online_Bookstore_System.Service;

namespace Online_Bookstore_System.Extension
{
    public static class RepositoryExtension
    {
        public static IServiceCollection AddApplicationRepository(this IServiceCollection services)
        {
            services.AddScoped<IAuthRepository, AuthRepository>();
            return services;
        }
    }
}
