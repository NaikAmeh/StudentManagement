using StudentManagement.Application.Interfaces.Uitility;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace StudentMgmt.Infrastructure.Utililty
{
    public class PasswordGenerator: IPasswordGenerator
    {
        // Simple generator, enhance with complexity rules if needed
        private const string Lowercase = "abcdefghijklmnopqrstuvwxyz";
        private const string Uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        private const string Digits = "0123456789";
        private const string Symbols = "!@#$%^&*()_-+=<>?";
        private const int DefaultLength = 12;

        public string GenerateRandomPassword(int length = DefaultLength)
        {
            var charSets = new[] { Lowercase, Uppercase, Digits, Symbols };
            var allChars = string.Concat(charSets);
            var password = new char[length];

            // Ensure at least one char from each required set (simple approach)
            password[0] = Lowercase[RandomNumberGenerator.GetInt32(Lowercase.Length)];
            password[1] = Uppercase[RandomNumberGenerator.GetInt32(Uppercase.Length)];
            password[2] = Digits[RandomNumberGenerator.GetInt32(Digits.Length)];
            password[3] = Symbols[RandomNumberGenerator.GetInt32(Symbols.Length)];

            // Fill the rest randomly
            for (int i = 4; i < length; i++)
            {
                password[i] = allChars[RandomNumberGenerator.GetInt32(allChars.Length)];
            }

            // Shuffle the password to make it less predictable
            return new string(password.OrderBy(c => RandomNumberGenerator.GetInt32(length)).ToArray());
        }
    }
}
