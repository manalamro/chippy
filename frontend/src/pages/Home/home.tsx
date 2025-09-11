import React, { useRef } from 'react';
import HeroSection from '../../components/heroSection';
import SweetTreatsMenu from '../../components/category';

const Home: React.FC = () => {
  // ✅ Type-safe ref to a div element
  const menuRef = useRef<HTMLDivElement | null>(null);

  // ✅ Smooth scroll function
  const scrollToMenu = () => {
    menuRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      {/* Pass scroll function as prop */}
      <HeroSection onCtaClick={scrollToMenu} />
      
      {/* Assign ref directly to SweetTreatsMenu wrapper */}
      <div ref={menuRef}>
        <SweetTreatsMenu />
      </div>
    </div>
  );
};

export default Home;
