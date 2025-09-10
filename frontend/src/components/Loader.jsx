// Loader.jsx
import Lottie from "lottie-react";
import loadingAnim from "../assets/animation/Loading.json";

const Loader = ({ size = 100, loop = true }) => (
  <Lottie
    animationData={loadingAnim}
    loop={loop}
    style={{
      width: size,
      height: size,
      margin: "auto",
      display: "block",
    }}
  />
);

export default Loader;
