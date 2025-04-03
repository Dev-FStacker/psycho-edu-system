using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class SurveyWithQuestionsAndAnswersDTO
    {
        public Guid SurveyId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Target { get; set; }
   public bool IsPublic { get; set; }
        public DateTime UpdateAt { get; set; }
        public DateTime CreateAt { get; set; }
        public List<QuestionWithAnswersDTO> Questions { get; set; }
    }
}
