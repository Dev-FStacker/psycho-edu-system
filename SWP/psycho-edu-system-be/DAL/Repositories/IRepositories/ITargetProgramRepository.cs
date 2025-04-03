using System.Threading.Tasks;
using DAL.Entities;

namespace DAL.Repositories.IRepositories
{
    public interface ITargetProgramRepository : IGenericRepository<TargetProgram>
    {
        Task<TargetProgram?> FindProgramByHealthPointsAsync(int healthPoints);
    }
}
