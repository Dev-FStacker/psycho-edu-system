using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Entities;

namespace DAL.Repositories.IRepositories
{
    public interface IBlogPostRepository
    {


        Task<IEnumerable<BlogPost>> GetAllAsync();
        Task<BlogPost> GetByIdAsync(int blogId);
        Task AddAsync(BlogPost blog);
        Task UpdateAsync(BlogPost blog);
        Task DeleteAsync(int blogId);

        // Bổ sung các hàm đã triển khai
        Task<BlogPost> GetByIdWithDimensionAsync(int id);
        Task<IEnumerable<BlogPost>> GetBlogPostsWithDimension();
        Task<(IEnumerable<BlogPost>, int)> GetPagedBlogPosts(int pageNumber, int pageSize);
    }
}
