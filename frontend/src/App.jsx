import Layout from "./components/Layout.jsx";
import { ToastContainer } from "react-toastify";
import { Outlet } from "react-router-dom";

export default function App() {
  return (
    <>
      <ToastContainer /> {/* Global toast notifications */}
      <Layout>
        <Outlet />
      </Layout>
    </>
  );
}
