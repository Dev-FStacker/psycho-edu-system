using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class AppointmentRequestDTO
    {
        [Required]
        public Guid BookedBy { get; set; }
        [Required]
        public Guid AppointmentFor { get; set; }
        [Required]
        public Guid MeetingWith { get; set; }
        public DateOnly Date { get; set; }
        public int SlotId { get; set; }
        [Required]
        public bool IsOnline { get; set; }
    }
}
