using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class StudentClassResponseDTO
    {
        public int ClassId { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public Guid TeacherId { get; set; }
    }
}
