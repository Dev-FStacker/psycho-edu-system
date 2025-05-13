using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Entities
{
    public class Message
    {
        [Key]
        public Guid MessageId { get; set; }
        public Guid StudentId { get; set; }
        public Guid OwnerId { get; set; }
        public string Content { get; set; }
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public DateTime? CreateAt { get; set; }

        [ForeignKey("StudentId")]
        public virtual User Student { get; set; }
        [ForeignKey("OwnerId")]
        public virtual User Counselor { get; set; }
    }
}
