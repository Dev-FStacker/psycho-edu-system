using DAL.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Interface
{
   public interface IClassService
    {
         Task<IEnumerable<Class>> GetClassesByTeacherIdAsync(Guid teacherId);
        Task<IEnumerable<User>> GetStudentsByClassIdAsync(int classId);
    }
}
