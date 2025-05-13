using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Entities;

namespace DAL.Repositories.IRepositories
{
    public interface IAnswerRepository : IGenericRepository<Answer>
    {
        Task DeleteRangeAsync(IEnumerable<Answer> entities);
    }
}
