using DAL.Data;
using DAL.Entities;
using DAL.Repositories.IRepositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Entities;
using Microsoft.EntityFrameworkCore;

namespace DAL.Repositories

{
    public class MessageRepository : GenericRepository<Message>, IMessageRepository
    {
        private readonly MindAidContext _context;
        public MessageRepository(MindAidContext context) : base(context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Message>> GetMessagesBetweenUsers(Guid StudentId, Guid OwnerId)
        {
            return await _context.Messages
                .Where(m => (m.StudentId == StudentId && m.OwnerId == OwnerId) ||
                            (m.StudentId == OwnerId && m.OwnerId == StudentId))
                .OrderBy(m => m.CreateAt)
                .ToListAsync();

        }
    }
}
