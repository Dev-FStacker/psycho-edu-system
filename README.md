# PsychoEduSystem

## Introduction

**PsychoEduSystem** is a school-based mental health support platform designed for a single educational institution. The system provides a comprehensive set of features to promote, monitor, and support the psychological well-being of students, parents, and staff. It enables users to access mental health resources, participate in surveys, register for targeted support programs, book counseling appointments, and track their mental health journey through dashboards and reports.

### Key Features

- **Homepage**: Introduction to the school, mental health resources, and a blog for sharing experiences.
- **User Registration**: Allows students and parents to create accounts.
- **Survey Management**: Admins can create periodic or ad-hoc surveys to monitor students' mental health.
- **Self-Assessment**: Users can take standardized mental health assessments (e.g., GAD-7, PHQ-9) to evaluate various psychological indices (cognitive, social, emotional, physical, etc.). Historical data is visualized in dashboards for analysis and support.
- **Targeted Support Programs**: Users can register for specific support programs (e.g., insomnia for cognitive health, happiness at school for emotional health).
- **Counseling Appointments**: Users can book appointments with mental health professionals.
- **Participation Management**: Track students' involvement in support programs and counseling sessions.
- **User Profile & History**: Manage user profiles, participation history, and appointment records.
- **Dashboard & Reporting**: Visualize and report on mental health data for analysis and decision-making.

---

## Technology Stack

- **.NET 8** (ASP.NET Core Web API)
- **Entity Framework Core** (Code-First, Migrations)
- **SQL Server** (default, configurable via `appsettings.json`)
- **Three-Layer Architecture**:
  - **Presentation Layer**: API Controllers
  - **Business Logic Layer (BLL)**: Services, DTOs
  - **Data Access Layer (DAL)**: Repositories, Unit of Work, Entities
- **JWT Authentication**
- **Swagger** (for API documentation)
- **Other**: Dependency Injection, Logging, Model Validation

---

## Setup Instructions

### 1. Clone the Repository
```
git clone https://github.com/xbensieve/psycho-edu-system.git
```
### 2. Configure the Database
Update the connection string in `appsettings.json` if needed:
  ```
  "ConnectionStrings": { "DefaultConnection": "Server=localhost;Database=PsyTable;User Id=sa;Password=12345;TrustServerCertificate=True" }
  ```
### 3. Apply Migrations (Code-First)
Open a terminal in the project root and run:
  ```
  dotnet tool install --global dotnet-ef dotnet ef database update --project DAL --startup-project PsychoEduSystem
  ```
> This will create the database and all required tables using the latest migrations.

### 4. Build and Run the Application
```
dotnet build dotnet run --project PsychoEduSystem
```
- The API will be available at `https://localhost:7192` (or as configured).

### 5. API Documentation

- Navigate to `/swagger` for interactive API documentation and testing.

---

## Project Structure

- **DAL**: Data Access Layer (Entities, Repositories, Unit of Work)
- **BLL**: Business Logic Layer (Services, DTOs, Utilities)
- **PsychoEduSystem**: Presentation Layer (API Controllers, Startup, Configuration)

---
# Psycho-Edu System Frontend

## Features

- **User Roles**: Supports multiple user roles such as Students, Parents, Teachers, Psychologists, and Admins.
- **Scheduling**: Allows users to book, view, and manage appointments.
- **Chat**: Real-time chat functionality using SignalR.
- **Surveys**: Administer and manage surveys for students and parents.
- **Blogs**: Blog management for sharing mental health and educational resources.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## Tech Stack

- **React**: Frontend library for building user interfaces.
- **Vite**: Fast build tool for modern web projects.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Axios**: HTTP client for API communication.
- **SignalR**: Real-time communication for chat functionality.
- **Framer Motion**: Animations and transitions.
- **Date-FNS & Moment.js**: Date manipulation libraries.
- **SweetAlert2**: Beautiful alerts and modals.

## Project Structure
![image](https://github.com/user-attachments/assets/029a8344-068d-492d-9cc8-b58160a82e4e)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/xbensieve/psycho-edu-system.git
   cd psycho-edu-system-frontend
2. Install dependencies:
   ```bash
   npm install
3. Start the development server:
   ```bash
   npm run dev
4. Open the application in your browser at http://localhost:5173

## Requirements & Use Cases

This project aims to:

- Provide a platform for school-based mental health support.
- Allow users (students, parents) to register and manage their profiles.
- Enable periodic and ad-hoc mental health surveys for students.
- Support self-assessment using standardized tools (GAD-7, PHQ-9, etc.).
- Visualize mental health indices and trends via dashboards.
- Allow registration for targeted support programs.
- Enable booking and management of counseling appointments.
- Track participation in support programs and counseling.
- Manage user profiles, participation, and appointment history.
- Provide dashboards and reports for analysis and decision-making.

---

## Contribution

Contributions are welcome! Please fork the repository and submit a pull request.

---

## License

This project is licensed under the MIT License.

Live Demo: [Google Drive](https://drive.google.com/drive/folders/1z3ptTLDeVpksef3EHMlCc2_v5BIL9xCJ?usp=sharing)
