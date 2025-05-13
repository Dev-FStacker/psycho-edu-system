using DAL.Entities;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace DAL.Repositories.IRepositories
{
    public interface IGenericRepository<T> where T : class
    {
        T GetById(string id);
        Task<T> GetByIdAsync(Guid id);
        Task<T> GetByIdInt(int id);
        IQueryable<T> GetAll();
        IQueryable<T> FindAll(Expression<Func<T, bool>> expression);
        IEnumerable<T> FindAllAsync(Expression<Func<T, bool>> expression);
        Task<T> AddAsync(T entity);
        T Add(T entity);
        Task<T> UpdateAsync(T entity);
        bool Delete(T entity);
        Task<List<T>> GetAllByListAsync(Expression<Func<T, bool>> expression);
        void UpdateRange(List<T> entity);
        void RemoveRange(List<T> entity);
        Task DeleteAsync(Guid id);
        Task<bool> AnyAsync(Expression<Func<User, bool>> predicate);
        Task<T> GetByConditionAsync(Expression<Func<T, bool>> expression);
        Task<IEnumerable<T>> GetByConditionAsyncc(Expression<Func<T, bool>> expression);
        T GetByCondition(Expression<Func<T, bool>> expression);
        Task<IEnumerable<T>> FindProductAsync(Expression<Func<T, bool>> expression);
        Task<T> FirstOrDefaultAsync(Expression<Func<T, bool>> expression);
        Task CreateRangeAsync(IEnumerable<T> entities);
        Task<T> GetByConditionWithIncludesAsync(Expression<Func<T, bool>> expression, params Expression<Func<T, object>>[] includes);
        Task<T> GetByConditionWithIncludesAsyncc(
    Expression<Func<T, bool>> expression,
    params Func<IQueryable<T>, IQueryable<T>>[] includes);
        Task<List<SurveyAnswerUser>> GetUserAnswersAsync(Guid userId, Guid surveyId);
        Task<T> GetByEmailAsync(string email);
        Task<T> GetByIdWithIncludesAsync(Guid id, params Expression<Func<T, object>>[] includes);
        Task<List<T>> GetAllAsync();


    }
}