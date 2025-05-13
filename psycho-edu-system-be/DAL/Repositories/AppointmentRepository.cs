using DAL.Data;
using DAL.Entities;
using DAL.Repositories.IRepositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Repositories
{
    public class AppointmentRepository : GenericRepository<Appointment>, IAppointmentRepository
    {

        private readonly MindAidContext _context;
        public AppointmentRepository(MindAidContext context) : base(context)
        {
            _context = context;
        }

        public async Task<Appointment> GetAppointmentByUsers(Guid studentId, Guid ownerId)
        {
            var currentTime = DateTime.UtcNow;

            return await _context.Appointments
                .Include(a => a.Slot)
                .FirstOrDefaultAsync(a =>
                    a.MeetingWith == ownerId &&
                    a.AppointmentFor == studentId &&
                    !a.IsCanceled &&
                    !a.IsCompleted &&
                    a.Slot.StartTime <= currentTime &&
                    a.Slot.EndTime >= currentTime // 🔹 Kiểm tra khoảng thời gian hợp lệ
                );
        }

    }
}

