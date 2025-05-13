using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class MentalHealthPointResponseDTO
    {
        public Guid MHPId { get; set; }
        public Guid UserId { get; set; }
        public List<MentalHealthPointDetailResponseDTO> MentalHealthPointDetails { get; set; }
    }

}
