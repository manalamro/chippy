import React, { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { useUserStore } from "../../store/userStore";
import { useCartStore } from "../../store/cartStore";
import { useNavigate } from "react-router-dom";

const AuthPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const { loginUser, signupUser, loading, error, user } = useUserStore();
  const cartStore = useCartStore();

  // Set document direction based on selected language
  useEffect(() => {
    const savedLang = localStorage.getItem("language");
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token && !user) {
        try {
          const storedUser = useUserStore.getState().user;
          if (storedUser) {
            redirectUser(storedUser);
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('token');
        }
      } else if (user) {
        redirectUser(user);
      }
      setIsCheckingAuth(false);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      redirectUser(user);
    }
  }, [user]);

  const redirectUser = (userData: any) => {
    cartStore.fetchCart(String(userData.id));
    if (userData.role === "ADMIN") {
      navigate("/admin", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  };

  const handleContinueAsGuest = () => setShowGuestModal(true);
  const handleGuestConfirm = () => {
    setShowGuestModal(false);
    navigate("/cart");
  };

  // Updated toggleLanguage to save in localStorage
  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
    localStorage.setItem("language", newLang); // save selection
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginUser(loginEmail, loginPassword);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    await signupUser(signupName, signupEmail, signupPassword);
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #FAF3E0, #FDFBF7)' }}>
        <div className="text-lg" style={{ color: '#3E2723' }}>Checking authentication...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative"
      style={{ background: 'linear-gradient(to bottom right, #FAF3E0, #FDFBF7)' }}>
      
      {/* Language Toggle */}
      <div className="absolute top-4 right-6">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1 px-3 py-1 text-sm rounded-lg bg-white/80 border border-gray-200 shadow hover:bg-gray-100 transition cursor-pointer"
        >
          <Globe className="w-4 h-4" />
          <span>{i18n.language === "en" ? "العربية" : "English"}</span>
        </button>
      </div>

      {/* Auth form container */}
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl relative"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid rgba(230, 213, 195, 0.6)' }}>
        
        {/* Login/Register Tabs */}
        <div className="relative flex flex-col" style={{ background: 'linear-gradient(to right, #7B4B27, #A97155, #D9A441)' }}>
          <div className="flex">
            <button className={`flex-1 flex items-center justify-center font-medium transition-all duration-300 py-4 ${isLogin ? 'text-white bg-amber-900 bg-opacity-30' : 'text-amber-900 bg-white'}`} onClick={() => setIsLogin(true)}>
              {t("auth.login")}
            </button>
            <button className={`flex-1 flex items-center justify-center font-medium transition-all duration-300 py-4 ${!isLogin ? 'text-white bg-amber-900 bg-opacity-30' : 'text-amber-900 bg-white'}`} onClick={() => setIsLogin(false)}>
              {t("auth.register")}
            </button>
          </div>
          <div className={`absolute bottom-0 h-1 bg-amber-900 transition-all duration-500 ${isLogin ? 'left-0 w-1/2' : 'left-1/2 w-1/2'}`}></div>
        </div>

        {/* Form Content */}
        <div className="px-6 pt-10 pb-2">
          <h2 className="text-2xl font-bold mb-1" style={{ color: '#3E2723' }}>
            {isLogin ? t("auth.welcomeBack") : t("auth.joinUs")}
          </h2>
          <p className="text-sm" style={{ color: '#5C3D2E' }}>
            {isLogin ? t("auth.signInMessage") : t("auth.registerMessage")}
          </p>
        </div>

        <div className="relative w-full h-[350px] perspective">
          <div className={`relative w-full h-full transition-transform duration-700 preserve-3d ${isLogin ? '' : 'rotate-y-180'}`}>

            {/* Login Form */}
            <div className="absolute w-full h-full backface-hidden p-6 overflow-y-auto">
              <form className="space-y-4" onSubmit={handleLogin}>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("auth.email")}</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder={t("auth.enterEmail")}
                    className="w-full pl-3 pr-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("auth.password")}</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder={t("auth.enterPassword")}
                      className="w-full pl-3 pr-10 py-2 border rounded-lg"
                    />
                    <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full text-white py-2 px-4 mt-4 rounded-lg font-medium transition-colors hover:shadow-lg flex items-center justify-center" style={{ background: 'linear-gradient(to right, #A97155, #D9A441)' }}>
                  {loading ? t("auth.loading") : t("auth.signIn")}
                </button>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </form>
            </div>

            {/* Signup Form */}
            <div className="absolute w-full h-full backface-hidden rotate-y-180 p-6 overflow-y-auto">
              <form className="space-y-4" onSubmit={handleSignup}>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("auth.name")}</label>
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder={t("auth.enterName")}
                    className="w-full pl-3 pr-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("auth.email")}</label>
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder={t("auth.enterEmail")}
                    className="w-full pl-3 pr-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("auth.password")}</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder={t("auth.createPassword")}
                    className="w-full pl-3 pr-4 py-2 border rounded-lg"
                  />
                </div>
                <button type="submit" disabled={loading} className="w-full text-white py-2 px-4 mt-4 rounded-lg font-medium transition-colors hover:shadow-lg flex items-center justify-center" style={{ background: 'linear-gradient(to right, #A97155, #D9A441)' }}>
                  {loading ? t("auth.loading") : t("auth.createAccount")}
                </button>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </form>
            </div>

          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="relative flex items-center my-4">
            <div className="flex-grow border-t" style={{ borderColor: '#E6D5C3' }}></div>
            <span className="flex-shrink mx-3 text-sm" style={{ color: '#5C3D2E' }}>{t("auth.or")}</span>
            <div className="flex-grow border-t" style={{ borderColor: '#E6D5C3' }}></div>
          </div>

          <button onClick={handleContinueAsGuest} className="w-full py-2 font-medium transition-colors flex items-center justify-center cursor-pointer" style={{ color: '#5C3D2E' }}>
            {t("auth.continueGuest")}
          </button>
        </div>

        <div className="h-2 w-full" style={{ background: 'linear-gradient(to right, #7B4B27, #A97155, #D9A441)' }}></div>
      </div>

      {showGuestModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm text-center">
            <h3 className="text-lg font-semibold mb-4">Notice</h3>
            <p className="mb-6">{t("auth.guestNotice")}</p>
            <div className="flex justify-center gap-4">
              <button onClick={handleGuestConfirm} className="px-4 py-2 bg-amber-900 text-white rounded-lg hover:bg-amber-800 transition cursor-pointer">
                {t("auth.goToCart")}
              </button>
              <button onClick={() => setShowGuestModal(false)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition cursor-pointer">
                {t("auth.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .perspective { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default AuthPage;
