import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useRegisterMutation } from "../slices/usersApiSlice.js";
import { setCredentials } from "../slices/authSlice.js";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export default function RegisterScreen() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    userRole: "customer",
    DOB: "",
    phoneNumber: "",
    description: "",
  });

  const [formErrors, setFormErrors] = useState({
    phoneNumber: "",
    DOB: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [register, { isLoading }] = useRegisterMutation();

  useEffect(() => {
    if (userInfo) navigate("/dashboard");
  }, [userInfo, navigate]);

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,12}$/;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Inline validations
    if (name === "phoneNumber") {
      const phoneRegex = /^\+?[0-9]*$/;
      setFormErrors((prev) => ({
        ...prev,
        phoneNumber: phoneRegex.test(value)
          ? ""
          : "Phone number must contain only numbers and an optional leading +",
      }));
    }

    if (name === "DOB") {
      if (value) {
        const dob = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
        setFormErrors((prev) => ({
          ...prev,
          DOB: age < 18 ? "You must be at least 18 years old to register." : "",
        }));
      } else {
        setFormErrors((prev) => ({
          ...prev,
          DOB: "Please enter your date of birth.",
        }));
      }
    }

    if (name === "password") {
      setFormErrors((prev) => ({
        ...prev,
        password: passwordRegex.test(value)
          ? ""
          : "Password must be 8-12 characters and include uppercase, lowercase, number, and special character.",
        confirmPassword:
          formData.confirmPassword && value !== formData.confirmPassword
            ? "Passwords do not match."
            : "",
      }));
    }

    if (name === "confirmPassword") {
      setFormErrors((prev) => ({
        ...prev,
        confirmPassword:
          value !== formData.password ? "Passwords do not match." : "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      formErrors.phoneNumber ||
      formErrors.DOB ||
      formErrors.password ||
      formErrors.confirmPassword
    )
      return;

    try {
      const res = await register(formData).unwrap();
      // Prevent undefined userInfo issues
      if (res?.user) dispatch(setCredentials({ ...res }));
      toast.success("Registration successful!");
      navigate("/dashboard");
    } catch (err) {
      if (err?.data?.errors) {
        Object.values(err.data.errors).forEach((error) =>
          toast.error(error.message)
        );
      } else if (err?.data?.message) {
        toast.error(err.data.message);
      } else {
        toast.error(err?.error || "Something went wrong");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block font-medium mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              id="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block font-medium mb-1">
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
          </div>

          {/* Password */}
          <div className="relative">
            <label htmlFor="password" className="block font-medium mb-1">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
            <span
              className="absolute right-3 top-10 cursor-pointer text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
            </span>
            {formErrors.password && (
              <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label htmlFor="confirmPassword" className="block font-medium mb-1">
              Confirm Password
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
            <span
              className="absolute right-3 top-10 cursor-pointer text-gray-500"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <AiOutlineEye />
              ) : (
                <AiOutlineEyeInvisible />
              )}
            </span>
            {formErrors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* User Role */}
          <div>
            <label htmlFor="userRole" className="block font-medium mb-1">
              User Role
            </label>
            <select
              name="userRole"
              id="userRole"
              value={formData.userRole}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="cashier">Cashier</option>
            </select>
          </div>

          {/* DOB */}
          <div>
            <label htmlFor="DOB" className="block font-medium mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              name="DOB"
              id="DOB"
              value={formData.DOB}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
            {formErrors.DOB && (
              <p className="text-red-500 text-sm mt-1">{formErrors.DOB}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phoneNumber" className="block font-medium mb-1">
              Phone Number
            </label>
            <input
              type="text"
              name="phoneNumber"
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
            {formErrors.phoneNumber && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.phoneNumber}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block font-medium mb-1">
              Description
            </label>
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition"
          >
            {isLoading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Login link */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
