export const getToken = () => localStorage.getItem("token");

export const setToken = (token) => {
    localStorage.setItem("token", token);
};

export const removeToken = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};

export const decodeJWT = (token) => {
    try {
        const payload = token.split(".")[1];
        return JSON.parse(atob(payload));
    } catch {
        return null;
    }
};

export const isTokenExpired = (token, bufferSeconds = 30) => {
    const decoded = decodeJWT(token);
    if (!decoded?.exp) return true;

    const now = Date.now() / 1000;
    return decoded.exp < now + bufferSeconds;
};
