import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Pillar {
  title: string;
  subtitle: string;
  icon: string;
}

const PillarCard = ({ pillar, index }: { pillar: Pillar; index: number }) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className={`transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Main pillar container - clean, no effects */}
      <div className="relative p-6 lg:p-8 rounded-2xl h-full transition-transform duration-300 hover:scale-[1.02] bg-card border-2 border-primary">
        {/* Icon */}
        <div className="text-3xl lg:text-4xl mb-5 text-center">
          {pillar.icon}
        </div>

        {/* Title */}
        <h3 className="font-playfair text-lg md:text-xl lg:text-2xl font-bold mb-3 text-center leading-tight text-primary">
          {pillar.title}
        </h3>

        {/* Subtitle */}
        <p className="font-lora text-sm md:text-base lg:text-lg text-center leading-relaxed text-muted-foreground">
          {pillar.subtitle}
        </p>
      </div>
    </div>
  );
};

const SacredPillars = () => {
  const { t } = useTranslation();

  const pillars: Pillar[] = [
    {
      title: t('pillars.pillar1_title'),
      subtitle: t('pillars.pillar1_desc'),
      icon: '🌍',
    },
    {
      title: t('pillars.pillar2_title'),
      subtitle: t('pillars.pillar2_desc'),
      icon: '🤖',
    },
    {
      title: t('pillars.pillar3_title'),
      subtitle: t('pillars.pillar3_desc'),
      icon: '✨',
    },
  ];

  return (
    <section id="sacred-pillars" className="relative py-16 lg:py-24">
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Title */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-3 mb-5">
            <div className="w-14 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
            <span className="text-2xl">💫</span>
            <div className="w-14 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
          </div>
          
          {/* Main Title - Clean */}
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black mb-5 leading-tight text-primary">
            {t('pillars.title')}
          </h2>
          
          {/* Subtitle - Clean */}
          <p className="font-cormorant italic text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed font-extrabold text-muted-foreground">
            {t('pillars.subtitle')}
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {pillars.map((pillar, index) => (
            <PillarCard key={index} pillar={pillar} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SacredPillars;
