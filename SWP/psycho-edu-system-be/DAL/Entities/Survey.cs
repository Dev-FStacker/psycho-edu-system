using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Entities
{
    public class Survey
    {
        [Key]
        public Guid SurveyId { get; set; }
        public string SurveyName { get; set; }
        public string Description { get; set; }
        public bool IsPublic { get; set; }
        public string SurveyFor { get; set; } // "student", "parent", "teacher"
        public DateTime CreateAt { get; set; }
        public DateTime UpdateAt { get; set; }
        public ICollection<Question> Questions { get; set; }
    }
}
