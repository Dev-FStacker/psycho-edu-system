using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class DimensionResultDTO
    {
        public string DimensionName { get; set; }
        public int Points { get; set; }
        public double? AveragePoints { get; set; }
    }
}
