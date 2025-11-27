import { useState } from "react";
import { toast } from "react-toastify";
import { useForgotPasswordMutation, useResetPasswordMutation } from "../slices/usersApiSlice.js";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export default function ForgotPasswordScreen() {
    const navigate = useNavigate();
  const [forgotStep, setForgotStep] = useState(1); 
  const [data, setData] = useState({ email: "", resetCode: "", newPassword: "", confirmPassword: "" });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [forgotPasswordMutation, { isLoading: isSendingCode }] = useForgotPasswordMutation();
  const [resetPasswordMutation, { isLoading: isResetting }] = useResetPasswordMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const sendCode = async () => {
    if (!data.email) return toast.error("Email is required");
    try {
      await forgotPasswordMutation(data.email).unwrap();
      toast.success("Verification code sent to your email");
      setForgotStep(2);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to send code");
    }
  };

  const resetPassword = async () => {
    const { email, resetCode, newPassword, confirmPassword } = data;
    if (!email || !resetCode || !newPassword || !confirmPassword) return toast.error("All fields are required");
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match");

    try {
      await resetPasswordMutation({ email, resetCode, newPassword }).unwrap();
      toast.success("Password reset successfully");
      setData({ email: "", resetCode: "", newPassword: "", confirmPassword: "" });
      setForgotStep(1);
            navigate("/login");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>

        {forgotStep === 1 && (
          <div className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={data.email}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
            <button
              onClick={sendCode}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              disabled={isSendingCode}
            >
              {isSendingCode ? "Sending..." : "Send Verification Code"}
            </button>
            <p className="text-center mt-2 text-sm text-gray-600">
              <Link to="/login" className="text-blue-600 hover:underline">Back to login</Link>
            </p>
          </div>
        )}

        {forgotStep === 2 && (
          <div className="space-y-4">
            {/* Verification Code */}
            <input
              type="text"
              name="resetCode"
              placeholder="Verification Code"
              value={data.resetCode}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />

            {/* New Password */}
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                placeholder="New Password"
                value={data.newPassword}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded pr-10"
              />
              <span
                className="absolute top-2 right-3 cursor-pointer text-gray-500"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <AiOutlineEye size={20} /> : <AiOutlineEyeInvisible size={20} />}
              </span>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={data.confirmPassword}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded pr-10"
              />
              <span
                className="absolute top-2 right-3 cursor-pointer text-gray-500"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <AiOutlineEye size={20} /> : <AiOutlineEyeInvisible size={20} />}
              </span>
            </div>

            <button
              onClick={resetPassword}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
              disabled={isResetting}
            >
              {isResetting ? "Resetting..." : "Reset Password"}
            </button>

            <p className="text-center mt-2 text-sm text-gray-600">
              <Link to="/login" className="text-blue-600 hover:underline">Back to login</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
