using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Entities;

namespace DAL.Repositories.IRepositories
{
    public interface ISurveyResponseRepository : IGenericRepository<SurveyResponse>
    {

        Task<SurveyResponse> GetLatestSurveyResponseByUserIdAsync(Guid userId);
    }
}
