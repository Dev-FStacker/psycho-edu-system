using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class MentalHealthPointDetailResponseDTO
    {
        public Guid MHPDId { get; set; }
        public int Point { get; set; }
        public string CategoryName { get; set; }
    }
}
