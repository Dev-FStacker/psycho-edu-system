using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BLL.Interface;
using Common.DTO;
using DAL.Entities;
using DAL.UnitOfWork;

namespace BLL.Service
{
    public class BlogPostService : IBlogPostService
    {
        private readonly IUnitOfWork _unitOfWork;

        public BlogPostService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<BlogPostResponseDTO>> GetAllBlog()
        {
            var blogs = await _unitOfWork.BlogPost.GetBlogPostsWithDimension();
            return blogs.Select(blog => new BlogPostResponseDTO
            {
                BlogId = blog.BlogId,
                Title = blog.Title,
                Content = blog.Content,
                // AuthorId = blog.AuthorId,
                DimensionName = blog.Dimension?.DimensionName,
                CreatedAt = blog.CreatedAt
            }).ToList();
        }




        public async Task<BlogPostDTO> GetBlogPostById(int id)
        {
            var blog = await _unitOfWork.BlogPost.GetByIdWithDimensionAsync(id);
            if (blog == null) return null;

            // Chuyển từ Entity sang DTO
            return new BlogPostDTO
            {
                BlogId = blog.BlogId,
                Title = blog.Title,
                Content = blog.Content,
                DimensionName = blog.Dimension?.DimensionName,  // Tránh lỗi null
                CreatedAt = blog.CreatedAt
            };
        }

        public async Task<BlogPostResponseDTO> AddBlog(BlogPostCreateDTO blogDTO)
        {
            var blog = new BlogPost
            {
                Title = blogDTO.Title,
                Content = blogDTO.Content,
                DimensionId = blogDTO.DimensionId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _unitOfWork.BlogPost.AddAsync(blog);
            await _unitOfWork.SaveChangeAsync();

            var createdBlog = (await _unitOfWork.BlogPost.GetBlogPostsWithDimension()).FirstOrDefault(b => b.BlogId == blog.BlogId);
            return new BlogPostResponseDTO
            {
                BlogId = createdBlog.BlogId,
                Title = createdBlog.Title,
                Content = createdBlog.Content,
                DimensionName = createdBlog.Dimension?.DimensionName ?? "Unknown",
                CreatedAt = createdBlog.CreatedAt
            };
        }

        public async Task UpdateBlog(int id, BlogPostUpdateDTO blogDTO)
        {
            var blog = await _unitOfWork.BlogPost.GetByIdAsync(id);

            if (blog == null) return;

            blog.Title = blogDTO.Title;
            blog.Content = blogDTO.Content;
            blog.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.BlogPost.UpdateAsync(blog);
            await _unitOfWork.SaveChangeAsync();
        }


        public async Task DeleteBlog(int id)
        {
            var blog = await _unitOfWork.BlogPost.GetByIdAsync(id);
            if (blog != null)
            {
                await _unitOfWork.BlogPost.DeleteAsync(blog.BlogId);
                await _unitOfWork.SaveChangeAsync();
            }
        }


        public async Task<(IEnumerable<BlogPostResponseDTO>, int)> GetPagedBlogPosts(int pageNumber, int pageSize)
        {
            var (blogs, totalRecords) = await _unitOfWork.BlogPost.GetPagedBlogPosts(pageNumber, pageSize);

            var blogDTOs = blogs.Select(blog => new BlogPostResponseDTO
            {
                BlogId = blog.BlogId,
                Title = blog.Title,
                Content = blog.Content,
                //  AuthorId = blog.AuthorId,
                DimensionName = blog.Dimension?.DimensionName,
                CreatedAt = blog.CreatedAt
            }).ToList();

            return (blogDTOs, totalRecords);
        }





    }
}
