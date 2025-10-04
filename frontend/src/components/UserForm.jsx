import { useState, useEffect } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export default function UserForm({
  initialData = {},
  role,
  onSubmit,
  isLoading = false,
  submitText = "Submit",
  onCancel,
}) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    userRole: role,
    DOB: "",
    phoneNumber: "",
    description: "",
    ...initialData,
  });

  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,12}$/;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Inline validation
    if (name === "phoneNumber") {
      const phoneRegex = /^\+?[0-9]*$/;
      setFormErrors((prev) => ({
        ...prev,
        phoneNumber: phoneRegex.test(value)
          ? ""
          : "Phone number must contain only numbers and optional leading +",
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
          DOB: age < 18 ? "User must be at least 18 years old" : "",
        }));
      } else {
        setFormErrors((prev) => ({ ...prev, DOB: "Please enter a valid date" }));
      }
    }

    if (name === "password") {
      setFormErrors((prev) => ({
        ...prev,
        password: value && !passwordRegex.test(value)
          ? "Password must be 8-12 characters and include uppercase, lowercase, number, and special character."
          : "",
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Object.values(formErrors).some((err) => err)) return;
    onSubmit(formData);
  };

  useEffect(() => {
    setFormData((prev) => ({ ...prev, userRole: role }));
  }, [role]);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Username */}
      <div className="flex flex-col">
        <label className="mb-1 font-medium">Username</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2"
          required
        />
      </div>

      {/* Email */}
      <div className="flex flex-col">
        <label className="mb-1 font-medium">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2"
          required
        />
      </div>

      {/* Password */}
      <div className="flex flex-col relative">
        <label className="mb-1 font-medium">Password</label>
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={`w-full border rounded-lg px-3 py-2 pr-10 ${
            formErrors.password ? "border-red-500" : ""
          }`}
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
      <div className="flex flex-col relative">
        <label className="mb-1 font-medium">Confirm Password</label>
        <input
          type={showConfirmPassword ? "text" : "password"}
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={`w-full border rounded-lg px-3 py-2 pr-10 ${
            formErrors.confirmPassword ? "border-red-500" : ""
          }`}
        />
        <span
          className="absolute right-3 top-10 cursor-pointer text-gray-500"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          {showConfirmPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
        </span>
        {formErrors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1">{formErrors.confirmPassword}</p>
        )}
      </div>

      {/* Role */}
      <div className="flex flex-col">
        <label className="mb-1 font-medium">Role</label>
        <select
          name="userRole"
          value={formData.userRole}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2"
          required
        >
          <option value="customer">Customer</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="cashier">Cashier</option>
        </select>
      </div>

      {/* DOB */}
      <div className="flex flex-col">
        <label className="mb-1 font-medium">DOB</label>
        <input
          type="date"
          name="DOB"
          value={formData.DOB}
          onChange={handleChange}
          className={`w-full border rounded-lg px-3 py-2 ${
            formErrors.DOB ? "border-red-500" : ""
          }`}
          required
        />
        {formErrors.DOB && (
          <p className="text-red-500 text-sm mt-1">{formErrors.DOB}</p>
        )}
      </div>

      {/* Phone */}
      <div className="flex flex-col">
        <label className="mb-1 font-medium">Phone</label>
        <input
          type="text"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          className={`w-full border rounded-lg px-3 py-2 ${
            formErrors.phoneNumber ? "border-red-500" : ""
          }`}
          required
        />
        {formErrors.phoneNumber && (
          <p className="text-red-500 text-sm mt-1">{formErrors.phoneNumber}</p>
        )}
      </div>

      {/* Description */}
      <div className="flex flex-col">
        <label className="mb-1 font-medium">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2"
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-lg hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          disabled={isLoading}
        >
          {isLoading ? submitText + "..." : submitText}
        </button>
      </div>
    </form>
  );
}
