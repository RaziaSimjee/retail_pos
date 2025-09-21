import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useLoginMutation, useForgotPasswordMutation, useResetPasswordMutation } from "../slices/usersApiSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../slices/authSlice.js";

export default function LoginScreen() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const [login, { isLoading }] = useLoginMutation();
  const [forgotPasswordMutation, { isLoading: isSendingCode }] = useForgotPasswordMutation();
  const [resetPasswordMutation, { isLoading: isResetting }] = useResetPasswordMutation();

  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: enter email, 2: enter code + new password
  const [forgotData, setForgotData] = useState({ email: "", resetCode: "", newPassword: "" });

  useEffect(() => {
    if (userInfo) navigate("/dashboard");
  }, [userInfo, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setFormErrors((prev) => ({ ...prev, email: emailRegex.test(value) ? "" : "Invalid email" }));
    }

    if (name === "password") {
      setFormErrors((prev) => ({ ...prev, password: value ? "" : "Password cannot be empty" }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return toast.error("Fill all fields");
    if (formErrors.email || formErrors.password) return;

    try {
      const res = await login(formData).unwrap();
      dispatch(setCredentials(res));
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.data?.message || "Login failed");
    }
  };

  // === Forgot Password Handlers ===
  const handleForgotChange = (e) => {
    const { name, value } = e.target;
    setForgotData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendCode = async () => {
    if (!forgotData.email) return toast.error("Email is required");
    try {
      await forgotPasswordMutation(forgotData.email).unwrap();
      toast.success("Verification code sent to your email");
      setResetStep(2);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to send code");
    }
  };

  const handleResetPassword = async () => {
    const { email, resetCode, newPassword } = forgotData;
    if (!email || !resetCode || !newPassword) return toast.error("All fields are required");
    try {
      await resetPasswordMutation(forgotData).unwrap();
      toast.success("Password reset successfully");
      setForgotModalOpen(false);
      setResetStep(1);
      setForgotData({ email: "", resetCode: "", newPassword: "" });
    } catch (err) {
      toast.error(err?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />
            {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
          </div>

          <div className="relative">
            <label className="block mb-1 font-medium">Password</label>
            <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required className="w-full border px-3 py-2 rounded pr-10" />
            <span className="absolute top-9 right-3 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "Hide" : "Show"}
            </span>
            {formErrors.password && <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>}
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          <span className="cursor-pointer text-blue-600 hover:underline" onClick={() => setForgotModalOpen(true)}>
            Forgot Password?
          </span>
        </p>

        <p className="mt-2 text-center text-sm text-gray-600">
          Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
        </p>
      </div>

      {/* === Forgot Password Modal === */}
      {forgotModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Reset Password</h3>
            
            {resetStep === 1 && (
              <div className="space-y-3">
                <label className="block mb-1">Email</label>
                <input type="email" name="email" value={forgotData.email} onChange={handleForgotChange} className="w-full border px-2 py-1 rounded" required />
                <button onClick={handleSendCode} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mt-2">
                  {isSendingCode ? "Sending..." : "Send Verification Code"}
                </button>
              </div>
            )}

            {resetStep === 2 && (
              <div className="space-y-3">
                <label className="block mb-1">Verification Code</label>
                <input type="text" name="resetCode" value={forgotData.resetCode} onChange={handleForgotChange} className="w-full border px-2 py-1 rounded" required />

                <label className="block mb-1">New Password</label>
                <input type="password" name="newPassword" value={forgotData.newPassword} onChange={handleForgotChange} className="w-full border px-2 py-1 rounded" required />

                <button onClick={handleResetPassword} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 mt-2">
                  {isResetting ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            )}

            <button onClick={() => { setForgotModalOpen(false); setResetStep(1); }} className="mt-4 px-3 py-1 border rounded hover:bg-gray-100">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
