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
    public class RelationshipService : IRelationshipService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly UserUtility _userUtility;

        public RelationshipService(IUnitOfWork unitOfWork, UserUtility userUtility)
        {
            _unitOfWork = unitOfWork;
            _userUtility = userUtility;
        }
        public async Task<IEnumerable<Relationship>> GetRelationshipsByParentIdAsync(Guid parentId)
        {
            return await _unitOfWork.Relationship.GetByConditionAsyncc(r => r.ParentId == parentId);
        }
    }
}
