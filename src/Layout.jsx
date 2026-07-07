// import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Package, User, Plus, Search, Home, Briefcase, BarChart2 } from "lucide-react";
// import { base44 } from "@/api/base44Client";
// import NotificationCenter from "@/components/notifications/NotificationCenter";

const navigationItems = [
  { title: "Home", url: createPageUrl("Home"), icon: Home },
  { title: "My Jobs", url: createPageUrl("MyJobs"), icon: Briefcase },
  { title: "Post Job", url: createPageUrl("PostJob"), icon: Plus },
  { title: "Find Jobs", url: createPageUrl("FindJobs"), icon: Search },
  { title: "Profile", url: createPageUrl("Profile"), icon: User },
  { title: "Analytics", url: createPageUrl("Analytics"), icon: BarChart2 },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  // const [userId, setUserId] = useState(null);

  // useEffect(() => {
  //   const loadUser = async () => {
  //     try {
  //       const user = await base44.auth.me();
  //       setUserId(user.id);
  //     } catch (error) {}
  //   };
  //   loadUser();
  // }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Top Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-slate-200/60 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between max-w-2xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-base">Everyone's a Courier</span>
          </div>
          {/* {userId && <NotificationCenter userId={userId} />} */}
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 overflow-auto pb-20">
        {children}
      </main>

      {/* Bottom Navigation Bar (mobile-first) */}
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
                <item.icon className={`${isPost ? "w-6 h-6" : "w-5 h-5"} mb-0.5`} />
                {!isPost && (
                  <span className={`text-[10px] font-medium leading-tight ${isActive ? "text-blue-600" : "text-slate-400"}`}>
                    {item.title}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}