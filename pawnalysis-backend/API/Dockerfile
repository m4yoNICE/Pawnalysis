FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj files first, preserving folder structure, for better layer caching
COPY API/API.csproj API/
COPY DataAccess/DataAccess.csproj DataAccess/

RUN dotnet restore API/API.csproj

# Now copy everything else
COPY . .

RUN dotnet publish API/API.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "API.dll"]