using DAL.Data;
using DAL.Entities;
using DAL.Repositories.IRepositories;
using Google;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Repositories
{
    public class ProgramEnrollmentRepository : GenericRepository<ProgramEnrollment>, IProgramEnrollmentRepository
    {
        private readonly MindAidContext _mindAidContext;
        public ProgramEnrollmentRepository(MindAidContext context) : base(context)
        {
            _mindAidContext = context;
        }
        public IQueryable<ProgramEnrollment> GetEnrollmentsWithStudents(Expression<Func<ProgramEnrollment, bool>> predicate)
        {
            return _context.ProgramEnrollments.Include(pe => pe.Student).Where(predicate);
        }
    }
}
