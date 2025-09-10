// GoBackLink.jsx
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function GoBackLink({ to = "/", label = "Go Back" }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors mb-3"
    >
      <ArrowLeftIcon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
}
