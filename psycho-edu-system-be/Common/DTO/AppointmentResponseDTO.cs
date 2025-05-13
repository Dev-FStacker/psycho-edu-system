using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class AppointmentResponseDTO
    {
        public Guid AppointmentId { get; set; }
        public int SlotId { get; set; }
        public string Notes { get; set; }
        public string GoogleMeetURL { get; set; } = string.Empty;
        public string MeetingWith { get; set; } = string.Empty;
        public string BookedBy { get; set; } = string.Empty;
        public string AppointmentFor { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;
        public bool IsOnline { get; set; }
        public bool IsCompleted { get; set; }
        public bool IsCancelled { get; set; }

    }
}
