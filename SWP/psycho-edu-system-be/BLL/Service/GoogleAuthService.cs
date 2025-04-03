using BLL.Interface;
using Common.Config;
using Common.Constants;
using Common.DTO;
using DAL.Entities;
using DAL.UnitOfWork;
using Google.Apis.Auth;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Data;
using System.Security.Claims;
using System.Threading.Tasks;
using static Google.Apis.Auth.GoogleJsonWebSignature;

namespace BLL.Services
{
    public class GoogleAuthService : IGoogleAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly GoogleAuthConfig _googleAuthConfig;
        private readonly IJwtProvider _jwtProvider;

        public GoogleAuthService(IUnitOfWork unitOfWork, IOptions<GoogleAuthConfig> googleAuthConfig, IJwtProvider jwtProvider)
        {
            _unitOfWork = unitOfWork;
            _googleAuthConfig = googleAuthConfig.Value;
            _jwtProvider = jwtProvider;
        }

        public async Task<ResponseDTO> GoogleSignIn(GoogleAuthTokenDTO googleAuthToken)
        {
            Payload payload;
            try
            {
                // Xác thực token Google
                payload = await ValidateAsync(googleAuthToken.IdToken, new ValidationSettings
                {
                    Audience = new[] { "1018910450198-m8sitc37vcjdg1qbe7d3cp00nca00840.apps.googleusercontent.com" }
                });
            }
            catch (Exception ex)
            {
                return new ResponseDTO("Failed to validate Google token.", 400, false, ex.Message);
            }

            
            if (!payload.Email.EndsWith("@fpt.edu.vn", StringComparison.OrdinalIgnoreCase))
            {
                return new ResponseDTO("Login failed. Only fpt.edu.vn emails are allowed.", 400, false);
            }

      
            var existingUser = await _unitOfWork.User.GetByEmailAsync(payload.Email);
            if (existingUser != null)
            {
                return await GenerateTokensForUser(existingUser);
            }

            // Tạo người dùng mới nếu chưa tồn tại
            var newUser = new User
            {
                UserId = Guid.NewGuid(),
                FullName = $"{payload.GivenName} {payload.FamilyName}".Trim(),
                PasswordHash = new byte[32],
                PasswordSalt = new byte[32],
                Email = payload.Email,
                IsEmailConfirmed = true,
                CreateAt = DateTime.UtcNow,
                ClassId = 1,
                RoleId = 3 
            };

            await _unitOfWork.User.AddAsync(newUser);
            await _unitOfWork.SaveChangeAsync();

            return await GenerateTokensForUser(newUser);
        }

        private async Task<ResponseDTO> GenerateTokensForUser(User user)
        {
           
            var claims = new List<Claim>
    {
        new Claim(JwtClaimTypes.UserId, user.UserId.ToString()),
        new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
        new Claim(JwtClaimTypes.Username, user.UserName)
    };
            var role = await _unitOfWork.Role.GetByIdInt(user.RoleId);
            if (role == null)
            {
                Console.WriteLine($"Role {user.RoleId} not found for user {user.UserId}. Defaulting to 'User'.");
                claims.Add(new Claim(ClaimTypes.Role, "User"));
            }
            else
            {
                claims.Add(new Claim(ClaimTypes.Role, role.RoleName));
            }
            claims.Add(new Claim(JwtConstant.KeyClaim.fullName, user.FullName));
            claims.Add(new Claim(JwtConstant.KeyClaim.Email, user.Email));
            var accessToken = _jwtProvider.GenerateAccessToken(claims);
            var refreshToken = _jwtProvider.GenerateRefreshToken(claims);

           
            var refreshTokenEntity = new RefreshToken
            {
                RefreshTokenId = Guid.NewGuid(),
                UserId = user.UserId,
                RefreshTokenKey = refreshToken,
                IsRevoked = false,
                CreatedAt = DateTime.UtcNow
            };

            try
            {
                await _unitOfWork.RefreshToken.AddAsync(refreshTokenEntity);
                await _unitOfWork.SaveChangeAsync();
            }
            catch (Exception ex)
            {
                return new ResponseDTO("Failed to save refresh token", 500, false, ex.Message);
            }

            // Trả về access token và refresh token
            return new ResponseDTO("Login successful", 200, true, new
            {
                AccessToken = accessToken, // Đảm bảo tên trường chính xác
                RefreshToken = refreshToken,
                UserId = user.UserId,
                Role = 3 
            });
        }
    }
}