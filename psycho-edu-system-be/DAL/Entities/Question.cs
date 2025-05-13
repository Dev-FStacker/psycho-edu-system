using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Entities
{
    public  class Question
    {
        [Key]
        public Guid QuestionId { get; set; }
   
        public string Content { get; set; }
        public DateTime? UpdateTime     { get; set; }
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public DateTime? CreateAt { get; set; }
    public virtual ICollection<Answer> Answers { get; set;}
        public virtual Survey Survey { get; set; }
        public Guid SurveyId { get; set; }
        public DimensionHealth Dimension { get; set; }
        public int DimensionId { get; set; }
    }
}
