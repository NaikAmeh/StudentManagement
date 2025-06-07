using DocumentFormat.OpenXml.Office2016.Drawing.ChartDrawing;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using QuestPDF.Infrastructure;
using Serilog;
using StudentManagement.Application.Factories;
using StudentManagement.Application.Features.Students;
using StudentManagement.Application.Interfaces;
using StudentManagement.Application.Interfaces.Factories;
using StudentManagement.Application.Interfaces.Identity;
using StudentManagement.Application.Interfaces.Infrastructure;
using StudentManagement.Application.Interfaces.Services;
using StudentManagement.Application.Interfaces.Uitility;
using StudentManagement.Application.Services;
using StudentManagement.Application.Validation;
using StudentManagement.Application.ViewModelMap;
using StudentMgmt.Infrastructure.Data.DBContext;
using StudentMgmt.Infrastructure.FileProcessing;
using StudentMgmt.Infrastructure.FileStorage;
using StudentMgmt.Infrastructure.Identity;
using StudentMgmt.Infrastructure.Repositories;
using StudentMgmt.Infrastructure.Services;
using StudentMgmt.Infrastructure.Utililty;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// --- CORS Configuration (remains the same) ---
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
                     ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      policy =>
                      {
                          policy.AllowAnyOrigin()
                                .AllowAnyHeader()
                                .AllowAnyMethod()
                                .WithExposedHeaders("Content-Disposition");
                      });
});

var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";



// Add services to the container.
builder.Configuration.AddEnvironmentVariables();

// --- Database Context Configuration ---
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
connectionString = connectionString
    .Replace("${DB_HOST}", Environment.GetEnvironmentVariable("DB_HOST"))
    .Replace("${DB_PORT}", Environment.GetEnvironmentVariable("DB_PORT"))
    .Replace("${DB_DATABASE}", Environment.GetEnvironmentVariable("DB_DATABASE"))
    .Replace("${DB_USER}", Environment.GetEnvironmentVariable("DB_USER"))
    .Replace("${DB_PASSWORD}", Environment.GetEnvironmentVariable("DB_PASSWORD"));

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString), // Use AutoDetect
        mySqlOptions => mySqlOptions.EnableRetryOnFailure( // Optional: Add resilience
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorNumbersToAdd: null)
    )
    // Optional: Add logging in development
    .EnableSensitiveDataLogging(builder.Environment.IsDevelopment())
    .EnableDetailedErrors(builder.Environment.IsDevelopment())
);


// --- Register Application & Identity Services ---
builder.Services.AddScoped<ISchoolService, SchoolService>(); // Specific service
builder.Services.AddScoped<IUserService, UserService>();     // Specific service
builder.Services.AddSingleton<IPasswordHasher, PasswordHasher>();
builder.Services.AddSingleton<ITokenService, TokenService>(); // Singleton fine for token service
builder.Services.AddScoped<IStudentService, StudentService>();
builder.Services.AddScoped<IExcelService, ExcelService>(); // <-- Add Excel Service Registration
builder.Services.AddScoped<IPdfService, PdfService>();
builder.Services.AddScoped<IUserFactory, UserFactory>();
builder.Services.AddScoped<IStudentFactory, StudentFactory>();
builder.Services.AddScoped<ICommonDataService, CommonDataService>();
builder.Services.AddScoped<IDapperService, DapperService>();

builder.Services.AddScoped<IGenericObjectFactory, GenericObjectFactory>();
//builder.services.AddScoped<IValidator<VmStudentImport>, VmStudentImportValidator>();
// --- End Service Registration ---

// --- Register Infrastructure Services ---
// Configure FileStorageSettings from appsettings.json
builder.Services.Configure<FileStorageSettings>(builder.Configuration.GetSection("FileStorageSettings"));

// Register the specific implementation based on config (simple version)
// TODO: Add logic here to switch implementation (e.g., AzureBlobStorageService) based on settings.StorageType
builder.Services.AddScoped<IFileStorageService, FileStorageService>();
// --- End Infrastructure Service Registration ---

// --- This line registers all validators ---
// It scans the assembly where StudentImportDtoValidator is defined
builder.Services.AddValidatorsFromAssemblyContaining<StudentImportDtoValidator>();
// --- End Validator Registration ---


builder.Services.AddSingleton<IPasswordGenerator, PasswordGenerator>(); // Or AddScoped

