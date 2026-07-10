// import React, { createContext, useState, useContext } from "react";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isLoadingAuth, setIsLoadingAuth] = useState(false);
//   const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
//   const [authError, setAuthError] = useState(null);
//   const [appPublicSettings, setAppPublicSettings] = useState(null);

//   const checkAppState = async () => {
//     // No backend currently
//     setIsLoadingAuth(false);
//     setIsLoadingPublicSettings(false);
//   };


//   const logout = () => {
//     setUser(null);
//     setIsAuthenticated(false);
//   };


//   const navigateToLogin = () => {
//     // Add your own login route later
//     console.log("Login required");
//   };


//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         setUser,
//         isAuthenticated,
//         setIsAuthenticated,
//         isLoadingAuth,
//         isLoadingPublicSettings,
//         authError,
//         appPublicSettings,
//         logout,
//         navigateToLogin,
//         checkAppState
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };


// export const useAuth = () => {
//   const context = useContext(AuthContext);

//   if (!context) {
//     throw new Error("useAuth must be used within AuthProvider");
//   }

//   return context;
// };


import { createContext, useContext, useState } from "react";
import { logoutUser } from "../api/ApiServices/logoutService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );

  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const login = (data) => {
    localStorage.setItem("token", data.payload.token);
    localStorage.setItem("user", JSON.stringify(data.payload.user));
    localStorage.setItem("isLoggedIn", "true");

    setToken(data.payload.token);
    setUser(data.payload.user);
  };

 const logout = async () => {
  try {
    if (token) {
      await logoutUser(token);
    }
  } catch (error) {
    
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");

    setToken(null);
    setUser(null);
  }
};

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);