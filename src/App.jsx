import { Toaster } from "./components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "./lib/query-client";

import { useEffect } from "react";
import { listenForMessages } from "./firebaseNotification";

// for use session logout
import "./lib/axiosInterceptor";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./lib/AuthContext";

import Layout from "./Layout";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import MyJobs from "./pages/MyJobs";
import PostJob from "./pages/PostJob";
import FindJobs from "./pages/FindJobs";
import Profile from "./pages/Profile";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

import TermsAcceptanceModal from "./components/TermsAcceptanceModal";
import UserNotRegisteredError from "./components/UserNotRegisteredError";
import PageNotFound from "./lib/PageNotFound";
import ServerError from "./lib/500";
import AssignedJobView from "./components/jobs/AssignedJobView";
import ApplicantList from "./components/jobs/ApplicantList";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./lib/ProtectedRoute";
import UserProfileView from "./pages/UserProfileView";

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError?.type === "user_not_registered") {
    return <UserNotRegisteredError />;
  }

  return (
    <>
      <TermsAcceptanceModal />

      <Routes>
        {/* Redirect root to Home */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
        <Route path="/TermsOfService" element={<TermsOfService />} />

        {/* App Routes */}
        <Route
          path="/home"
          element={
            <Layout currentPageName="Home">
              {" "}
              <Home />{" "}
            </Layout>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout currentPageName="Dashboard">
                {" "}
                <Dashboard />{" "}
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-jobs"
          element={
            <ProtectedRoute>
              <Layout currentPageName="MyJobs">
                {" "}
                <MyJobs />{" "}
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/post-job"
          element={
            <ProtectedRoute>
              <Layout currentPageName="PostJob">
                {" "}
                <PostJob />{" "}
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/find-jobs"
          element={
            <ProtectedRoute>
              <Layout currentPageName="FindJobs">
                {" "}
                <FindJobs />{" "}
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout currentPageName="Profile">
                {" "}
                <Profile />{" "}
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Layout currentPageName="Analytics">
                {" "}
                <Analytics />{" "}
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-jobs/:id/assigned"
          element={
            <ProtectedRoute>
              <Layout currentPageName="MyJobs">
                <AssignedJobView />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-jobs/:id/applicants"
          element={
            <ProtectedRoute>
              <Layout currentPageName="MyJobs">
                <ApplicantList />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/user-profile/:userId"
          element={
            <ProtectedRoute>
              <Layout currentPageName="MyJobs">
                <UserProfileView />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<PageNotFound />} />

        {/* 500 */}
        <Route path="/500" element={<ServerError />} />

      </Routes>
    </>
  );
};

export default function App() {
  useEffect(() => {
    // Register Firebase Messaging Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register(
          "/current-project/react-project/EveryoneCourior/firebase-messaging-sw.js",
        )
        // .register("/firebase-messaging-sw.js")
        .then((registration) => {
          // console.log("✅ Firebase service worker registered:", registration);
        })
        .catch((error) => {
          // console.error(
          //   "❌ Firebase service worker registration failed:",
          //   error,
          // );
        });
    }

    // Listen for foreground FCM messages
    listenForMessages();
  }, []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
       <Router basename="/current-project/react-project/EveryoneCourior">
         {/* <Router>  */}
          {/* here scrolltotop use for need to show top any navigate after  */}
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}
