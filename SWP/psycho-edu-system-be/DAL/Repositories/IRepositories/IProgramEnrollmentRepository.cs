using DAL.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Repositories.IRepositories
{
    public interface IProgramEnrollmentRepository : IGenericRepository<ProgramEnrollment>
    {
        IQueryable<ProgramEnrollment> GetEnrollmentsWithStudents(Expression<Func<ProgramEnrollment, bool>> predicate);
    }
}
