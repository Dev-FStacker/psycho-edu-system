import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faChartBar,
  faClipboardList,
  faBell,
  faCalendarPlus,
  faCalendarAlt,
  faUser,
  faFileAlt,
  faTachometerAlt,
  faBookOpen,
  faPoll,
  faUsers,
  faCalendarCheck,
  faUserPlus,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons";
import AuthContext from "../../context/auth/AuthContext";

const SideBar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useContext(AuthContext) || {};
  const navItems = getNavItems(user?.role);

  return (
    <div
      className={`bg-white transition-all duration-300 flex flex-col border-r border-gray-200 ${
        isCollapsed ? "w-20" : "w-48"
      }`}
      style={{ minHeight: "calc(100vh - 72px)" }} // Đảm bảo chiều cao tối thiểu
    >
      {/* Toggle Button */}
      <div className="p-4 flex justify-center border-b border-gray-200">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4h14v2H3V4zm0 6h14v2H3v-2zm0 6h14v2H3v-2z" />
          </svg>
        </button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 flex flex-col items-center gap-4 py-4">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className="flex flex-col items-center gap-1 text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-colors w-full no-underline"
          >
            <FontAwesomeIcon icon={item.icon} className="text-lg" />
            {!isCollapsed && (
              <span className="text-sm font-medium">{item.label}</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

const getNavItems = (role) => {
  switch (role) {
    case "Student":
      return [
        { icon: faHome, label: "Home", path: "/student" },
        { icon: faBookOpen, label: "Program", path: "/student/programs" },
        { icon: faCalendarAlt, label: "Schedules", path: "/student/schedule" },
        { icon: faCalendarCheck, label: "Booking", path: "/student/booking" },
      ];
    case "Teacher":
      return [
        { icon: faHome, label: "Home", path: "/teacher" },
        { icon: faCalendarPlus, label: "Book Slots", path: "/teacher/slot" },
        { icon: faCalendarAlt, label: "Schedule", path: "/teacher/schedule" },
      ];
    case "Psychologist":
      return [
        { icon: faHome, label: "Dashboard", path: "/psychologist" },
        { icon: faBookOpen, label: "Program", path: "/psychologist/programs" },
        { icon: faBell, label: "Schedule", path: "/psychologist/schedule" },
        { icon: faFileAlt, label: "Book Slots", path: "/psychologist/slot" },
      ];
    case "Parent":
      return [
        { icon: faHome, label: "Home", path: "/parent" },
        { icon: faBell, label: "Schedule", path: "/parent/schedule" },
        { icon: faFileAlt, label: "Booking", path: "/parent/booking" },
      ];
    case "Admin":
      return [
        { icon: faTachometerAlt, label: "Dashboard", path: "/admin" },
        { icon: faBookOpen, label: "Programs", path: "/admin/programs" },
        { icon: faPoll, label: "Surveys", path: "/admin/survey" },
        { icon: faFileAlt, label: "Blogs", path: "/admin/blog" },
        {
          icon: faUserPlus,
          label: "Create Parent",
          path: "/admin/create-parent",
        },
      ];
    default:
      return [];
  }
};

export default SideBar;
