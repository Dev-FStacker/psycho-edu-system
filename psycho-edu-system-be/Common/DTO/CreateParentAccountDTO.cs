using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Common.DTO
{
    public class CreateAccountDTO
    {
        [Required(ErrorMessage = "Username is required.")]
        [MinLength(3, ErrorMessage = "Username must be at least 3 characters long.")]
        [MaxLength(50, ErrorMessage = "Username must not exceed 50 characters.")]
        public required string UserName { get; set; }

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public required string Email { get; set; }

        [Required(ErrorMessage = "Role name is required.")]
        [RegularExpression("^(Parent|Psychologist|Teacher)$", ErrorMessage = "Invalid role name.")]
        public required string RoleName { get; set; }

        public List<StudentRelationshipDTO>? StudentRelationships { get; set; }
    }
}
