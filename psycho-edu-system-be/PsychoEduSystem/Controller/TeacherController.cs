using BLL.Interface;
using BLL.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PsychoEduSystem.Controller
{
    [Route("api/teachers")]
    [ApiController]
    public class TeachersController : ControllerBase
    {
        private readonly IClassService _classService;

        public TeachersController(IClassService classService)
        {
            _classService = classService;
        }

        [HttpGet("{userId}/classes")]
        public async Task<IActionResult> GetTeacherClasses(Guid userId)
        {
            var classes = await _classService.GetClassesByTeacherIdAsync(userId);
            return Ok(classes);
        }
        [HttpGet("{classId}/students")]
        public async Task<IActionResult> GetClassStudents(int classId)
        {
            var students = await _classService.GetStudentsByClassIdAsync(classId);
            return Ok(students);
        }
    }
}
