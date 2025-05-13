# Survey Management System

A tool to create, manage, and track surveys, import surveys from Excel, handle user profiles, and collect responses.

---

## Features

- Create, update, and view surveys
- Manage users and their profiles
- Import surveys from Excel files
- Submit and view survey responses
- Role-based access (Student, Parent, Teacher, Psychologist)

---

## Tech Stack

- C# 12.0
- .NET 8
- Entity Framework Core
- ExcelDataReader
- ASP.NET Core

---

## Project Structure

```
SurveyManagementSystem/
│── BLL/               # Business logic
│── Service/           # Services (SurveyService, UserService)
│── Interface/         # Service interfaces
│── DAL/               # Data access
│── Entities/          # Models (User, Survey, etc.)
│── UnitOfWork/        # Unit of Work pattern
│── Common/            # Shared utilities
│── DTO/               # Data Transfer Objects
│── Constants/         # Constants
│── Enum/              # Enums
│── PsychoEduSystem/   # Main app & controllers
│── Controller/        # API controllers
```

---

## API Endpoints

### User Management
- Register: `POST /api/user/register`
- Get User: `GET /api/user/username/{userName}`
- Update Profile: `PUT /api/user/profile/{userId}`
- Check User: `GET /api/user/check-existence?userName={userName}&email={email}`
- Get Students: `GET /api/user/students`

### Survey Management
- Import Survey: `POST /api/survey/import`
- Update Survey: `PUT /api/survey/{surveyId}`
- Get Survey: `GET /api/survey/{surveyId}`
- Submit Survey: `POST /api/survey/submit`
- Get Results: `GET /api/survey/results/{userId}`

---

## Contributing

1. Fork the repo
2. Create a branch (`git checkout -b feature-name`)
3. Commit changes (`git commit -m "Add feature"`)
4. Push branch (`git push origin feature-name`)
5. Submit a pull request

---

## License

MIT License. See [LICENSE](LICENSE) file.

---

## Contact

Email: bennguyen.contact@gmail.com

Live Demo: [Google Drive](https://drive.google.com/drive/folders/1z3ptTLDeVpksef3EHMlCc2_v5BIL9xCJ?usp=sharing)
