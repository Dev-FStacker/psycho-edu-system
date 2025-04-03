
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using BLL.Interface;
using Common.Constant;
using Common.Setting;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;

namespace BLL.Service
{
    public class JwtProvider : IJwtProvider
    {
        public string GenerateAccessToken(List<Claim> claims)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(JwtSettingModel.SecretKey);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(JwtSettingModel.ExpireDayAccessToken),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                Issuer = JwtSettingModel.Issuer,
                Audience = JwtSettingModel.Audience
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public string GenerateRefreshToken(List<Claim> claims)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(JwtSettingModel.SecretKey);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(JwtSettingModel.ExpireDayRefreshToken),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                Issuer = JwtSettingModel.Issuer,
                Audience = JwtSettingModel.Audience
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public void HandleRefreshToken(string tokenInput, out string accessToken, out string refreshToken)
        {
            List<Claim> claims = DecodeToken(tokenInput);
            accessToken = GenerateAccessToken(claims);
            refreshToken = GenerateRefreshToken(claims);
        }

        public List<Claim> DecodeToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(JwtSettingModel.SecretKey);

            tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = false,
                ValidateAudience = false
            }, out SecurityToken validatedToken);

            var jwtToken = (JwtSecurityToken)validatedToken;
            return jwtToken.Claims.ToList();
        }

        public bool Validation(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(JwtSettingModel.SecretKey);

                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true 
                }, out SecurityToken validatedToken);

                return true;
            }
            catch
            {
                return false;
            }
        }
        public string? GetUserId(string token)
        {
            if (string.IsNullOrEmpty(token))
            {
                return null;
            }
            List<Claim> claims = DecodeToken(token);
            return GetUserId(claims);
        }

        public string? GetUserId(List<Claim> claims)
        {
            if (claims.Count > 0)
            {
                Claim claim = claims.FirstOrDefault(c => c.Type == JwtConstant.KeyClaim.userId);
                if (claim != null)
                {
                    return claim.Value;
                }
            }
            return null;
        }

        public string? GetUserId(HttpContext httpContext)
        {
            string accessToken = GetAccessTokenByHeader(httpContext.Request);
            return GetUserId(accessToken);
        }

        public string GetRole(HttpContext httpContext)
        {
            string accessToken = GetAccessTokenByHeader(httpContext.Request);
            return GetRole(accessToken);
        }

        public string GetRole(HttpRequest httpRequest)
        {
            string accessToken = GetAccessTokenByHeader(httpRequest);
            return GetRole(accessToken);
        }

        public string GetRole(string token)
        {
            if (string.IsNullOrEmpty(token))
            {
                return string.Empty;
            }
            List<Claim> claims = DecodeToken(token);
            return GetRole(claims);
        }

        public string GetRole(List<Claim> claims)
        {
            if (claims.Count > 0)
            {
                Claim claim = claims.FirstOrDefault(c => c.Type == JwtConstant.KeyClaim.Role);
                if (claim != null)
                {
                    return claim.Value;
                }
            }
            return string.Empty;
        }

        public string GetAccessTokenByHeader(HttpRequest httpRequest)
        {
            string authorization = httpRequest.Headers[JwtConstant.Header.Authorization];
            return GetAccessTokenByHeader(authorization);
        }

        public string GetAccessTokenByHeader(string authorizationValue)
        {
            try
            {
                if (string.IsNullOrEmpty(authorizationValue))
                {
                    return string.Empty;
                }

                var parts = authorizationValue.Split(" ");

                if (parts.Length == 2 && parts[0].Equals("Bearer", StringComparison.OrdinalIgnoreCase))
                {
                    return parts[1];
                }
                return parts.Last();
            }
            catch (Exception)
            {
                throw;
            }
        }

        public Guid? GetUserIdAsGuid(string token)
        {
            if (string.IsNullOrEmpty(token))
            {
                return null;
            }
            List<Claim> claims = DecodeToken(token);
            return GetUserIdAsGuid(claims);
        }

        public Guid? GetUserIdAsGuid(List<Claim> claims)
        {
            Claim claim = claims.FirstOrDefault(c => c.Type == JwtConstant.KeyClaim.userId);
            if (claim != null && Guid.TryParse(claim.Value, out Guid userId))
            {
                return userId;
            }
            return null;
        }

        public Guid? GetUserIdAsGuid(HttpContext httpContext)
        {
            string accessToken = GetAccessTokenByHeader(httpContext.Request);
            return GetUserIdAsGuid(accessToken);
        }
    }
}





