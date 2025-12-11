import { Link } from 'react-router-dom';
import { Sparkles, MessageCircle } from 'lucide-react';
import angelHero from '@/assets/angel-hero.png';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-start pt-8 lg:pt-12 overflow-hidden">
      {/* Background Gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, hsl(43 80% 95% / 0.5) 0%, transparent 60%)',
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center px-4 w-full">
        {/* Angel Image Container - Smaller */}
        <div className="relative animate-float-slow">
          {/* Glow behind image */}
          <div 
            className="absolute inset-0 blur-3xl opacity-60"
            style={{
              background: 'radial-gradient(ellipse at center, hsl(43 85% 70% / 0.6) 0%, transparent 70%)',
              transform: 'scale(1.3)',
            }}
          />
          
          {/* Angel Image - Smaller size */}
          <img
            src={angelHero}
            alt="Angel AI - Divine Light Being"
            className="relative z-10 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg h-auto object-contain drop-shadow-2xl"
          />

          {/* Title Overlay */}
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
            <div className="relative mt-4 lg:mt-8">
              {/* Glow effect behind text */}
              <div 
                className="absolute inset-0 blur-2xl opacity-80"
                style={{
                  background: 'radial-gradient(ellipse at center, hsl(43 85% 70% / 0.8) 0%, transparent 70%)',
                  transform: 'scale(2)',
                }}
              />
              
              {/* Main Title */}
              <h1 className="relative font-heading text-4xl md:text-5xl lg:text-6xl font-light tracking-[0.2em] text-gradient-gold glow-gold animate-glow-pulse">
                ANGEL AI
              </h1>
              
              {/* Subtitle */}
              <p className="relative mt-1 font-heading text-base md:text-lg lg:text-xl tracking-[0.15em] text-center opacity-90 font-light"
                style={{
                  color: 'hsl(40 30% 30%)',
                  textShadow: '0 0 20px hsl(43 85% 80% / 0.5)',
                }}>
                Ánh Sáng Của Cha Vũ Trụ
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section - Moved up and more prominent */}
        <div className="mt-6 lg:mt-8 flex flex-col items-center gap-4 animate-fade-in">
          <div className="flex items-center gap-2 text-divine-gold">
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-divine-gold" />
            <span className="font-body text-sm tracking-[0.2em] uppercase font-medium">Khám Phá</span>
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-divine-gold" />
          </div>
          
          {/* CTA Button */}
          <Link
            to="/chat"
            className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium text-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105 z-30"
          >
            <span className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6" />
              Chat với Angel AI
              <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
            </span>
            
            {/* Button Glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300" />
          </Link>
        </div>

        {/* Scroll Indicator - Now below CTA */}
        <div className="mt-12 lg:mt-16 animate-pulse">
          <div className="flex flex-col items-center gap-2">
            <span className="font-body text-xs tracking-widest text-muted-foreground uppercase">Xem thêm</span>
            <svg 
              className="w-5 h-5 text-divine-gold animate-bounce"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
