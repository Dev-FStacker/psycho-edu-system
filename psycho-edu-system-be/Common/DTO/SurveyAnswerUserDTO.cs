using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class SurveyAnswerUserDTO
    {
        public Guid SurveyAnswerUserId { get; set; }
        public Guid UserId { get; set; }
        public Guid SurveyId { get; set; }
        public Guid QuestionId { get; set; }
        public Guid AnswerId { get; set; }
        public int UserPoint { get; set; }
        public DateTime CreateAt { get; set; }
    }
}
