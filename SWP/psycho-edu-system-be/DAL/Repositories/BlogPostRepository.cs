using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DAL.Data;
using DAL.Entities;
using DAL.Repositories.IRepositories;
using Microsoft.EntityFrameworkCore;

namespace DAL.Repositories
{
    public class BlogPostRepository : GenericRepository<BlogPost>, IBlogPostRepository
    {
        public BlogPostRepository(MindAidContext context) : base(context) { }

        public async Task<IEnumerable<BlogPost>> GetAllAsync()
        {
            return await _context.BlogPosts.Include(b => b.Dimension).ToListAsync();
        }

        public async Task<BlogPost> GetByIdAsync(int blogId)
        {
            return await _context.BlogPosts
                .Include(b => b.Dimension)
                .FirstOrDefaultAsync(b => b.BlogId == blogId);
        }

        public async Task AddAsync(BlogPost blog)
        {
            await _context.BlogPosts.AddAsync(blog);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(BlogPost blog)
        {
            _context.BlogPosts.Update(blog);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int blogId)
        {
            var blog = await _context.BlogPosts.FindAsync(blogId);
            if (blog != null)
            {
                _context.BlogPosts.Remove(blog);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<BlogPost> GetByIdWithDimensionAsync(int id)
        {
            return await _context.BlogPosts
                .Include(b => b.Dimension) // Load Dimension khi lấy blog
                .FirstOrDefaultAsync(b => b.BlogId == id);
        }

        public async Task<IEnumerable<BlogPost>> GetBlogPostsWithDimension()
        {
            return await _context.BlogPosts.Include(b => b.Dimension).ToListAsync();
        }

        public async Task<(IEnumerable<BlogPost>, int)> GetPagedBlogPosts(int pageNumber, int pageSize)
        {
            var totalRecords = await _context.BlogPosts.CountAsync();

            var blogs = await _context.BlogPosts
                .Include(b => b.Dimension)
                .OrderByDescending(b => b.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (blogs, totalRecords);
        }
    }
}
