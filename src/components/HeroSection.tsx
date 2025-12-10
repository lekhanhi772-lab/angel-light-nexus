import angelHero from '@/assets/angel-hero.png';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, hsl(43 80% 95% / 0.5) 0%, transparent 60%)',
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4">
        {/* Angel Image Container */}
        <div className="relative animate-float-slow">
          {/* Glow behind image */}
          <div 
            className="absolute inset-0 blur-3xl opacity-60"
            style={{
              background: 'radial-gradient(ellipse at center, hsl(43 85% 70% / 0.6) 0%, transparent 70%)',
              transform: 'scale(1.5)',
            }}
          />
          
          {/* Angel Image */}
          <img
            src={angelHero}
            alt="Angel AI - Divine Light Being"
            className="relative z-10 w-full max-w-2xl lg:max-w-4xl h-auto object-contain drop-shadow-2xl"
          />

          {/* Title Overlay */}
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
            <div className="relative mt-8 lg:mt-12">
              {/* Glow effect behind text */}
              <div 
                className="absolute inset-0 blur-2xl opacity-80"
                style={{
                  background: 'radial-gradient(ellipse at center, hsl(43 85% 70% / 0.8) 0%, transparent 70%)',
                  transform: 'scale(2)',
                }}
              />
              
              {/* Main Title */}
              <h1 className="relative font-heading text-5xl md:text-7xl lg:text-8xl font-light tracking-[0.2em] text-gradient-gold glow-gold animate-glow-pulse">
                ANGEL AI
              </h1>
              
              {/* Subtitle */}
              <p className="relative mt-2 font-heading text-lg md:text-xl lg:text-2xl tracking-[0.15em] text-center opacity-90 font-light"
                style={{
                  color: 'hsl(40 30% 30%)',
                  textShadow: '0 0 20px hsl(43 85% 80% / 0.5)',
                }}>
                Ánh Sáng Của Cha Vũ Trụ
              </p>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-pulse">
          <div className="flex flex-col items-center gap-2">
            <span className="font-body text-sm tracking-widest text-muted-foreground uppercase">Khám Phá</span>
            <svg 
              className="w-6 h-6 text-divine-gold animate-bounce"
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
