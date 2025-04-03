using Swashbuckle.AspNetCore.Swagger;
using DAL.Data;
using Microsoft.EntityFrameworkCore;
using DAL.Repositories.IRepositories;
using BLL.Interface;
using DAL.Repositories;
using BLL.Service;
using DAL.UnitOfWork;
using BLL.Utilities;
using BLL.Services;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Common.Setting;
using Common.Constant;
using System.Security.Claims;
using Swashbuckle.AspNetCore.SwaggerUI;
using Swashbuckle.AspNetCore.Filters;
using Microsoft.AspNetCore.SignalR;
using BLL.Hubs;
using BLL;

namespace MIndAid
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(JwtSettingModel.SecretKey)),
            ValidateIssuer = true,
            ValidIssuer = JwtSettingModel.Issuer,
            ValidateAudience = true,
            ValidAudience = JwtSettingModel.Audience,
            ValidateLifetime = true,
            NameClaimType = "userId"
        };
    });
            // Add services to the container.
            builder.Services.AddControllers();

            // Đăng ký IHttpContextAccessor để có thể truy cập HttpContext
            builder.Services.AddHttpContextAccessor();

            // Đăng ký các dịch vụ của bạn
            builder.Services.AddScoped<IUserRepository, UserRepository>();
            builder.Services.AddScoped<IUserService, UserService>();
            builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
            builder.Services.AddScoped<UserUtility>();
            builder.Services.AddScoped<ILoginService, LoginService>();
            builder.Services.AddScoped<ISurveyService, SurveyService>();
            builder.Services.AddScoped<IGoogleAuthService, GoogleAuthService>();
            builder.Services.AddScoped<IJwtProvider, JwtProvider>();
            builder.Services.AddScoped<IClassService, ClassService>();
            builder.Services.AddScoped<IRelationshipService, RelationshipService>();

            builder.Services.AddScoped<ITargetProgramService, TargetProgramService>();
            builder.Services.AddScoped<AppointmentTimerService>();
            builder.Services.AddScoped<ChatHub>();

            builder.Services.AddScoped<IMessageService, MessageService>();
            builder.Services.AddSignalR();


            builder.Services.AddScoped<IScheduleService, ScheduleService>();
            builder.Services.AddScoped<IAppointmentService, AppointmentService>();
            builder.Services.AddScoped<IBlogPostService, BlogPostService>();

            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "My API", Version = "v1" });
                c.OperationFilter<SecurityRequirementsOperationFilter>();

                c.AddSecurityDefinition("bearer", new OpenApiSecurityScheme
                {
                    Description =
        "JWT Authorization header using the Bearer scheme. \r\n\r\n " +
        "Enter 'Bearer' [space] and then your token in the text input below. \r\n\r\n" +
        "Example: \"Bearer 12345abcdef\"",
                    Name = "authorization",
                    In = ParameterLocation.Header,
                    Scheme = "bearer",
                    Type = SecuritySchemeType.ApiKey
                });


            });


            // Cấu hình DbContext
            builder.Services.AddDbContext<MindAidContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
            );
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    policy.WithOrigins("https://localhost:5173")
                          .AllowAnyMethod()
                          .AllowAnyHeader()
                          .AllowCredentials();
                });
            });
            builder.Services.AddAuthorization(options =>
            {
                options.AddPolicy("SurveyResultsPolicy", policy =>
                    policy.RequireRole("Student", "Parent", "Teacher", "Psychologist")
                          .RequireAuthenticatedUser());
            });
            builder.Logging.AddConsole();
            builder.Services.AddSignalR();


            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
                });
                app.UseSwagger();
            }

            app.UseRouting();
            app.UseCors("AllowFrontend");
            app.UseAuthentication();
            app.UseAuthorization();
            app.MapControllers();
            app.MapHub<ChatHub>("/chatHub").RequireCors("AllowFrontend"); ;

            app.Run();
        }
    }
}
