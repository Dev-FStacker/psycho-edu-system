using System.Threading.Tasks;
using Common.DTO;

namespace BLL.Interface
{
    public interface ILoginService
    {
        Task<ResponseDTO> LoginAsync(string email, string password);
        Task<ResponseDTO> RefreshBothTokens(string oldAccessToken, string oldRefreshTokenKey);
        Task<ResponseDTO> LogoutAsync(string refreshTokenKey);
        ResponseDTO GetUserByAccessToken(string accessToken);
        GetUserDTO GetUserByUserId(string userId);
    }
}
