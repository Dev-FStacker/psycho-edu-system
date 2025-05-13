using System;
using System.ComponentModel.DataAnnotations;

public class AttendanceUpdateRequest
{
    [Required(ErrorMessage = "StudentId is required.")]
    public Guid StudentId { get; set; }

    [Required(ErrorMessage = "ProgramId is required.")]
    public Guid ProgramId { get; set; }

    [Required(ErrorMessage = "StatusName is required.")]
    public string StatusName { get; set; }
}
