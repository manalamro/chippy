import { motion } from "framer-motion";
import { Truck, Star, Cookie } from "lucide-react";
import { useTranslation } from "react-i18next";
import bgImage from "../assets/heroSection.png";

// ✅ Type the prop
type HeroSectionProps = {
  onCtaClick?: () => void;
};

const HeroSection: React.FC<HeroSectionProps> = ({ onCtaClick }) => {
  const { t } = useTranslation();

  return (
    <section
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#FAF3E0] to-[#FDFBF7]"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-[#FAF3E0]/80 backdrop-blur-sm" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 text-center px-6 sm:px-8 lg:px-12"
      >
        <div className="bg-white/90 border border-[#E6D5C3]/60 backdrop-blur-lg rounded-3xl p-8 sm:p-10 lg:p-14 shadow-xl max-w-2xl lg:w-4xl">
          
          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#3E2723] leading-tight tracking-tight">
            {t("HERO.TITLE_LINE1")}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A97155] to-[#D9A441]">
              {t("HERO.TITLE_LINE2")}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl mt-6 mb-10 text-[#5C3D2E] leading-relaxed whitespace-pre-line">
            {t("HERO.SUBTITLE")}
          </p>

          {/* CTA Button */}
          <motion.button
            whileHover={{
              scale: 1.08,
              boxShadow: "0px 6px 20px rgba(0,0,0,0.2)",
              backgroundPosition: "100% 0",
            }}
            whileTap={{ scale: 0.96 }}
            onClick={onCtaClick} // ✅ Now properly typed
            className="bg-gradient-to-r from-[#A97155] to-[#D9A441] 
                       text-white font-semibold py-3 px-10 md:py-4 md:px-12 
                       rounded-full text-lg shadow-md transition-all duration-500 
                       bg-[length:200%_100%] bg-left hover:bg-right cursor-pointer"
          >
            {t("HERO.CTA_BUTTON")}
          </motion.button>

          {/* Features */}
          <div className="mt-10 grid grid-cols-3 gap-6">
            {[
              { icon: <Cookie className="w-6 h-6" />, label: t("HERO.FEATURES.FRESH_BAKERY") },
              { icon: <Truck className="w-6 h-6" />, label: t("HERO.FEATURES.FAST_DELIVERY") },
              { icon: <Star className="w-6 h-6" />, label: t("HERO.FEATURES.PREMIUM_QUALITY") },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -6, scale: 1.05 }}
                className="flex flex-col items-center"
              >
                <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-[#FAF3E0] to-[#FDFBF7] rounded-full shadow-md text-[#7B4B27]">
                  {item.icon}
                </div>
                <span className="text-sm mt-3 text-[#3E2723] font-medium">
                  {item.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Bottom Gradient Border */}
      <div className="absolute bottom-0 left-0 w-full h-3 bg-gradient-to-r from-[#7B4B27] via-[#A97155] to-[#D9A441]" />
    </section>
  );
};

export default HeroSection;
