import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Package,
  User,
  Plus,
  Search,
  Home,
  Briefcase,
  BarChart2,
  LogOut,
} from "lucide-react";
import { useAuth } from "../src/lib/AuthContext";
const navigationItems = [
  { title: "Home", url: "/home", icon: Home },
  { title: "My Jobs", url: "/my-jobs", icon: Briefcase },
  { title: "Post Job", url: "/post-job", icon: Plus },
  { title: "Find Jobs", url: "/find-jobs", icon: Search },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Analytics", url: "/analytics", icon: BarChart2 },
];
export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();
  // const handleLogout = async () => {
  //   try {
  //     await logout();
  //     window.location.href = "/login";
  //   } catch (error) {}
  // };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Top Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-slate-200/60 px-4 py-3 sticky top-0 z-40">
<div className="flex items-center justify-between w-full px-2">
          <Link to="/home" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-base">
              Everyone's a Courier
            </span>
          </Link>
          <div className="flex items-center">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main
        className={`flex-1 overflow-auto ${isAuthenticated ? "pb-20" : ""}`}
      >
        {children}
      </main>

      {/* Bottom Navigation Bar (mobile-first, logged in) */}
      {isAuthenticated && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg">
          <div className="flex items-center justify-around px-1 py-1 max-w-2xl mx-auto">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.url;
              const isPost = item.title === "Post Job";
              return (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all duration-200 ${
                    isPost
                      ? "relative -top-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg w-14 h-14 flex-none mx-2"
                      : isActive
                        ? "text-blue-600"
                        : "text-slate-400"
                  }`}
                >
                  <item.icon
                    className={`${isPost ? "w-6 h-6" : "w-5 h-5"} mb-0.5`}
                  />
                  {!isPost && (
                    <span
                      className={`text-[10px] font-medium leading-tight ${isActive ? "text-blue-600" : "text-slate-400"}`}
                    >
                      {item.title}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* Footer (logged out) */}
      {!isAuthenticated && (
        <footer className="bg-white border-t border-slate-200/60 px-4 py-6">
          <div className="max-w-2xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link to="/home" className="flex items-center gap-2">
                <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow">
                  <Package className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-semibold text-slate-800 text-sm">
                  Everyone's a Courier
                </span>
              </Link>

              <div className="flex items-center gap-5 text-sm text-slate-500">
                <Link
                  to="/contact"
                  className="hover:text-blue-600 transition-colors"
                >
                  Contact
                </Link>
                <Link
                  to="/terms"
                  className="hover:text-blue-600 transition-colors"
                >
                  Terms
                </Link>
                <Link
                  to="/privacy"
                  className="hover:text-blue-600 transition-colors"
                >
                  Privacy
                </Link>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
              © {new Date().getFullYear()} Everyone's a Courier. All rights
              reserved.
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
