using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Entities
{
    public class SurveyAnswerUser
    {
        [Key]
        public Guid SurveyAnswerUserId { get; set; }

        // Foreign Keys
        public Guid UserId { get; set; }
        public Guid SurveyId { get; set; }
        public Guid SurveyResponseId { get; set; }
        public Guid QuestionId { get; set; }
        public Guid AnswerId { get; set; }

        // Navigation Properties
        [ForeignKey("UserId")]
        public User User { get; set; }

        [ForeignKey("SurveyId")]
        public Survey Survey { get; set; }

        [ForeignKey("SurveyResponseId")]
        public SurveyResponse SurveyResponse { get; set; }

        [ForeignKey("QuestionId")]
        public Question Question { get; set; }

        [ForeignKey("AnswerId")]
        public Answer Answer { get; set; }

        public int UserPoint { get; set; }
        public DateTime CreateAt { get; set; }
    }
}
