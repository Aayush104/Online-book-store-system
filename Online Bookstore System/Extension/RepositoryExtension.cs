﻿using Online_Bookstore_System.IRepository;
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
            services.AddScoped<IOtpRepository, OtpRepository>();
            services.AddScoped<IBookRepository, BookRepository>();
            services.AddScoped<IWhiteListRepository, WhiteListRepository>();
            services.AddScoped<ICartRepository, CartRepository>();
            services.AddScoped<IOrderRepository, OrderRepository>();
            services.AddScoped<IAnnouncementReposoitory, AnnouncementRepository>();
            services.AddScoped<IReviewRepository, ReviewRepository>();
            return services;
        }
    }
}
