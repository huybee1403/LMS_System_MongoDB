import { getToken, isTokenExpired } from "./token";
import { refreshAccessToken } from "./refreshManager";

let timer = null;

export const startAuthScheduler = () => {
    if (timer) clearInterval(timer);

    timer = setInterval(async () => {
        const token = getToken();
        if (!token) return;

        if (isTokenExpired(token, 30)) {
            try {
                await refreshAccessToken();
            } catch (err) {
                console.error("Auto refresh failed", err);
            }
        }
    }, 10000);
};
