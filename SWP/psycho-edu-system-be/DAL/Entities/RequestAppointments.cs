using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Entities
{
    public class RequestAppointments
    {
        [Key]
        public Guid RequestId { get; set; }
        public Guid StudentId { get; set; }
        public int SlotId { get; set; }
        public Boolean IsBooking { get; set; }
        public Boolean IsSend { get; set; }
        public Boolean IsScheduled { get; set; }
        public Boolean IsDeposit { get; set; }
        public Boolean IsCheckedIn { get; set; }
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public DateTime? CreateAt { get; set; }

        [ForeignKey("StudentId")]
        public virtual User Student { get; set; }
        [ForeignKey("SlotId")]
        public virtual Slot Slot { get; set; }
    }
}
