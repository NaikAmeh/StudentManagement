FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["backend/src/StudentManagement.API/StudentManagement.API.csproj", "src/StudentManagement.API/"]
COPY ["backend/src/StudentManagement.Application/StudentManagement.Application.csproj", "src/StudentManagement.Application/"]
COPY ["backend/src/StudentManagement.Domains/StudentManagement.Domain.csproj", "src/StudentManagement.Domains/"]
COPY ["backend/src/StudentMgmt.Infrastructure/StudentMgmt.Infrastructure.csproj", "src/StudentMgmt.Infrastructure/"]
RUN dotnet restore "src/StudentManagement.API/StudentManagement.API.csproj"
COPY backend/. .
WORKDIR "/src/src/StudentManagement.API"
RUN dotnet build "StudentManagement.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "StudentManagement.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "StudentManagement.API.dll"]