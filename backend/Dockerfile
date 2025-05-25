FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy all relevant projects from src
COPY src/StudentManagement.API ./StudentManagement.API
COPY src/StudentManagement.Application ./StudentManagement.Application
COPY src/StudentManagement.Domains ./StudentManagement.Domains
COPY src/StudentMgmt.Infrastructure ./StudentMgmt.Infrastructure

WORKDIR /src/StudentManagement.API
RUN dotnet restore
RUN dotnet publish -c Release -o /app/out

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out ./
EXPOSE 5000
ENTRYPOINT ["dotnet", "StudentManagement.API.dll"]