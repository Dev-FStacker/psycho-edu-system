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
    public class SurveyResponseRepository : GenericRepository<SurveyResponse>, ISurveyResponseRepository
    {
        private readonly MindAidContext _context;
        public SurveyResponseRepository(MindAidContext context) : base(context)
        {
            _context = context;

        }

        public async Task<SurveyResponse> GetLatestSurveyResponseByUserIdAsync(Guid userId)
        {
            return await _context.SurveyResponses
            .Where(sr => sr.SurveyTakerId == userId)
            .OrderByDescending(sr => sr.CreateAt) // Lấy khảo sát mới nhất
            .FirstOrDefaultAsync();
        }
    }

}
