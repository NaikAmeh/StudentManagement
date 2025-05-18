using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Application.Interfaces.Identity
{
    public interface IPasswordHasher
    {
        // Returns a tuple/record containing both the hash and the salt
        (byte[] hash, byte[] salt) HashPassword(string password);

        // Verifies a given password against a stored hash and salt
        bool VerifyPassword(string password, byte[] storedHash, byte[] storedSalt);
        string GenerateSalt();
        string GenerateSaltedHash(string password, string passwordSalt);

    }
}
