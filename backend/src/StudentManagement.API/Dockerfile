# backend/src/StudentManagement.API/Dockerfile

# --- Build Stage ---
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-env
ARG BUILD_CONFIGURATION=Release
WORKDIR /app

# Copy solution and project files first for better layer caching
# Adjust paths if your .sln file is elsewhere or projects are structured differently
COPY ../../../StudentManagement.sln ./
COPY src/StudentManagement.API/StudentManagement.API.csproj ./src/StudentManagement.API/
COPY src/StudentManagement.Application/StudentManagement.Application.csproj ./src/StudentManagement.Application/
COPY src/StudentManagement.Domains/StudentManagement.Domains.csproj ./src/StudentManagement.Domains/
# Add more COPY lines here if you have other projects in the solution

# Restore dependencies for all projects in the solution
RUN dotnet restore "StudentManagement.sln"

# Copy the rest of the source code
COPY . .

# Publish the API project
WORKDIR "/app/src/StudentManagement.API"
RUN dotnet publish "StudentManagement.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish --no-restore

# --- Runtime Stage ---
FROM mcr.microsoft.com/dotnet/aspnet:8.0
ARG BUILD_CONFIGURATION=Release
WORKDIR /app

# Copy published output from the build stage
COPY --from=build-env /app/publish .

# Create a non-root user for security
RUN useradd -m myappuser
USER myappuser

# Create an 'uploads' directory if your application needs one for file storage
# Ensure the myappuser has permissions
# RUN mkdir -p /app/uploads
# RUN chown -R myappuser:myappuser /app/uploads

# Expose the port the app runs on (default for ASP.NET Core in container is often 8080)
# If your app is configured for a different port (e.g., via ASPNETCORE_URLS), change this.
EXPOSE 8080

# Set the entry point for the application
# Ensure ASPNETCORE_URLS is set if you're not using the default Kestrel ports or if you need to listen on 0.0.0.0
# ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "StudentManagement.API.dll"]