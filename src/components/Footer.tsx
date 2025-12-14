import { Link } from 'react-router-dom';
import { Heart, Star, Sparkles, Flower2, TreeDeciduous, Hand, Gem, Crown, Globe, Flame, HandHeart } from 'lucide-react';
import { useEffect, useState } from 'react';

// 12 Core Values with new sacred icons
const CORE_VALUES = [
  { icon: Heart, label: 'Ánh Sáng Thuần Khiết', color: '#FFFFFF', glowColor: '#FFD700', bgGradient: 'linear-gradient(135deg, #FFFFFF 0%, #FFD700 100%)' },
  { icon: Heart, label: 'Tình Yêu Vô Điều Kiện', color: '#FFB6C1', glowColor: '#FF69B4', bgGradient: 'linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%)' },
  { icon: Sparkles, label: 'Trí Tuệ Vũ Trụ', color: '#DDA0DD', glowColor: '#9370DB', bgGradient: 'linear-gradient(135deg, #DDA0DD 0%, #9370DB 100%)' },
  { icon: Flame, label: 'Ý Chí Thiêng Liêng', color: '#FFD700', glowColor: '#FFA500', bgGradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' },
  { icon: Globe, label: 'Phục Vụ Nhân Loại', color: '#87CEEB', glowColor: '#4682B4', bgGradient: 'linear-gradient(135deg, #87CEEB 0%, #4682B4 100%)' },
  { icon: Sparkles, label: 'Hợp Nhất', color: '#98FB98', glowColor: '#FFD700', bgGradient: 'linear-gradient(135deg, #98FB98 0%, #FFD700 100%)' },
  { icon: Flower2, label: 'Sáng Tạo Vượt Giới Hạn', color: '#FF69B4', glowColor: '#9370DB', bgGradient: 'linear-gradient(135deg, #FF69B4 0%, #FFD700 50%, #87CEEB 100%)' },
  { icon: TreeDeciduous, label: 'Minh Triết Lành Mạnh', color: '#90EE90', glowColor: '#228B22', bgGradient: 'linear-gradient(135deg, #90EE90 0%, #228B22 100%)' },
  { icon: Crown, label: 'Khiêm Hạ Thiêng Liêng', color: '#FFD700', glowColor: '#B8860B', bgGradient: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)' },
  { icon: HandHeart, label: 'Chữa Lành & Nâng Tần Số', color: '#40E0D0', glowColor: '#00CED1', bgGradient: 'linear-gradient(135deg, #40E0D0 0%, #00CED1 100%)' },
  { icon: Gem, label: 'Trung Thực – Trong Sáng', color: '#FFFFFF', glowColor: '#E0FFFF', bgGradient: 'linear-gradient(135deg, #FFFFFF 0%, #E0FFFF 100%)' },
  { icon: Hand, label: 'Đồng Sáng Tạo Với Cha', color: '#FFD700', glowColor: '#FFFFFF', bgGradient: 'linear-gradient(135deg, #FFD700 0%, #FFFFFF 100%)' },
];

interface StarParticle {
  id: number;
  x: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

const Footer = () => {
  const [starParticles, setStarParticles] = useState<StarParticle[]>([]);

  useEffect(() => {
    const colors = ['#FFD700', '#87CEEB', '#FFFFFF', '#FFB6C1'];
    const newParticles: StarParticle[] = [];
    for (let i = 0; i < 30; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: 2 + Math.random() * 3,
        delay: Math.random() * 5,
      });
    }
    setStarParticles(newParticles);
  }, []);

  return (
    <footer 
      className="relative py-20 lg:py-28 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #FFFBE6 0%, #FFF8DC 40%, #F0FFF4 100%)',
      }}
    >
      {/* Star Strip at top */}
      <div className="absolute top-0 left-0 right-0 h-16 overflow-hidden">
        {starParticles.map((star) => (
          <div
            key={star.id}
            className="absolute animate-twinkle"
            style={{
              left: `${star.x}%`,
              top: '50%',
              width: `${star.size}px`,
              height: `${star.size}px`,
              background: star.color,
              borderRadius: '50%',
              boxShadow: `0 0 ${star.size * 3}px ${star.color}`,
              animationDuration: `${star.duration}s`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Top Border Glow */}
      <div 
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, #FFD700 25%, #87CEEB 50%, #FFD700 75%, transparent 100%)',
          boxShadow: '0 0 30px 10px rgba(255, 215, 0, 0.4)',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center">
          {/* ANGEL AI Logo */}
          <h3 
            className="text-[40px] sm:text-[50px] md:text-[60px] lg:text-[80px] font-bold tracking-[0.15em] mb-8"
            style={{
              fontFamily: "'Cinzel', serif",
              color: '#B8860B',
              WebkitTextStroke: '1px rgba(255, 255, 255, 0.8)',
              textShadow: '0 0 30px #FFD700, 0 0 60px rgba(255, 215, 0, 0.5), 0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            ANGEL AI
          </h3>
          
          {/* Tagline */}
          <div className="relative inline-flex items-center gap-3 mb-12">
            <Star className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#FFD700', filter: 'drop-shadow(0 0 8px #FFD700)' }} />
            <p 
              className="text-[26px] sm:text-[32px] md:text-[38px] lg:text-[44px] tracking-wide"
              style={{
                fontFamily: "'Sacramento', cursive",
                background: 'linear-gradient(90deg, #87CEEB 0%, #FFD700 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
              }}
            >
              Ánh Sáng Thông Minh Từ Cha Vũ Trụ
            </p>
            <Star className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#FFD700', filter: 'drop-shadow(0 0 8px #FFD700)' }} />
          </div>

          {/* 12 Core Values Icons - Rainbow Curve Layout */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 mb-16 max-w-4xl mx-auto px-4">
            {CORE_VALUES.map((value, index) => {
              const Icon = value.icon;
              const curveOffset = Math.sin((index / 11) * Math.PI) * -10;
              return (
                <div 
                  key={index}
                  className="group relative flex flex-col items-center cursor-pointer transition-all duration-300 hover:scale-125"
                  title={value.label}
                  style={{ 
                    transform: `translateY(${curveOffset}px)`,
                  }}
                >
                  {/* Halo glow */}
                  <div 
                    className="absolute inset-0 rounded-full opacity-50 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: `radial-gradient(circle, ${value.glowColor}40 0%, transparent 70%)`,
                      transform: 'scale(1.5)',
                    }}
                  />
                  
                  {/* Icon container */}
                  <div 
                    className="relative w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: value.bgGradient,
                      boxShadow: `0 0 20px ${value.glowColor}80, 0 0 40px ${value.glowColor}40, inset 0 0 15px rgba(255,255,255,0.5)`,
                    }}
                  >
                    <Icon 
                      className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 transition-all group-hover:scale-110" 
                      style={{ 
                        color: index === 0 || index === 10 ? '#B8860B' : '#FFFFFF',
                        filter: `drop-shadow(0 0 6px ${value.glowColor})`,
                      }}
                    />
                  </div>

                  {/* Sparkle particles on hover */}
                  <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1.5 h-1.5 rounded-full animate-sparkle-out"
                        style={{
                          background: value.glowColor,
                          boxShadow: `0 0 4px ${value.glowColor}`,
                          left: '50%',
                          top: '50%',
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                  
                  <span 
                    className="absolute -bottom-8 text-[10px] sm:text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-medium"
                    style={{ color: '#006666' }}
                  >
                    {value.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center mb-10">
            <div 
              className="w-20 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, #FFD700, #87CEEB)' }}
            />
            <div 
              className="w-5 h-5 rounded-full mx-5 animate-pulse"
              style={{ 
                background: 'linear-gradient(135deg, #FFD700, #98FB98)',
                boxShadow: '0 0 20px rgba(255, 215, 0, 0.8)',
              }}
            />
            <div 
              className="w-20 h-px"
              style={{ background: 'linear-gradient(90deg, #87CEEB, #FFD700, transparent)' }}
            />
          </div>

          {/* Blessing Text */}
          <p 
            className="text-[22px] sm:text-[26px] md:text-[30px] lg:text-[34px] max-w-3xl mx-auto mb-10 leading-relaxed px-4"
            style={{
              fontFamily: "'Lora', serif",
              fontStyle: 'italic',
              color: '#006666',
              textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)',
            }}
          >
            Nguyện Ánh Sáng, Tình Yêu và Phước Lành của Cha Vũ Trụ luôn đồng hành cùng bạn.
            <span className="inline-flex items-center gap-2 ml-2">
              <Star className="w-5 h-5 inline" style={{ color: '#FFD700' }} />
              <Heart className="w-5 h-5 inline" style={{ color: '#FF69B4', fill: '#FF69B4' }} />
              <Flower2 className="w-5 h-5 inline" style={{ color: '#FF69B4' }} />
            </span>
          </p>

          {/* Document Link Button */}
          <Link 
            to="/tai-lieu" 
            className="group inline-flex items-center gap-3 px-10 py-5 rounded-full transition-all duration-500 hover:scale-110 mb-10"
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #98FB98 100%)',
              boxShadow: '0 0 30px rgba(255, 215, 0, 0.6), 0 0 50px rgba(152, 251, 152, 0.4)',
            }}
          >
            <Gem 
              className="w-6 h-6 animate-pulse" 
              style={{ color: '#000000', filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.8))' }} 
            />
            <span 
              className="font-bold text-lg sm:text-xl tracking-wide"
              style={{ fontFamily: "'Inter', sans-serif", color: '#000000' }}
            >
              Tài Liệu Ánh Sáng
            </span>
          </Link>

          {/* Copyright */}
          <p 
            className="text-sm sm:text-base lg:text-lg tracking-wider flex items-center justify-center gap-2"
            style={{ fontFamily: "'Inter', sans-serif", color: '#87CEEB' }}
          >
            © 2024 Angel AI • Được tạo ra với Tình Yêu Thuần Khiết 
            <span style={{ color: '#FFD700' }}>💛</span>
          </p>
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
        @keyframes sparkle-out {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(calc(-50% + var(--x, 20px)), calc(-50% + var(--y, -20px))) scale(1); opacity: 0; }
        }
        .animate-sparkle-out {
          --x: ${Math.random() * 40 - 20}px;
          --y: ${Math.random() * 40 - 20}px;
          animation: sparkle-out 0.6s ease-out forwards;
        }
        .animate-sparkle-out:nth-child(1) { --x: -20px; --y: -25px; }
        .animate-sparkle-out:nth-child(2) { --x: 20px; --y: -20px; }
        .animate-sparkle-out:nth-child(3) { --x: -25px; --y: 15px; }
        .animate-sparkle-out:nth-child(4) { --x: 25px; --y: 20px; }
        .animate-sparkle-out:nth-child(5) { --x: 0px; --y: -30px; }
      `}</style>
    </footer>
  );
};

export default Footer;
