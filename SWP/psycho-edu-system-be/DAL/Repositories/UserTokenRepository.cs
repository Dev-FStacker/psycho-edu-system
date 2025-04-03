using DAL.Data;
using DAL.Entities;
using DAL.Repositories.IRepositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Repositories
{
    public class UserTokenRepository : GenericRepository<UserToken>, IUserTokenRepository
    {
        public UserTokenRepository(MindAidContext context) : base(context) { }
    }
}
