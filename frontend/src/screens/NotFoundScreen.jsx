import { Link } from "react-router-dom";
import Lottie from "lottie-react";
import NotFoundAnimation from "../assets/animation/NotFoundAnimation.json";

const NotFoundScreen = () => {
  return (
<div
  className="flex flex-col items-center justify-center text-center mx-auto px-4 py-8
            "
  style={{ minHeight: "80vh", maxWidth: 420 }}
>
  <Lottie
    animationData={NotFoundAnimation}
    style={{
      width: "80%",
      maxWidth: 300,
      height: "auto",
      marginBottom: "1rem",
    }}
  />

  <h1 className="text-6xl font-extrabold text-red-600 dark:text-red-400 mb-2">404</h1>
  <h2 className="mb-3 text-[#1e3163] dark:text-[#a3bffa] text-2xl font-semibold">
    Oops! Page Not Found
  </h2>
  <p className="text-gray-500 dark:text-gray-400 mb-6">
    The page you are looking for doesn&apos;t exist or has been moved.
  </p>

  <Link to="/">
    <button
      type="button"
      className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-800 transition"
    >
      Go Home
    </button>
  </Link>
</div>

  );
};

export default NotFoundScreen;
