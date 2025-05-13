/* eslint-disable no-unused-vars */
import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../Header/Header";
import SideBar from "../Navigation/SideBar";
import Breadcrumbs from "../Breadcrumbs ";

const PortalLayout = () => {
  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col font-sans text-sm">
      <div className="w-full bg-white sticky top-0 z-20 flex items-center">
        <Header />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <SideBar />
        <div className="flex-1 flex flex-col bg-gray-50 overflow-auto">
          <div className="bg-white p-4 border-b border-gray-200">
            <Breadcrumbs />
          </div>
          <div className="flex-1 p-6 overflow-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalLayout;
