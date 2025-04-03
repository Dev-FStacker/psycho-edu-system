using DAL.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class ScheduleDTO
    {
        public Guid ScheduleId { get; set; }

        [ForeignKey("User")]
        public Guid UserId { get; set; }
        public virtual User User { get; set; }

        [ForeignKey("Slot")]
        public int SlotId { get; set; }
        public virtual Slot Slot { get; set; }

        [DataType(DataType.Date)]
        public DateTime Date { get; set; }

        public DateTime CreateAt { get; set; }
    }
}
