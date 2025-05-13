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
    public class RelationshipRepository : GenericRepository<Relationship>, IRelationshipRepository
    {
        private readonly MindAidContext _context;

        public RelationshipRepository(MindAidContext context) : base(context)
        {
            _context = context;
        }

        public async Task AddRangeAsync(IEnumerable<Relationship> relationships)
        {
            if (relationships == null || !relationships.Any())
                return;

            await _context.Set<Relationship>().AddRangeAsync(relationships);
        }
    }
}
