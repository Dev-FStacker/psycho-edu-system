using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Entities
{
    public class Answer
    {
        [Key]
        public Guid AnswerId { get; set; }
        public Question Question { get; set; }
        [ForeignKey("QuestionId")]
        public Guid QuestionId { get; set; }
        public int Point { get; set; }
        public string Content { get; set; }
        public DateTime? UpdatedTime { get; set; }
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public DateTime? CreateAt { get; set; }
    }
}
