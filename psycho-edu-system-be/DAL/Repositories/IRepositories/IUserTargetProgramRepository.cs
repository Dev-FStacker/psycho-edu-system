using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Entities;

namespace DAL.Repositories.IRepositories
{
    public interface IUserTargetProgramRepository : IGenericRepository<UserTargetProgram>
    {

        Task<UserTargetProgram> FindByUserAndProgramAsync(Guid userId, Guid programId);



    }
}
