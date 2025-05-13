using Common.DTO;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Interface
{
    public interface IScheduleService
    {
        Task<IActionResult> BookSlots(BookSlotRequest request);
        Task<IActionResult> GetUserSchedules(Guid userId);
        Task<IActionResult> GetAvailableSlots(DateTime date);
    }
}
