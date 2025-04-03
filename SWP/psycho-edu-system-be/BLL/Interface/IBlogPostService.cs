using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Common.DTO;
using DAL.Entities;

namespace BLL.Interface
{
    public interface IBlogPostService
    {
        Task<IEnumerable<BlogPostResponseDTO>> GetAllBlog();
        Task<BlogPostDTO> GetBlogPostById(int id);

        Task<BlogPostResponseDTO> AddBlog(BlogPostCreateDTO blogDTO);
        Task UpdateBlog(int id, BlogPostUpdateDTO blogDTO);
        Task DeleteBlog(int id);

        Task<(IEnumerable<BlogPostResponseDTO>, int)> GetPagedBlogPosts(int pageNumber, int pageSize);





    }
}
