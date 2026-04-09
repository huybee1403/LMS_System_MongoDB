import React, { useState } from "react";
import Sidebar from "../../components/global/sidebar/Sidebar";
import Header from "../../components/global/header/Header";
import "./HomePage.css";
import { Outlet } from "react-router-dom";

const HomePage = () => {
    const [sidebarActive, setSidebarActive] = useState(false);

    const activeSidebar = () => {
        setSidebarActive(true);
    };
    const removeActiveSidebar = () => {
        setSidebarActive(false);
    };

    return (
        <div className="layout">
            <Sidebar active={sidebarActive} offSidebar={removeActiveSidebar}></Sidebar>
            <div className="layout_content">
                <Header onSidebar={activeSidebar}></Header>
                <Outlet />
            </div>
        </div>
    );
};

export default HomePage;
