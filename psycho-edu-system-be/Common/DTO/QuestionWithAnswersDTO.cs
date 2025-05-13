using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class QuestionWithAnswersDTO
    {
        public Guid QuestionId { get; set; }
        public string Content { get; set; }
 
        public  int CategoryId { get; set; }
        public string CategoryName { get; set; }
        
        public List<AnswerDTO> Answers { get; set; }
    }
}
