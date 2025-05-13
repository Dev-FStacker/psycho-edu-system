using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class SurveyResultDTO
    {
        public Guid StudentId { get; set; }
        public string StudentName { get; set; }
        public DateTime SurveyDate { get; set; }
        public List<DimensionResultDTO> Dimensions { get; set; }
        public int TotalPoints { get; set; }
    }
}
