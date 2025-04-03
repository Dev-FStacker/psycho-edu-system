//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;
//using BLL.Interface;
//using Common.DTO;
//using DAL.Entities;
//using DAL.UnitOfWork;

//namespace BLL.Service
//{
//    public class AnswerService : IAnswerService
//    {
//        private readonly IAnswerService _answerService;
//        private readonly IUnitOfWork _unitOfWork;

//        public AnswerService(IAnswerService answerService, IUnitOfWork unitOfWork)
//        {
//            _answerService = answerService;
//            _unitOfWork = unitOfWork;
//        }

//        // Thêm câu trả lời mới
//        public async Task AddAnswerAsync(AnswerDTO answerDTO)
//        {
//            // Chuyển đổi từ AnswerDTO sang Answer entity
//            var answer = new Answer
//            {
//                AnswerId = Guid.NewGuid(),  // Tạo một GUID mới cho Answer
//                Content = answerDTO.Content,
//                QuestionId = answerDTO.QuestionId
//            };

//            // Thêm câu trả lời vào repository thông qua UnitOfWork
//            await _unitOfWork.Answer.Add(answer);
//            // Lưu thay đổi vào cơ sở dữ liệu
//            await _unitOfWork.SaveChangeAsync();  // Lưu thay đổi vào cơ sở dữ liệu


//        }

//        public async Task<AnswerDTO> GetAnswerByIdAsync(Guid answerId)
//        {
//            var answer = await _unitOfWork.Answer.GetId(answerId);

//            // Nếu không tìm thấy câu trả lời, trả về null
//            if (answer == null) return null;

//            // Chuyển đổi từ Answer entity sang AnswerDTO
//            var answerDTO = new AnswerDTO
//            {
//                AnswerId = answer.AnswerId,
//                Content = answer.Content,
//                QuestionId = answer.QuestionId
//            };

//            return answerDTO;



//        }
//    }
//}
