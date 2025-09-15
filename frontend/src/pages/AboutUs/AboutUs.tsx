// Remove unused React import
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AboutUs = () => {
  const { t } = useTranslation();

  const contactInfo = [
    { icon: <Phone className="w-6 h-6" />, label: t("contactUs.phone"), value: "+1 234 567 890" },
    { icon: <Mail className="w-6 h-6" />, label: t("contactUs.email"), value: "hello@coffeeandcookies.com" },
    { icon: <MapPin className="w-6 h-6" />, label: t("contactUs.address"), value: t("contactUs.fullAddress") },
    { icon: <Clock className="w-6 h-6" />, label: t("contactUs.hours"), value: t("contactUs.weekdays") + "\n" + t("contactUs.weekend") },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 font-sans">

      {/* Header Section */}
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#3E2723] mb-4">
          {t("aboutUs.title")}
        </h1>
        <p className="text-lg text-[#5C3D2E] max-w-2xl mx-auto leading-relaxed">
          {t("aboutUs.subtitle.part1")} <span className="font-medium text-[#A97155]">{t("aboutUs.subtitle.coffee")}</span> {t("aboutUs.subtitle.and")} <span className="font-medium text-[#D9A441]">{t("aboutUs.subtitle.cookies")}</span>. {t("aboutUs.subtitle.part2")}
        </p>
      </div>

      {/* Story Section */}
      <div className="flex flex-col lg:flex-row gap-10 items-center mb-20">
        <div className="lg:w-1/2">
          <div className="bg-gradient-to-br from-[#FAF3E0] to-[#FDFBF7] p-8 rounded-3xl shadow-md">
            <h2 className="text-2xl font-semibold text-[#3E2723] mb-4 text-center">{t("aboutUs.story.title")}</h2>
            <p className="text-[#5C3D2E] leading-relaxed">
              {t("aboutUs.story.content")}
            </p>
          </div>
        </div>
        <div className="lg:w-1/2 rounded-2xl overflow-hidden shadow-md">
          <img
            src="https://images.unsplash.com/photo-1511920170033-f8396924c348"
            alt={t("aboutUs.story.imageAlt")}
            className="w-full h-[350px] object-cover"
          />
        </div>
      </div>

      {/* Mission & Promise */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
        <div className="p-8 rounded-3xl bg-gradient-to-br from-[#FAF3E0] to-[#FDFBF7] shadow-md">
          <h2 className="text-xl font-semibold text-[#3E2723] mb-4 text-center">{t("aboutUs.mission.title")}</h2>
          <p className="text-[#5C3D2E] leading-relaxed">
            {t("aboutUs.mission.content")}
          </p>
        </div>
        <div className="p-8 rounded-3xl bg-gradient-to-br from-[#FAF3E0] to-[#FDFBF7] shadow-md">
          <h2 className="text-xl font-semibold text-[#3E2723] mb-4 text-center">{t("aboutUs.promise.title")}</h2>
          <p className="text-[#5C3D2E] leading-relaxed">
            {t("aboutUs.promise.content")}
          </p>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gradient-to-br">
        <h2 className="text-2xl font-bold text-[#3E2723] mb-8 text-center">{t("contactUs.title")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactInfo.map((item, i) => (
            <div key={i} className="text-center">
              <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-[#FAF3E0] to-[#FDFBF7] rounded-full shadow-md text-[#7B4B27] mx-auto mb-3">
                {item.icon}
              </div>
              <p className="font-medium text-[#3E2723] text-sm mb-1">{item.label}</p>
              <p className="text-[#5C3D2E] text-sm whitespace-pre-line">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutUs;