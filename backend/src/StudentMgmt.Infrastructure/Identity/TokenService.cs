using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using StudentManagement.Application.Interfaces.Identity;
using StudentManagement.Domain.Entities;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace StudentMgmt.Infrastructure.Identity
{
    public class TokenService : ITokenService
    {
        private readonly IConfiguration _config;
        private readonly SymmetricSecurityKey _key; // Store the key derived from config

        public TokenService(IConfiguration config)
        {
            _config = config;
            // Ensure the key from config is retrieved securely and is long enough
            var secretKey = _config["JwtSettings:Key"];
            if (string.IsNullOrEmpty(secretKey) || secretKey.Length < 32) // Example check
            {
                throw new ArgumentException("JWT secret key is missing or too short in configuration.");
            }
            _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        }

        public string GenerateToken(User user)
        {
            if (user == null) throw new ArgumentNullException(nameof(user));

            // Claims identify the user and their properties/roles
            var claims = new List<Claim>
            {
                // Standard claims
                new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()), // Subject (user ID)
                new Claim(JwtRegisteredClaimNames.GivenName, user.Username),    // Username
                new Claim(JwtRegisteredClaimNames.Email, user.Email),           // Email
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()), // Unique token identifier

                // Custom claims (e.g., Role)
                //new Claim(ClaimTypes.Role, user.Role) // Add user role(s)
                // Add other claims as needed (e.g., school IDs user belongs to)
            };

            // Signing credentials using the secret key and algorithm
            var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha512Signature); // Use strong algorithm

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(Convert.ToDouble(_config["JwtSettings:DurationInMinutes"] ?? "60")),
                Issuer = _config["JwtSettings:Issuer"],
                Audience = _config["JwtSettings:Audience"],
                SigningCredentials = creds
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token); // Serialize the token to a string
        }
    }
}
