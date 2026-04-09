import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { removeToken, setToken } from "../../services/auth/token";

import { loginUser, registerUser, requestPasswordReset, resetPassword, updateProfile, logoutUser, heartbeatUser } from "../../services/apis/api";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    /* ================= INIT ================= */
    useEffect(() => {
        const initAuth = () => {
            let storedUser = null;

            try {
                storedUser = JSON.parse(localStorage.getItem("user"));
            } catch {
                storedUser = null;
            }

            if (storedUser) {
                setUser(storedUser);
            }

            setLoading(false);
        };

        initAuth();
    }, []);

    /* ================= SYNC USER ================= */
    useEffect(() => {
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        }
    }, [user]);

    /* ================= HEARTBEAT ================= */
    useEffect(() => {
        if (!user?.id) return;

        const interval = setInterval(() => {
            heartbeatUser(user.id).catch(() => null);
        }, 60000);

        return () => clearInterval(interval);
    }, [user?.id]);

    /* ================= HANDLE ACTION ================= */
    const handleAction = async (actionFn, values, { onSuccess, onError, onFinally } = {}) => {
        setLoading(true);
        try {
            const result = await actionFn(values);
            if (onSuccess) onSuccess(result);
            return result;
        } catch (err) {
            const msg = err?.response?.data?.message || "Something went wrong";
            toast.error(msg);
            if (onError) onError(err);
        } finally {
            setLoading(false);
            if (onFinally) onFinally();
        }
    };

    /* ================= LOGIN ================= */
    const handleLogin = (values, callbacks = {}) =>
        handleAction(
            async () => {
                const response = await loginUser(values);

                const accessToken = response.data?.accessToken;
                const userData = response.data?.user;

                if (accessToken) {
                    setToken(accessToken);
                }

                setUser(userData);
                localStorage.setItem("user", JSON.stringify(userData));

                toast.success(response.message || "Đăng nhập thành công");

                return response;
            },
            values,
            callbacks,
        );

    /* ================= REGISTER ================= */
    const handleRegister = (values, callbacks = {}) =>
        handleAction(
            async () => {
                const res = await registerUser(values);

                toast.success(res.message || "Đăng ký thành công, vui lòng đăng nhập");

                return res;
            },
            values,
            callbacks,
        );

    /* ================= LOGOUT ================= */
    const handleLogout = async (callbacks = {}) => {
        const { onSuccess, onError, onFinally } = callbacks;

        try {
            await logoutUser();

            removeToken();

            setUser(null);

            toast.success("Đăng xuất thành công");

            if (onSuccess) onSuccess();

            setTimeout(() => navigate("/login"), 500);
        } catch (err) {
            toast.error("Logout failed");
            if (onError) onError(err);
        } finally {
            setLoading(false);
            if (onFinally) onFinally();
        }
    };

    /* ================= COMPLETE PROFILE ================= */
    const handleCompleteProfile = (values, callbacks = {}) =>
        handleAction(
            async () => {
                const res = await updateProfile(values);

                setUser((prev) => ({
                    ...prev,
                    ...res.data.user,
                }));

                toast.success(res.message || "Cập nhật hồ sơ thành công");

                return res;
            },
            values,
            callbacks,
        );

    /* ================= REQUEST RESET PASSWORD ================= */
    const handleRequestReset = (values, callbacks = {}) =>
        handleAction(
            async () => {
                const res = await requestPasswordReset(values);

                toast.success(res.message || "Vui lòng kiểm tra email");

                return res;
            },
            values,
            callbacks,
        );

    /* ================= RESET PASSWORD ================= */
    const handleResetPassword = (data, callbacks = {}) =>
        handleAction(
            async () => {
                const res = await resetPassword(data);

                toast.success(res.message || "Đổi mật khẩu thành công");

                return res;
            },
            data,
            callbacks,
        );

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                loading,

                handleLogin,
                handleRegister,
                handleLogout,
                handleCompleteProfile,
                handleRequestReset,
                handleResetPassword,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };
