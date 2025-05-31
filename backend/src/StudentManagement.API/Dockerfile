# /backend/src/StudentManagement.API/Dockerfile

# --- Build Stage ---
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-env
ARG BUILD_CONFIGURATION=Release
WORKDIR /app

# Copy solution and project files for optimized layer caching
# Paths are relative to the build context (the 'backend' folder)

# Copy the solution file
COPY StudentManagement.sln ./StudentManagement.sln

# Copy .csproj files for each project in the solution
COPY src/StudentManagement.API/StudentManagement.API.csproj ./src/StudentManagement.API/
COPY src/StudentManagement.Application/StudentManagement.Application.csproj ./src/StudentManagement.Application/
COPY src/StudentManagement.Domains/StudentManagement.Domain.csproj ./src/StudentManagement.Domains/
COPY src/StudentMgmt.Infrastructure/StudentMgmt.Infrastructure.csproj ./src/StudentMgmt.Infrastructure/
# Add COPY lines for any other projects under backend/src/ that are part of the solution

# Restore NuGet packages for the entire solution
RUN dotnet restore "StudentManagement.sln"

# Copy the entire 'src' directory from the build context (backend/src/)
# This brings in all C# source code files.
COPY src ./src

# Set the working directory to the API project for publishing
WORKDIR "/app/src/StudentManagement.API"
# Publish the API project
RUN dotnet publish "StudentManagement.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish --no-restore

# --- Runtime Stage ---
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# Copy the published output from the build stage
COPY --from=build-env /app/publish .

# Create a non-root user and an uploads directory
RUN useradd -m myappuser
RUN mkdir -p /app/uploads && chown -R myappuser:myappuser /app/uploads

# Create Resources directory and set permissions
RUN mkdir -p /app/Resources && chown -R myappuser:myappuser /app/Resources

USER myappuser

# Expose the port the application will listen on
EXPOSE 8080
# Define the URL Kestrel should listen on (all interfaces within container)
ENV ASPNETCORE_URLS=http://+:8080

# Entry point for the application
ENTRYPOINT ["dotnet", "StudentManagement.API.dll"]
