using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Common.DTO;

namespace BLL.Interface
{
   public interface IAuthService
    {
        Task SignInWithGoogle(GoogleAuthTokenDTO googleAuthToken);
    }
}
