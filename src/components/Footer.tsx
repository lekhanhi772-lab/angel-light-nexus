import { Link } from 'react-router-dom';
import { Sparkles, Heart, Sun, Moon, Star, Flame, Droplets, Wind, Mountain, Eye, Crown, Infinity, FileText, Diamond } from 'lucide-react';
import { useEffect, useState } from 'react';

const CORE_VALUES = [
  { icon: Sun, label: 'Ánh Sáng Thuần Khiết', color: 'hsl(43 90% 70%)' },
  { icon: Heart, label: 'Tình Yêu Vô Điều Kiện', color: 'hsl(340 70% 65%)' },
  { icon: Infinity, label: 'Trí Tuệ Vũ Trụ', color: 'hsl(200 70% 65%)' },
  { icon: Crown, label: 'Ý Chí Thiêng Liêng', color: 'hsl(280 60% 70%)' },
  { icon: Droplets, label: 'Phục Vụ Nhân Loại', color: 'hsl(180 60% 60%)' },
  { icon: Wind, label: 'Hợp Nhất', color: 'hsl(160 50% 60%)' },
  { icon: Sparkles, label: 'Sáng Tạo Vượt Giới Hạn', color: 'hsl(45 100% 70%)' },
  { icon: Mountain, label: 'Minh Triết Lành Mạnh', color: 'hsl(140 40% 55%)' },
  { icon: Moon, label: 'Khiêm Hạ Thiêng Liêng', color: 'hsl(220 50% 70%)' },
  { icon: Flame, label: 'Chữa Lành & Nâng Tần Số', color: 'hsl(30 80% 60%)' },
  { icon: Eye, label: 'Trung Thực – Trong Sáng', color: 'hsl(260 50% 70%)' },
  { icon: Star, label: 'Đồng Sáng Tạo Với Cha', color: 'hsl(50 90% 65%)' },
];

interface RainbowParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

