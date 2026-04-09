import axios from "axios";
import { getToken } from "../services/auth/token";
import { refreshAccessToken } from "../services/auth/refreshManager";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const instance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

/* ================= REQUEST ================= */
instance.interceptors.request.use((config) => {
    const token = getToken();

    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

/* ================= RESPONSE ================= */
instance.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;

        if (!error.response || error.response.status !== 401) {
            return Promise.reject(error);
        }

        if (originalRequest._retry) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            const newToken = await refreshAccessToken();

            originalRequest.headers.Authorization = `Bearer ${newToken}`;

            return instance(originalRequest);
        } catch (err) {
            return Promise.reject(err);
        }
    },
);

export default instance;
