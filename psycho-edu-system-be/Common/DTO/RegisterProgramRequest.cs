using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class RegisterProgramRequest
    {
        public Guid ProgramId { get; set; }
        public Guid UserId { get; set; }
    }
}
