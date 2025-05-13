using System;
using System.Linq;
using System.Threading.Tasks;
using DAL.Data;
using DAL.Entities;
using DAL.Repositories.IRepositories;
using Microsoft.EntityFrameworkCore;

namespace DAL.Repositories
{
    public class RefreshTokenRepository : GenericRepository<RefreshToken>, IRefreshTokenRepository
    {
        private readonly MindAidContext _mindAidContext;

        public RefreshTokenRepository(MindAidContext mindAidContext) : base(mindAidContext)
        {
            _mindAidContext = mindAidContext;
        }
        public async Task<RefreshToken?> GetRefreshTokenByKey(string refreshToken)
        {
            // Kiểm tra nếu refreshToken không hợp lệ (null hoặc rỗng)
            if (string.IsNullOrWhiteSpace(refreshToken))
            {
                throw new ArgumentException("Refresh token cannot be null or empty.", nameof(refreshToken));
            }

            // Thực hiện truy vấn để tìm RefreshToken theo RefreshTokenKey
            var refreshTokenEntity = await _mindAidContext.RefreshTokens
                .FirstOrDefaultAsync(rt => rt.RefreshTokenKey == refreshToken);

            // Nếu không tìm thấy refresh token, có thể trả về null hoặc ném một ngoại lệ tuỳ theo yêu cầu
            if (refreshTokenEntity == null)
            {
                throw new InvalidOperationException("Refresh token not found.");
            }

            return refreshTokenEntity;
        }

        public async Task<RefreshToken?> GetActiveTokensByUserId(Guid userId)
        {
            // Lấy token chưa bị thu hồi
            var activeToken = await _mindAidContext.RefreshTokens
                .Where(rt => rt.UserId == userId && !rt.IsRevoked) // Lọc token theo UserId và IsRevoked
                .FirstOrDefaultAsync();

            // Nếu không có token hợp lệ, có thể trả về null hoặc ném ngoại lệ tùy theo yêu cầu
            return activeToken;
        }
    }
}
