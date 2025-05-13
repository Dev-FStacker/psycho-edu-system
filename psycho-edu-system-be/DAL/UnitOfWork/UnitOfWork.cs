using DAL.Data;
using DAL.Repositories.IRepositories;
using DAL.Repositories;
using System.Threading.Tasks;
using DAL.Entities;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.EntityFrameworkCore;

namespace DAL.UnitOfWork
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly MindAidContext _context;

        public UnitOfWork(MindAidContext context)
        {
            _context = context;

            // Khởi tạo các repository
            Appointment = new AppointmentRepository(_context);
            DimensionHealth = new CategoryRepository(_context);

            MentalHealthPointDetail = new MentalHealthPointDetailRepository(_context);

            Message = new MessageRepository(_context);
            Role = new RoleRepository(_context);
            Slot = new SlotRepository(_context);
            User = new UserRepository(_context);

            UserToken = new UserTokenRepository(_context);
            Answer = new AnswerRepository(_context);
            RefreshToken = new RefreshTokenRepository(_context);
            Question = new QuestionRepository(_context);
            Survey = new SurveyRepository(_context);
            SurveyResponse = new SurveyResponseRepository(_context);
            SurveyAnswerUser = new SurveyAnswerUserRepository(_context);
            Relationship = new RelationshipRepository(_context);
            Class = new ClassRepository(_context);
            TargetProgram = new TargetProgramRepository(_context);
            Schedule = new ScheduleRepository(_context);
            ProgramEnrollment = new ProgramEnrollmentRepository(_context);
            BlogPost = new BlogPostRepository(_context);

            UserTargetProgram = new UserTargetProgramRepository(_context);
        }

        // Các repository được khởi tạo từ constructor
        public IAppointmentRepository Appointment { get; private set; }
        public ICategoryRepository DimensionHealth { get; private set; }

        public IMentalHealthPointDetailRepository MentalHealthPointDetail { get; private set; }

        public IMessageRepository Message { get; private set; }
        public IRoleRepository Role { get; private set; }
        public ISlotRepository Slot { get; private set; }
        public IUserRepository User { get; private set; }


        public IUserTokenRepository UserToken { get; private set; }



        public IAnswerRepository Answer { get; private set; }

        public IRefreshTokenRepository RefreshToken { get; private set; }
        public IQuestionRepository Question { get; private set; }
        public ISurveyRepository Survey { get; private set; }
        public ISurveyResponseRepository SurveyResponse { get; private set; }
        public ISurveyAnswerUserRepository SurveyAnswerUser { get; private set; }
        public IRelationshipRepository Relationship { get; private set; }
        public IClassRepository Class { get; private set; }

        public ITargetProgramRepository TargetProgram { get; private set; }

        public IScheduleRepository Schedule { get; private set; }

        public IProgramEnrollmentRepository ProgramEnrollment { get; private set; }

        public IBlogPostRepository BlogPost { get; private set; }


        public IUserTargetProgramRepository UserTargetProgram { get; private set; }
        public IDbContextTransaction BeginTransaction(System.Data.IsolationLevel isolationLevel)
        {
            return _context.Database.BeginTransaction(isolationLevel);
        }
        // Giải phóng tài nguyên
        public void Dispose()
        {
            _context.Dispose();
        }

        // Phương thức lưu thay đổi đồng bộ
        public bool SaveChange()
        {
            // Trả về true nếu có thay đổi được lưu
            return _context.SaveChanges() > 0;
        }

        // Phương thức lưu thay đổi bất đồng bộ
        public async Task<bool> SaveChangeAsync()
        {
            // Trả về true nếu có thay đổi được lưu
            return await _context.SaveChangesAsync() > 0;
        }


    }
}
