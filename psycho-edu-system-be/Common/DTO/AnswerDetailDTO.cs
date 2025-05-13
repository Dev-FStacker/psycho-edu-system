using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class AnswerDetailDTO
    {
        public Guid QuestionId { get; set; }
        public string QuestionContent { get; set; }
        public Guid AnswerId { get; set; }
        public string AnswerContent { get; set; }
        public int Point { get; set; }
        public string DimensionName { get; set; }
    }
}
