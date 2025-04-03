using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Entities;

namespace BLL.Interface
{
    public interface IMessageService
    {
        Task<List<Message>> GetMessagesBetweenUsers(Guid StudentId, Guid OwnerId);

    }
}
