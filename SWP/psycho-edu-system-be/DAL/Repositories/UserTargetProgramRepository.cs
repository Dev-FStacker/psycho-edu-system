using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Data;
using DAL.Entities;
using DAL.Repositories.IRepositories;
using Microsoft.EntityFrameworkCore;

namespace DAL.Repositories
{
    public class UserTargetProgramRepository : GenericRepository<UserTargetProgram>, IUserTargetProgramRepository
    {
        private readonly MindAidContext _context;

        public UserTargetProgramRepository(MindAidContext context) : base(context)
        {
            _context = context;
        }

        public async Task<UserTargetProgram> FindByUserAndProgramAsync(Guid userId, Guid programId)
        {
            return await _context.UserTargetPrograms
                .FirstOrDefaultAsync(up => up.UserId == userId && up.ProgramId == programId);
        }
    }
}
