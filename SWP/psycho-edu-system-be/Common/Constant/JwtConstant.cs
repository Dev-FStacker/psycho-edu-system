using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Constant
{
    public class JwtConstant
    {
        public class Header
        {

            public const string Authorization = nameof(Authorization);


            public const string Bearer = nameof(Bearer);
        }

        public class KeyClaim
        {
            public const string Username = nameof(Username);
            public const string Email = nameof(Email);
            public const string Password = nameof(Password);
            public const string Role = nameof(Role);
            public const string userId = nameof(userId);
            public const string fullName = nameof(fullName);
        }
    }

}
