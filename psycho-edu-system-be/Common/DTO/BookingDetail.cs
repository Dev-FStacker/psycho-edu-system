using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class BookingDetail
    {
        [Required]
        [Range(1, 8, ErrorMessage = "SlotId must be between 1 and 8")]
        public int SlotId { get; set; }

        [Required]
        [DataType(DataType.Date)]
        public DateTime Date { get; set; }
    }
}
