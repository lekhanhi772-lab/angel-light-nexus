import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, ArrowRight, ArrowUp } from 'lucide-react';
import angelAvatar from '@/assets/angel-avatar.png';

const HeroSection = () => {
  const { t } = useTranslation();
  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden py-20">
      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center px-4 w-full max-w-6xl">
        
        {/* Angel Image with Golden Border - Clean, no effects */}
        <div className="relative mb-2 md:mb-3">
          {/* Golden border ring */}
          <div 
            className="relative rounded-full p-[2px]"
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #DAA520 50%, #FFD700 100%)',
              width: 'fit-content',
            }}
          >
            {/* Angel Image - Perfect Circle */}
            <div className="relative z-10 w-[150px] h-[150px] sm:w-[175px] sm:h-[175px] md:w-[200px] md:h-[200px] lg:w-[225px] lg:h-[225px] rounded-full overflow-hidden">
              <img
                src={angelAvatar}
                alt="Angel AI - Divine Light Being"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </div>

        {/* Title Section */}
        <div className="text-center mb-8 md:mb-12">
          <div className="relative">
            {/* Main Title - Clean */}
            <h1 
              className="relative text-[60px] sm:text-[80px] md:text-[100px] lg:text-[130px] font-black italic tracking-[0.02em] text-primary"
              style={{
                fontFamily: "'Playfair Display', serif",
              }}
            >
              Angel AI
            </h1>
            
            {/* Decorative Elements - Simple */}
            <div className="flex items-center justify-center gap-4 mt-3">
              <div className="h-px w-16 sm:w-24 bg-gradient-to-r from-transparent via-primary to-transparent" />
              <div className="flex gap-2">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="text-primary text-sm">✦</span>
                <Sparkles className="w-3 h-3 text-primary" />
              </div>
              <div className="h-px w-16 sm:w-24 bg-gradient-to-r from-transparent via-primary to-transparent" />
            </div>
            
            {/* Tagline - Clean */}
            <p 
              className="mt-4 font-cormorant italic text-[28px] sm:text-[34px] md:text-[40px] lg:text-[48px] tracking-[0.04em] font-bold text-secondary dark:text-secondary"
            >
              {t('hero.tagline')}
            </p>
          </div>
        </div>

        {/* CTA Button - Simple style */}
        <div className="flex flex-col items-center justify-center">
          <Link 
            to="/chat" 
            className="px-12 py-5 rounded-full font-playfair text-xl font-bold tracking-wider text-primary-foreground transition-colors duration-300 hover:opacity-90 bg-primary"
          >
            <span className="flex items-center gap-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              {t('hero.cta')}
            </span>
          </Link>
          
          {/* Lời mời gọi ấm áp với mũi tên hướng lên */}
          <div className="mt-4 flex flex-col items-center group cursor-pointer">
            {/* Mũi tên hướng lên */}
            <div className="mb-2 transition-all duration-300 group-hover:scale-125">
              <ArrowUp 
                className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 transition-all duration-300 text-primary drop-shadow-lg"
              />
            </div>
            
            {/* Dòng chữ mời gọi */}
            <p className="text-center font-playfair text-base sm:text-lg md:text-xl italic tracking-wide px-4 transition-all duration-300 group-hover:scale-105 text-primary">
              {t('hero.invite')} 💛
            </p>
          </div>
        </div>

        {/* Sacred Channel Text - Clean */}
        <div className="text-center mt-8">
          <p className="font-playfair text-lg md:text-2xl lg:text-3xl font-bold leading-tight text-primary">
            {t('hero.platform')}
          </p>
        </div>

        {/* FUN Ecosystem Card - Simple, no hover effects */}
        <Link to="/fun-ecosystem" className="mt-10 mb-20 block">
          <div className="relative p-10 md:p-12 rounded-2xl max-w-3xl mx-auto transition-transform duration-300 hover:scale-[1.02] bg-card border border-border">
            <div className="relative z-10 text-center">
              {/* Decorative stars */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-primary">✦</span>
                <Sparkles className="w-5 h-5 text-primary" />
              </div>

              <h3 className="font-cinzel text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-primary">
                {t('hero.explore_ecosystem')}
              </h3>
              
              <p className="font-lora text-base md:text-lg mb-6 max-w-xl mx-auto font-medium text-foreground">
                {t('hero.ecosystem_description')}
              </p>

              <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-poppins text-base md:text-lg font-bold bg-primary text-primary-foreground">
                <Sparkles className="w-5 h-5" />
                {t('hero.enter_ecosystem')}
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;
