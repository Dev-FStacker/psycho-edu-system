using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Entities
{
    public class UserTargetProgram
    {
        [Key]
        public Guid Id { get; set; }

        public Guid UserId { get; set; }
        public Guid ProgramId { get; set; }
        public DateTime JoinDate { get; set; }
        public virtual User User { get; set; }
        public virtual TargetProgram TargetProgram { get; set; }
    }
}

