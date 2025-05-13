using Common.Enum;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class SurveyResultFilterDTO
    {
   
        public Guid? StudentId { get; set; }
        public int? Month { get; set; }
        public int? Year { get; set; }
        public ResultSource? Source { get; set; }
    }
}
