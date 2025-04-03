using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BLL.Interface;
using DAL.Entities;
using DAL.UnitOfWork;

namespace BLL.Service
{
    public class MessageService : IMessageService
    {
        private readonly IUnitOfWork _unitOfWork;

        public MessageService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<List<Message>> GetMessagesBetweenUsers(Guid studentId, Guid ownerId)
        {
            var messages = await _unitOfWork.Message.GetMessagesBetweenUsers(studentId, ownerId);
            return messages.ToList();
        }
    }
}




