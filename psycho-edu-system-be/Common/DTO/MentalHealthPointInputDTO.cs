using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class MentalHealthPointInputDTO
    {
        public Guid UserId { get; set; }
        public int AnxietyPoint { get; set; }
        public int DepressionPoint { get; set; }
        public int StressPoint { get; set; }
    }
}
