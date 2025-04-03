        using BLL.Interface;
using Common.Constants;
using Common.DTO;
using Common.Enum;
using DAL.Entities;
        using DAL.UnitOfWork;
        using ExcelDataReader;
        using Microsoft.AspNetCore.Http;
    using Microsoft.EntityFrameworkCore;
    using System;
        using System.Collections.Generic;
        using System.Linq;
using System.Security.Claims;
using System.Text;
        using System.Threading.Tasks;

    namespace BLL.Service
    {
        public class SurveyService : ISurveyService
        {
            private readonly IUnitOfWork _unitOfWork;
        private readonly IHttpContextAccessor  _httpContextAccessor;

            public SurveyService(IUnitOfWork unitOfWork, IHttpContextAccessor httpContext)
            {
                _unitOfWork = unitOfWork;
            _httpContextAccessor = httpContext;
            }

            public async Task<SurveyWithQuestionsAndAnswersDTO> ImportSurveyFromExcel(IFormFile file, SurveySettingsDTO settings)
            {
                try
                {
                    Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

                    using (var stream = new MemoryStream())
                    {
                        await file.CopyToAsync(stream);
                        stream.Position = 0;

                        using (var reader = ExcelReaderFactory.CreateReader(stream))
                        {
                            var dataSet = reader.AsDataSet(new ExcelDataSetConfiguration
                            {
                                ConfigureDataTable = _ => new ExcelDataTableConfiguration
                                {
                                    UseHeaderRow = false
                                }
                            });

                            var dataTable = dataSet.Tables[0];
                            var questions = new List<SurveyQuestionDTO>();

                            // Read each row
                            for (int row = 0; row < dataTable.Rows.Count; row++)
                            {
                                // Bỏ qua hàng trống
                                if (string.IsNullOrEmpty(dataTable.Rows[row][0]?.ToString()))
                                    continue;
                                if (!int.TryParse(dataTable.Rows[row][0].ToString(), out int categoryId))
                                {
                                    continue; // Bỏ qua nếu không phải số
                                }





                                // Kiểm tra Category tồn tại
                                var category = await _unitOfWork.DimensionHealth.GetByIdInt(categoryId);
                                if (category == null)
                                {

                                    continue;
                                }


                                var question = new SurveyQuestionDTO
                                {
                                    CategoryId = categoryId,
                                    CategoryName = category.DimensionName,
                                    Question = dataTable.Rows[row][1].ToString(),
                                    Answers = new List<string>
                    {
                        dataTable.Rows[row][2].ToString(), // Cột C - Answer 1
                        dataTable.Rows[row][3].ToString(), // Cột D - Answer 2
                        dataTable.Rows[row][4].ToString(), // Cột E - Answer 3
                        dataTable.Rows[row][5].ToString()  // Cột F - Answer 4
                    },
                                    Points = new List<int> { 0, 1, 2, 3 }
                                };
                                questions.Add(question);

                            }

                            var surveyId = Guid.NewGuid();
                            var survey = new Survey
                            {
                                SurveyId = surveyId,
                                SurveyName = settings.Title,
                                Description = settings.Description,
                                SurveyFor = settings.Target,
                                IsPublic = true,
                                CreateAt = DateTime.Now,
                            };

                            await _unitOfWork.Survey.AddAsync(survey);

                            var result = new SurveyWithQuestionsAndAnswersDTO
                            {
                                SurveyId = surveyId,
                                Description = settings.Description,

                                UpdateAt = DateTime.Now,
                                Questions = new List<QuestionWithAnswersDTO>()
                            };

                            foreach (var q in questions)
                            {
                                var question = new Question
                                {
                                    QuestionId = Guid.NewGuid(),
                                    DimensionId = q.CategoryId,
                                    Content = q.Question,
                                    SurveyId = surveyId,
                                    CreateAt = DateTime.Now
                                };

                                await _unitOfWork.Question.AddAsync(question);

                                var answers = new List<AnswerDTO>();

                                // Add answers for each question
                                for (int i = 0; i < q.Answers.Count; i++)
                                {
                                    var answer = new Answer
                                    {
                                        AnswerId = Guid.NewGuid(),
                                        Content = q.Answers[i],
                                        Point = q.Points[i],
                                        QuestionId = question.QuestionId,
                                        CreateAt = DateTime.Now
                                    };

                                    await _unitOfWork.Answer.AddAsync(answer);

                                    // Add answer to response
                                    answers.Add(new AnswerDTO
                                    {
                                        AnswerId = answer.AnswerId,
                                        Content = answer.Content,
                                        Point = answer.Point
                                    });
                                }

                                // Add question with answers to result
                                result.Questions.Add(new QuestionWithAnswersDTO
                                {
                                    QuestionId = question.QuestionId,
                                    Content = question.Content,
                                    CategoryName = q.CategoryName,
                                    Answers = answers
                                });
                            }

                            await _unitOfWork.SaveChangeAsync();
                            return result;
                        }
                    }
                }
                catch (Exception ex)
                {
                    // Log exception nếu cần
                    Console.WriteLine($"Error: {ex.Message} , please check file again");
                    return null;
                }
            }
            public async Task<bool> UpdateSurveyAsync(Guid surveyId, UpdateSurveyDTO updateDto)
            {
                var survey = await _unitOfWork.Survey.GetByIdAsync(surveyId);
                if (survey == null)
                    return false;

                survey.IsPublic = updateDto.IsPublic;
                survey.SurveyFor = updateDto.SurveyFor;
                survey.SurveyName = updateDto.Title;
                survey.Description = updateDto.Description;
                survey.UpdateAt = DateTime.Now;

                _unitOfWork.Survey.UpdateAsync(survey);
                await _unitOfWork.SaveChangeAsync();
                return true;
            }

            public async Task<IEnumerable<SurveyDTO>> GetAllSurveysAsync()
            {
                var surveys = await _unitOfWork.Survey.GetAll().ToListAsync();
                return surveys.Select(s => new SurveyDTO
                {
                    SurveyId = s.SurveyId,
                    SurveyName = s.SurveyName,
                    Description = s.Description,
                    IsPublic = s.IsPublic,
                    SurveyFor = s.SurveyFor,
                    CreateAt = s.CreateAt,
                    UpdateAt = s.UpdateAt
                });
            }

            public async Task<SurveyWithQuestionsAndAnswersDTO> GetSurveyByIdAsync(Guid surveyId)
            {
                var survey = await _unitOfWork.Survey.GetByConditionWithIncludesAsync(
                    s => s.SurveyId == surveyId,
                    s => s.Questions);

                if (survey == null)
                    return null;

                var questionIds = survey.Questions.Select(q => q.QuestionId).ToList();
                var answers = await _unitOfWork.Answer.FindAll(a => questionIds.Contains(a.QuestionId)).ToListAsync();

                var categoryIds = survey.Questions.Select(q => q.DimensionId).Distinct().ToList();
                var categories = await _unitOfWork.DimensionHealth.FindAll(c => categoryIds.Contains(c.DimensionId)).ToListAsync();

                foreach (var question in survey.Questions)
                {
                    question.Answers = answers.Where(a => a.QuestionId == question.QuestionId).ToList();
                }

                return new SurveyWithQuestionsAndAnswersDTO
                {
                    SurveyId = survey.SurveyId,
                    Title = survey.SurveyName,
                    Description = survey.Description,
                    IsPublic = survey.IsPublic,
                    Target = survey.SurveyFor,
                    CreateAt = survey.CreateAt,
                    UpdateAt = survey.UpdateAt,
                    Questions = survey.Questions.Select(q => new QuestionWithAnswersDTO
                    {
                        QuestionId = q.QuestionId,
                        Content = q.Content,
                        CategoryName = categories.FirstOrDefault(c => c.DimensionId == q.DimensionId)?.DimensionName,
                        Answers = q.Answers.Select(a => new AnswerDTO
                        {
                            AnswerId = a.AnswerId,
                            Content = a.Content,
                            Point = a.Point
                        }).ToList()
                    }).ToList()
                };

            }
            public async Task<SurveyResponseDTO> GetSurveyByUserIdAsync(Guid takerId, Guid targetId)
            {
                // Kiểm tra survey response trong tháng
                var currentMonthStart = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
                var hasTakenSurvey = await _unitOfWork.SurveyResponse
                    .FindAll(sr => sr.SurveyTakerId == takerId && sr.SurveyTargetId == targetId && sr.CreateAt >= currentMonthStart )
                    .AnyAsync();

                if (hasTakenSurvey)
                {
                    return new SurveyResponseDTO
                    {
                        CanTakeSurvey = false,
                        Message = "Bạn đã hoàn thành survey trong tháng này"
                    };
                }

                // Lấy user với role
                var user = await _unitOfWork.User.GetByConditionWithIncludesAsyncc(
                    u => u.UserId == takerId,
                    includes: q => q.Include(u => u.Role));

                if (user?.Role == null) throw new Exception("Không tìm thấy thông tin người dùng");
            var latestSurvey = await _unitOfWork.Survey
   .FindAll(s => s.IsPublic &&
       s.SurveyFor.Equals(user.Role.RoleName))
   .OrderByDescending(s => s.CreateAt) // Sắp xếp theo ngày tạo giảm dần
   .Include(s => s.Questions)
   .ThenInclude(q => q.Answers)
   .FirstOrDefaultAsync();

            if (latestSurvey == null)
            {
                return new SurveyResponseDTO
                {
                    CanTakeSurvey = false,
                    Message = "Không có survey nào phù hợp"
                };
            }


            return new SurveyResponseDTO
            {
                Message = "Vui lòng thực hiện khảo sát",
                CanTakeSurvey = true,
                Surveys = new List<SurveyDTO>
        {
            new SurveyDTO
            {
                SurveyId = latestSurvey.SurveyId,
                SurveyName = latestSurvey.SurveyName,
                Description = latestSurvey.Description,
                IsPublic = latestSurvey.IsPublic,
                SurveyFor = latestSurvey.SurveyFor,
                CreateAt = latestSurvey.CreateAt,
                Questions = latestSurvey.Questions.Select(q => new QuestionDTO
                {
                    QuestionID = q.QuestionId,
                    Content = q.Content,
                    Answers = q.Answers.Select(a => new AnswerDTO
                    {
                        AnswerId = a.AnswerId,
                        Content = a.Content,
                        Point = a.Point
                    }).ToList()
                }).ToList()
            }
        }
            };
        }

        public async Task<SubmitSurveyResponseDTO> SubmitSurveyAsync( SubmitSurveyRequestDTO request)
            {
           
                var healthPoints = 0;
                var dimensionPoints = new Dictionary<int, (string Name, int Points)>();
                var answerDetails = new List<UserAnswerDetailDTO>();
                SurveyResponse surveyResponse = null;

           
                using (var transaction = _unitOfWork.BeginTransaction(System.Data.IsolationLevel.ReadCommitted))
                {
                    try
                    {
                 
                        var survey = await _unitOfWork.Survey.GetByIdAsync(request.SurveyId);
                        if (survey == null || !survey.IsPublic)
                            throw new Exception("Survey is not public");

                  
                     
                    var surveyTaker = await _unitOfWork.User.GetByIdAsync(request.SurveyTakerId);
                    if (surveyTaker == null)
                        throw new Exception("SurveyTaker not found");

                    // Kiểm tra người được khảo sát (SurveyTarget)
                    var surveyTarget = await _unitOfWork.User.GetByIdAsync(request.SurveyTargetId);
                    if (surveyTarget == null)
                        throw new Exception("SurveyTarget not found");


                    surveyResponse = new SurveyResponse
                        {
                            SurveyResponseId = Guid.NewGuid(),
                            SurveyTakerId = request.SurveyTakerId,
                            SurveyTargetId = request.SurveyTargetId,
                            HealthPoints = 0, 
                            CreateAt = DateTime.Now,
                            SurveyId = request.SurveyId
                        };

                 
                        await _unitOfWork.SurveyResponse.AddAsync(surveyResponse);
                        await _unitOfWork.SaveChangeAsync();

                    
                        foreach (var response in request.Responses)
                        {
                     
                            var question = await _unitOfWork.Question.GetByIdAsync(response.QuestionId);
                            var answer = await _unitOfWork.Answer.GetByIdAsync(response.AnswerId);

                    
                            if (question == null)
                                throw new Exception($"QuestionID {response.QuestionId} not exist.");
                            if (answer == null)
                                throw new Exception($"AnswerID {response.AnswerId} not exist..");
                            if (answer.QuestionId != question.QuestionId)
                                throw new Exception($"Not correct question {question.QuestionId}.");

               
                            var dimension = await _unitOfWork.DimensionHealth.GetByIdInt(question.DimensionId);
                            if (dimension == null)
                                throw new Exception($"Dimension ID {question.DimensionId} not exist..");

                       
                            if (!dimensionPoints.ContainsKey(dimension.DimensionId))
                            {
                                dimensionPoints[dimension.DimensionId] = (dimension.DimensionName, 0);
                            }
                            var current = dimensionPoints[dimension.DimensionId];
                            dimensionPoints[dimension.DimensionId] = (current.Name, current.Points + answer.Point);
                            healthPoints += answer.Point;

                 
                            var surveyAnswerUser = new SurveyAnswerUser
                            {
                                SurveyAnswerUserId = Guid.NewGuid(),
                                UserId = request.SurveyTargetId,
                                SurveyId = request.SurveyId,
                                SurveyResponseId = surveyResponse.SurveyResponseId, 
                                QuestionId = question.QuestionId,
                                AnswerId = answer.AnswerId,
                                UserPoint = answer.Point,
                                CreateAt = DateTime.Now
                            };
                            await _unitOfWork.SurveyAnswerUser.AddAsync(surveyAnswerUser);


                            answerDetails.Add(new UserAnswerDetailDTO
                            {
                                QuestionId = question.QuestionId,
                                QuestionContent = question.Content ?? "N/A", 
                                AnswerId = answer.AnswerId,
                                AnswerContent = answer.Content ?? "N/A", 
                                Point = answer.Point,
                                DimensionName = dimension.DimensionName ?? "N/A" 
                            });
                        }

                 
                        surveyResponse.HealthPoints = healthPoints;
                        await _unitOfWork.SurveyResponse.UpdateAsync(surveyResponse);

                 
                        var mentalHealthDetails = dimensionPoints.Select(kvp => new MentalHealthPointDetail
                        {
                            MentalHPDetailId = Guid.NewGuid(),
                            DimensionId = kvp.Key,
                            DimensionName = kvp.Value.Name,
                            HealthPoints = kvp.Value.Points,
                            SurveyResponseId = surveyResponse.SurveyResponseId,
                            CreateAt = DateTime.Now
                        }).ToList();

                        await _unitOfWork.MentalHealthPointDetail.CreateRangeAsync(mentalHealthDetails);
                        await _unitOfWork.SaveChangeAsync();

              
                        transaction.Commit();
                    }
                    catch (Exception ex)
                    {
            
                        transaction.Rollback();

             
                        Console.WriteLine($"Error: {ex.Message}\nStackTrace: {ex.StackTrace}");

                 
                        if (surveyResponse == null)
                            Console.WriteLine("Error: SurveyResponse not start");
                        else if (surveyResponse.SurveyResponseId == Guid.Empty)
                            Console.WriteLine("Error: SurveyResponseId not correct");

                        throw new Exception($"Submit survey failed: {ex.Message}");
                    }
                }

                return new SubmitSurveyResponseDTO
                {
                    SurveyResponseId = surveyResponse?.SurveyResponseId ?? Guid.Empty,
                    TotalHealthPoints = healthPoints,
                    Details = dimensionPoints.Select(kvp => new MentalHealthPointDetailDTO
                    {
                        DimensionName = kvp.Value.Name,
                        Points = kvp.Value.Points
                    }).ToList(),
                    AnswerDetails = answerDetails
                };
            }
            public async Task<SurveyAnswerResponseDTO> GetUserSurveyAnswersAsync(Guid userId, Guid surveyId)
            {
          
                var user = await _unitOfWork.User.GetByIdAsync(userId);
                if (user == null) throw new Exception("User không tồn tại");

         
                var survey = await _unitOfWork.Survey.GetByIdAsync(surveyId);
                if (survey == null) throw new Exception("Survey không tồn tại");

        
                var answers = await _unitOfWork.SurveyAnswerUser.GetUserAnswersAsync(userId, surveyId);

    
                return new SurveyAnswerResponseDTO
                {
                    SurveyId = surveyId,
                    SurveyName = survey.SurveyName,
                    SubmittedAt = answers.FirstOrDefault()?.CreateAt ?? DateTime.MinValue,
                    Answers = answers.Select(a => new AnswerDetailDTO
                    {
                        QuestionId = a.QuestionId,
                        QuestionContent = a.Question?.Content ?? "N/A",
                        AnswerId = a.AnswerId,
                        AnswerContent = a.Answer?.Content ?? "N/A",
                        Point = a.UserPoint,
                        DimensionName = a.Question?.Dimension?.DimensionName ?? "N/A"
                    }).ToList()
                };
            }
            public async Task<SurveyWithQuestionsAndAnswersDTO> AdjustSurveyAsync(Guid surveyId)
            {
            
                var survey = await _unitOfWork.Survey.GetByConditionWithIncludesAsync(
                    s => s.SurveyId == surveyId,
                    s => s.Questions);

                if (survey == null)
                    throw new Exception("Survey không tồn tại.");

            
                var questionIds = survey.Questions.Select(q => q.QuestionId).ToList();
                var answers = await _unitOfWork.Answer.FindAll(a => questionIds.Contains(a.QuestionId)).ToListAsync();

          
                var categoryIds = survey.Questions.Select(q => q.DimensionId).Distinct().ToList();
                var categories = await _unitOfWork.DimensionHealth.FindAll(c => categoryIds.Contains(c.DimensionId)).ToListAsync();

       
                foreach (var question in survey.Questions)
                {
                    question.Answers = answers.Where(a => a.QuestionId == question.QuestionId).ToList();
                }

                // Trả về thông tin survey dưới dạng DTO
                return new SurveyWithQuestionsAndAnswersDTO
                {
                    SurveyId = survey.SurveyId,
                    Title = survey.SurveyName,
                    Description = survey.Description,
                    IsPublic = survey.IsPublic,
                    Target = survey.SurveyFor,
                    CreateAt = survey.CreateAt,
                    UpdateAt = survey.UpdateAt,
                    Questions = survey.Questions.Select(q => new QuestionWithAnswersDTO
                    {
                        QuestionId = q.QuestionId,
                        Content = q.Content,
                        CategoryId = q.DimensionId, 
                        CategoryName = categories.FirstOrDefault(c => c.DimensionId == q.DimensionId)?.DimensionName,
                        Answers = q.Answers.Select(a => new AnswerDTO
                        {
                            AnswerId = a.AnswerId,
                            Content = a.Content,
                            Point = a.Point
                        }).ToList()
                    }).ToList()
                };
            }
            public async Task<ResponseDTO> UpdateSurveyWithValidationAsync(Guid surveyId, SurveyWithQuestionsAndAnswersDTO updatedSurvey)
            {
                
                var survey = await _unitOfWork.Survey.GetByIdAsync(surveyId);
                if (survey == null)
                    return new ResponseDTO("Survey không tồn tại.", 404, false);

           
                if (updatedSurvey.Questions.Count != 21)
                    return new ResponseDTO("Survey phải có đúng 21 câu hỏi.", 400, false);

           
                foreach (var question in updatedSurvey.Questions)
                {
                    if (string.IsNullOrWhiteSpace(question.Content))
                        return new ResponseDTO("Câu hỏi không được trống.", 400, false);

                    if (question.Answers == null || question.Answers.Count == 0)
                        return new ResponseDTO("Mỗi câu hỏi phải có ít nhất một câu trả lời.", 400, false);

                    foreach (var answer in question.Answers)
                    {
                        if (string.IsNullOrWhiteSpace(answer.Content))
                            return new ResponseDTO("Câu trả lời không được trống.", 400, false);
                    }
                }

        
                survey.SurveyName = updatedSurvey.Title;
                survey.Description = updatedSurvey.Description;
                survey.IsPublic = updatedSurvey.IsPublic;
                survey.SurveyFor = updatedSurvey.Target;
                survey.UpdateAt = DateTime.Now;

         
                var existingQuestions = await _unitOfWork.Question.FindAll(q => q.SurveyId == surveyId).ToListAsync();
                foreach (var question in existingQuestions)
                {
                    var existingAnswers = await _unitOfWork.Answer.FindAll(a => a.QuestionId == question.QuestionId).ToListAsync();
              await      _unitOfWork.Answer.DeleteRangeAsync(existingAnswers);
                }
              await  _unitOfWork.Question.DeleteRangeAsync(existingQuestions);

        
                foreach (var questionDto in updatedSurvey.Questions)
                {
                    var question = new Question
                    {
                        QuestionId = Guid.NewGuid(),
                        DimensionId = questionDto.CategoryId,
                        Content = questionDto.Content,
                        SurveyId = surveyId,
                        CreateAt = DateTime.Now
                    
                    };
                    await _unitOfWork.Question.AddAsync(question);

                    foreach (var answerDto in questionDto.Answers)
                    {
                        var answer = new Answer
                        {
                            AnswerId = Guid.NewGuid(),
                            Content = answerDto.Content,
                            Point = answerDto.Point,
                            QuestionId = question.QuestionId,
                            CreateAt = DateTime.Now
                        };
                        await _unitOfWork.Answer.AddAsync(answer);
                    }
                }

         
                await _unitOfWork.SaveChangeAsync();

                return new ResponseDTO("Cập nhật survey thành công.", 200, true);
            }
        public async Task<List<SurveyResultDTO>> GetSurveyResults(Guid userId, SurveyResultFilterDTO filter)
        {
            var currentUser = await _unitOfWork.User.GetByConditionWithIncludesAsyncc(
         u => u.UserId == userId,
         includes: q => q.Include(u => u.Role));

            if (currentUser?.Role == null)
            {
                throw new UnauthorizedAccessException("Invalid user role");
            }

            var results = new List<SurveyResultDTO>();

            // Base query
            var query = _unitOfWork.SurveyResponse.GetAll()
                .Include(sr => sr.SurveyTaker)
                .Include(sr => sr.SurveyTarget)
                .Include(sr => sr.HealthPointsDetail)
                .AsQueryable();

            // Apply role-based filtering
            switch (currentUser.Role.RoleName)
            {
                case "Student":
                    query = query.Where(sr => sr.SurveyTakerId== userId && sr.SurveyTargetId == userId);
                    break;

                case "Parent":
                    query = query.Where(sr => sr.SurveyTargetId == filter.StudentId);
                    break;

                case "Teacher":
                    query = query.Where(sr => sr.SurveyTargetId == filter.StudentId);
                    break;

                case "Psychologist":
                    
                    break;
            }

            // Apply date filters
            if (filter.Year.HasValue)
            {
                query = query.Where(sr => sr.CreateAt.Year == filter.Year);

                if (filter.Month.HasValue)
                {
                    query = query.Where(sr => sr.CreateAt.Month == filter.Month);
                }
            }

            // Apply source filter
            if (filter.Source.HasValue)
            {
                switch (filter.Source.Value)
                {
                    case ResultSource.Self:
                        query = query.Where(sr => sr.Survey.SurveyFor == "Student");
                        break;

                    case ResultSource.Parent:
                        query = query.Where(sr => sr.Survey.SurveyFor == "Parent");
                        break;

                    case ResultSource.Teacher:
                        query = query.Where(sr => sr.Survey.SurveyFor == "Teacher");
                        break;

                    case ResultSource.Average:
                        return await GetAverageResults(query);
                }
            }

            // Execute query
            var surveyResponses = await query.ToListAsync();

            // Map to DTO
            return surveyResponses.Select(sr => new SurveyResultDTO
            {
                StudentId = sr.SurveyTargetId,
                StudentName = sr.SurveyTarget.FullName,
                SurveyDate = sr.CreateAt,
                TotalPoints = sr.HealthPoints,
                Dimensions = sr.HealthPointsDetail.Select(d => new DimensionResultDTO
                {
                    DimensionName = d.DimensionName,
                    Points = d.HealthPoints
                }).ToList()
            }).ToList();
        }

        private async Task<List<SurveyResultDTO>> GetAverageResults(IQueryable<SurveyResponse> baseQuery)
        {
            // Get all relevant responses
            var allResponses = await baseQuery
                .Include(sr => sr.HealthPointsDetail)
                .ToListAsync();

            // Group by student and dimension
            var grouped = allResponses
                .GroupBy(sr => sr.SurveyTargetId)
                .Select(g => new SurveyResultDTO
                {
                    StudentId = g.Key,
                    StudentName = g.First().SurveyTarget.FullName,
                    Dimensions = g.SelectMany(r => r.HealthPointsDetail)
                        .GroupBy(d => d.DimensionId)
                        .Select(dg => new DimensionResultDTO
                        {
                            DimensionName = dg.First().DimensionName,
                            AveragePoints = dg.Average(x => x.HealthPoints)
                        }).ToList(),
                    TotalPoints = (int)g.Average(r => r.HealthPoints)
                }).ToList();

            return grouped;
        }
        private Guid GetCurrentUserId()
        {
            // Kiểm tra HttpContext có tồn tại không
            if (_httpContextAccessor.HttpContext == null)
            {
                throw new UnauthorizedAccessException("HTTP context is not available");
            }

            // Lấy claim theo cả 2 cách để debug
            var userIdClaim = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)
                            ?? _httpContextAccessor.HttpContext.User.FindFirst(JwtConstant.KeyClaim.userId);

            if (userIdClaim == null)
            {
                var allClaims = _httpContextAccessor.HttpContext.User.Claims
                                .Select(c => $"{c.Type}: {c.Value}")
                                .ToList();
                throw new UnauthorizedAccessException($"User ID claim not found. Available claims: {string.Join(", ", allClaims)}");
            }

            if (!Guid.TryParse(userIdClaim.Value, out Guid userId))
            {
                throw new UnauthorizedAccessException($"Invalid User ID format: {userIdClaim.Value}");
            }

            return userId;
        }
        public Guid GetUserIdFromToken()
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User.Claims.FirstOrDefault(c => c.Type == "userId" || c.Type == "Role");
            if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out Guid userId))
            {
                return userId;
            }
            return Guid.Empty;
        }
    }
    }