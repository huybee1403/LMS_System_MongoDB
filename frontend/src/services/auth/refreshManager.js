import axios from "axios";
import { setToken } from "./token";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

let isRefreshing = false;
let queue = [];

const processQueue = (error, token = null) => {
    queue.forEach((p) => {
        if (error) p.reject(error);
        else p.resolve(token);
    });
    queue = [];
};

export const refreshAccessToken = async () => {
    if (isRefreshing) {
        return new Promise((resolve, reject) => {
            queue.push({ resolve, reject });
        });
    }

    isRefreshing = true;

    try {
        const res = await axios.post(`${BASE_URL}/auth/refresh-token`, {}, { withCredentials: true });

        const newToken = res.data.accessToken;

        setToken(newToken);

        processQueue(null, newToken);

        return newToken;
    } catch (err) {
        processQueue(err, null);
        localStorage.clear();
        window.location.href = "/login";
        throw err;
    } finally {
        isRefreshing = false;
    }
};
