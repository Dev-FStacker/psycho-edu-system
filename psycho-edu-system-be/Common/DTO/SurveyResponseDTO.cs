using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class SurveyResponseDTO
    {
     
        public bool CanTakeSurvey { get; set; }
        public string Message { get; set; }
        public List<SurveyDTO> Surveys
        {
            get; set;
        }

    }
}
