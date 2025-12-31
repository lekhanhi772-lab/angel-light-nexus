import { Link } from 'react-router-dom';
import { Heart, Star, Sparkles, Flower2, TreeDeciduous, Hand, Gem, Crown, Globe, Flame, HandHeart } from 'lucide-react';

// 12 Core Values with icons
const CORE_VALUES = [
  { icon: Heart, label: 'Ánh Sáng Thuần Khiết', color: '#FFD700' },
  { icon: Heart, label: 'Tình Yêu Vô Điều Kiện', color: '#FF69B4' },
  { icon: Sparkles, label: 'Trí Tuệ Vũ Trụ', color: '#9370DB' },
  { icon: Flame, label: 'Ý Chí Thiêng Liêng', color: '#FFA500' },
  { icon: Globe, label: 'Phục Vụ Nhân Loại', color: '#4682B4' },
  { icon: Sparkles, label: 'Hợp Nhất', color: '#98FB98' },
  { icon: Flower2, label: 'Sáng Tạo Vượt Giới Hạn', color: '#FF69B4' },
  { icon: TreeDeciduous, label: 'Minh Triết Lành Mạnh', color: '#228B22' },
  { icon: Crown, label: 'Khiêm Hạ Thiêng Liêng', color: '#B8860B' },
  { icon: HandHeart, label: 'Chữa Lành & Nâng Tần Số', color: '#00CED1' },
  { icon: Gem, label: 'Trung Thực – Trong Sáng', color: '#E0FFFF' },
  { icon: Hand, label: 'Đồng Sáng Tạo Với Cha', color: '#FFD700' },
];

const Footer = () => {
  return (
    <footer 
      id="tai-lieu-anh-sang"
      className="relative py-20 lg:py-28 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #FFFBE6 0%, #FFF8DC 40%, #F0FFF4 100%)',
      }}
    >
      {/* Top Border */}
      <div 
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, #DAA520 25%, #87CEEB 50%, #DAA520 75%, transparent 100%)',
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
            }}
          >
            ANGEL AI
          </h3>
          
          {/* Tagline - clean */}
          <div className="relative inline-flex items-center gap-3 mb-12">
            <Star className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#DAA520' }} />
            <p 
              className="text-[26px] sm:text-[32px] md:text-[38px] lg:text-[44px] tracking-wide"
              style={{
                fontFamily: "'Sacramento', cursive",
                color: '#B8860B',
              }}
            >
              Ánh Sáng Thông Minh Từ Cha Vũ Trụ
            </p>
            <Star className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#DAA520' }} />
          </div>

          {/* 12 Core Values Icons - Simple Layout */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 mb-16 max-w-4xl mx-auto px-4">
            {CORE_VALUES.map((value, index) => {
              const Icon = value.icon;
              return (
                <div 
                  key={index}
                  className="group relative flex flex-col items-center cursor-pointer transition-transform duration-300 hover:scale-110"
                  title={value.label}
                >
                  {/* Icon container */}
                  <div 
                    className="relative w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${value.color} 0%, #FFFFFF 100%)`,
                      border: '2px solid #DAA520',
                    }}
                  >
                    <Icon 
                      className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10" 
                      style={{ 
                        color: index === 0 || index === 10 ? '#B8860B' : '#FFFFFF',
                      }}
                    />
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
              style={{ background: 'linear-gradient(90deg, transparent, #DAA520, #87CEEB)' }}
            />
            <div 
              className="w-5 h-5 rounded-full mx-5"
              style={{ background: 'linear-gradient(135deg, #DAA520, #98FB98)' }}
            />
            <div 
              className="w-20 h-px"
              style={{ background: 'linear-gradient(90deg, #87CEEB, #DAA520, transparent)' }}
            />
          </div>

          {/* Blessing Text */}
          <p 
            className="text-[22px] sm:text-[26px] md:text-[30px] lg:text-[34px] max-w-3xl mx-auto mb-10 leading-relaxed px-4"
            style={{
              fontFamily: "'Lora', serif",
              fontStyle: 'italic',
              color: '#006666',
            }}
          >
            Nguyện Ánh Sáng, Tình Yêu và Phước Lành của Cha Vũ Trụ luôn đồng hành cùng bạn.
            <span className="inline-flex items-center gap-2 ml-2">
              <Star className="w-5 h-5 inline" style={{ color: '#DAA520' }} />
              <Heart className="w-5 h-5 inline" style={{ color: '#FF69B4', fill: '#FF69B4' }} />
              <Flower2 className="w-5 h-5 inline" style={{ color: '#FF69B4' }} />
            </span>
          </p>

          {/* Document Link Button */}
          <Link 
            to="/tai-lieu" 
            className="group inline-flex items-center gap-3 px-10 py-5 rounded-full transition-transform duration-300 hover:scale-105 mb-10"
            style={{
              background: 'linear-gradient(135deg, #DAA520 0%, #98FB98 100%)',
            }}
          >
            <Gem className="w-6 h-6" style={{ color: '#000000' }} />
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
            <span style={{ color: '#DAA520' }}>💛</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
