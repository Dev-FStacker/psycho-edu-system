using BLL.Interface;
using BLL.Utilities;
using DAL.Entities;
using DAL.UnitOfWork;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Service
{
   public class ClassService : IClassService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly UserUtility _userUtility;

        public ClassService(IUnitOfWork unitOfWork, UserUtility userUtility)
        {
            _unitOfWork = unitOfWork;
            _userUtility = userUtility;
        }
        public async Task<IEnumerable<Class>> GetClassesByTeacherIdAsync(Guid teacherId)
        {
            return await _unitOfWork.Class.GetByConditionAsyncc(c => c.TeacherId == teacherId);
        }

        public async Task<IEnumerable<User>> GetStudentsByClassIdAsync(int classId)
        {
            return await _unitOfWork.User.GetByConditionAsyncc(u => u.ClassId == classId && u.RoleId == 3);
        }
    }
}
