
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Replace this with your actual Google Client ID
const GOOGLE_CLIENT_ID = "149459573476-lc3gjhm1bd3dqu285cpjgd6d0v6602p3.apps.googleusercontent.com";

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
);
