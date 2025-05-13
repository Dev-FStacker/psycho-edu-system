using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Entities
{
    public class Relationship
    {
        [Key]
        public Guid RelationshipId { get; set; }
        public Guid ParentId { get; set; }
        public Guid StudentId { get; set; }
        public string RelationshipName { get; set; }
        public DateTime CreateAt { get; set; }

        [ForeignKey("ParentId")]
        public User Parent { get; set; }

        [ForeignKey("StudentId")]
        public virtual User Student { get; set; }
    }
}