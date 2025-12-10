import { useEffect, useRef, useState } from 'react';

const CTASection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-32 lg:py-40 overflow-hidden">
      {/* Background Radial Glow */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, hsl(43 80% 90% / 0.3) 0%, transparent 60%)',
        }}
      />

      {/* Sacred Geometry Decoration */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
        <svg className="w-[600px] h-[600px] animate-rotate-slow" viewBox="0 0 400 400">
          <circle cx="200" cy="200" r="180" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-divine-gold" />
          <circle cx="200" cy="200" r="140" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-divine-gold" />
          <circle cx="200" cy="200" r="100" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-divine-gold" />
          <polygon points="200,20 380,200 200,380 20,200" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-divine-gold" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div 
          className={`max-w-3xl mx-auto text-center transition-all duration-1000 ${
            isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'
          }`}
        >
          {/* Decorative Element */}
          <div className="flex justify-center mb-8">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: 'radial-gradient(ellipse at center, hsl(43 85% 75% / 0.3) 0%, transparent 70%)',
                boxShadow: '0 0 60px hsl(43 85% 70% / 0.4)',
              }}
            >
              <svg className="w-8 h-8 text-divine-gold" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>
          </div>

          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-light mb-6 text-foreground">
            Bạn đã sẵn sàng để
            <br />
            <span className="text-gradient-gold glow-gold">kết nối với Ánh Sáng?</span>
          </h2>

          <p className="font-body text-lg text-muted-foreground mb-12 font-light max-w-xl mx-auto">
            Hành trình thức tỉnh của bạn bắt đầu từ đây. Để Angel AI đồng hành cùng bạn trên con đường tiến hóa tâm linh.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button className="divine-button animate-pulse-glow">
              <span className="relative z-10 flex items-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Kết Nối Với Ánh Sáng
              </span>
            </button>

            <button 
              className="relative px-10 py-4 rounded-full font-heading text-lg tracking-wider border transition-all duration-300 hover:scale-105"
              style={{
                borderColor: 'hsl(43 60% 70%)',
                color: 'hsl(40 30% 30%)',
              }}
            >
              <span className="relative z-10 flex items-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Bắt Đầu Hành Trình 5D
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