// --- Add Authentication ---
builder.Services.AddAuthentication(options =>
{
    // Set default schemes
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options => // Configure JWT Bearer authentication handler
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true, // Validate the server that generated the token
        ValidateAudience = true, // Validate the recipient of the token is authorized to receive
        ValidateLifetime = true, // Check if the token is not expired and the signing key is valid
        ValidateIssuerSigningKey = true, // Validate the signature of the token

        ValidIssuer = builder.Configuration["JwtSettings:Issuer"], // Get from appsettings
        ValidAudience = builder.Configuration["JwtSettings:Audience"], // Get from appsettings
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:Key"] ?? "")), // Get from appsettings

        ClockSkew = TimeSpan.Zero // Optional: remove default 5 minute tolerance on expiration
    };

    // Optional: Add event handlers (e.g., OnAuthenticationFailed) for logging/debugging
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            // Log the failure
            Console.WriteLine("OnAuthenticationFailed: " + context.Exception.Message); // Replace with proper logging
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            // Optional: Perform custom validation after token is validated
            Console.WriteLine("OnTokenValidated: " + context.SecurityToken); // Replace with proper logging
            return Task.CompletedTask;
        }
    };
});
// --- End Authentication ---

// --- Add Authorization (Needed even if just using [Authorize]) ---
builder.Services.AddAuthorization();
// --- End Authorization ---

builder.Services.AddAutoMapper(typeof(MappingProfile).Assembly);
// --- Register UnitOfWork and Generic Repository ---
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>(); // Register UnitOfWork
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>)); // Register Generic Repository
//builder.Services.AddScoped<IValidator<VmStudentImport>, StudentImportDtoValidator>();

// --- Register Security Services ---
builder.Services.AddSingleton<IPasswordHasher, PasswordHasher>(); // Singleton is fine for this stateless service
                                                                  // --- End Security Services Registration ---

////builder.Services.AddAutoMapper(typeof(MappingProfile).Assembly);
//builder.Services.AddAutoMapper(cfg => cfg.AddProfile<MappingProfile>(), typeof(MappingProfile).Assembly);

//builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

// --- Configure Serilog ---
// Reads configuration from appsettings.json ("Serilog" section)
// and registers Serilog as the logging provider, overriding default ASP.NET Core logging
builder.Host.UseSerilog((context, services, configuration) => configuration
    .ReadFrom.Configuration(context.Configuration) // Read from appsettings
    .ReadFrom.Services(services) // Allow enrichment from services
    .Enrich.FromLogContext()); // Enable LogContext enrichment
                               // --- End Serilog Config ---

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options => // <-- Configure Swagger for Auth
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "Student ID Mgmt API", Version = "v1" });

    // Define the Bearer Authentication security scheme
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http, // Use ApiKey for Bearer token input
        Scheme = "Bearer"
    });

    // Make sure Swagger UI requires a Bearer token to be specified globally
    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement()
     {
         {
             new Microsoft.OpenApi.Models.OpenApiSecurityScheme
             {
                 Reference = new Microsoft.OpenApi.Models.OpenApiReference
                 {
                     Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                     Id = "Bearer"
                 },
                 Scheme = "Bearer",
                 Name = "Bearer",
                 In = Microsoft.OpenApi.Models.ParameterLocation.Header,
             },
             new List<string>()
         }
     });
});

// --- QuestPDF Configuration ---
// Choose one based on your license (Community is free for many cases)
QuestPDF.Settings.License = LicenseType.Community;
// If using Professional:
// QuestPDF.Settings.License = LicenseType.Professional;
// QuestPDF.Settings.LicenseKey = configuration["QuestPdfLicenseKey"]; // Load from config
// --- End QuestPDF Configuration ---

var app = builder.Build();

// --- Add Serilog Request Logging Middleware ---
// Logs details about each incoming HTTP request (method, path, status code, timing)
// Place it early in the pipeline, but after exception handling/routing if possible.
app.UseSerilogRequestLogging();
// --- End Serilog Request Logging ---

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


app.UseCors(MyAllowSpecificOrigins);

// Use a fixed server path for storing student images (e.g., /var/appdata/student-images on Linux, or C:\AppData\StudentImages on Windows)
//var serverImagePath = Environment.OSVersion.Platform == PlatformID.Win32NT
//    ? @"D:\Projects\Core\StudentManagement\CodeBase\Resources\Images\Students"
//    : "/var/appdata/student-images";

var serverImagePath = Path.Combine(builder.Configuration.GetSection("FileStorageSettings")["LocalStorageBasePath"], "Students");


//var folderPath = Path.Combine(builder.Environment.ContentRootPath, "Resources", "Images", "Students");
if (!Directory.Exists(serverImagePath))
{
    Directory.CreateDirectory(serverImagePath);
}
// IMPORTANT: This enables serving static files from wwwroot
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(serverImagePath),//User config
    RequestPath = "/uploads"
});

app.UseHttpsRedirection();

app.UseRouting();
//app.UseCors(MyAllowSpecificOrigins);

// --- Add Authentication and Authorization Middleware ---
// IMPORTANT: Call UseAuthentication() BEFORE UseAuthorization()
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();