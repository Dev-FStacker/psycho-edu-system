import { useState } from "react";
import LoginModal from "../Modal/LoginModal";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faInfoCircle,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const clientId =
    "1018910450198-m8sitc37vcjdg1qbe7d3cp00nca00840.apps.googleusercontent.com";

  const links = [
    { href: "", title: "About", icon: faInfoCircle },
    { href: "", title: "Home", icon: faHome },
    { href: "", title: "Contact", icon: faEnvelope },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const isActive = (href) => window.location.pathname === href;

  return (
    <header className="sticky top-0 z-50 shadow-md">
      <nav className="bg-[#26A69A] px-4 lg:px-6 py-2">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <a
            href="/"
            className="flex items-center group transition-transform duration-300 hover:scale-105 no-underline"
            aria-label="Mental Health Care Homepage"
          >
            <span className="text-2xl text-white font-semibold">
              Mental Health Care©
            </span>
          </a>
          <div
            className={`${
              isMenuOpen ? "block" : "hidden"
            } w-full lg:flex lg:w-auto lg:order-1 transition-all duration-300`}
          >
            <ul className="flex flex-col items-center lg:flex-row lg:space-x-8 w-full mt-2 lg:mt-0">
              {links.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className={`flex items-center px-3 py-2 text-sm font-semibold text-white hover:text-[#FBBF24] hover:bg-[#F9E79F] lg:hover:bg-transparent transition-all duration-300 rounded-md no-underline ${
                      isActive(link.href) ? "bg-[#F9E79F] text-[#26A69A]" : ""
                    }`}
                  >
                    <FontAwesomeIcon icon={link.icon} className="mr-2" />
                    <span>{link.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center space-x-4 lg:order-2">
            <GoogleOAuthProvider clientId={clientId}>
              <LoginModal />
            </GoogleOAuthProvider>
            <button
              onClick={toggleMenu}
              type="button"
              className="lg:hidden text-white p-1.5 focus:outline-none focus:ring-2 focus:ring-[#FBBF24] rounded-md"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`w-5 h-5 ${isMenuOpen ? "hidden" : "block"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <svg
                className={`w-5 h-5 ${isMenuOpen ? "block" : "hidden"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
