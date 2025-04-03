using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Entities;

namespace DAL.Repositories.IRepositories
{
    public interface IRefreshTokenRepository : IGenericRepository<RefreshToken>
    {
        Task<RefreshToken?> GetRefreshTokenByKey(string refreshToken);
        Task<RefreshToken> GetActiveTokensByUserId(Guid userId);
    }
}
