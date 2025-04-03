using System;
using System.Threading.Tasks;
using DAL.Entities;
using DAL.Repositories.IRepositories;
using Microsoft.EntityFrameworkCore.Storage;

namespace DAL.UnitOfWork
{
    public interface IUnitOfWork : IDisposable
    {
        IAppointmentRepository Appointment { get; }
        ICategoryRepository DimensionHealth { get; }

        IMentalHealthPointDetailRepository MentalHealthPointDetail { get; }

        IMessageRepository Message { get; }
        IRoleRepository Role { get; }
        ISlotRepository Slot { get; }
        IUserRepository User { get; }

        IProgramEnrollmentRepository ProgramEnrollment { get; }
        IUserTokenRepository UserToken { get; }

        IAnswerRepository Answer { get; }

        IRefreshTokenRepository RefreshToken { get; }
        IQuestionRepository Question { get; }
        ISurveyRepository Survey { get; }
        ISurveyResponseRepository SurveyResponse { get; }
        ISurveyAnswerUserRepository SurveyAnswerUser { get; }
        IRelationshipRepository Relationship { get; }
        IClassRepository Class { get; }
        ITargetProgramRepository TargetProgram { get; }
        IUserTargetProgramRepository UserTargetProgram { get; }
        IScheduleRepository Schedule { get; }

        IBlogPostRepository BlogPost { get; }


        IDbContextTransaction BeginTransaction(System.Data.IsolationLevel isolationLevel);
        void Dispose();
        Task<bool> SaveChangeAsync();
        bool SaveChange();
    }
}
