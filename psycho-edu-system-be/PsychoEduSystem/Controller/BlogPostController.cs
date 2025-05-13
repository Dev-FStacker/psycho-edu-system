using BLL.Interface;
using Common.DTO;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PsychoEduSystem.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class BlogPostController : ControllerBase
    {
        private readonly IBlogPostService _blogPostService;

        public BlogPostController(IBlogPostService blogPostService)
        {
            _blogPostService = blogPostService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllBlogs()
        {
            var blogs = await _blogPostService.GetAllBlog();
            return Ok(blogs);
        }


        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetBlogById(int id)
        {
            var blog = await _blogPostService.GetBlogPostById(id);
            if (blog == null)
                return NotFound(new { message = "Blog post not found" });

            return Ok(blog);
        }


        [HttpPost]
        public async Task<IActionResult> CreateBlog([FromBody] BlogPostCreateDTO blogDTO)
        {
            if (blogDTO == null)
                return BadRequest(new { message = "Invalid blog data" });

            var newBlog = await _blogPostService.AddBlog(blogDTO);

            return CreatedAtAction(nameof(GetBlogById), new { id = newBlog.BlogId }, newBlog);
        }


        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateBlog(int id, [FromBody] BlogPostUpdateDTO blogDTO)
        {
            if (blogDTO == null)
                return BadRequest(new { message = "Invalid data" });

            await _blogPostService.UpdateBlog(id, blogDTO);
            return NoContent();
        }


        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteBlog(int id)
        {
            var blog = await _blogPostService.GetBlogPostById(id);
            if (blog == null)
                return NotFound(new { message = "Blog post not found" });

            await _blogPostService.DeleteBlog(id);
            return NoContent();
        }


        [HttpGet("paged")]
        public async Task<IActionResult> GetPagedBlogs(int pageNumber = 1, int pageSize = 10)
        {
            var (blogs, totalRecords) = await _blogPostService.GetPagedBlogPosts(pageNumber, pageSize);

            var totalPages = (int)Math.Ceiling((double)totalRecords / pageSize);

            var response = new
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = totalPages,
                TotalRecords = totalRecords,
                Blogs = blogs.Select(blog => new
                {
                    blog.BlogId,
                    blog.Title,
                    blog.Content,
                    blog.DimensionName,
                    blog.CreatedAt
                })
            };

            return Ok(response);
        }
    }
}
