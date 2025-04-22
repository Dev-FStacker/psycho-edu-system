# Survey Management System

A **comprehensive solution** for managing surveys, including creating, updating, and retrieving survey data. Supports importing surveys from Excel files, managing user profiles, and handling survey responses.

---

## 🚀 Features

✅ **Survey Management**: Create, update, and retrieve surveys.  
✅ **User Management**: Register users, update profiles, and retrieve user information.  
✅ **Survey Import**: Import surveys from Excel files.  
✅ **Survey Responses**: Submit and retrieve survey responses.  
✅ **Role-Based Access**: Different functionalities based on user roles (*Student, Parent, Teacher, Psychologist*).  

---

## 🛠️ Technologies Used

- **C# 12.0**
- **.NET 8**
- **Entity Framework Core**
- **ExcelDataReader** (for reading Excel files)
- **ASP.NET Core** (for building the web API)

---

## 📂 Project Structure

```
SurveyManagementSystem/
│── BLL/               # Business Logic Layer
│── Service/           # Service classes (SurveyService, UserService)
│── Interface/         # Service interfaces (ISurveyService, IUserService)
│── DAL/               # Data Access Layer
│── Entities/          # Entity classes (User, Survey, Appointment)
│── UnitOfWork/        # Unit of Work pattern implementation
│── Common/            # Common classes & constants
│── DTO/               # Data Transfer Objects (SurveyDTO, UserDTO, ResponseDTO)
│── Constants/         # Constant values
│── Enum/              # Enumerations
│── PsychoEduSystem/   # Main application & controllers
│── Controller/        # API Controllers (UserController)
```

---

## ⚡ Getting Started

### 📌 Prerequisites

- **Visual Studio 2022**
- **.NET 8 SDK**
- **SQL Server** (or any other supported database)

### 🔧 Setup Instructions

1. **Clone the repository**:
   ```sh
   git clone https://github.com/your-repo/survey-management-system.git
   cd survey-management-system
   ```
2. **Restore NuGet packages**:
   ```sh
   dotnet restore
   ```
3. **Update the database connection string**:
   Modify `appsettings.json` to point to your database.
4. **Apply migrations**:
   ```sh
   dotnet ef database update
   ```
5. **Run the application**:
   ```sh
   dotnet run
   ```

---

## 🔗 API Endpoints

### 🧑‍💼 User Management
- **Register User** → `POST /api/user/register`
- **Get User by Username** → `GET /api/user/username/{userName}`
- **Get User Profile** → `GET /api/user/profile?userId={userId}`
- **Update User Profile** → `PUT /api/user/profile/{userId}`
- **Check User Existence** → `GET /api/user/check-existence?userName={userName}&email={email}`
- **Create Account** → `POST /api/user/create-account`
- **Retrieve User Class Info** → `GET /api/user/{studentId}/class`
- **Get Available Slots** → `GET /api/user/{userId}/slots?selectedDate={selectedDate}`
- **Get Students** → `GET /api/user/students`

### 📋 Survey Management
- **Import Survey from Excel** → `POST /api/survey/import`
- **Update Survey** → `PUT /api/survey/{surveyId}`
- **Get Survey by ID** → `GET /api/survey/{surveyId}`
- **Get Survey by User ID** → `GET /api/survey/user/{takerId}/{targetId}`
- **Submit Survey** → `POST /api/survey/submit`
- **Get User Survey Answers** → `GET /api/survey/answers/{userId}/{surveyId}`
- **Adjust Survey** → `PUT /api/survey/adjust/{surveyId}`
- **Update Survey with Validation** → `PUT /api/survey/validate/{surveyId}`
- **Get Survey Results** → `GET /api/survey/results/{userId}`

---

## 🤝 Contributing

🚀 **Contributions are welcome!**

1. **Fork the repository**
2. **Create a new branch** (`git checkout -b feature-name`)
3. **Commit your changes** (`git commit -m "Added new feature"`)
4. **Push to the branch** (`git push origin feature-name`)
5. **Submit a pull request**

---

## 📜 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 📧 Contact

For questions or support, please contact:
📩 **bennguyen.contact@gmail.com**

---

⭐ **Star this repository** if you found it useful!

