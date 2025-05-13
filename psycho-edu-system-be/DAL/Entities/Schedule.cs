using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Entities
{
    public class Schedule
    {
        public Guid ScheduleId { get; set; }
        public virtual User User { get; set; }
        public Guid UserId { get; set; }
        public int SlotId { get; set; }
        public virtual Slot Slot { get; set; }
        public DateTime Date { get; set; }
        public DateTime CreateAt { get; set; }
    }
}
