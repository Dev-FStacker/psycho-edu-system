using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class UpdateSurveyDTO
    {
        public bool IsPublic { get; set; }
        public string SurveyFor { get; set; }
        public string Title { get; set; }
        public string Description {get; set; }
    }

}
