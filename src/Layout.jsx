import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
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
  Mail,
  Phone,
  MapPin,
  ChevronDown,
  X,
} from "lucide-react";
import { useAuth } from "../src/lib/AuthContext";
import { getPrivacyPolicyUrl } from "./api/ApiServices/getPrivacyPolicyUrlApiService";
import { getTermsOfServiceUrl } from "./api/ApiServices/getTermsOfServiceUrlApiService";
import { getNotificationCount } from "./api/ApiServices/notification/getNotficationCountService";
import { getNotificationList } from "./api/ApiServices/notification/getNotificationListService";

// Links shown inline in the desktop nav (Post Job is rendered separately as a CTA button)
const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "My Jobs", url: "/my-jobs", icon: Briefcase },
  { title: "Find Jobs", url: "/find-jobs", icon: Search },
  { title: "Profile", url: "/profile", icon: User },
  // { title: "Analytics", url: "/analytics", icon: BarChart2 },
];

// Same items, with Post Job re-inserted in the middle, for the mobile bottom nav
const mobileNavigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "My Jobs", url: "/my-jobs", icon: Briefcase },
  { title: "Post Job", url: "/post-job", icon: Plus },
  { title: "Find Jobs", url: "/find-jobs", icon: Search },
  { title: "Analytics", url: "/analytics", icon: BarChart2 },
];

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, isAuthenticated, user, token } = useAuth();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isMobileAccountMenuOpen, setIsMobileAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);

  // for notification

  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isNotificationLoading, setIsNotificationLoading] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target)
      ) {
        setIsAccountMenuOpen(false);
      }
    };

    if (isAccountMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAccountMenuOpen]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setNotificationCount(0);
      return;
    }

    const fetchNotificationCount = async () => {
      try {
        const response = await getNotificationCount(token);
        if (response?.status === 1) {
          const count = response?.payload?.count || 0;

          setNotificationCount(count);
        }
      } catch (error) {
        setNotificationCount(0);
      }
    };

    fetchNotificationCount();
  }, [isAuthenticated, token]);

  const handleNotificationClick = async () => {
    if (isNotificationOpen) {
      setIsNotificationOpen(false);
      return;
    }

    setIsNotificationOpen(true);

    if (!token) {
      return;
    }

    try {
      setIsNotificationLoading(true);
      const response = await getNotificationList(token);

      if (response?.status === 1) {
        const list = response?.payload?.notificationList?.data || [];

        setNotifications(list);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      setNotifications([]);
    } finally {
      setIsNotificationLoading(false);
    }
  };

  const handlePrivacyClick = async () => {
    try {
      const response = await getPrivacyPolicyUrl();

      if (response?.status === 1 && response?.payload?.privacyPolicyUrl) {
        window.open(response.payload.privacyPolicyUrl, "_blank");
      }
    } catch (error) {}
  };

  const handleTermsClick = async () => {
    try {
      const response = await getTermsOfServiceUrl();

      if (response?.status === 1 && response?.payload?.termsOfServiceUrl) {
        window.open(response.payload.termsOfServiceUrl, "_blank");
      }
    } catch (error) {}
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
              {navigationItems
                .filter(
                  (item) =>
                    !(
                      user?.user_type === "CUSTOMER" &&
                      item.url === "/find-jobs"
                    ),
                )
                .map((item) => {
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

                {/* for notification  */}
                <div className="hidden md:block relative">
                  <button
                    type="button"
                    onClick={handleNotificationClick}
                    className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 transition"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />

                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                        {notificationCount > 99 ? "99+" : notificationCount}
                      </span>
                    )}
                  </button>

                  {isNotificationOpen && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsNotificationOpen(false)}
                      />

                      {/* Notification dropdown */}
                      <div className="absolute right-0 top-full mt-3 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                          <h3 className="text-sm font-semibold text-slate-800">
                            Notifications
                          </h3>

                          {notificationCount > 0 && (
                            <span className="text-xs text-blue-600 font-medium">
                              {notificationCount} notification
                              {notificationCount !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>

                        {/* Body */}
                        <div className="max-h-80 overflow-y-auto">
                          {isNotificationLoading ? (
                            <div className="px-4 py-8 text-center text-sm text-slate-500">
                              Loading notifications...
                            </div>
                          ) : notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center">
                              <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />

                              <p className="text-sm font-medium text-slate-600">
                                No notifications
                              </p>

                              <p className="text-xs text-slate-400 mt-1">
                                You don't have any notifications yet.
                              </p>
                            </div>
                          ) : (
                            notifications.map((notification, index) => (
                              <div
                                key={notification.id || index}
                                className="px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition"
                              >
                                <p className="text-sm font-medium text-slate-800">
                                  {notification.title ||
                                    notification.notification_title ||
                                    "Notification"}
                                </p>

                                <p className="text-xs text-slate-500 mt-1">
                                  {notification.message ||
                                    notification.description ||
                                    notification.notification_message ||
                                    ""}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Account dropdown */}
                <div
                  ref={accountMenuRef}
                  className="hidden md:block relative pl-2 border-l border-slate-200"
                >
                  <button
                    type="button"
                    onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-xs font-semibold text-slate-700">
                      {initials}
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      {user?.name || "Account"}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isAccountMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isAccountMenuOpen && (
                    <>
                      {/* backdrop to close on outside click */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsAccountMenuOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50">
                        <button
                          onClick={() => {
                            setIsAccountMenuOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg mx-1"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Notifications */}
          {isAuthenticated && (
            <div className="md:hidden relative">
              <button
                type="button"
                onClick={handleNotificationClick}
                className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 transition"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />

                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                )}
              </button>

              {isNotificationOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40 bg-black/10"
                    onClick={() => setIsNotificationOpen(false)}
                  />

                  {/* Notification panel */}
                  <div
                    className="fixed left-4 right-4 top-16 max-w-[calc(100vw-2rem)]
                     bg-white rounded-2xl shadow-2xl border border-slate-200
                     z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50/60">
                      <h3 className="text-sm font-semibold text-slate-800">
                        Notifications
                        {notificationCount > 0 && (
                          <span className="ml-2 text-xs font-medium text-blue-600">
                            {notificationCount} new
                          </span>
                        )}
                      </h3>

                      <button
                        type="button"
                        onClick={() => setIsNotificationOpen(false)}
                        className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
                        aria-label="Close notifications"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Body */}
                    <div className="max-h-[60vh] overflow-y-auto">
                      {isNotificationLoading ? (
                        <div className="px-4 py-10 text-center text-sm text-slate-500">
                          Loading notifications...
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="px-4 py-10 text-center">
                          <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <p className="text-sm font-medium text-slate-600">
                            No notifications
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            You don't have any notifications yet.
                          </p>
                        </div>
                      ) : (
                        notifications.map((notification, index) => {
                          const isUnread = !notification.is_read; // adjust field name to match your API
                          return (
                            <div
                              key={
                                notification.id ??
                                `${notification.title}-${index}`
                              }
                              className={`flex gap-3 px-4 py-3 border-b border-slate-100 last:border-b-0 transition ${
                                isUnread ? "bg-blue-50/50" : "bg-white"
                              } active:bg-slate-100`}
                            >
                              <span
                                className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                                  isUnread ? "bg-blue-500" : "bg-transparent"
                                }`}
                              />
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-800 truncate">
                                  {notification.title ||
                                    notification.notification_title ||
                                    "Notification"}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                  {notification.message ||
                                    notification.description ||
                                    notification.notification_message ||
                                    ""}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Mobile Account */}
          <div className="md:hidden relative">
            <button
              type="button"
              onClick={() => setIsMobileAccountMenuOpen((prev) => !prev)}
              className="flex items-center justify-center"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-xs font-semibold text-slate-700">
                {initials}
              </div>
            </button>

            {isMobileAccountMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsMobileAccountMenuOpen(false)}
                />

                <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50">
                  <button
                    onClick={() => {
                      setIsMobileAccountMenuOpen(false);
                      navigate("/profile");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg mx-1"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileAccountMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg mx-1"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
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
      <footer className="bg-gradient-to-b from-white to-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-10"> */}
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-4">
            {/* Brand */}
            <div>
              <Link
                to="/home"
                className="flex items-center gap-3 mb-4 group w-fit"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <Package className="w-6 h-6 text-white" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Everyone's a Courier
                  </h2>
                  <p className="text-xs font-semibold tracking-[0.2em] uppercase text-blue-600">
                    RouteRunner
                  </p>
                </div>
              </Link>

              <p className="text-slate-500 text-sm leading-7 max-w-sm">
                Fast, secure and community-powered deliveries. Post delivery
                jobs or earn money by delivering packages nearby.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-5">
                Quick Links
              </h3>

              <div className="flex flex-col gap-3">
                <Link
                  to="/home"
                  className="text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Home
                </Link>

                <button
                  onClick={handleTermsClick}
                  className="text-left text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Terms & Conditions
                </button>

                <button
                  onClick={handlePrivacyClick}
                  className="text-left text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Privacy Policy
                </button>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-5">
                Contact
              </h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="text-slate-600 text-sm">
                    support@everyonecourier.com
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <span className="text-slate-600 text-sm">0401 636 261</span>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span className="text-slate-600 text-sm">Australia</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-12 pt-6 border-t border-slate-200 flex justify-center">
            <p className="text-sm text-slate-500 text-center">
              © {new Date().getFullYear()}{" "}
              <span className="font-semibold text-slate-700">
                Everyone's a Courier
              </span>
              . All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
