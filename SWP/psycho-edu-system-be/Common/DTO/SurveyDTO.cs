using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class SurveyDTO
    {
        public Guid SurveyId { get; set; }
        public string SurveyName { get; set; }
        public string Description { get; set; }
        public bool IsPublic { get; set; }
        public string SurveyFor { get; set; }
        public DateTime CreateAt { get; set; }
        public DateTime UpdateAt { get; set; }
        public List<QuestionDTO> Questions { get; set; }
    }
}