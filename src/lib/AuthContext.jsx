import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { logoutUser } from "../api/ApiServices/logoutService";
import { updateDeviceNotificationToken } from "../api/ApiServices/notification/deviceTokenNotificationService";
import { requestNotificationPermission } from "../firebaseNotification";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => {
    return sessionStorage.getItem("token");
  });
  const login = async (data) => {
    const expiryTime = Date.now() + 60 * 60 * 1000;

    sessionStorage.setItem("token", data.payload.token);
    sessionStorage.setItem("user", JSON.stringify(data.payload.user));
    sessionStorage.setItem("isLoggedIn", "true");
    sessionStorage.setItem("tokenExpiry", String(expiryTime));

    setToken(data.payload.token);
    setUser(data.payload.user);

    // Update device notification token
    try {
      const notificationData = await requestNotificationPermission();

      // console.log("🔔 Notification data:", notificationData);

      if (notificationData) {
        const notificationResponse = await updateDeviceNotificationToken(
          data.payload.token,
          notificationData.device_type,
          notificationData.fcm_token,
        );

        // console.log("🔔 Device token API response:", notificationResponse);
      } else {
        // console.log("❌ No FCM token received");
      }
    } catch (error) {
      // console.error("❌ Notification token update failed:", error);
    }
  };
  // const updateUser = (updatedUser) => {
  //   localStorage.setItem("user", JSON.stringify(updatedUser));
  //   setUser(updatedUser);
  // };

  const updateUser = useCallback((updatedUser) => {
    sessionStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, []);

  const updateStripeStatus = (stripeStatus) => {
    setUser((prevUser) => {
      if (!prevUser) return prevUser;

      const updatedUser = {
        ...prevUser,

        stripe_account_id:
          stripeStatus.stripe_account_id ?? prevUser.stripe_account_id,

        stripe_onboarding_complete: stripeStatus.stripe_onboarding_complete,

        stripe_payouts_enabled: stripeStatus.stripe_payouts_enabled,

        stripe_details_submitted: stripeStatus.stripe_details_submitted,

        is_payout_ready: stripeStatus.is_payout_ready,
      };

      sessionStorage.setItem("user", JSON.stringify(updatedUser));

      return updatedUser;
    });
  };

  const logout = useCallback(async () => {
    try {
      if (token) {
        await logoutUser(token);
      }
    } catch (error) {
   
    } finally {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("isLoggedIn");
      sessionStorage.removeItem("tokenExpiry");

      setToken(null);
      setUser(null);
    }
  }, [token]);

  useEffect(() => {
    const expiry = sessionStorage.getItem("tokenExpiry");

    if (!token || !expiry) {
      return;
    }

    const remainingTime = Number(expiry) - Date.now();

    if (remainingTime <= 0) {
      logout();
      return;
    }

    const timer = setTimeout(() => {
      logout();
    }, remainingTime);

    return () => clearTimeout(timer);
  }, [token, logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        updateUser,
        updateStripeStatus,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
