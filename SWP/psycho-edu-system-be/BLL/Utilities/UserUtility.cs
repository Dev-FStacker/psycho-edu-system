using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Common.DTO;
using Microsoft.AspNetCore.Http;

namespace BLL.Utilities
{
    public class UserUtility
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UserUtility(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        const int keySize = 64;
        const int iterations = 350000;

        HashAlgorithmName hashAlgorithm = HashAlgorithmName.SHA512;

        public PasswordHashResultDTO CreateHashPassword(string password)
        {
            var salt = RandomNumberGenerator.GetBytes(keySize);
            var hash = Rfc2898DeriveBytes.Pbkdf2(Encoding.UTF8.GetBytes(password.Trim()), salt, iterations, hashAlgorithm, keySize);

            return new PasswordHashResultDTO(hash, salt);

        }

        public bool VerifyPassword(string password, byte[] storedHash, byte[] storedSalt)
        {
            using (var hmac = new System.Security.Cryptography.HMACSHA512(storedSalt))
            {
                var computedHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
                return computedHash.SequenceEqual(storedHash);
            }
        }


    }



}
