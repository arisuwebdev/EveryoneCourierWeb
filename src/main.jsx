

// import ReactDOM from "react-dom/client";
// import App from "./App";
// import "./index.css";

// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// ReactDOM.createRoot(document.getElementById("root")).render(
//   <>
//     <App />
//     <ToastContainer position="top-right" autoClose={3000} />
//   </>
// );



import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
);