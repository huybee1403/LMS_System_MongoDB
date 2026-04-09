import { Routes, Route } from "react-router-dom";

import Login from "../pages/authentication/login/Login";
import Register from "../pages/authentication/register/Register";
import ForgotPass from "../pages/authentication/forgot-pass/ForgotPass";
import ResetPass from "../pages/authentication/reset-pass/ResetPass";
import CompleteProfile from "../pages/authentication/complete-profile/CompleteProfile";

import ListUser from "../pages/admin/list-user/ListUser";
import ListCourses from "../pages/admin/list-course/ListCourse";
import ListCalender from "../pages/admin/list-calender/ListCalender";
import ListStudent from "../pages/admin/list-student/ListStudent";
import ListTeacher from "../pages/admin/list-teacher/ListTeacher";
import ListSalary from "../pages/admin/list-salary/ListSalary";
import ClassDetail from "../pages/admin/class-detail/ClassDetail";
import AccountDetail from "../pages/user/account-detail/AccountDetail";
import MySalary from "../pages/teacher/MySalary";
import SettingPage from "../pages/admin/setting/SettingPage";

import NotFound from "../components/global/404/NotFound";

import { ProtectedRoute, GuestRoute, RoleRoute, IncompleteProfileRoute, ResetPasswordGuard } from "../utils/RouteGuard";
import HomePage from "../pages/home/HomePage";

export default function AppRoutes() {
    return (
        <Routes>
            {/* ===== PUBLIC ===== */}
            <Route element={<GuestRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPass />} />

                <Route
                    path="/reset-password/:token"
                    element={
                        <ResetPasswordGuard>
                            <ResetPass />
                        </ResetPasswordGuard>
                    }
                />
            </Route>

            {/* ===== COMPLETE PROFILE ===== */}
            <Route
                path="/complete-profile"
                element={
                    <IncompleteProfileRoute>
                        <CompleteProfile />
                    </IncompleteProfileRoute>
                }
            />

            {/* ===== MAIN LAYOUT (GIỐNG CODE 2) ===== */}
            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<HomePage />}>
                    {/* ADMIN */}
                    <Route element={<RoleRoute allowedRoles={["admin"]} />}>
                        <Route index element={<ListUser />} />
                        <Route path="list-user" element={<ListUser />} />
                        <Route path="list-student" element={<ListStudent />} />
                        <Route path="list-teacher" element={<ListTeacher />} />
                        <Route path="list-salary" element={<ListSalary />} />
                        <Route path="setting" element={<SettingPage />} />
                    </Route>

                    {/* TEACHER */}
                    <Route element={<RoleRoute allowedRoles={["teacher"]} />}>
                        <Route path="my-salary" element={<MySalary />} />
                    </Route>

                    {/* ALL ROLES */}
                    <Route element={<RoleRoute allowedRoles={["admin", "teacher", "student"]} />}>
                        <Route path="list-courses" element={<ListCourses />} />
                        <Route path="list-calender" element={<ListCalender />} />
                        <Route path="class-detail/:id" element={<ClassDetail />} />
                        <Route path="account-detail" element={<AccountDetail />} />
                    </Route>
                </Route>
            </Route>

            {/* 404 */}
            <Route path="/404" element={<NotFound />} />
        </Routes>
    );
}
