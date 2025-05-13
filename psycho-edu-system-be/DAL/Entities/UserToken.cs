using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Entities
{
    public class UserToken
    {
        [Key]
        public Guid TokenId { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        public string AccessToken { get; set; } = string.Empty;

        [Required]
        public string RefreshToken { get; set; } = string.Empty;

        public DateTime TokenCreated { get; set; }
        public DateTime TokenExpires { get; set; }
        public DateTime RefreshTokenExpires { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; }
    }
}
