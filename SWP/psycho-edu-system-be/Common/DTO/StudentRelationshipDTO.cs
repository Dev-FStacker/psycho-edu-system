using System.ComponentModel.DataAnnotations;

namespace Common.DTO
{
    public class StudentRelationshipDTO
    {
        [Required(ErrorMessage = "Student email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string StudentEmail { get; set; }

        [Required(ErrorMessage = "Relationship name is required.")]
        public string RelationshipName { get; set; }
    }
}
