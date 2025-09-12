import React, { useState, useEffect, useRef } from "react";
import { User, ShoppingCart, Menu, X, Cookie, Cake, Coffee, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCartStore } from "../store/cartStore";
import { useUserStore } from "../store/userStore"; // ✅ Import user store
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const { cart } = useCartStore();
  const logoutUser = useUserStore((state) => state.logoutUser); // ✅ Get logout function
  const user = useUserStore((state) => state.user); // ✅ Get user info
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const cartItemsCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  useEffect(() => {
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const toggleLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang); // حفظ اللغة المختارة
    setIsLangDropdownOpen(false);
  };
  
  const buttonBaseStyles =
    "p-2 text-[#3E2723] hover:text-[#A97155] transition-all duration-300 hover:bg-[#F6C1B1]/30 rounded-full hover:scale-110";

  // User Dropdown
  const UserDropdown: React.FC<{ isMobile?: boolean }> = ({ isMobile = false }) => (
    <div className="relative" ref={userDropdownRef}>
      <button
        className={buttonBaseStyles}
        aria-label="User menu"
        onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
      >
        <User size={isMobile ? 22 : 20} />
      </button>
      {isUserDropdownOpen && (
        <div
          className={`
            absolute mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 w-36 min-w-max
            ${i18n.language === "ar" ? "left-0" : "right-0"}
          `}
        >
          {!user && (
            <button
              onClick={() => {
                setIsUserDropdownOpen(false);
                navigate("/auth");
              }}
              className={`block w-full px-4 py-2 hover:bg-[#F6C1B1]/20 transition-colors ${
                i18n.language === "ar" ? "text-right" : "text-left"
              }`}
            >
              {t("login", { defaultValue: "Login" })}
            </button>
          )}

          {user && (
            <>
              <Link
                to="/orders"
                className={`block w-full px-4 py-2 hover:bg-[#F6C1B1]/20 transition-colors ${
                  i18n.language === "ar" ? "text-right" : "text-left"
                }`}
                onClick={() => setIsUserDropdownOpen(false)}
              >
                {t("myOrders", { defaultValue: "My Orders" })}
              </Link>

              <button
                onClick={() => {
                  logoutUser();
                  setIsUserDropdownOpen(false);
                  navigate("/");
                }}
                className={`block w-full px-4 py-2 hover:bg-[#F6C1B1]/20 transition-colors ${
                  i18n.language === "ar" ? "text-right" : "text-left"
                }`}
              >
                {t("logout", { defaultValue: "Logout" })}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );

  // Cart icon
  const CartIcon: React.FC<{ isMobile?: boolean }> = ({ isMobile = false }) => (
    <Link to="/cart" className={`${buttonBaseStyles} relative`} aria-label="Shopping cart">
      <ShoppingCart size={isMobile ? 22 : 20} />
      {cartItemsCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {cartItemsCount}
        </span>
      )}
    </Link>
  );

  // Language dropdown
  const LanguageDropdown: React.FC<{ isMobile?: boolean }> = ({ isMobile = false }) => (
    <div className="relative" ref={langDropdownRef}>
      <button
        className={buttonBaseStyles}
        aria-label="Select language"
        onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
      >
        <Globe size={isMobile ? 22 : 20} />
      </button>
      {isLangDropdownOpen && (
        <div
          className={`
            absolute mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 w-32 min-w-max
            ${i18n.language === "ar" ? "left-0" : "right-0"}
          `}
        >
          <button
            className={`block w-full px-4 py-2 hover:bg-[#F6C1B1]/20 transition-colors rounded-t-md ${
              i18n.language === "ar" ? "text-right" : "text-left"
            } ${i18n.language === "en" ? "bg-[#F6C1B1]/10 font-medium" : ""}`}
            onClick={() => toggleLanguage("en")}
          >
            English
          </button>
          <button
            className={`block w-full px-4 py-2 hover:bg-[#F6C1B1]/20 transition-colors rounded-b-md ${
              i18n.language === "ar" ? "text-right" : "text-left"
            } ${i18n.language === "ar" ? "bg-[#F6C1B1]/10 font-medium" : ""}`}
            onClick={() => toggleLanguage("ar")}
          >
            العربية
          </button>
        </div>
      )}
    </div>
  );

  // Decorative line icons
  const DecorativeElements: React.FC = () => (
    <div
      className={`flex items-center justify-center pt-4 opacity-60 ${
        i18n.language === "ar" ? "space-x-reverse space-x-2" : "space-x-2"
      }`}
    >
      <Cookie className="text-[#7B4B27]" size={16} />
      <div className="w-8 h-0.5 bg-gradient-to-r from-[#7B4B27]/50 to-[#A97155]/50" />
      <Cake className="text-[#A97155]" size={16} />
      <div className="w-8 h-0.5 bg-gradient-to-r from-[#A97155]/50 to-[#D9A441]/50" />
      <Coffee className="text-[#D9A441]" size={16} />
    </div>
  );

  const navItems = [
    { name: t("home"), href: "/" },
    { name: t("products"), href: "/products" },
    { name: t("about"), href: "/aboutUs" },
  ];

  return (
    <header className="w-full font-sans bg-white/70 backdrop-blur-md shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              to="/"
              className="text-2xl font-extrabold bg-gradient-to-r from-[#7B4B27] to-[#A97155] bg-clip-text text-transparent tracking-wide hover:scale-105 transition-transform duration-300"
            >
              CHIPPY
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8" role="navigation">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-[#3E2723] hover:text-[#A97155] px-3 py-2 text-sm font-medium transition-all duration-300 relative group"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#A97155] to-[#D9A441] transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Desktop Icons */}
          <div className="hidden md:flex items-center space-x-4">
            <UserDropdown />
            <CartIcon />
            <LanguageDropdown />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className={`md:hidden ${buttonBaseStyles}`}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white backdrop-blur-md border-t border-[#D9A441]/30 shadow-lg z-50 animate-fadeIn">
          <div className="px-2 pt-2 pb-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="block text-center py-3 text-base font-medium text-[#3E2723] hover:text-[#A97155] hover:bg-gradient-to-r hover:from-[#F6C1B1]/20 hover:to-[#D9A441]/20 rounded-lg transition-all duration-300 mx-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            <div className="flex items-center justify-center gap-6 pt-4 mt-4 relative">
              <UserDropdown isMobile />
              <CartIcon isMobile />
              <LanguageDropdown isMobile />
            </div>

            <DecorativeElements />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
