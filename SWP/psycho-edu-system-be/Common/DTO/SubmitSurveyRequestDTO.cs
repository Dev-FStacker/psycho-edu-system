using Azure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class SubmitSurveyRequestDTO
    {
        public Guid SurveyId { get; set; }
        public Guid SurveyTakerId { get; set; }
        public Guid SurveyTargetId { get; set; }
        public List<QuestionResponseDTO> Responses { get; set; }
    }
}
