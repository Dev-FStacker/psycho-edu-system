using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class UserProfileDTO
    {
        public string FirstName {  get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Phone {  get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string BirthDay { get; set; }
        public string Gender {  get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
    }
}
