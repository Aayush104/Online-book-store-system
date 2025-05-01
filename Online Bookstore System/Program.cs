using DotNetEnv;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Online_Bookstore_System.Data;
using Online_Bookstore_System.Extension;
using Online_Bookstore_System.IService;
using Online_Bookstore_System.Model;
using Online_Bookstore_System.Service;


Env.Load(); //.env lai load garna yo chainxa
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.


builder.Services.AddApplicationServices();
builder.Services.AddApplicationRepository();

builder.Services.AddControllers();

builder.Services.AddCors(o =>
{
    o.AddPolicy("AllowLocalhost5173",
        builder => builder
            .WithOrigins("http://localhost:5173")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});



// Identity use garna yo halnu parxa
builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

//Database Connection
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Conn"))
);
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowLocalhost5173");


app.UseAuthorization();

app.MapControllers();

app.Run();
