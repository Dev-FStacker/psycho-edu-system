import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/auth/AuthContext";
import ProtectedRoute from "./context/auth/ProtectedRoute";
import "./App.css";
import HomePage from "./pages/main/HomePage";
import MainLayout from "./components/Layouts/MainLayout";
import NotFoundPage from "./pages/error/NotFoundPage";
import PortalLayout from "./components/Layouts/PortalLayout";
import Dashboard from "./pages/student/Dashboard";
import StartUpPage from "./pages/student/StartUpPage";
import SurveyPage from "./pages/student/SurveyPage";
import SurveyResultPage from "./pages/student/SurveyResultPage";
import BookingPage from "./pages/booking/BookingPage";
import SchedulePage from "./pages/student/SchedulePage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import SurveyList from "./pages/admin/survey/SurveyList";
import SurveyDetail from "./pages/admin/survey/SurveyDetail";
import RequireSurvey from "./components/Survey/RequireSurvey";
import ParentDashboard from "./pages/parent/Dashboard";
import ParentSurveyPage from "./pages/parent/SurveyPage";
import TeacherDashboard from "./pages/teacher/Dashboard";
import ClassDetails from "./pages/teacher/ClassDetails";
import SurveyResult from "./pages/survey/SurveyResult";
import ParentSchedulePage from "./pages/parent/ParentSchedulePage";
import { BookingProvider } from "./context/BookingContext";
import PsychologistDashboard from "./pages/couselor/PsychologistDashboard";
import PsychologistSchedulePage from "./pages/couselor/PsychologistSchedulePage";
import PsychologistScheduleRegistration from "./pages/couselor/PsychologistScheduleRegistration";
import TeacherScheduleRegistration from "./pages/teacher/TeacherScheduleRegistration";
import TeacherSchedulePage from "./pages/teacher/TeacherSchedulePage";
import Chat from "./pages/chat/Chat";
import TargetPrograms from "./pages/admin/TargetPrograms";
import CreateUserPage from "./pages/admin/CreateUserPage";
import AttendancePage from "./pages/counselor/AttendancePage";
import UserProfilePage from "./pages/UserProfilePage";
import BlogDetailPage from "./pages/BlogDetailPage";
import BlogManagementPage from "./pages/admin/BlogManagementPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="blog/:id" element={<BlogDetailPage />} />
          </Route>

          {/* Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={["Student"]} />}>
            <Route path="student/start-up-survey" element={<StartUpPage />} />
            <Route path="student/survey-for-student" element={<SurveyPage />} />
            <Route element={<RequireSurvey />}>
              <Route path="student/" element={<PortalLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="programs" element={<TargetPrograms />} />
                <Route path="booking" element={<BookingPage />} />
                <Route path="schedule" element={<SchedulePage />} />
              </Route>
            </Route>
          </Route>
          <Route path="survey-result" element={<SurveyResultPage />} />

          {/* Parent Routes */}
          <Route element={<ProtectedRoute allowedRoles={["Parent"]} />}>
            <Route path="parent/" element={<PortalLayout />}>
              <Route index element={<ParentDashboard />} />
              <Route
                path="schedule"
                element={
                  <BookingProvider>
                    <ParentSchedulePage />
                  </BookingProvider>
                }
              />
              <Route path="booking" element={<BookingPage />} />
            </Route>
          </Route>
          <Route path="survey/:childId" element={<ParentSurveyPage />} />

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
            <Route path="admin/" element={<PortalLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="survey" element={<SurveyList />} />
              <Route path="survey/:id" element={<SurveyDetail />} />
              <Route path="programs" element={<TargetPrograms />} />
              <Route path="create-parent" element={<CreateUserPage />} />
              <Route path="blog" element={<BlogManagementPage />} />
            </Route>
          </Route>
          <Route
            path="overall-survey-result/:studentId"
            element={<SurveyResult />}
          />

          {/* Psychologist Routes */}
          <Route element={<ProtectedRoute allowedRoles={["Psychologist"]} />}>
            <Route path="/psychologist/" element={<PortalLayout />}>
              <Route index element={<PsychologistDashboard />} />
              <Route path="schedule" element={<PsychologistSchedulePage />} />
              <Route path="programs" element={<TargetPrograms />} />
              <Route
                path="slot"
                element={<PsychologistScheduleRegistration />}
              />
              <Route
                path="attendance/:programId"
                element={<AttendancePage />}
              />
            </Route>
          </Route>

          {/* Teacher Routes */}
          <Route element={<ProtectedRoute allowedRoles={["Teacher"]} />}>
            <Route path="teacher/" element={<PortalLayout />}>
              <Route index element={<TeacherDashboard />} />
              <Route path="class/:classId" element={<ClassDetails />} />
              <Route path="slot" element={<TeacherScheduleRegistration />} />
              <Route path="schedule" element={<TeacherSchedulePage />} />
            </Route>
          </Route>

          {/* Profile Route - Accessible by all authenticated users */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={[
                  "Student",
                  "Parent",
                  "Teacher",
                  "Psychologist",
                  "Admin",
                ]}
              />
            }
          >
            <Route path="/profile" element={<PortalLayout />}>
              <Route index element={<UserProfilePage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
          <Route path="chat/:id" element={<Chat />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

export const getAuthDataFromLocalStorage = () => {
  const userData = localStorage.getItem("user");
  if (!userData) return null;

  try {
    const parsedData = JSON.parse(userData);
    const tokenPayload = JSON.parse(atob(parsedData.accessToken.split(".")[1]));
    return {
      accessToken: parsedData.accessToken,
      role: parsedData.role,
      userId: tokenPayload.userId,
      email: tokenPayload.email,
      username: tokenPayload.username,
    };
  } catch (error) {
    console.error("Error parsing auth data:", error);
    return null;
  }
};
