using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class QuestionDTO
    {
        public Guid QuestionID { get; set; }
        public string Content { get; set; }
        public List<AnswerDTO> Answers { get; set; }
    }
}
