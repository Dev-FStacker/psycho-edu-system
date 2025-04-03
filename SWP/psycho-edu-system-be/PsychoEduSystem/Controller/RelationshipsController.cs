using BLL.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using BLL.Service;
using DAL.Entities;

namespace PsychoEduSystem.Controller
{
    [Route("api/relationships")]
    [ApiController]
    public class RelationshipsController : ControllerBase
    {
        private readonly IRelationshipService _relationshipService;

        public RelationshipsController(IRelationshipService relationshipService)
        {
            _relationshipService = relationshipService;
        }

        [HttpGet("parent/{userId}")]
        public async Task<IActionResult> GetParentRelationships(Guid userId)
        {
            var relationships = await _relationshipService.GetRelationshipsByParentIdAsync(userId);
            return Ok(relationships);
        }
    }
}
