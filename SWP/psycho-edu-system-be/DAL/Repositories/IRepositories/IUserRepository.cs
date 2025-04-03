using DAL.Entities;
using DAL.Repositories.IRepositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Repositories.IRepositories
{

    public interface IUserRepository : IGenericRepository<User>
    {
        Task<User> GetByEmailOrUserNameAsync(string emailOrUserName);


        Task<User> GetUserByEmailAsync(string email);
        Task<bool> IsUserExistAsync(string userName, string email);
        Task<User> GetCurrentUserWithRoleAsync(Guid userId);
    }
}
