using Konscious.Security.Cryptography;
using StudentManagement.Application.Interfaces.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace StudentMgmt.Infrastructure.Identity
{
    public class PasswordHasher : IPasswordHasher
    {
        // --- Argon2id Implementation ---
        // Configure Argon2 parameters (adjust as needed based on security requirements and performance)
        private const int ArgonDegreeOfParallelism = 4; // Adjust based on server cores
        private const int ArgonMemorySizeKB = 1024 * 128; // 128 MB - Adjust based on RAM
        private const int ArgonIterations = 4; // Number of passes

        public (byte[] hash, byte[] salt) HashPassword(string password)
        {
            if (string.IsNullOrEmpty(password))
            {
                throw new ArgumentNullException(nameof(password));
            }

            var salt = RandomNumberGenerator.GetBytes(16); // Generate a 16-byte salt

            var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password))
            {
                Salt = salt,
                DegreeOfParallelism = ArgonDegreeOfParallelism,
                MemorySize = ArgonMemorySizeKB,
                Iterations = ArgonIterations
            };

            var hash = argon2.GetBytes(32); // Generate a 32-byte hash

            return (hash, salt);
        }

        public (string hash, string salt) Password(string password)
        {
            if (string.IsNullOrEmpty(password))
            {
                throw new ArgumentNullException(nameof(password));
            }

            var salt = RandomNumberGenerator.GetBytes(16); // Generate a 16-byte salt

            var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password))
            {
                Salt = salt,
                DegreeOfParallelism = ArgonDegreeOfParallelism,
                MemorySize = ArgonMemorySizeKB,
                Iterations = ArgonIterations
            };

            var hash = argon2.GetBytes(32); // Generate a 32-byte hash

            return (Convert.ToBase64String(hash), Convert.ToBase64String(salt));
        }

        //add test code

        public bool VerifyPassword(string password, string storedHash, string storedSalt)
        {
            if (string.IsNullOrEmpty(password) || string.IsNullOrEmpty(storedHash) || string.IsNullOrEmpty(storedSalt))
            {
                // Basic validation failed, likely invalid input
                return false;
            }


            var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password))
            {
                Salt = Encoding.UTF8.GetBytes(storedSalt),
                DegreeOfParallelism = ArgonDegreeOfParallelism,
                MemorySize = ArgonMemorySizeKB,
                Iterations = ArgonIterations
            };

            var computedHash = argon2.GetBytes(32);

            return Convert.ToBase64String(computedHash) == storedHash;
            // Constant-time comparison to prevent timing attacks
           // return CryptographicOperations.FixedTimeEquals(computedHash, storedHash);
        }


        public bool VerifyPassword(string password, byte[] storedHash, byte[] storedSalt)
        {
            if (string.IsNullOrEmpty(password) || storedHash == null || storedSalt == null || storedHash.Length != 32 || storedSalt.Length != 16)
            {
                // Basic validation failed, likely invalid input
                return false;
            }

            var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password))
            {
                Salt = storedSalt,
                DegreeOfParallelism = ArgonDegreeOfParallelism,
                MemorySize = ArgonMemorySizeKB,
                Iterations = ArgonIterations
            };

            var computedHash = argon2.GetBytes(32);


            // Constant-time comparison to prevent timing attacks
            return CryptographicOperations.FixedTimeEquals(computedHash, storedHash);
        }

        public string GenerateSalt()
        {
            byte[] data = new byte[16];
            new RNGCryptoServiceProvider().GetBytes(data);

            return Convert.ToBase64String(data);
        }
        public string GenerateSaltedHash(string password, string passwordSalt)
        {
            HashAlgorithm algorithm = new SHA512Managed();

            byte[] data = algorithm.ComputeHash(Encoding.UTF8.GetBytes(password + passwordSalt));

            return Convert.ToBase64String(data);
        }


        // --- PBKDF2 Implementation (Alternative) ---
        /*
        private const int SaltSize = 16; // 128 bit
        private const int HashSize = 32; // 256 bit
        private const int Iterations = 10000; // Number of iterations (adjust as needed)

        public (byte[] hash, byte[] salt) HashPassword(string password)
        {
            if (string.IsNullOrEmpty(password)) throw new ArgumentNullException(nameof(password));

            byte[] salt = RandomNumberGenerator.GetBytes(SaltSize);

            using (var pbkdf2 = new Rfc2898DeriveBytes(password, salt, Iterations, HashAlgorithmName.SHA256))
            {
                byte[] hash = pbkdf2.GetBytes(HashSize);
                return (hash, salt);
            }
        }

        public bool VerifyPassword(string password, byte[] storedHash, byte[] storedSalt)
        {
             if (string.IsNullOrEmpty(password) || storedHash == null || storedSalt == null || storedHash.Length != HashSize || storedSalt.Length != SaltSize)
             {
                return false;
             }

            using (var pbkdf2 = new Rfc2898DeriveBytes(password, storedSalt, Iterations, HashAlgorithmName.SHA256))
            {
                byte[] computedHash = pbkdf2.GetBytes(HashSize);
                return CryptographicOperations.FixedTimeEquals(computedHash, storedHash);
            }
        }
        */
    }
}
