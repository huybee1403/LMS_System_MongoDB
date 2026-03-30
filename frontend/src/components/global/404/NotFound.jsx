import "./NotFound.css";
import image from "../../../image/404-removebg-preview.png"; // Assuming you have a 404 image in this path
const NotFound = () => {
    return (
        <section className="container">
            <div className="error">
                <h1>Uh Ohh!</h1>
                <p>We couldn't find the page that you're looking for :(</p>
                <div className="cta">
                    <button
                        className="cta-back"
                        onClick={() => window.history.back()} // quay lại trang trước
                    >
                        Go Back
                    </button>
                </div>
            </div>
            <img src={image} alt="home" className="hero-img" />
        </section>
    );
};

export default NotFound;
