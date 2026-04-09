import React from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import { useAuth } from "../contexts/authentication/AuthContext";
import { jwtDecode } from "jwt-decode";

/* ================= ROLE MAP ================= */
const ROLE_REDIRECT = {
    admin: "/list-user",
    teacher: "/list-courses",
    student: "/list-calender",
};

/* ================= ProtectedRoute ================= */
export const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) return null; // hoặc spinner

    if (!user) return <Navigate to="/login" replace />;

    if (!user.is_complete_profile) {
        return <Navigate to="/complete-profile" replace />;
    }

    return <Outlet />;
};

/* ================= GuestRoute ================= */
export const GuestRoute = () => {
    const { user, loading } = useAuth();

    if (loading) return null;

    if (user) {
        if (!user.is_complete_profile) {
            return <Navigate to="/complete-profile" replace />;
        }

        return <Navigate to={ROLE_REDIRECT[user.type] || "/404"} replace />;
    }

    return <Outlet />;
};

/* ================= RoleRoute ================= */
export const RoleRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) return null;

    if (!user) return <Navigate to="/login" replace />;

    if (!user.is_complete_profile) {
        return <Navigate to="/complete-profile" replace />;
    }

    const role = user?.type || user?.user_type;

    if (!allowedRoles.includes(role)) {
        return <Navigate to="/404" replace />;
    }

    return <Outlet />;
};

/* ================= IncompleteProfileRoute ================= */
export const IncompleteProfileRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return null;

    if (!user) return <Navigate to="/login" replace />;

    if (user.is_complete_profile) {
        return <Navigate to={ROLE_REDIRECT[user.type] || "/404"} replace />;
    }

    return children;
};

/* ================= ResetPasswordGuard ================= */
export const ResetPasswordGuard = ({ children }) => {
    const { token } = useParams(); // ✅ lấy từ URL

    if (!token) return <Navigate to="/404" replace />;

    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
            return <Navigate to="/404" replace />;
        }
    } catch {
        return <Navigate to="/404" replace />;
    }

    return children;
};
