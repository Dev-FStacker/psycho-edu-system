using Microsoft.AspNetCore.SignalR;
using DAL.UnitOfWork;
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Concurrent;
using System.Linq;
using System.Security.Claims;
using BLL.Service;
using System.Collections.Generic;
using System.Globalization;

namespace BLL.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly IUnitOfWork _unitOfWork;
        private static readonly ConcurrentDictionary<string, HashSet<string>> _groupConnections = new();
        private static readonly ConcurrentDictionary<string, bool> _groupStartedByPsychologist = new();
        private readonly AppointmentTimerService _appointmentTimerService;
        private readonly IHubContext<ChatHub> _hubContext;

        public ChatHub(IUnitOfWork unitOfWork, AppointmentTimerService appointmentTimerService, IHubContext<ChatHub> hubContext)
        {
            _unitOfWork = unitOfWork;
            _appointmentTimerService = appointmentTimerService;
            _hubContext = hubContext;
        }

        public override async Task OnConnectedAsync()
        {
            try
            {
                var userId = Context.UserIdentifier;
                var role = Context.User?.FindFirst(ClaimTypes.Role)?.Value;
                var appointmentId = Context.GetHttpContext()?.Request.Query["appointmentId"].ToString();

                if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(role) || string.IsNullOrEmpty(appointmentId))
                {
                    await Clients.Caller.SendAsync("ReceiveMessage", "System", "Invalid connection parameters.");
                    Context.Abort();
                    return;
                }

                if (!Guid.TryParse(appointmentId, out var parsedAppointmentId))
                {
                    await Clients.Caller.SendAsync("ReceiveMessage", "System", "Invalid appointment ID format.");
                    Context.Abort();
                    return;
                }

                var appointment = await _unitOfWork.Appointment.GetByIdAsync(parsedAppointmentId);

                var slot = await _unitOfWork.Slot.GetByIdInt(appointment.SlotId);

                if (appointment == null || (appointment.MeetingWith.ToString() != userId && appointment.AppointmentFor.ToString() != userId))
                {
                    await Clients.Caller.SendAsync("ReceiveMessage", "System", "You are not authorized for this chat.");
                    Context.Abort();
                    return;
                }

                if (appointment.IsCompleted)
                {
                    await Clients.Caller.SendAsync("ReceiveMessage", "System", "This appointment has been completed.");
                    Context.Abort();
                    return;
                }

                if (slot == null)
                {
                    await Clients.Caller.SendAsync("ReceiveMessage", "System", "This appointment hasn't been assigned a slot.");
                    Context.Abort();
                    return;
                }



                var sessionEndTime = DateTime.Parse($"{appointment.Date:yyyy-MM-dd} {slot.SlotName}");

                var vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
                var currentVietnamTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, vietnamTimeZone);

                if (currentVietnamTime < sessionEndTime)
                {
                    await Clients.Caller.SendAsync("ReceiveMessage", "System", "This appointment hasn't happened yet.");
                    Context.Abort();
                    return;
                }

                if (currentVietnamTime > sessionEndTime.AddMinutes(45))
                {
                    await Clients.Caller.SendAsync("ReceiveMessage", "System", "This appointment has already been completed.");
                    Context.Abort();
                    return;
                }

                var connectionSet = _groupConnections.GetOrAdd(appointmentId, _ => new HashSet<string>());

                if (connectionSet.Count >= 2 && !connectionSet.Contains(Context.ConnectionId))
                {
                    await Clients.Caller.SendAsync("ReceiveMessage", "System", "This appointment is already full.");
                    Context.Abort();
                    return;
                }

                await Groups.AddToGroupAsync(Context.ConnectionId, appointmentId);
                connectionSet.Add(Context.ConnectionId);

                if (role == "Psychologist" || role == "Teacher")
                {
                    if (!_groupStartedByPsychologist.ContainsKey(appointmentId))
                    {
                        _groupStartedByPsychologist[appointmentId] = true;
                        _appointmentTimerService.StartTimer(appointmentId, sessionEndTime.AddMinutes(45), EndSession);
                    }
                }

                await Clients.Group(appointmentId).SendAsync("ReceiveMessage", "System", $"{role} has joined the chat.");
                await base.OnConnectedAsync();
            }
            catch (Exception ex)
            {
                await Clients.Caller.SendAsync("ReceiveMessage", "System", $"Error: {ex.Message}");
                Context.Abort();
            }
        }

        public async Task EndSession(string appointmentId)
        {
            try
            {

                await _appointmentTimerService.StopTimer(appointmentId, null);

                if (_groupConnections.TryRemove(appointmentId, out var connectionSet))
                {
                    foreach (var connectionId in connectionSet)
                    {
                        Console.WriteLine($"[Debug] Removing connection: {connectionId}");
                        await Task.Delay(100);
                        await _hubContext.Clients.Client(connectionId).SendAsync("SessionEnded", "System", "Session has ended.");
                    }
                    _groupConnections.TryRemove(appointmentId, out _);
                }
                else
                {
                    Console.WriteLine($"[Error] No connections found for appointment {appointmentId}.");
                }

                _groupStartedByPsychologist.TryRemove(appointmentId, out _);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in EndSession: {ex.Message}");
            }
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var appointmentId = Context.GetHttpContext()?.Request.Query["appointmentId"].ToString();
            if (string.IsNullOrEmpty(appointmentId))
            {
                await base.OnDisconnectedAsync(exception);
                return;
            }

            await Groups.RemoveFromGroupAsync(Context.ConnectionId, appointmentId);

            if (_groupConnections.TryGetValue(appointmentId, out var connectionSet))
            {
                connectionSet.Remove(Context.ConnectionId);

                if (connectionSet.Count == 0)
                {
                    _groupConnections.TryRemove(appointmentId, out _);
                    _groupStartedByPsychologist.TryRemove(appointmentId, out _);
                    await _appointmentTimerService.StopTimer(appointmentId, null);
                }
            }

            await base.OnDisconnectedAsync(exception);
        }
        public async Task SendMessage(string message)
        {
            var appointmentId = Context.GetHttpContext()?.Request.Query["appointmentId"].ToString();

            if (string.IsNullOrEmpty(appointmentId))
            {
                await Clients.Caller.SendAsync("ReceiveMessage", "System", "Invalid appointment ID.");
                return;
            }

            var userId = Context.UserIdentifier;
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var parsedUserId))
            {
                await Clients.Caller.SendAsync("ReceiveMessage", "System", "Invalid user ID.");
                return;
            }

            var user = await _unitOfWork.User.GetByIdAsync(parsedUserId);
            if (user == null)
            {
                await Clients.Caller.SendAsync("ReceiveMessage", "System", "User not found.");
                return;
            }

            string userName = !string.IsNullOrEmpty(user.FullName) ? user.FullName : parsedUserId.ToString();

            if (!_groupStartedByPsychologist.TryGetValue(appointmentId, out bool sessionStarted) || !sessionStarted)
            {
                await Clients.Caller.SendAsync("ReceiveMessage", "System", "You cannot chat until the Psychologist is in.");
                return;
            }

            if (!_groupConnections.TryGetValue(appointmentId, out var connectionSet) || !connectionSet.Contains(Context.ConnectionId))
            {
                await Clients.Caller.SendAsync("ReceiveMessage", "System", "You are not in the chat room.");
                return;
            }

            await Clients.OthersInGroup(appointmentId).SendAsync("ReceiveMessage", userName, message);
        }

    }
}
