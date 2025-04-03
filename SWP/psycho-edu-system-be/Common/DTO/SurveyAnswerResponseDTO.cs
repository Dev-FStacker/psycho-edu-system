using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class SurveyAnswerResponseDTO
    {
        public Guid SurveyId { get; set; }
        public string SurveyName { get; set; }
        public DateTime SubmittedAt { get; set; }
        public List<AnswerDetailDTO> Answers { get; set; }
    }

}
