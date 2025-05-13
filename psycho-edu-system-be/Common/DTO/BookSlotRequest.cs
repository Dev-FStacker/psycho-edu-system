using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class BookSlotRequest
    {
        [Required]
        public Guid UserId { get; set; }

        [Required]
        [MinLength(1, ErrorMessage = "At least one booking detail is required")]
        public List<BookingDetail> BookingDetails { get; set; }
    }

}
