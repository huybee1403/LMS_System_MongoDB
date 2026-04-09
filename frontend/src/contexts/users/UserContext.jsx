import { createContext, useContext, useState, useCallback } from "react";
import { getAllUser, updateAccount, updateAccountDetail, getAllUserByRole, deleteAccount } from "../../services/apis/api";
import { toast } from "react-toastify";
import { useAuth } from "../authentication/AuthContext";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { setUser } = useAuth();

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAllUser();
            setUsers(data);
        } catch (err) {
            console.error("Fetch users failed:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUsersByRole = async (role) => {
        try {
            setLoading(true);
            const data = await getAllUserByRole(role);
            setUsers(data);
        } catch (err) {
            console.error("Fetch users by role failed:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAccount = async (values, callback) => {
        try {
            setLoading(true);
            const response = await updateAccount(values);
            await fetchUsers();
            toast.success(response?.message || "Cập nhật tài khoản thành công!");
            callback?.();
        } catch (err) {
            console.error("Update user failed:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAccountDetail = async (values, { onSuccess, resetForm }) => {
        setLoading(true);

        try {
            const formData = new FormData();

            Object.keys(values).forEach((key) => {
                if (values[key] !== undefined && values[key] !== null && values[key] !== "") {
                    formData.append(key, values[key]);
                }
            });

            const response = await updateAccountDetail(formData);
            const updatedUser = response?.user || response?.data?.user;

            if (updatedUser) {
                setUser((prev) => ({
                    ...(prev || {}),
                    ...updatedUser,
                    avatar_updated_at: values?.avatar ? Date.now() : prev?.avatar_updated_at,
                }));
            } else {
                // Fallback để vẫn phản ánh realtime các field text ngay cả khi backend không trả user object
                setUser((prev) => ({
                    ...(prev || {}),
                    email: values?.email ?? prev?.email,
                    phone_number: values?.phone_number ?? prev?.phone_number,
                    date_of_birth: values?.date_of_birth ?? prev?.date_of_birth,
                }));
            }

            toast.success(response?.message || "Cập nhật tài khoản thành công!");

            onSuccess?.();
            resetForm?.();
        } catch (error) {
            console.error("UPDATE ACCOUNT DETAIL ERROR:", error);

            toast.error(error?.response?.data?.message || error?.message || "Cập nhật thất bại!");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async (id, callback) => {
        try {
            setLoading(true);
            await deleteAccount(id);
            await fetchUsers();
            callback?.();
        } catch (err) {
            console.error("Delete user failed:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <UserContext.Provider
            value={{
                users,
                setUsers,
                loading,
                error,

                fetchUsers,
                fetchUsersByRole,

                handleUpdateAccount,
                handleUpdateAccountDetail,
                handleDeleteAccount,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);

