using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class UpdateUserProfileDTO
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string CurrentPassword { get; set; }
        public string NewPassword { get; set; }
        public string? Phone { get; set; }
        public DateTime? BirthDay { get; set; }
        public string? Gender { get; set; }
        public string? Address { get; set; }
    }
}
