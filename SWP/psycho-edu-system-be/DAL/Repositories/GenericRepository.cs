using DAL.Data;
using DAL.Entities;
using DAL.Repositories.IRepositories;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;


namespace DAL.Repositories
{
    public class GenericRepository<T> : IGenericRepository<T> where T : class
    {
        protected readonly MindAidContext _context;
        protected readonly DbSet<T> _dbSet;
        public GenericRepository(MindAidContext context)
        {
            _context = context;
            _dbSet = _context.Set<T>();
        }
        public async Task<T> AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
            return entity;
        }

        public bool Delete(T entity)
        {
            _dbSet.Remove(entity);
            return true;
        }

        public IQueryable<T> FindAll(Expression<Func<T, bool>> expression)
        {
            return _dbSet.Where(expression).AsQueryable();
        }

        public IQueryable<T> GetAll()
        {
            return _dbSet.AsQueryable();
        }

        public T GetById(string id)
        {
            throw new NotImplementedException();
        }

        public async Task<T> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty)
            {
                throw new ArgumentException("Id cannot be empty", nameof(id));
            }

            return await _dbSet.FindAsync(id);
        }

        public async Task<T> GetByIdInt(int id)
        {
            if (id == null)
            {
                throw new ArgumentException("Id cannot be empty", nameof(id));
            }
            return await _dbSet.FindAsync(id);
        }
        public async Task<T> UpdateAsync(T entity)
        {
            _dbSet.Update(entity);
            return entity;
        }

        public IEnumerable<T> FindAllAsync(Expression<Func<T, bool>> expression)
        {
            return _dbSet.Where(expression).AsEnumerable();
        }

        public T Add(T entity)
        {
            _dbSet.Add(entity);
            return entity;
        }

        public Task<List<T>> GetAllByListAsync(Expression<Func<T, bool>> expression)
        {
            return _dbSet.Where(expression).ToListAsync();
        }

        public void UpdateRange(List<T> entity)
        {
            _dbSet.UpdateRange(entity);
        }

        public void RemoveRange(List<T> entity)
        {
            _dbSet.RemoveRange(entity);
        }
        public async Task<T> GetByConditionAsync(Expression<Func<T, bool>> expression)
        {
            return await _dbSet.FirstOrDefaultAsync(expression);
        }

        public T GetByCondition(Expression<Func<T, bool>> expression)
        {
            return _dbSet.FirstOrDefault(expression);
        }
        public async Task<IEnumerable<T>> FindProductAsync(Expression<Func<T, bool>> expression)
        {
            return await _dbSet.Where(expression).ToListAsync();
        }
        public async Task DeleteAsync(Guid id)
        {
            var entity = await GetByIdAsync(id);
            if (entity != null)
            {
                Delete(entity);
                await _context.SaveChangesAsync();
            }
        }
        public IQueryable<T> FindAllWithIncludes(Expression<Func<T, bool>>? expression = null, params Expression<Func<T, object>>[] includes)
        {
            IQueryable<T> query = _dbSet.AsQueryable();

            if (expression != null)
            {
                query = query.Where(expression);
            }

            foreach (var include in includes)
            {
                query = query.Include(include);
            }
            return query;
        }
        public async Task<bool> AnyAsync(Expression<Func<User, bool>> predicate)
        {
            return await _context.Users.AnyAsync(predicate);
        }
        public async Task<T> GetByConditionWithIncludesAsync(Expression<Func<T, bool>> expression, params Expression<Func<T, object>>[] includes)
        {
            IQueryable<T> query = _dbSet.Where(expression);
            foreach (var include in includes)
            {
                query = query.Include(include);
            }
            return await query.FirstOrDefaultAsync();
        }
        public async Task<T> GetByConditionWithIncludesAsyncc(
    Expression<Func<T, bool>> expression,
    params Func<IQueryable<T>, IQueryable<T>>[] includes)
        {
            IQueryable<T> query = _dbSet.Where(expression);

            foreach (var include in includes)
            {
                query = include(query); // Cho phép sử dụng ThenInclude
            }

            return await query.FirstOrDefaultAsync();
        }
        public async Task<T> FirstOrDefaultAsync(Expression<Func<T, bool>> expression)
        {
            return await _dbSet.FirstOrDefaultAsync(expression);
        }
        public async Task CreateRangeAsync(IEnumerable<T> entities)
        {
            await _dbSet.AddRangeAsync(entities);
        }
        public async Task<List<SurveyAnswerUser>> GetUserAnswersAsync(Guid userId, Guid surveyId)
        {
            return await _context.SurveyAnswerUsers
                .Include(sau => sau.Question)
                .Include(sau => sau.Answer)
                .Include(sau => sau.Survey)
                .Where(sau => sau.UserId == userId && sau.SurveyId == surveyId)
                .ToListAsync();
        }
        public async Task<T> GetByEmailAsync(string email)
        {
            return await _dbSet.FirstOrDefaultAsync(e => EF.Property<string>(e, "Email") == email);
        }
        public async Task<IEnumerable<T>> GetByConditionAsyncc(Expression<Func<T, bool>> expression)
        {
            return await _dbSet.Where(expression).ToListAsync();
        }
        public async Task<T> GetByIdWithIncludesAsync(Guid id, params Expression<Func<T, object>>[] includes)
        {
            var query = _dbSet.AsQueryable();

            foreach (var include in includes)
            {
                query = query.Include(include);
            }

            return await query.FirstOrDefaultAsync(e => EF.Property<Guid>(e, "UserId") == id);
        }

        public async Task<List<T>> GetAllAsync()
        {
            return await _dbSet.ToListAsync();
        }

    }
}
