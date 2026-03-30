// contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [accessToken, setAccessToken] = useState(() => localStorage.getItem("accessToken"));

    // Hàm login
    const login = async (email, password) => {
        const res = await axios.post("/api/auth/login", { email, password }, { withCredentials: true });
        setUser(res.data.user);
        setAccessToken(res.data.accessToken);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("accessToken", res.data.accessToken);
    };

    // Hàm logout
    const logout = async () => {
        await axios.post("/api/auth/logout", {}, { withCredentials: true });
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
    };

    // Hàm refresh token
    const refreshAccessToken = async () => {
        try {
            const res = await axios.post("/api/auth/refresh-token", {}, { withCredentials: true });
            setAccessToken(res.data.accessToken);
            localStorage.setItem("accessToken", res.data.accessToken);
            return res.data.accessToken;
        } catch (err) {
            logout();
            return null;
        }
    };

    return <AuthContext.Provider value={{ user, accessToken, login, logout, refreshAccessToken, setUser }}>{children}</AuthContext.Provider>;
};
