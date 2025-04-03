using Common.DTO;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BLL.Interface
{
    public interface IAnswerService
    {
        Task AddAnswerAsync(AnswerDTO answerDTO);  // Thêm câu trả lời mới
        Task<AnswerDTO> GetAnswerByIdAsync(Guid answerId);  // Lấy câu trả lời theo ID

    }
}
