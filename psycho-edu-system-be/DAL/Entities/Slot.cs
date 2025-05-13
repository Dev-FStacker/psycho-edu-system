using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Entities
{
    public class Slot
    {
        [Key]
        public int SlotId { get; set; }

        public string SlotName { get; set; }

        public DateTime StartTime { get; set; }  // 🔹 Thêm thời gian bắt đầu
        public DateTime EndTime { get; set; }    // 🔹 Thêm thời gian kết thúc

        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public DateTime? CreateAt { get; set; }

        public virtual ICollection<Appointment> Appointments { get; set; }
    }
}
