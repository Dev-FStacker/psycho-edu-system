using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace BLL.Interface
{
    public interface IJwtProvider
    {
        /// <summary>
        /// Generate access token based on the claims.
        /// </summary>
        /// <param name="claims">The list of claims for the user.</param>
        /// <returns>A JWT as a string.</returns>
        string GenerateAccessToken(List<Claim> claims);
        string GenerateRefreshToken(List<Claim> claims);
        void HandleRefreshToken(string tokenInput, out string accessToken, out string refreshToken);
        List<Claim> DecodeToken(string token);
        bool Validation(string token);
        string? GetUserId(string token);
        string? GetUserId(List<Claim> claims);
        string? GetUserId(HttpContext httpContext);
        string GetRole(HttpContext httpContext);
        string GetRole(HttpRequest httpRequest);
        string GetRole(string token);
        string GetRole(List<Claim> claims);
        string GetAccessTokenByHeader(HttpRequest httpRequest);
        string GetAccessTokenByHeader(string authorizationValue);
        Guid? GetUserIdAsGuid(string token);
        Guid? GetUserIdAsGuid(List<Claim> claims);
        Guid? GetUserIdAsGuid(HttpContext httpContext);
    }
}
