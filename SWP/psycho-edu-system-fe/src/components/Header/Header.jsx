import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Fade,
  ListItemIcon,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import MailIcon from "@mui/icons-material/Mail";
import PersonIcon from "@mui/icons-material/Person";
import Swal from "sweetalert2";
import AuthContext from "../../context/auth/AuthContext";
import LogoHeader from "../../assets/logo-header.png";
import DecodeJWT from "../../utils/decodeJwt";

const Header = () => {
  const { logout } = useContext(AuthContext) || {};
  const [anchorEl, setAnchorEl] = useState(null);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out from your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "#FF6F61", // Coral
      cancelButtonColor: "#26A69A", // Teal
      reverseButtons: false,
      focusCancel: true,
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        Swal.fire({
          title: "Logged Out",
          text: "You have successfully logged out.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          willClose: () => navigate("/"),
        });
      }
    });
    handleMenuClose();
  };

  useEffect(() => {
    const token = localStorage.getItem("user");
    if (token) {
      try {
        const formattedToken = JSON.parse(token);
        const accessToken = formattedToken?.accessToken;
        if (accessToken && typeof accessToken === "string") {
          const userData = DecodeJWT(accessToken);
          if (userData) {
            setProfile(userData);
          }
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  const avatarMap = {
    Admin: "https://cdn-icons-png.flaticon.com/512/2922/2922510.png",
    Student: "https://cdn-icons-png.flaticon.com/512/2922/2922520.png",
    Teacher: "https://cdn-icons-png.flaticon.com/512/2922/2922565.png",
    Psychologist: "https://cdn-icons-png.flaticon.com/512/2922/2922570.png",
    Parent: "https://cdn-icons-png.flaticon.com/512/2922/2922580.png",
  };

  const getAvatar = (role) =>
    avatarMap[role] ||
    "https://cdn-icons-png.flaticon.com/512/2922/2922510.png";

  if (!profile) {
    return <div className="text-center text-gray-500 py-4">Loading...</div>;
  }

  return (
    <AppBar position="sticky" className="bg-white ">
      <Toolbar className="flex justify-between py-2">
        <Box className="flex items-center">
          <img src={LogoHeader} alt="Logo" className="w-32 h-auto" />
        </Box>
        <Box className="flex items-center">
          <IconButton
            onClick={handleMenuOpen}
            className="flex items-center text-teal-600 hover:bg-transparent"
          >
            <Avatar
              src={getAvatar(profile.role)}
              alt="Profile"
              className="w-11 h-11 border-2 border-yellow-300 bg-gray-200 transition-transform transform hover:scale-105 "
            />
            <Typography className="ml-2 font-medium text-lg text-teal-600">
              {profile && profile.fullName
                ? profile.fullName
                : profile?.Username || "User"}
            </Typography>
            <ArrowDropDownIcon className="text-yellow-400" />
          </IconButton>
        </Box>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          // TransitionComponent={Fade}
          className="mt-1"
          PaperProps={{
            elevation: 0,
            className:
              "rounded-lg min-w-[250px] shadow-md bg-white p-1 border border-gray-300",
          }}
        >
          <Box className="flex items-center px-4 py-2">
            <Avatar
              src={getAvatar(profile.role)}
              className="w-12 h-12 border-2 border-yellow-300 bg-gray-200 mr-2"
            />
            <Box>
              <Typography
                variant="subtitle1"
                className="font-semibold text-teal-600"
              >
                {profile.fullName || profile.Username || "User"}
              </Typography>
              <Typography
                variant="body2"
                className="text-gray-600 flex items-center"
              >
                <MailIcon className="mr-1 text-yellow-400" />
                {profile.Email}
              </Typography>
            </Box>
          </Box>
          <Divider className="my-2 border-gray-300" />
          <MenuItem
            component={Link}
            to="/profile"
            onClick={handleMenuClose}
            className="text-teal-600 hover:bg-yellow-300 hover:text-teal-600 text-sm py-2"
          >
            <ListItemIcon>
              <PersonIcon className="text-yellow-400" />
            </ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem
            component={Link}
            to="/"
            onClick={handleMenuClose}
            className="text-teal-600 hover:bg-yellow-300 hover:text-teal-600 text-sm py-2"
          >
            <ListItemIcon>
              <HomeIcon className="text-yellow-400" />
            </ListItemIcon>
            Home
          </MenuItem>
          <Divider className="my-2 border-gray-300" />
          <MenuItem
            onClick={handleLogout}
            className="text-red-500 hover:bg-yellow-300 hover:text-red-400 text-sm py-2"
          >
            <ListItemIcon>
              <LogoutIcon className="text-red-500" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
