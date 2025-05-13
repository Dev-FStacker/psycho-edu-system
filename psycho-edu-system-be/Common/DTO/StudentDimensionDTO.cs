using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class StudentDimensionDTO
    {
        public Guid StudentId { get; set; }
        public int Anxiety {  get; set; }
        public int Depression { get; set; }
        public int Stress { get; set; }
    }
}
