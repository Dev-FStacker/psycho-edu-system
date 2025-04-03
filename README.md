Survey Management System
Overview
The Survey Management System is a comprehensive solution designed to manage surveys, including creating, updating, and retrieving survey data. It supports importing surveys from Excel files, managing user profiles, and handling survey responses. The system is built using C# and targets .NET 8.
Features
•	Survey Management: Create, update, and retrieve surveys.
•	User Management: Register users, update user profiles, and retrieve user information.
•	Survey Import: Import surveys from Excel files.
•	Survey Responses: Submit and retrieve survey responses.
•	Role-Based Access: Different functionalities based on user roles (Student, Parent, Teacher, Psychologist).
Technologies Used
•	C# 12.0
•	.NET 8
•	Entity Framework Core
•	ExcelDataReader: For reading Excel files.
•	ASP.NET Core: For building the web API.
Project Structure
•	BLL (Business Logic Layer): Contains the business logic and service classes.
•	Service: Contains service classes like SurveyService and UserService.
•	Interface: Contains service interfaces like ISurveyService and IUserService.
•	DAL (Data Access Layer): Contains data access logic and entity classes.
•	Entities: Contains entity classes like User, Survey, and Appointment.
•	UnitOfWork: Contains the unit of work pattern implementation.
•	Common: Contains common classes and constants used across the project.
•	DTO: Contains Data Transfer Objects (DTOs) like SurveyDTO, UserRegisterDTO, and ResponseDTO.
•	Constants: Contains constant values used in the project.
•	Enum: Contains enumerations used in the project.
•	PsychoEduSystem: Contains the main application and controllers.
•	Controller: Contains API controllers like UserController.
Getting Started
Prerequisites
•	Visual Studio 2022
•	.NET 8 SDK
•	SQL Server (or any other supported database)
Setup
1.	Clone the repository:   git clone https://github.com/your-repo/survey-management-system.git
   cd survey-management-system
2.	Restore NuGet packages:   dotnet restore
3.	Update the database connection string: Update the connection string in appsettings.json to point to your database.
4.	Apply migrations:    dotnet ef database update
5.	Run the application: dotnet run
   
API Endpoints
User Management
•	Register User: POST /api/user/register
•	Get User by Username: GET /api/user/username/{userName}
•	Get User Profile: GET /api/user/profile?userId={userId}
•	Update User Profile: PUT /api/user/profile/{userId}
•	Check User Existence: GET /api/user/check-existence?userName={userName}&email={email}
•	Create Account: POST /api/user/create-account
•	Retrieve User Class Info: GET /api/user/{studentId}/class
•	Get Available Slots: GET /api/user/{userId}/slots?selectedDate={selectedDate}
•	Get Students: GET /api/user/students
Survey Management
•	Import Survey from Excel: POST /api/survey/import
•	Update Survey: PUT /api/survey/{surveyId}
•	Get Survey by ID: GET /api/survey/{surveyId}
•	Get Survey by User ID: GET /api/survey/user/{takerId}/{targetId}
•	Submit Survey: POST /api/survey/submit
•	Get User Survey Answers: GET /api/survey/answers/{userId}/{surveyId}
•	Adjust Survey: PUT /api/survey/adjust/{surveyId}
•	Update Survey with Validation: PUT /api/survey/validate/{surveyId}
•	Get Survey Results: GET /api/survey/results/{userId}
Contributing
Contributions are welcome! Please fork the repository and submit a pull request with your changes.
License
This project is licensed under the MIT License. See the LICENSE file for details.
Contact
For any questions or support, please contact bennguyen.contact@gmail.com.
