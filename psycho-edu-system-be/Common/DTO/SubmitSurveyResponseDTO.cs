using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class SubmitSurveyResponseDTO
    {
        public Guid SurveyResponseId { get; set; }
        public int TotalHealthPoints { get; set; }
        public List<MentalHealthPointDetailDTO> Details { get; set; }
        public List<UserAnswerDetailDTO> AnswerDetails { get; set; }
    }
}
