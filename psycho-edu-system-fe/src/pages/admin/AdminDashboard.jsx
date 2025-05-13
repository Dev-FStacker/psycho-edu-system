/* eslint-disable react/prop-types */
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faCalendarCheck,
  faBullseye,
  faBookOpen,
  faChalkboardTeacher,
  faUserFriends,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import adminService from "../../api/services/adminService";

const AdminDashboard = () => {
  const [totalUsers, setTotalUsers] = useState(null);
  const [totalParents, setTotalParents] = useState(null);
  const [totalClasses, setTotalClasses] = useState(null);
  const [totalTargetPrograms, setTotalTargetPrograms] = useState(null);
  const [totalAppointments, setTotalAppointments] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const users = await adminService.getTotalUsers();
        setTotalUsers(users);

        const parents = await adminService.getTotalParents();
        setTotalParents(parents);

        const classes = await adminService.getTotalClasses();
        setTotalClasses(classes);

        const programs = await adminService.getTotalTargetPrograms();
        setTotalTargetPrograms(programs);

        const appointments = await adminService.getTotalAppointments();
        setTotalAppointments(appointments);

        setUpcomingAppointments(await adminService.getUpcomingAppointments());
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError("Failed to fetch data from the API");
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-8 bg-white min-h-screen text-gray-900">
      {/* Error Display */}
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {/* Overview Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DashboardCard
          icon={faUsers}
          title="Total Users"
          count={totalUsers !== null ? totalUsers : "Loading..."}
          color="blue-500"
        />
        <DashboardCard
          icon={faCalendarCheck}
          title="Appointments"
          count={totalAppointments !== null ? totalAppointments : "Loading..."}
          color="green-500"
        />
        <DashboardCard
          icon={faBullseye}
          title="Target Programs"
          count={
            totalTargetPrograms !== null ? totalTargetPrograms : "Loading..."
          }
          color="purple-500"
        />
        <DashboardCard
          icon={faChalkboardTeacher}
          title="Classrooms"
          count={totalClasses !== null ? totalClasses : "Loading..."}
          color="teal-500"
        />
        <DashboardCard
          icon={faUserFriends}
          title="Parents"
          count={totalParents !== null ? totalParents : "Loading..."}
          color="red-500"
        />
      </section>

      {/* Detailed Sections */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <DashboardSection title="Upcoming Appointments">
          {upcomingAppointments.length > 0 ? (
            <ul className="space-y-4">
              {upcomingAppointments.map((appt) => (
                <li
                  key={appt.appointmentId}
                  className="flex justify-between text-gray-700 border-b pb-2 border-gray-300"
                >
                  <span>📅 {appt.date}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 text-center">
              No upcoming appointments
            </p>
          )}
        </DashboardSection>
      </section>
    </div>
  );
};

// Simplified Card Component
const DashboardCard = ({ icon, title, count, color }) => (
  <div className="p-6 bg-white rounded-xl shadow-md transition-all duration-300 hover:scale-105">
    <div className="flex items-center">
      <FontAwesomeIcon icon={icon} className={`text-${color} w-14 h-14`} />
      <div className="ml-4">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-gray-700 text-lg">{count}</p>
      </div>
    </div>
  </div>
);

// Simplified Section Component
const DashboardSection = ({ title, children }) => (
  <div className="p-6 bg-white rounded-xl shadow-md transition-all duration-300 hover:scale-105">
    <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
    {children}
  </div>
);

export default AdminDashboard;
