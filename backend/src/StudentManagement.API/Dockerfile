# Codebase/backend/src/StudentManagement.API/Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-env
ARG BUILD_CONFIGURATION=Release
WORKDIR /app

COPY StudentManagement.Sln ./StudentManagement.Sln
COPY src/StudentManagement.API/StudentManagement.API.csproj ./src/StudentManagement.API/
COPY src/StudentManagement.Application/StudentManagement.Application.csproj ./src/StudentManagement.Application/
COPY src/StudentManagement.Domains/StudentManagement.Domains.csproj ./src/StudentManagement.Domains/

RUN dotnet restore "StudentManagement.Sln"

COPY src ./src

WORKDIR "/app/src/StudentManagement.API"
RUN dotnet publish "StudentManagement.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build-env /app/publish .

RUN useradd -m myappuser
RUN mkdir -p /app/uploads && chown -R myappuser:myappuser /app/uploads # Create uploads dir and set permissions
USER myappuser

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "StudentManagement.API.dll"]