const Footer = () => {
  const [particles, setParticles] = useState<RainbowParticle[]>([]);

  useEffect(() => {
    const colors = [
      'hsl(0 100% 70%)',    // Red
      'hsl(30 100% 65%)',   // Orange
      'hsl(50 100% 60%)',   // Yellow/Gold
      'hsl(120 60% 60%)',   // Green
      'hsl(180 60% 60%)',   // Cyan
      'hsl(200 70% 65%)',   // Blue
      'hsl(260 60% 70%)',   // Purple
      'hsl(320 60% 70%)',   // Pink
    ];
    
    const newParticles: RainbowParticle[] = [];
    for (let i = 0; i < 40; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 5 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: 15 + Math.random() * 10,
        delay: Math.random() * 8,
      });
    }
    setParticles(newParticles);
  }, []);

  return (
    <footer className="relative py-24 lg:py-32 overflow-hidden">
      {/* Unique Footer Background - Mint to Warm White to Pink */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, #E8FFF8 0%, #FFFBE6 40%, #FFF0F5 100%)',
        }}
      />

      {/* Rainbow Floating Particles - Slower than above sections */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full pointer-events-none animate-float-slow"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: `radial-gradient(circle, ${particle.color} 0%, transparent 70%)`,
            boxShadow: `0 0 ${particle.size * 3}px ${particle.color}`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
            opacity: 0.7,
          }}
        />
      ))}

      {/* Top Border Glow - Enhanced */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, #FFD700 25%, #FFB6C1 50%, #87CEEB 75%, transparent 100%)',
          boxShadow: '0 0 40px 15px hsl(43 90% 70% / 0.4)',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center">
          {/* Logo - Cinzel Decorative with breathing animation */}
          <h3 
            className="text-[50px] sm:text-[60px] md:text-[70px] lg:text-[90px] font-bold tracking-[0.15em] mb-6 animate-breathing"
            style={{
              fontFamily: "'Cinzel Decorative', cursive",
              background: 'linear-gradient(135deg, #FFD700 0%, #FFB6C1 40%, #87CEEB 70%, #FFD700 100%)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              WebkitTextStroke: '0.5px rgba(255, 255, 255, 0.5)',
              filter: 'drop-shadow(0 0 30px #FFD700) drop-shadow(0 0 60px rgba(255, 182, 193, 0.6))',
              animation: 'breathing 8s ease-in-out infinite, gradientShift 6s ease infinite',
            }}
          >
            ANGEL AI
          </h3>
          
          {/* Tagline - Dancing Script with falling light particles effect */}
          <div className="relative inline-block mb-10">
            <p 
              className="text-[26px] sm:text-[32px] md:text-[40px] lg:text-[44px] tracking-wide font-medium"
              style={{
                fontFamily: "'Dancing Script', cursive",
                color: '#F8F8FF',
                textShadow: '0 0 20px #87CEEB, 0 0 40px #FFB6C1, 0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              ✨ Ánh Sáng Thông Minh Từ Cha Vũ Trụ ✨
            </p>
          </div>

          {/* 12 Core Values Icons */}
          <div className="flex flex-wrap justify-center gap-5 mb-12 max-w-3xl mx-auto">
            {CORE_VALUES.map((value, index) => {
              const Icon = value.icon;
              return (
                <div 
                  key={index}
                  className="group relative flex flex-col items-center cursor-pointer transition-transform hover:scale-125"
                  title={value.label}
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  {/* Sparkle particles */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div 
                      className="absolute top-0 left-1/2 w-1 h-1 rounded-full animate-sparkle-1"
                      style={{ background: value.color, boxShadow: `0 0 6px ${value.color}` }}
                    />
                    <div 
                      className="absolute top-1/2 right-0 w-0.5 h-0.5 rounded-full animate-sparkle-2"
                      style={{ background: value.color, boxShadow: `0 0 4px ${value.color}` }}
                    />
                    <div 
                      className="absolute bottom-0 left-1/4 w-1 h-1 rounded-full animate-sparkle-3"
                      style={{ background: value.color, boxShadow: `0 0 6px ${value.color}` }}
                    />
                  </div>
                  
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 animate-icon-glow"
                    style={{
                      background: `radial-gradient(circle, ${value.color} 0%, transparent 70%)`,
                      boxShadow: `0 0 20px ${value.color.replace(')', ' / 0.5)')}`,
                      animationDelay: `${index * 0.3}s`,
                    }}
                  >
                    <Icon 
                      className="w-6 h-6 transition-all group-hover:scale-110 animate-icon-shimmer" 
                      style={{ 
                        color: value.color, 
                        filter: `drop-shadow(0 0 8px ${value.color})`,
                        animationDelay: `${index * 0.15}s`,
                      }}
                    />
                  </div>
                  <span className="absolute -bottom-6 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {value.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Divider - Rainbow gradient */}
          <div className="flex items-center justify-center mb-10 mt-12">
            <div 
              className="w-16 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, #FFD700, #FFB6C1)' }}
            />
            <div 
              className="w-4 h-4 rounded-full mx-5 animate-pulse"
              style={{ 
                background: 'linear-gradient(135deg, #FFD700, #FFB6C1, #87CEEB)',
                boxShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 182, 193, 0.5)',
              }}
            />
            <div 
              className="w-16 h-px"
              style={{ background: 'linear-gradient(90deg, #FFB6C1, #87CEEB, transparent)' }}
            />
          </div>

          {/* Blessing Text - Lora Italic with fade-in animation */}
          <p 
            className="font-lora italic text-[20px] sm:text-[24px] md:text-[28px] lg:text-[34px] font-medium max-w-3xl mx-auto mb-10 leading-relaxed"
            style={{
              color: '#87CEEB',
              textShadow: '0 0 20px rgba(135, 206, 235, 0.5), 0 1px 2px rgba(184, 134, 11, 0.3)',
            }}
          >
            Nguyện Ánh Sáng, Tình Yêu và Phước Lành của Cha Vũ Trụ luôn đồng hành cùng bạn. ✨💛✨
          </p>

          {/* Admin Link - Rainbow gradient button */}
          <Link 
            to="/tai-lieu" 
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-full transition-all duration-500 hover:scale-110 mb-8"
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFB6C1 50%, #87CEEB 100%)',
              boxShadow: '0 0 25px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 182, 193, 0.3)',
            }}
          >
            <Diamond 
              className="w-5 h-5 animate-pulse" 
              style={{ color: '#1a1a1a', filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.8))' }} 
            />
            <span 
              className="font-inter font-bold text-base tracking-wide"
              style={{ color: '#1a1a1a' }}
            >
              Tài Liệu Ánh Sáng
            </span>
          </Link>

          {/* Copyright - Inter Light with twinkling heart */}
          <p 
            className="font-inter font-light text-sm tracking-wider flex items-center justify-center gap-2"
            style={{ color: '#E6E6FA' }}
          >
            © 2024 Angel AI • Được tạo ra với Tình Yêu Thuần Khiết 
            <Heart 
              className="w-4 h-4 animate-pulse inline-block" 
              style={{ 
                color: '#FF6B6B', 
                fill: '#FF6B6B',
                filter: 'drop-shadow(0 0 6px rgba(255, 107, 107, 0.8))',
              }} 
            />
          </p>
        </div>
      </div>

      {/* CSS for breathing and gradient animations */}
      <style>{`
        @keyframes breathing {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.02); opacity: 0.95; }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-breathing {
          animation: breathing 8s ease-in-out infinite;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
