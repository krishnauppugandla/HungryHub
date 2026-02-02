import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../../contexts/AuthContext";
import { API } from "../../../constants/api";
import toast from "react-hot-toast";

const GOOGLE_CLIENT_ID   = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const FB_APP_ID          = process.env.REACT_APP_FACEBOOK_APP_ID;
const APPLE_CLIENT_ID    = process.env.REACT_APP_APPLE_CLIENT_ID;
const APPLE_REDIRECT_URI = process.env.REACT_APP_APPLE_REDIRECT_URI || window.location.origin;

// ── SVG icons ─────────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const AppleIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

// ── Reusable button shell ──────────────────────────────────────────────────────
const ProviderButton = ({ onClick, isLoading, icon, label, textColor = "text-gray-700" }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={isLoading}
    className={`flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl border border-gray-200 font-medium text-sm transition-all hover:bg-gray-50 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed ${textColor}`}
  >
    {isLoading
      ? <span className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      : icon}
    {isLoading ? "Signing in…" : label}
  </button>
);

// ── Google button — lives in its own component so useGoogleLogin is only
//    called when GoogleOAuthProvider has a real clientId ─────────────────────
const GoogleButton = ({ onSuccess, isLoading }) => {
  const signIn = useGoogleLogin({
    onSuccess: (res) => onSuccess(res.access_token),
    onError:   ()    => toast.error("Google sign-in failed."),
  });

  return (
    <ProviderButton
      onClick={signIn}
      isLoading={isLoading}
      icon={<GoogleIcon />}
      label="Continue with Google"
    />
  );
};

// Shown when Google client ID is not configured yet
const GoogleButtonDisabled = () => (
  <ProviderButton
    onClick={() => toast("Set REACT_APP_GOOGLE_CLIENT_ID in .env and restart the server.", { icon: "ℹ️" })}
    isLoading={false}
    icon={<GoogleIcon />}
    label="Continue with Google"
  />
);

// ── Main exported component ────────────────────────────────────────────────────
const OAuthButtons = () => {
  const { oauthLogin }  = useAuth();
  const navigate        = useNavigate();
  const location        = useLocation();
  const from            = location.state?.from?.pathname || "/restaurants";

  const [loadingProvider, setLoadingProvider] = useState(null);
  const [fbReady,         setFbReady]         = useState(false);
  const [appleReady,      setAppleReady]      = useState(false);

  // ── Load Facebook SDK ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!FB_APP_ID) return;
    if (window.FB) { setFbReady(true); return; }
    window.fbAsyncInit = () => {
      window.FB.init({ appId: FB_APP_ID, cookie: true, xfbml: false, version: "v19.0" });
      setFbReady(true);
    };
    const s = document.createElement("script");
    s.src   = "https://connect.facebook.net/en_US/sdk.js";
    s.async = true;
    s.defer = true;
    document.body.appendChild(s);
  }, []);

  // ── Load Apple Sign In JS ──────────────────────────────────────────────────
  useEffect(() => {
    if (!APPLE_CLIENT_ID) return;
    if (window.AppleID) { setAppleReady(true); return; }
    const s    = document.createElement("script");
    s.src      = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
    s.async    = true;
    s.onload   = () => {
      window.AppleID.auth.init({ clientId: APPLE_CLIENT_ID, scope: "name email", redirectURI: APPLE_REDIRECT_URI, usePopup: true });
      setAppleReady(true);
    };
    document.head.appendChild(s);
  }, []);

  // ── Shared result handler ──────────────────────────────────────────────────
  const handleOAuth = async (provider, endpoint, payload) => {
    setLoadingProvider(provider);
    try {
      const user = await oauthLogin(endpoint, payload);
      toast.success(`Welcome${user.name ? `, ${user.name.split(" ")[0]}` : ""}! 👋`);
      navigate(
        user.role === "seller" ? "/seller" : user.role === "admin" ? "/admin" : from,
        { replace: true }
      );
    } catch (err) {
      toast.error(err.response?.data?.message || `${provider} sign-in failed. Try again.`);
    } finally {
      setLoadingProvider(null);
    }
  };

  // ── Facebook ───────────────────────────────────────────────────────────────
  const handleFacebook = () => {
    if (!FB_APP_ID) {
      toast("Set REACT_APP_FACEBOOK_APP_ID in .env and restart the server.", { icon: "ℹ️" });
      return;
    }
    if (!fbReady) { toast.error("Facebook SDK still loading, try again."); return; }
    window.FB.login(
      (response) => {
        if (response.authResponse) {
          handleOAuth("facebook", API.FACEBOOK_AUTH, { accessToken: response.authResponse.accessToken });
        } else {
          toast("Facebook sign-in cancelled.", { icon: "ℹ️" });
        }
      },
      { scope: "public_profile,email" }
    );
  };

  // ── Apple ──────────────────────────────────────────────────────────────────
  const handleApple = async () => {
    if (!APPLE_CLIENT_ID) {
      toast("Set REACT_APP_APPLE_CLIENT_ID in .env and restart the server.", { icon: "ℹ️" });
      return;
    }
    if (!appleReady) { toast.error("Apple SDK still loading, try again."); return; }
    try {
      const response = await window.AppleID.auth.signIn();
      handleOAuth("apple", API.APPLE_AUTH, {
        identityToken: response.authorization.id_token,
        fullName:      response.user?.name,
      });
    } catch (err) {
      if (err?.error !== "popup_closed_by_user") toast.error("Apple sign-in failed.");
    }
  };

  return (
    <div className="space-y-3">
      {/* Google — conditionally renders hook-based component */}
      {GOOGLE_CLIENT_ID
        ? <GoogleButton
            onSuccess={(token) => handleOAuth("google", API.GOOGLE_AUTH, { accessToken: token })}
            isLoading={loadingProvider === "google"}
          />
        : <GoogleButtonDisabled />
      }

      {/* Facebook */}
      <ProviderButton
        onClick={handleFacebook}
        isLoading={loadingProvider === "facebook"}
        icon={<FacebookIcon />}
        label="Continue with Facebook"
        textColor="text-[#1877F2]"
      />

      {/* Apple */}
      <ProviderButton
        onClick={handleApple}
        isLoading={loadingProvider === "apple"}
        icon={<AppleIcon />}
        label="Continue with Apple"
        textColor="text-gray-900"
      />
    </div>
  );
};

export default OAuthButtons;
