using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Entities
{

    public class ProgramEnrollment
    {
        public Guid ProgramId { get; set; }
        public Guid StudentId { get; set; }
        public string? Status { get; set; }
        public DateTime EnrolledAt { get; set; }
        public DateTime CreateAt { get; set; }

        [ForeignKey("ProgramId")]
        public TargetProgram Program { get; set; }
        [ForeignKey("StudentId")]
        public User Student { get; set; }
    }
}
