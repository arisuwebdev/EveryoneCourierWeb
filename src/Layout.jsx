// import { Link, useLocation, useNavigate } from "react-router-dom";
// import {
//   Package,
//   User,
//   Plus,
//   Search,
//   Home,
//   Briefcase,
//   BarChart2,
//   LogOut,
// } from "lucide-react";
// import { useAuth } from "../src/lib/AuthContext";
// const navigationItems = [
//   { title: "Home", url: "/home", icon: Home },
//   { title: "My Jobs", url: "/my-jobs", icon: Briefcase },
//   { title: "Post Job", url: "/post-job", icon: Plus },
//   { title: "Find Jobs", url: "/find-jobs", icon: Search },
//   { title: "Profile", url: "/profile", icon: User },
//   { title: "Analytics", url: "/analytics", icon: BarChart2 },
// ];
// export default function Layout({ children }) {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { logout, isAuthenticated } = useAuth();
//   // const handleLogout = async () => {
//   //   try {
//   //     await logout();
//   //     window.location.href = "/login";
//   //   } catch (error) {}
//   // };

//   const handleLogout = async () => {
//     await logout();
//     navigate("/login", { replace: true });
//   };

//   return (
//     <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
//       {/* Top Header */}
//       <header className="bg-white/90 backdrop-blur-sm border-b border-slate-200/60 px-4 py-3 sticky top-0 z-40">
// <div className="flex items-center justify-between w-full px-2">
//           <Link to="/home" className="flex items-center gap-2">
//             <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow">
//               <Package className="w-4 h-4 text-white" />
//             </div>
//             <span className="font-bold text-slate-900 text-base">
//               Everyone's a Courier
//             </span>
//           </Link>
//           <div className="flex items-center">
//             {isAuthenticated && (
//               <button
//                 onClick={handleLogout}
//                 className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50"
//               >
//                 <LogOut className="w-5 h-5" />
//                 <span>Logout</span>
//               </button>
//             )}
//           </div>
//         </div>
//       </header>

//       {/* Page Content */}
//       <main
//         className={`flex-1 overflow-auto ${isAuthenticated ? "pb-20" : ""}`}
//       >
//         {children}
//       </main>

//       {/* Bottom Navigation Bar (mobile-first, logged in) */}
//       {isAuthenticated && (
//         <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg">
//           <div className="flex items-center justify-around px-1 py-1 max-w-2xl mx-auto">
//             {navigationItems.map((item) => {
//               const isActive = location.pathname === item.url;
//               const isPost = item.title === "Post Job";
//               return (
//                 <Link
//                   key={item.title}
//                   to={item.url}
//                   className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all duration-200 ${
//                     isPost
//                       ? "relative -top-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg w-14 h-14 flex-none mx-2"
//                       : isActive
//                         ? "text-blue-600"
//                         : "text-slate-400"
//                   }`}
//                 >
//                   <item.icon
//                     className={`${isPost ? "w-6 h-6" : "w-5 h-5"} mb-0.5`}
//                   />
//                   {!isPost && (
//                     <span
//                       className={`text-[10px] font-medium leading-tight ${isActive ? "text-blue-600" : "text-slate-400"}`}
//                     >
//                       {item.title}
//                     </span>
//                   )}
//                 </Link>
//               );
//             })}
//           </div>
//         </nav>
//       )}

//       {/* Footer (logged out) */}
//       {!isAuthenticated && (
//         <footer className="bg-white border-t border-slate-200/60 px-4 py-6">
//           <div className="max-w-2xl mx-auto w-full">
//             <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
//               <Link to="/home" className="flex items-center gap-2">
//                 <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow">
//                   <Package className="w-3.5 h-3.5 text-white" />
//                 </div>
//                 <span className="font-semibold text-slate-800 text-sm">
//                   Everyone's a Courier
//                 </span>
//               </Link>

//               <div className="flex items-center gap-5 text-sm text-slate-500">
//                 <Link
//                   to="/contact"
//                   className="hover:text-blue-600 transition-colors"
//                 >
//                   Contact
//                 </Link>
//                 <Link
//                   to="/terms"
//                   className="hover:text-blue-600 transition-colors"
//                 >
//                   Terms
//                 </Link>
//                 <Link
//                   to="/privacy"
//                   className="hover:text-blue-600 transition-colors"
//                 >
//                   Privacy
//                 </Link>
//               </div>
//             </div>

//             <div className="mt-4 pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
//               © {new Date().getFullYear()} Everyone's a Courier. All rights
//               reserved.
//             </div>
//           </div>
//         </footer>
//       )}
//     </div>
//   );
// }

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
  Bell,
} from "lucide-react";
import { useAuth } from "../src/lib/AuthContext";
import { getPrivacyPolicyUrl } from "./api/ApiServices/getPrivacyPolicyUrlApiService";
import { getTermsOfServiceUrl } from "./api/ApiServices/getTermsOfServiceUrlApiService";
// Links shown inline in the desktop nav (Post Job is rendered separately as a CTA button)
const navigationItems = [
  { title: "Home", url: "/home", icon: Home },
  { title: "My Jobs", url: "/my-jobs", icon: Briefcase },
  { title: "Find Jobs", url: "/find-jobs", icon: Search },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Analytics", url: "/analytics", icon: BarChart2 },
];

