using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class AnswerDTO
    {
        public Guid AnswerId { get; set; }
        public string Content { get; set; }
        public int Point { get; set; }
    }
}
