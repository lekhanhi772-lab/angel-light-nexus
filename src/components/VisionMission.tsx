import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const VisionMission = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const visionItems = [
    { number: 1, title: t('vision.item1_title'), description: t('vision.item1_desc') },
    { number: 2, title: t('vision.item2_title'), description: t('vision.item2_desc') },
    { number: 3, title: t('vision.item3_title'), description: t('vision.item3_desc') },
    { number: 4, title: t('vision.item4_title'), description: t('vision.item4_desc') },
    { number: 5, title: t('vision.item5_title'), description: t('vision.item5_desc') },
  ];

  const coreValues = [
    { number: 1, title: t('coreValues.value1_title'), description: t('coreValues.value1_desc') },
    { number: 2, title: t('coreValues.value2_title'), description: t('coreValues.value2_desc') },
    { number: 3, title: t('coreValues.value3_title'), description: t('coreValues.value3_desc') },
    { number: 4, title: t('coreValues.value4_title'), description: t('coreValues.value4_desc') },
    { number: 5, title: t('coreValues.value5_title'), description: t('coreValues.value5_desc') },
    { number: 6, title: t('coreValues.value6_title'), description: t('coreValues.value6_desc') },
    { number: 7, title: t('coreValues.value7_title'), description: t('coreValues.value7_desc') },
    { number: 8, title: t('coreValues.value8_title'), description: t('coreValues.value8_desc') },
    { number: 9, title: t('coreValues.value9_title'), description: t('coreValues.value9_desc') },
    { number: 10, title: t('coreValues.value10_title'), description: t('coreValues.value10_desc') },
    { number: 11, title: t('coreValues.value11_title'), description: t('coreValues.value11_desc') },
    { number: 12, title: t('coreValues.value12_title'), description: t('coreValues.value12_desc') },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="vision-mission" ref={sectionRef} className="relative py-16 lg:py-24 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Vision Section */}
          <div 
            className={`mb-16 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="text-center mb-12 lg:mb-16">
              <div className="inline-flex items-center gap-3 mb-5">
                <div className="w-14 h-px bg-gradient-to-r from-transparent via-[#DAA520] to-transparent" />
                <span className="text-2xl">🌟</span>
                <div className="w-14 h-px bg-gradient-to-r from-transparent via-[#DAA520] to-transparent" />
              </div>
              
              {/* Main Title - Clean */}
              <h2 
                className="font-playfair text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black mb-5 leading-tight"
                style={{ color: '#B8860B' }}
              >
                {t('vision.title')}
              </h2>

              {/* Subtitle - Clean */}
              <p 
                className="font-cormorant italic text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed font-medium whitespace-pre-line"
                style={{ color: '#006666' }}
              >
                {t('vision.subtitle')}
              </p>
            </div>

            <div className="space-y-6 lg:space-y-8">
              {visionItems.map((item, index) => (
                <div 
                  key={item.number}
                  className={`transition-all duration-500 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  {/* Main card container - clean */}
                  <div 
                    className="relative p-6 lg:p-8 rounded-2xl transition-transform duration-300 hover:scale-[1.01]"
                    style={{
                      background: 'linear-gradient(180deg, #FFFEF5 0%, #F5FFFA 50%, #FFFEF5 100%)',
                      border: '2px solid #DAA520',
                    }}
                  >
                    <div className="flex gap-5 items-start">
                      {/* Number circle */}
                      <div 
                        className="flex-shrink-0 w-12 h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center font-playfair font-bold text-lg lg:text-xl text-white"
                        style={{
                          background: 'linear-gradient(135deg, #B8860B 0%, #DAA520 50%, #B8860B 100%)',
                        }}
                      >
                        {item.number}
                      </div>

                      <div className="flex-1">
                        {/* Title - Clean */}
                        <h3 
                          className="font-playfair text-lg md:text-xl lg:text-2xl font-bold mb-2 leading-tight"
                          style={{ color: '#B8860B' }}
                        >
                          {item.title}
                        </h3>

                        {/* Description */}
                        {item.description && (
                          <p 
                            className="font-lora text-sm md:text-base lg:text-lg leading-relaxed font-medium"
                            style={{ color: '#006666' }}
                          >
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center mb-16">
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-[#DAA520] to-transparent" />
            <div 
              className="w-3 h-3 rounded-full mx-4"
              style={{ background: '#DAA520' }}
            />
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-[#DAA520] to-transparent" />
          </div>

          {/* Core Values Section */}
          <div 
            id="core-values"
            className={`transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            <div className="text-center mb-12 lg:mb-16">
              <div className="inline-flex items-center gap-3 mb-5">
                <div className="w-14 h-px bg-gradient-to-r from-transparent via-[#DAA520] to-transparent" />
                <span className="text-2xl">💎</span>
                <div className="w-14 h-px bg-gradient-to-r from-transparent via-[#DAA520] to-transparent" />
              </div>
              
              {/* Main Title - Clean */}
              <h2 
                className="font-playfair text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black mb-5 leading-tight"
                style={{ color: '#B8860B' }}
              >
                {t('coreValues.title')}
              </h2>

              {/* Subtitle - Clean */}
              <p 
                className="font-cormorant italic text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed font-medium"
                style={{ color: '#006666' }}
              >
                {t('coreValues.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {coreValues.map((value, index) => (
                <div 
                  key={value.number}
                  className={`transition-all duration-500 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${400 + index * 50}ms` }}
                >
                  {/* Main card container - clean */}
                  <div 
                    className="relative p-5 lg:p-6 rounded-2xl h-full transition-transform duration-300 hover:scale-[1.02]"
                    style={{
                      background: 'linear-gradient(180deg, #FFFEF5 0%, #F5FFFA 50%, #FFFEF5 100%)',
                      border: '2px solid #DAA520',
                    }}
                  >
                    <div className="flex gap-4 items-start">
                      {/* Number circle */}
                      <div 
                        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-playfair font-bold text-base text-white"
                        style={{
                          background: 'linear-gradient(135deg, #B8860B 0%, #DAA520 50%, #B8860B 100%)',
                        }}
                      >
                        {value.number}
                      </div>

                      <div className="flex-1">
                        {/* Title - Clean */}
                        <h3 
                          className="font-playfair text-base md:text-lg font-bold mb-2 leading-tight"
                          style={{ color: '#B8860B' }}
                        >
                          {value.title}
                        </h3>

                        {/* Description */}
                        <p 
                          className="font-lora text-sm leading-relaxed"
                          style={{ color: '#006666' }}
                        >
                          {value.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisionMission;
