/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect, useContext } from "react";
import { GoogleLogin } from "@react-oauth/google";
import AuthContext from "../../context/auth/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2"; // Giữ nguyên Swal gốc vì đã dùng trực tiếp
import { showSuccess, showError } from "../../utils/swalConfig"; // Thêm Swal config cho các thông báo khác
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const globalStyles = `
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    min-height: 100vh;
    overflow-x: hidden;
    box-sizing: border-box;
  }
  *, *:before, *:after {
    box-sizing: inherit;
  }
`;

const LoginModal = () => {
  const { isAuthenticated, user, login, logout, loginGoogle } =
    useContext(AuthContext) || {};
  const role = user?.role || "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginModal, setIsLoginModal] = useState(false);
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const navigate = useNavigate();
  const modalRef = useRef(null);

  const handleOutsideClick = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setIsLoginModal(false);
    }
  };

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = globalStyles;
    document.head.appendChild(styleSheet);

    if (isLoginModal) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.body.style.overflow = "hidden";
      document.body.style.margin = "0";
      document.body.style.padding = "0";
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.body.style.overflow = "auto";
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.body.style.overflow = "auto";
      document.body.style.margin = "";
      document.body.style.padding = "";
      document.head.removeChild(styleSheet);
    };
  }, [isLoginModal]);

  const handleGoogleSuccess = async (response) => {
    try {
      const role = await loginGoogle(response.credential);
      if (role === "Student") navigate("/student");
      setIsLoginModal(false);
      showSuccess("Logged In", "Logged in successfully with Google!");
    } catch (error) {
      showError("Error", error.message || "Google login failed");
    }
  };

  const handleGoogleError = () => showError("Error", "Google login failed");

  const handleOpenMenu = () => setIsOpenMenu(!isOpenMenu);

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out from your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "#FF6F61",
      cancelButtonColor: "#26A69A",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        showSuccess("Logged Out", "You have successfully logged out.");
        navigate("/");
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const role = await login(email, password);
      switch (role) {
        case "Admin":
          navigate("/admin");
          break;
        case "Student":
          navigate("/student");
          break;
        case "Parent":
          navigate("/parent");
          break;
        case "Teacher":
          navigate("/teacher");
          break;
        case "Psychologist":
          navigate("/psychologist");
          break;
        default:
          showError("Error", "Invalid role detected!");
          return;
      }
      setIsLoginModal(false);
      showSuccess("Logged In", "Logged in successfully!");
    } catch (error) {
      showError("Error", error.message || "Login failed");
    }
  };

  return (
    <>
      {isAuthenticated === false ? (
        <a
          className="flex items-center py-2 px-3 text-sm font-semibold text-[#FFFFFF] bg-[#26A69A] hover:text-[#FBBF24] hover:bg-[#4DB6AC] transition-all duration-300 no-underline rounded-md"
          onClick={() => setIsLoginModal(true)}
        >
          <FontAwesomeIcon icon={faUser} className="mr-2" />
          Sign In
        </a>
      ) : (
        <div className="relative cursor-pointer">
          <div
            onClick={handleOpenMenu}
            className="flex items-center py-2 px-3 text-sm font-semibold text-[#FFFFFF] bg-[#26A69A] hover:text-[#FBBF24] hover:bg-[#4DB6AC] rounded-md transition-all duration-300 no-underline"
          >
            <FontAwesomeIcon icon={faUser} className="mr-2" />
            <span>User</span>
          </div>
          {isOpenMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-md border border-[#E5E7EB] text-left"
            >
              <ul className="py-1 px-1 text-sm font-medium text-[#26A69A]">
                <li>
                  <a
                    href={role}
                    className="block px-4 py-2 hover:bg-[#F9E79F] hover:text-[#FBBF24] transition-all duration-300 no-underline"
                  >
                    Portal
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="block px-4 py-1 hover:bg-[#F9E79F] hover:text-[#FF6F61] transition-all duration-300 no-underline"
                    onClick={handleLogout}
                  >
                    Sign out
                  </a>
                </li>
              </ul>
            </motion.div>
          )}
        </div>
      )}

      {isLoginModal && (
        <div
          className="fixed top-0 left-0 w-screen h-screen z-50 flex items-center justify-center"
          style={{ margin: 0, padding: 0 }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-screen h-screen bg-black"
            style={{ margin: 0, padding: 0 }}
          />
          <div
            className="relative p-6 w-full max-w-md bg-white rounded-lg shadow-md border border-[#E5E7EB] z-60"
            ref={modalRef}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#26A69A]">Sign In</h3>
              <button
                type="button"
                className="text-gray-500 hover:text-[#26A69A] hover:bg-[#F9E79F] rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-[#26A69A] transition-all duration-300"
                onClick={() => setIsLoginModal(false)}
              >
                <svg
                  className="w-4 h-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <input
                  type="text"
                  className="w-full p-3 bg-[#F7FAFC] text-gray-700 text-sm rounded-lg border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#26A69A] transition-all duration-300 shadow-sm"
                  placeholder="Username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="Password"
                  className="w-full p-3 bg-[#F7FAFC] text-gray-700 text-sm rounded-lg border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#26A69A] transition-all duration-300 shadow-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#26A69A] text-white py-3 rounded-lg hover:bg-[#4DB6AC] focus:outline-none focus:ring-2 focus:ring-[#26A69A] shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                Login
              </button>
            </form>
            <div className="mt-6 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                size="large"
                theme="outline"
                text="signin_with"
                shape="pill"
                className="py-3 px-4 bg-white text-[#26A69A] font-semibold border border-[#26A69A] rounded-full hover:bg-[#F9E79F] hover:shadow-md hover:scale-105 transition-all duration-300"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginModal;
