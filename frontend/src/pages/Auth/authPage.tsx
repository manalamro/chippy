import React, { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { Globe, AlertCircle, RefreshCw, CheckCircle, Eye, EyeOff } from "lucide-react";
import { useUserStore } from "../../store/userStore";
import { useCartStore } from "../../store/cartStore";
import { useNavigate } from "react-router-dom";
import { getUserFriendlyError } from "../../lib/errorUtils";

const AuthPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupErrors, setSignupErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const { loginUser, signupUser, loading, error, user } = useUserStore();
  const cartStore = useCartStore();

  // Set document direction and language based on saved preference
  useEffect(() => {
    const savedLang = localStorage.getItem("language") || "en";
    if (savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
    document.documentElement.dir = savedLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = savedLang;
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
          setAuthError(t('error.generic'));
        }
      } else if (user) {
        redirectUser(user);
      }
      setIsCheckingAuth(false);
    };
    checkAuth();
  }, [t, user]);

  // Clear success message when there's an error
  useEffect(() => {
    if (error) {
      setSuccessMessage(null);
      setAuthError(getUserFriendlyError(error, t));
    }
  }, [error, t]);

  // Clear messages when switching tabs
  useEffect(() => {
    setAuthError(null);
    setSuccessMessage(null);
  }, [isLogin]);

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

  const handleRetry = () => {
    setAuthError(null);
    setSuccessMessage(null);
  };

  // Updated toggleLanguage to save in localStorage
  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
    localStorage.setItem("language", newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setSuccessMessage(null);
    
    try {
      await loginUser(loginEmail, loginPassword);
      // Check if there's no error before showing success message
      if (!error && !authError) {
        setSuccessMessage(t('auth.loginSuccess'));
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      setAuthError(getUserFriendlyError(err, t));
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setSuccessMessage(null);
    
    // Validate all fields before submit
    const nextErrors: { name?: string; email?: string; password?: string } = {};
    if (!signupName.trim()) {
      nextErrors.name = t('validation.fullNameRequired');
    } else if (signupName.trim().length < 2) {
      nextErrors.name = t('validation.fullNameTooShort');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!signupEmail.trim()) {
      nextErrors.email = t('validation.email');
    } else if (!emailRegex.test(signupEmail.trim())) {
      nextErrors.email = t('validation.invalidEmail');
    }
    
    if (!signupPassword) {
      nextErrors.password = t('validation.password');
    } else if (signupPassword.length < 8) {
      nextErrors.password = t('validation.passwordTooShort');
    }
    
    setSignupErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    
    try {
      await signupUser(signupName, signupEmail, signupPassword);
      // Check if there's no error before showing success message
      if (!error && !authError) {
        setSuccessMessage(t('auth.signupSuccess'));
      }
    } catch (err: any) {
      console.error('Signup failed:', err);
      setAuthError(getUserFriendlyError(err, t));
    }
  };

  const validateSignupNameOnBlur = () => {
    const value = signupName.trim();
    setSignupErrors((prev) => ({
      ...prev,
      name: !value
        ? t('validation.fullNameRequired')
        : value.length < 2
          ? t('validation.fullNameTooShort')
          : undefined,
    }));
  };

  const validateSignupEmailOnBlur = () => {
    const value = signupEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setSignupErrors((prev) => ({
      ...prev,
      email: !value
        ? t('validation.email')
        : !emailRegex.test(value)
          ? t('validation.invalidEmail')
          : undefined,
    }));
  };

  const validateSignupPasswordOnBlur = () => {
    setSignupErrors((prev) => ({
      ...prev,
      password: !signupPassword 
        ? t('validation.password') 
        : signupPassword.length < 8 
          ? t('validation.passwordTooShort')
          : undefined,
    }));
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #FAF3E0, #FDFBF7)' }}>
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#7B4B27]/20 border-t-[#7B4B27] mx-auto mb-4"></div>
            <div className="absolute inset-0 rounded-full h-12 w-12 border-4 border-transparent border-r-[#7B4B27]/40 mx-auto animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          <p className="text-lg" style={{ color: '#3E2723' }}>{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative"
      style={{ background: 'linear-gradient(to bottom right, #FAF3E0, #FDFBF7)' }}>
      
      {/* Language Toggle */}
      <div className={`absolute top-4 ${i18n.language === 'ar' ? 'left-6' : 'right-6'}`}>
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
            <button 
              className={`flex-1 flex items-center justify-center font-medium transition-all duration-300 py-4 ${isLogin ? 'text-white bg-amber-900 bg-opacity-30' : 'text-amber-900 bg-white'}`} 
              onClick={() => setIsLogin(true)}
            >
              {t("auth.login")}
            </button>
            <button 
              className={`flex-1 flex items-center justify-center font-medium transition-all duration-300 py-4 ${!isLogin ? 'text-white bg-amber-900 bg-opacity-30' : 'text-amber-900 bg-white'}`} 
              onClick={() => setIsLogin(false)}
            >
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
          
          {/* Error Display */}
          {(authError || error) && !successMessage && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
                  <p className="text-red-800 text-sm">{authError || error}</p>
                </div>
                <button
                  onClick={handleRetry}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          
          {/* Success Message */}
          {successMessage && !(authError || error) && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                <p className="text-green-800 text-sm">{successMessage}</p>
              </div>
            </div>
          )}
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
                    dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
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
                      dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
                    />
                    <button 
                      type="button" 
                      className={`absolute inset-y-0 ${i18n.language === 'ar' ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center cursor-pointer hover:bg-gray-100 rounded-lg transition-colors`} 
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                    </button>
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={loading || !loginEmail || !loginPassword} 
                  className="w-full text-white py-2 px-4 mt-4 rounded-lg font-medium transition-colors hover:shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed" 
                  style={{ background: 'linear-gradient(to right, #A97155, #D9A441)' }}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t("loading")}
                    </>
                  ) : (
                    t("auth.signIn")
                  )}
                </button>
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
                    onBlur={validateSignupNameOnBlur}
                    placeholder={t("auth.enterName")}
                    className={`w-full pl-3 pr-4 py-2 border rounded-lg ${signupErrors.name ? 'border-red-400' : ''}`}
                    aria-invalid={!!signupErrors.name}
                    dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
                  />
                  {signupErrors.name && (
                    <p className="mt-1 text-xs text-red-600">{signupErrors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("auth.email")}</label>
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    onBlur={validateSignupEmailOnBlur}
                    placeholder={t("auth.enterEmail")}
                    className={`w-full pl-3 pr-4 py-2 border rounded-lg ${signupErrors.email ? 'border-red-400' : ''}`}
                    aria-invalid={!!signupErrors.email}
                    dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
                  />
                  {signupErrors.email && (
                    <p className="mt-1 text-xs text-red-600">{signupErrors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("auth.password")}</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      onBlur={validateSignupPasswordOnBlur}
                      placeholder={t("auth.createPassword")}
                      className={`w-full pl-3 pr-10 py-2 border rounded-lg ${signupErrors.password ? 'border-red-400' : ''}`}
                      aria-invalid={!!signupErrors.password}
                      dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
                    />
                    <button 
                      type="button" 
                      className={`absolute inset-y-0 ${i18n.language === 'ar' ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center cursor-pointer hover:bg-gray-100 rounded-lg transition-colors`} 
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                    </button>
                  </div>
                  {signupErrors.password && (
                    <p className="mt-1 text-xs text-red-600">{signupErrors.password}</p>
                  )}
                </div>
                <button 
                  type="submit" 
                  disabled={loading || !signupName || !signupEmail || !signupPassword || !!signupErrors.name || !!signupErrors.email || !!signupErrors.password} 
                  className="w-full text-white py-2 px-4 mt-4 rounded-lg font-medium transition-colors hover:shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed" 
                  style={{ background: 'linear-gradient(to right, #A97155, #D9A441)' }}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t("loading")}
                    </>
                  ) : (
                    t("auth.createAccount")
                  )}
                </button>
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
            <h3 className="text-lg font-semibold mb-4">{t("auth.notice")}</h3>
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