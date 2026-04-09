import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import { AuthProvider } from "./contexts/authentication/AuthContext";
import { UserProvider } from "./contexts/users/UserContext.jsx";
import { initAuth } from "./services/auth/authBootstrap.js";
import { CoursesProvider } from "./contexts/courses/CourseContext.jsx";
import { SalaryProvider } from "./contexts/salaries/SalaryContext.jsx";
import { NotificationProvider } from "./contexts/notifications/NotificationContext.jsx";

initAuth();

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <NotificationProvider>
                    <SalaryProvider>
                        <CoursesProvider>
                            <UserProvider>
                                <App />
                            </UserProvider>
                        </CoursesProvider>
                    </SalaryProvider>
                </NotificationProvider>
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>,
);
