using DAL.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Interface
{
    public interface IRelationshipService
    {
        Task<IEnumerable<Relationship>> GetRelationshipsByParentIdAsync(Guid parentId);
    }
}
