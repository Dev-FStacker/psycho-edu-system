using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class PasswordHashResultDTO
    {
        public byte[] Hash { get; set; }
        public byte[] Salt { get; set; }

        public PasswordHashResultDTO(byte[] hash, byte[] salt)
        {
            Hash = hash;
            Salt = salt;

        }


    }
}
