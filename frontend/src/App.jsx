import "./App.css";
import { Slide, ToastContainer } from "react-toastify";
import AppRoutes from "./routers/AppRoutes";
import { DNA } from "react-loader-spinner";
import { useAuth } from "./contexts/authentication/AuthContext";

function App() {
    const { loading } = useAuth();

    if (loading) {
        // Nếu đang loading, hiển thị spinner
        return (
            <>
                <div className="loading">
                    <DNA visible={true} height="160" width="160" ariaLabel="dna-loading" wrapperStyle={{}} wrapperClass="dna-wrapper" />
                </div>
                <ToastContainer position="top-center" autoClose={2000} transition={Slide} pauseOnHover={false} />
            </>
        );
    }
    return (
        <>
            <AppRoutes />
            <ToastContainer position="top-center" autoClose={1000} transition={Slide} pauseOnHover={false} />
        </>
    );
}

export default App;
