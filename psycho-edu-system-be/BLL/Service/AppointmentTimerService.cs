using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.SignalR;
using System.Timers;
using Timer = System.Timers.Timer;
using DAL.UnitOfWork;
using BLL.Hubs;

namespace BLL.Service
{
    public class AppointmentTimerService
    {
        private readonly ConcurrentDictionary<string, (Timer Timer, DateTime SessionEndTime)> _appointments = new();
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IHubContext<ChatHub> _hubContext;

        public AppointmentTimerService(IServiceScopeFactory scopeFactory, IHubContext<ChatHub> hubContext)
        {
            _scopeFactory = scopeFactory;
            _hubContext = hubContext;
        }

        public void StartTimer(string appointmentId, DateTime sessionEndTime, Func<string, Task> onSessionEnd)
        {
            if (!_appointments.TryAdd(appointmentId, (new Timer(1000), sessionEndTime)))
            {
                Console.WriteLine($"[Timer] Appointment {appointmentId} already has an active timer.");
                return;
            }

            var (timer, _) = _appointments[appointmentId];

            timer.Elapsed += async (sender, e) => await CheckTimeRemaining(appointmentId, onSessionEnd);
            timer.AutoReset = true;
            timer.Start();

            Console.WriteLine($"[Timer] Started for appointment {appointmentId}. Ends at: {sessionEndTime}");
        }

        private async Task CheckTimeRemaining(string appointmentId, Func<string, Task> onSessionEnd)
        {
            if (!_appointments.TryGetValue(appointmentId, out var appointmentData))
            {
                return;
            }

            var vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var currentVietnamTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, vietnamTimeZone);
            var remainingTime = (appointmentData.SessionEndTime - currentVietnamTime).TotalSeconds;

            Console.WriteLine($"[Timer] Appointment {appointmentId} - Remaining: {remainingTime} seconds.");

            if (remainingTime <= 0)
            {
                await StopTimer(appointmentId, onSessionEnd);
            }
        }

        public async Task StopTimer(string appointmentId, Func<string, Task> onSessionEnd)
        {
            try
            {
                Console.WriteLine($"[Debug] Attempting to stop timer for {appointmentId}.");

                if (!_appointments.TryRemove(appointmentId, out var appointmentData))
                {
                    Console.WriteLine($"[Warning] StopTimer: No active timer found for {appointmentId}, forcing cleanup.");
                }
                else
                {
                    if (appointmentData.Timer != null)
                    {
                        appointmentData.Timer.Stop();
                        appointmentData.Timer.Dispose();
                        appointmentData.Timer = null;
                        Console.WriteLine($"[Info] Timer stopped and disposed for appointment {appointmentId}.");
                    }
                }

                using var scope = _scopeFactory.CreateScope();
                var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                var appointment = await unitOfWork.Appointment.GetByIdAsync(Guid.Parse(appointmentId));

                if (appointment != null && !appointment.IsCompleted)
                {
                    appointment.IsCompleted = true;
                    await unitOfWork.SaveChangeAsync();
                    Console.WriteLine($"[Info] Marked appointment {appointmentId} as completed in DB.");
                }

                await _hubContext.Clients.Group(appointmentId).SendAsync("SessionEnded", "System", "Session has ended.");

                if (onSessionEnd != null)
                {
                    await onSessionEnd(appointmentId);
                }

            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Error] StopTimer failed for {appointmentId}: {ex.Message}");
            }
        }


        public bool TryGetSessionEndTime(string appointmentId, out DateTime sessionEndTime)
        {
            if (_appointments.TryGetValue(appointmentId, out var appointmentData))
            {
                sessionEndTime = appointmentData.SessionEndTime;
                return true;
            }

            sessionEndTime = default;
            return false;
        }
    }
}
