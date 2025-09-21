import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useLoginMutation } from "../slices/usersApiSlice.js"; // RTK Query mutation
import { setCredentials } from "../slices/authSlice.js";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

export default function LoginScreen() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [login, { isLoading }] = useLoginMutation();

  useEffect(() => {
    if (userInfo) {
      navigate("/dashboard");
    }
  }, [userInfo, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Inline validation
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setFormErrors((prev) => ({
        ...prev,
        email: emailRegex.test(value) ? "" : "Invalid email address",
      }));
    }

    if (name === "password") {
      setFormErrors((prev) => ({
        ...prev,
        password: value ? "" : "Password cannot be empty",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final check
    if (!formData.email || !formData.password) {
      toast.error("Please fill all fields");
      return;
    }

    if (formErrors.email || formErrors.password) return;

    try {
      const res = await login(formData).unwrap();
      dispatch(setCredentials({ ...res }));
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      if (err?.data?.message) {
        toast.error(err.data.message);
      } else {
        toast.error(err?.error || "Something went wrong");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
            {formErrors.email && (
              <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block font-medium mb-1" htmlFor="password">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2 pr-10"
            />
            <span
              className="absolute right-3 top-9 cursor-pointer text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <AiFillEye size={20} />
              ) : (
                <AiFillEyeInvisible size={20} />
              )}
            </span>
            {formErrors.password && (
              <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Register Link */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
