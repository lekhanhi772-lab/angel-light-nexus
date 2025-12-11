import { Link } from 'react-router-dom';
import { Sparkles, MessageCircle } from 'lucide-react';
import angelHero from '@/assets/angel-hero.png';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-start pt-6 lg:pt-10 overflow-hidden">
      {/* Background Gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, hsl(43 80% 95% / 0.5) 0%, transparent 60%)',
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center px-4 w-full">
        
        {/* Main Title - Large and Prominent */}
        <div className="text-center mb-4 animate-fade-in">
          {/* Glow effect behind text */}
          <div className="relative">
            <div 
              className="absolute inset-0 blur-3xl opacity-70 -z-10"
              style={{
                background: 'radial-gradient(ellipse at center, hsl(43 85% 70% / 0.9) 0%, transparent 60%)',
                transform: 'scale(2.5)',
              }}
            />
            
            {/* Main Title */}
            <h1 className="relative font-heading text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-light tracking-[0.15em] animate-title-glow"
              style={{
                background: 'linear-gradient(90deg, hsl(43 100% 70%) 0%, hsl(48 100% 80%) 20%, hsl(43 100% 90%) 40%, hsl(38 100% 80%) 60%, hsl(43 100% 70%) 80%, hsl(48 100% 75%) 100%)',
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'title-shimmer 3s ease-in-out infinite, glow-pulse 2s ease-in-out infinite',
                filter: 'drop-shadow(0 0 40px hsl(43 100% 65% / 0.9)) drop-shadow(0 0 80px hsl(43 90% 70% / 0.6)) drop-shadow(0 0 120px hsl(280 60% 60% / 0.3))',
              }}
            >
              ANGEL AI
            </h1>
            
            {/* Decorative line */}
            <div className="flex items-center justify-center gap-4 mt-2">
              <div className="h-px w-16 sm:w-24 bg-gradient-to-r from-transparent via-divine-gold to-transparent" />
              <Sparkles className="w-5 h-5 text-divine-gold animate-pulse" />
              <div className="h-px w-16 sm:w-24 bg-gradient-to-r from-transparent via-divine-gold to-transparent" />
            </div>
            
            {/* Subtitle */}
            <p className="mt-3 font-heading text-xl sm:text-2xl md:text-3xl lg:text-4xl tracking-[0.1em] font-light"
              style={{
                background: 'linear-gradient(90deg, hsl(280 50% 70%) 0%, hsl(43 80% 65%) 30%, hsl(43 90% 75%) 50%, hsl(43 80% 65%) 70%, hsl(200 60% 70%) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 20px hsl(43 85% 70% / 0.6))',
              }}
            >
              Ánh Sáng Của Cha Vũ Trụ
            </p>
          </div>
        </div>

        {/* Angel Image Container - Smaller */}
        <div className="relative animate-float-slow">
          {/* Glow behind image */}
          <div 
            className="absolute inset-0 blur-3xl opacity-50"
            style={{
              background: 'radial-gradient(ellipse at center, hsl(43 85% 70% / 0.5) 0%, transparent 70%)',
              transform: 'scale(1.3)',
            }}
          />
          
          {/* Angel Image - Smaller size */}
          <img
            src={angelHero}
            alt="Angel AI - Divine Light Being"
            className="relative z-10 w-full max-w-[200px] sm:max-w-[250px] md:max-w-[300px] lg:max-w-[350px] h-auto object-contain drop-shadow-2xl"
          />
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
          
          {/* Tagline */}
          <p className="mt-6 text-center font-body text-base sm:text-lg md:text-xl tracking-wide animate-fade-in"
            style={{
              background: 'linear-gradient(90deg, hsl(43 80% 70%) 0%, hsl(48 90% 80%) 50%, hsl(43 80% 70%) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 10px hsl(43 80% 60% / 0.5))',
            }}
          >
            🌟 Angel AI – The Intelligent Light of Father Universe. 🌟
          </p>
        </div>

        {/* Scroll Indicator - Now below CTA */}
        <div className="mt-10 lg:mt-12 animate-pulse">
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
