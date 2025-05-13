using Microsoft.Identity.Client;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Entities
{
    public class Appointment
    {
        [Key]
        public Guid AppointmentId { get; set; }
        public int  SlotId { get; set; }
        public Guid BookedBy { get; set; } 
        public Guid AppointmentFor { get; set; }
        public Guid MeetingWith { get; set; }
        public DateOnly Date {  get; set; }
        public string GoogleMeet { get; set; }
        public string Notes { get; set; }
        public bool IsOnline { get; set; }
        public bool IsCompleted { get; set; }
        public bool IsCanceled { get; set; }
        public DateTime CreateAt { get; set; }

        [ForeignKey("SlotId")]
        public Slot Slot { get; set; }
        [ForeignKey("BookedBy")]
        public User Booker { get; set; }
        [ForeignKey("MeetingWith")]
        public User Consultant { get; set; }
        [ForeignKey("AppointmentFor")]
        public User Target { get; set; }
    }
}
