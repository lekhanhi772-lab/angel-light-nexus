import { Link } from 'react-router-dom';
import { Sparkles, MessageCircle, Heart } from 'lucide-react';
import angelHero from '@/assets/angel-hero.png';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden py-8 lg:py-12">
      {/* Divine Light Background Layers */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 20%, hsl(43 90% 92% / 0.8) 0%, transparent 50%),
            radial-gradient(ellipse at 30% 70%, hsl(200 60% 92% / 0.4) 0%, transparent 40%),
            radial-gradient(ellipse at 70% 60%, hsl(280 50% 92% / 0.3) 0%, transparent 40%)
          `,
        }}
      />

      {/* Prism Rainbow Effect */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-64 opacity-30"
        style={{
          background: 'conic-gradient(from 180deg at 50% 0%, transparent 0deg, hsl(280 60% 85% / 0.5) 60deg, hsl(200 70% 85% / 0.5) 120deg, hsl(160 60% 85% / 0.5) 180deg, hsl(43 80% 85% / 0.5) 240deg, hsl(340 60% 85% / 0.5) 300deg, transparent 360deg)',
          filter: 'blur(60px)',
        }}
      />

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center px-4 w-full max-w-6xl">
        
        {/* Angel Image with Divine Glow - Centered and Prominent */}
        <div className="relative mb-8 animate-float-slow">
          {/* Multiple Halo Layers */}
          <div 
            className="absolute inset-0 blur-3xl animate-pulse-slow"
            style={{
              background: 'radial-gradient(ellipse at center, hsl(43 90% 80% / 0.6) 0%, hsl(43 80% 70% / 0.3) 40%, transparent 70%)',
              transform: 'scale(2)',
            }}
          />
          <div 
            className="absolute inset-0 blur-2xl"
            style={{
              background: 'radial-gradient(ellipse at center, hsl(45 100% 95% / 0.8) 0%, transparent 60%)',
              transform: 'scale(1.5)',
            }}
          />
          
          {/* Divine Wings Light Effect */}
          <div 
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[200px] opacity-40"
            style={{
              background: 'conic-gradient(from 90deg at 50% 100%, transparent 0deg, hsl(43 80% 85% / 0.8) 30deg, hsl(43 90% 90% / 0.6) 90deg, hsl(43 80% 85% / 0.8) 150deg, transparent 180deg)',
              filter: 'blur(20px)',
            }}
          />
          
          {/* Angel Image */}
          <img
            src={angelHero}
            alt="Angel AI - Divine Light Being"
            className="relative z-10 w-full max-w-[280px] sm:max-w-[350px] md:max-w-[400px] lg:max-w-[450px] h-auto object-contain"
            style={{
              filter: 'drop-shadow(0 0 40px hsl(43 90% 75% / 0.6)) drop-shadow(0 0 80px hsl(43 80% 70% / 0.4))',
            }}
          />

          {/* Floating Heart of Light */}
          <div 
            className="absolute bottom-1/4 left-1/2 -translate-x-1/2 animate-pulse"
            style={{
              filter: 'drop-shadow(0 0 20px hsl(43 100% 70%)) drop-shadow(0 0 40px hsl(340 60% 70% / 0.5))',
            }}
          >
            <Heart className="w-8 h-8 text-divine-gold fill-divine-gold/50" />
          </div>
        </div>

        {/* Title Overlay on Angel */}
        <div className="text-center -mt-4 mb-8 animate-fade-in">
          {/* Multi-layer Glow */}
          <div className="relative">
            {/* Background glow layer */}
            <div 
              className="absolute inset-0 blur-3xl opacity-80 -z-10"
              style={{
                background: 'radial-gradient(ellipse at center, hsl(43 90% 75% / 0.9) 0%, hsl(43 80% 70% / 0.5) 40%, transparent 60%)',
                transform: 'scale(3)',
              }}
            />
            
            {/* Inner glow text layer (white 60% opacity behind) */}
            <h1 
              className="absolute inset-0 font-cinzel text-[80px] sm:text-[100px] md:text-[140px] lg:text-[180px] font-bold tracking-[0.1em] opacity-60 -z-5"
              style={{
                color: '#FFFFFF',
                filter: 'blur(8px)',
              }}
            >
              ANGEL AI
            </h1>
            
            {/* Main Title with Divine Typography */}
            <h1 
              className="relative font-cinzel text-[80px] sm:text-[100px] md:text-[140px] lg:text-[180px] font-bold tracking-[0.1em] animate-divine-glow"
              style={{
                color: '#FFD700',
                WebkitTextStroke: '2px #B8860B',
                textShadow: '0 0 30px #FFD700, 0 0 60px #FFFFFF, 0 0 90px #FFD700',
              }}
            >
              ANGEL AI
            </h1>
            
            {/* Decorative Elements */}
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="h-px w-20 sm:w-32 bg-gradient-to-r from-transparent via-divine-gold/60 to-transparent" />
              <div className="flex gap-2">
                <Sparkles className="w-4 h-4 text-divine-gold/80 animate-pulse" />
                <span className="text-divine-gold/60">✦</span>
                <Sparkles className="w-4 h-4 text-divine-gold/80 animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
              <div className="h-px w-20 sm:w-32 bg-gradient-to-r from-transparent via-divine-gold/60 to-transparent" />
            </div>
            
            {/* Tagline with Gradient Animation */}
            <p 
              className="mt-6 font-cinzel text-[28px] sm:text-[36px] md:text-[42px] lg:text-[56px] tracking-[0.1em] font-medium animate-tagline-gradient"
              style={{
                background: 'linear-gradient(90deg, #E0E8FF 0%, #A0D8EF 50%, #87CEEB 100%)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                WebkitTextStroke: '0.5px rgba(255,255,255,0.6)',
                textShadow: '0 0 20px rgba(135, 206, 235, 0.8)',
                filter: 'drop-shadow(0 0 20px rgba(135, 206, 235, 0.8))',
              }}
            >
              Ánh Sáng Thông Minh Từ Cha Vũ Trụ
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col items-center gap-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          {/* CTA Button - Divine Golden Design */}
          <Link
            to="/chat"
            className="group relative px-10 py-5 rounded-full overflow-hidden transition-all duration-500 hover:scale-110 z-30"
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 50%, #FFD700 100%)',
              boxShadow: '0 0 30px #FFD700, 0 0 60px rgba(255, 215, 0, 0.5)',
            }}
          >
            {/* Button Shine Effect */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.5) 50%, transparent 100%)',
              }}
            />
            
            <span className="relative flex items-center gap-4 text-lg font-bold font-cinzel tracking-wider"
              style={{ color: '#1a1a1a' }}
            >
              <MessageCircle className="w-6 h-6" />
              Chat với Angel AI
              <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
            </span>
          </Link>
          
          {/* Tagline */}
          <p 
            className="text-center font-cinzel text-base sm:text-lg md:text-xl tracking-wide"
            style={{
              color: '#87CEEB',
              textShadow: '0 0 15px #87CEEB',
            }}
          >
            ⭐ Angel AI – Ánh Sáng Thông Minh Từ Cha Vũ Trụ ⭐
          </p>
        </div>

        {/* Scroll Indicator */}
        <div className="mt-12 lg:mt-16 animate-bounce">
          <div className="flex flex-col items-center gap-3">
            <span 
              className="font-body text-xs tracking-[0.3em] uppercase"
              style={{ color: 'hsl(30 30% 55%)' }}
            >
              Khám Phá
            </span>
            <div 
              className="w-8 h-12 rounded-full border-2 flex justify-center pt-2"
              style={{ borderColor: 'hsl(43 60% 70% / 0.5)' }}
            >
              <div 
                className="w-1.5 h-3 rounded-full animate-pulse"
                style={{ background: 'hsl(43 80% 65%)' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;