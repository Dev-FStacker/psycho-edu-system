using DAL.Data;
using DAL.Entities;
using DAL.Repositories.IRepositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Repositories
{
    public class UserRepository : GenericRepository<User>, IUserRepository
    {
        private readonly MindAidContext _mindAidContext;

        public UserRepository(MindAidContext context) : base(context)
        {
            _mindAidContext = context;
        }

        // tìm kiếm người dùng theo tên 
        public async Task<User> GetUserByUserNameAsync(string userName)
        {
            return await _mindAidContext.Users.FirstOrDefaultAsync(u => u.UserName.ToLower() == userName.ToLower());
        }

        // gmail
        public async Task<User> GetUserByEmailAsync(string email)
        {
            return await _mindAidContext.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
        }

        public async Task<bool> IsUserExistAsync(string userName, string email)
        {
            return await _mindAidContext.Users
                .AnyAsync(u => u.UserName.ToLower() == userName.ToLower() || u.Email.ToLower() == email.ToLower());
        }

        public async Task<User> GetByEmailOrUserNameAsync(string emailOrUserName)
        {
            return await _mindAidContext.Users
                .FirstOrDefaultAsync(u => u.Email == emailOrUserName || u.UserName == emailOrUserName);
        }
        public async Task<User> GetCurrentUserWithRoleAsync(Guid userId)
        {
            return await _dbSet
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.UserId == userId);
        }

    }
}
