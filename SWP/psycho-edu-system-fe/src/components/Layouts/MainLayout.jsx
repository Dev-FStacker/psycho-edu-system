import { Outlet } from "react-router-dom";
import Navbar from "../Navigation/NavBar";

const MainLayout = () => {
  return (
    <>  
      <Navbar />
      <Outlet />
    </>
  );
};

export default MainLayout;
