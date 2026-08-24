import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-slate-800">404</h1>

        <h2 className="mt-4 text-2xl font-semibold text-slate-700">
          Page Not Found
        </h2>

        <p className="mt-2 text-slate-500">
          Sorry, the page you are looking for does not exist.
        </p>

        <Link
          to="/home"
          className="inline-block mt-6 px-6 py-3 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;