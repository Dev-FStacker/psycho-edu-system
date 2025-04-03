using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Entities
{
    public class Role
    {
        [Key]
        public int RoleId { get; set; }
        [Required(ErrorMessage = "Rolne Name is required")]
        public string RoleName { get; set; }

    }
}
