import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google"; // Import thư viện mới
import "./index.css";

// Thay chuỗi này bằng Client ID thật của bạn từ Google Cloud Console
const CLIENT_ID = "978371992192-sp59ej99928trm83dgoe6ta0cq3vt4p4.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* Bọc App lại bằng GoogleOAuthProvider */}
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <App />
      <Toaster position="top-right" />
    </GoogleOAuthProvider>
  </React.StrictMode>
);