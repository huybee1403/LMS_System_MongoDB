// RouteGuard.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/authentication/AuthContext";
import * as jwtDecode from "jwt-decode";

/* ================= ProtectedRoute ================= */
export const ProtectedRoute = () => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

/* ================= GuestRoute ================= */
export const GuestRoute = () => {
    const { user } = useAuth();

    if (user && user.isProfileComplete) {
        switch (user.type) {
            case "admin":
                return <Navigate to="/list-user" replace />;
            case "teacher":
                return <Navigate to="/list-courses" replace />;
            case "student":
                return <Navigate to="/list-calender" replace />;
            default:
                return <Navigate to="/404" replace />;
        }
    }

    return <Outlet />;
};

/* ================= IncompleteProfileRoute ================= */
export const IncompleteProfileRoute = ({ children }) => {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;

    if (!user.isProfileComplete) {
        return <Navigate to="/complete-profile" replace />;
    }

    return children;
};

/* ================= CompleteProfileGuard ================= */
export const CompleteProfileGuard = ({ children }) => {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;

    if (user.isProfileComplete) {
        switch (user.type) {
            case "admin":
                return <Navigate to="/list-user" replace />;
            case "teacher":
                return <Navigate to="/list-courses" replace />;
            case "student":
                return <Navigate to="/list-calender" replace />;
            default:
                return <Navigate to="/404" replace />;
        }
    }

    return children;
};

/* ================= ResetPasswordGuard ================= */
export const ResetPasswordGuard = ({ children }) => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) return <Navigate to="/404" replace />;

    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
            // token hết hạn → redirect đến page token-expired hoặc yêu cầu reset lại
            return <Navigate to="/token-expired" replace />;
        }
    } catch (err) {
        return <Navigate to="/404" replace />;
    }

    return children;
};