// Same items, with Post Job re-inserted in the middle, for the mobile bottom nav
const mobileNavigationItems = [
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
  const { logout, isAuthenticated, user } = useAuth();

  const handlePrivacyClick = async () => {
    try {
      const response = await getPrivacyPolicyUrl();

      if (response?.status === 1 && response?.payload?.privacyPolicyUrl) {
        window.open(response.payload.privacyPolicyUrl, "_blank");
      }
    } catch (error) {
      console.error("Failed to load privacy policy.", error);
    }
  };

  const handleTermsClick = async () => {
    try {
      const response = await getTermsOfServiceUrl();

      if (response?.status === 1 && response?.payload?.termsOfServiceUrl) {
        window.open(response.payload.termsOfServiceUrl, "_blank");
      }
    } catch (error) {
      console.error("Failed to load terms of service.", error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Top Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-slate-200/60 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between w-full px-2 max-w-7xl mx-auto">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow">
              <Package className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-slate-900 text-base">
                Everyone's a Courier
              </span>
              <span className="text-[11px] font-medium text-blue-600 tracking-wide">
                RouteRunner
              </span>
            </div>
          </Link>

          {/* Desktop inline nav links */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <Link
                    key={item.title}
                    to={item.url}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "text-blue-600 bg-blue-50"
                        : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                    }`}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right side: Post Job CTA, notifications, avatar, logout */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {isAuthenticated && (
              <>
                {user?.user_type !== "COURIER" && (
                  <Link
                    to="/post-job"
                    className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-full shadow hover:shadow-md hover:scale-[1.02] transition"
                  >
                    <Plus className="w-4 h-4" />
                    Post Job
                  </Link>
                )}

                <button
                  type="button"
                  className="hidden md:flex relative p-2 rounded-full text-slate-500 hover:bg-slate-100 transition"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
                </button>

                <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-xs font-semibold text-slate-700">
                    {initials}
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    {user?.name || "Account"}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main
        className={`flex-1 overflow-auto ${isAuthenticated ? "pb-24 md:pb-0" : ""}`}
      >
        {children}
      </main>

      {/* Bottom Navigation Bar (mobile-only, logged in) — floating rounded pill style */}

      {isAuthenticated && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg">
          <div className="flex items-center justify-around px-1 py-1 max-w-2xl mx-auto">
            {mobileNavigationItems.map((item) => {
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
                      className={`text-[10px] font-medium leading-tight ${
                        isActive ? "text-blue-600" : "text-slate-400"
                      }`}
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

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/60">
        <div className="max-w-6xl mx-auto w-full px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_1fr_1fr] gap-8">
            {/* Brand + blurb */}
            <div className="flex flex-col gap-3">
              <Link to="/home" className="flex items-center gap-2 w-fit">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-bold text-slate-900 text-sm">
                    Everyone's a Courier
                  </span>
                  <span className="text-[10px] font-medium text-blue-600 tracking-wide">
                    RouteRunner
                  </span>
                </div>
              </Link>
              <p className="text-sm text-slate-500 max-w-xs">
                Local deliveries, run by people nearby. Post a job or pick one
                up in minutes.
              </p>
            </div>

            {/* Product links */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Product
              </span>
              <Link
                to="/find-jobs"
                className="text-sm text-slate-600 hover:text-blue-600 transition-colors w-fit"
              >
                Find Jobs
              </Link>
              <Link
                to="/post-job"
                className="text-sm text-slate-600 hover:text-blue-600 transition-colors w-fit"
              >
                Post a Job
              </Link>
              <Link
                to="/analytics"
                className="text-sm text-slate-600 hover:text-blue-600 transition-colors w-fit"
              >
                Analytics
              </Link>
            </div>

            {/* Company / legal links */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Company
              </span>
              <Link
                to="/contact"
                className="text-sm text-slate-600 hover:text-blue-600 transition-colors w-fit"
              >
                Contact
              </Link>
              <button
                type="button"
                onClick={handleTermsClick}
                className="text-sm text-slate-600 hover:text-blue-600 transition-colors w-fit text-left"
              >
                Terms
              </button>
              <button
                type="button"
                onClick={handlePrivacyClick}
                className="text-sm text-slate-600 hover:text-blue-600 transition-colors w-fit text-left"
              >
                Privacy
              </button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-400">
              © {new Date().getFullYear()} Everyone's a Courier. All rights
              reserved.
            </span>
            <div className="h-1 w-16 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600" />
          </div>
        </div>
      </footer>
    </div>
  );
}
