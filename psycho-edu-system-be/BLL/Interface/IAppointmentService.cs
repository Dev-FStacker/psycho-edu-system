using Common.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Interface
{
    public interface IAppointmentService
    {
        Task<ResponseDTO> CreateAppointmentAsync(AppointmentRequestDTO request);
        Task<ResponseDTO> GetAppointmentFromRangeAsyncForStudent(Guid studentId, DateOnly selectedDate);
        Task<ResponseDTO> GetAppointmentFromRangeAsyncForConsultant(Guid consultantId, DateOnly selectedDate);
        Task<ResponseDTO> CancelAppointmentAsync(Guid AppointmentId);
        Task<ResponseDTO> DeleteAppointmentAsync();
        Task<ResponseDTO> GiveFeedbackAsync(Guid appointmentId, string notes);
    }
}
