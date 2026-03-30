import { Routes, Route } from "react-router-dom";
import Login from "../pages/authentication/login/Login";
import Register from "../pages/authentication/register/Register";
import ForgotPass from "../pages/authentication/forgot-pass/ForgotPass";
import ResetPass from "../pages/authentication/reset-pass/ResetPass";
import CompleteProfile from "../pages/authentication/complete-profile/CompleteProfile";
// import HomePage from "../pages/home/HomePage";
// import NotFound from "../components/global/404/NotFound";

import { ProtectedRoute, GuestRoute, ResetPasswordGuard } from "../utils/RouteGuard";
export default function AppRoutes() {
    return (
        <Routes>
            {/* ================= Guest routes ================= */}
            {/* <Route element={<GuestRoute />}> */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPass />} />
            <Route path="/reset-password" element={<ResetPass />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            {/*<Route
                    path="/reset-password"
                    element={
                        <ResetPasswordGuard>
                            <ResetPass />
                        </ResetPasswordGuard>
                    }
                />
                <Route path="/token-expired" element={<TokenExpired />} /> */}
            {/* </Route> */}

            {/* ================= Protected routes ================= */}
            {/* <Route element={<ProtectedRoute />}> */}
            {/* Complete profile */}
            {/* <Route
                    path="/complete-profile"
                    element={
                        <CompleteProfileGuard>
                            <CompleteProfile />
                        </CompleteProfileGuard>
                    }
                /> */}

            {/* Home page */}
            {/* <Route
                    path="/"
                    element={
                        <IncompleteProfileRoute>
                            <Home />
                        </IncompleteProfileRoute>
                    }
                /> */}

            {/* Role-based pages */}
            {/* <Route path="/list-user" element={<AdminDashboard />} />
                <Route path="/list-courses" element={<TeacherCourses />} />
                <Route path="/list-calender" element={<StudentCalendar />} />
            </Route> */}

            {/* Fallback */}
            <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
    );
}
