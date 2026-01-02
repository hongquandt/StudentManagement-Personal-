
namespace StudentManagement
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers().AddJsonOptions(x =>
                x.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles);
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // Register Database Context
            builder.Services.AddDbContext<StudentManagement.Models.StudentManagementContext>();
            builder.Services.AddMemoryCache();

            // Register Repositories
            builder.Services.AddScoped<StudentManagement.Repositories.IAuthRepository, StudentManagement.Repositories.AuthRepository>();
            builder.Services.AddScoped<StudentManagement.Repositories.IStudentRepository, StudentManagement.Repositories.StudentRepository>();

            // Register Services
            builder.Services.AddScoped<StudentManagement.Services.IAuthService, StudentManagement.Services.AuthService>();
            builder.Services.AddScoped<StudentManagement.Services.IEmailService, StudentManagement.Services.EmailService>();
            builder.Services.AddScoped<StudentManagement.Services.IStudentService, StudentManagement.Services.StudentService>();
            builder.Services.AddScoped<StudentManagement.Services.IGeminiService, StudentManagement.Services.GeminiService>();
            builder.Services.AddScoped<StudentManagement.Services.ITeacherService, StudentManagement.Services.TeacherService>();

            builder.Services.AddSignalR(); // Add SignalR

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll",
                    builder =>
                    {
                        builder.WithOrigins("http://localhost:5173") // Specific origin needed for credentials
                               .AllowAnyMethod()
                               .AllowAnyHeader()
                               .AllowCredentials(); // Allow Credentials
                    });
            });

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles(); // Enable static files for materials

            app.UseCors("AllowAll");

            app.UseAuthorization();


            app.MapControllers();
            app.MapHub<StudentManagement.Hubs.ChatHub>("/chatHub"); // Map Hub

            app.Run();
        }
    }
}
