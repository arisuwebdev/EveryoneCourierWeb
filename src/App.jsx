// import { Toaster } from "./components/ui/toaster";
// import { QueryClientProvider } from "@tanstack/react-query";
// import { queryClientInstance } from "./lib/query-client";
// import NavigationTracker from "./lib/NavigationTracker";
// import {
//   BrowserRouter as Router,
//   Route,
//   Routes,
//   Navigate,
// } from "react-router-dom";
// // import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
// import PageNotFound from "./lib/PageNotFound";
// // import PrivacyPolicy from './pages/PrivacyPolicy';
// // import TermsOfService from './pages/TermsOfService';
// import TermsAcceptanceModal from "./components/TermsAcceptanceModal";
// import { AuthProvider, useAuth } from "./lib/AuthContext";
// import UserNotRegisteredError from "./components/UserNotRegisteredError";
// import ProtectedRoute from "./components/ProtectedRoute";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import ForgotPassword from "./pages/ForgotPassword";
// import ResetPassword from "./pages/ResetPassword";
// import Layout from "./Layout";

// import Home from "./pages/Home";
// import Dashboard from "./pages/Dashboard";
// import Analytics from "./pages/Analytics";
// import MyJobs from "./pages/MyJobs";
// import PostJob from "./pages/PostJob";
// import FindJobs from "./pages/FindJobs";
// import Profile from "./pages/Profile";

// import PrivacyPolicy from "./pages/PrivacyPolicy";
// import TermsOfService from "./pages/TermsOfService";

// const AuthenticatedApp = () => {
//   const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } =
//     useAuth();

//   // Show loading spinner while checking app public settings or auth
//   if (isLoadingPublicSettings || isLoadingAuth) {
//     return (
//       <div className="fixed inset-0 flex items-center justify-center">
//         <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
//       </div>
//     );
//   }

//   // Handle authentication errors
//   if (authError) {
//     if (authError.type === "user_not_registered") {
//       return <UserNotRegisteredError />;
//     }
//   }

//   // Render the main app
//   return (
//     <>
//       <TermsAcceptanceModal />
//       <Routes>
//         {/* Public auth routes */}
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/forgot-password" element={<ForgotPassword />} />
//         <Route path="/reset-password" element={<ResetPassword />} />
//         <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
//         <Route path="/TermsOfService" element={<TermsOfService />} />

//         {/* Protected app routes */}
//         {/* <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}> */}
//         <>
//           <Route path="/home" element={   <Layout currentPageName="Home">     <Home />   </Layout> } />

//          <Route  path="/dashboard"  element={ <Layout currentPageName="Dashboard">   <Dashboard /> </Layout>  }/>

//           <Route  path="/my-jobs"  element={    <Layout currentPageName="MyJobs">      <MyJobs />    </Layout>  }/>

//           <Route  path="/post-job"  element={    <Layout currentPageName="PostJob">      <PostJob />    </Layout>   } />

//        <Route path="/find-jobs"  element={ <Layout currentPageName="FindJobs">   <FindJobs /> </Layout>  } />

//           <Route     path="/profile"    element={      <Layout currentPageName="Profile">        <Profile />      </Layout>    }  />

//           <Route   path="/analytics"      element={        <Layout currentPageName="Analytics">      <Analytics />    </Layout>  }   />
//         </>

//         <Route path="*" element={<PageNotFound />} />
//       </Routes>
//     </>
//   );
// };

// function App() {
//   return (
//     <AuthProvider>
//       <QueryClientProvider client={queryClientInstance}>
//         <Router >
//           <NavigationTracker />
//           <AuthenticatedApp />
//         </Router>
//         <Toaster />
//       </QueryClientProvider>
//     </AuthProvider>
//   );
// }

// export default App;

import { Toaster } from "./components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "./lib/query-client";

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
import AssignedJobView from "./components/jobs/AssignedJobView";
import ApplicantList from "./components/jobs/ApplicantList";

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
            <Layout currentPageName="Dashboard">
              {" "}
              <Dashboard />{" "}
            </Layout>
          }
        />

        <Route
          path="/my-jobs"
          element={
            <Layout currentPageName="MyJobs">
              {" "}
              <MyJobs />{" "}
            </Layout>
          }
        />

        <Route
          path="/post-job"
          element={
            <Layout currentPageName="PostJob">
              {" "}
              <PostJob />{" "}
            </Layout>
          }
        />

        <Route
          path="/find-jobs"
          element={
            <Layout currentPageName="FindJobs">
              {" "}
              <FindJobs />{" "}
            </Layout>
          }
        />

        <Route
          path="/profile"
          element={
            <Layout currentPageName="Profile">
              {" "}
              <Profile />{" "}
            </Layout>
          }
        />

        <Route
          path="/analytics"
          element={
            <Layout currentPageName="Analytics">
              {" "}
              <Analytics />{" "}
            </Layout>
          }
        />
<Route
  path="/my-jobs/:id/assigned"
  element={
    <Layout currentPageName="MyJobs">
      <AssignedJobView />
    </Layout>
  }
/>

        <Route
          path="/my-jobs/:id/applicants"
          element={
            <Layout currentPageName="MyJobs">
             <ApplicantList/>
            </Layout>
          }
        />

        {/* 404 */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        {/* <Router basename="/current-project/react-project/EveryoneCourior"> */}
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}
