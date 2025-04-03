using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Data;
using DAL.Entities;
using DAL.Repositories.IRepositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace DAL.Repositories
{
    public class TargetProgramRepository : GenericRepository<TargetProgram>, ITargetProgramRepository
    {
        private readonly MindAidContext _context;

        public TargetProgramRepository(MindAidContext context) : base(context)
        {
            _context = context;
        }

        public async Task<TargetProgram?> FindProgramByHealthPointsAsync(int healthPoints)
        {
            return await _context.TargetPrograms.Where(tp => tp.MinPoint <= healthPoints).FirstOrDefaultAsync();
        }
    }
}
