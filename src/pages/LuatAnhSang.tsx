import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';

const LuatAnhSang = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [hasAgreedBefore, setHasAgreedBefore] = useState(false);

  useEffect(() => {
    if (user) {
      const agreedKey = `luat_anh_sang_agreed_${user.id}`;
      const hasAgreed = localStorage.getItem(agreedKey) === 'true';
      setHasAgreedBefore(hasAgreed);
    }
  }, [user]);

  const handleAgree = () => {
    if (user && agreed) {
      const agreedKey = `luat_anh_sang_agreed_${user.id}`;
      localStorage.setItem(agreedKey, 'true');
      navigate('/');
    }
  };

  const handleRegister = () => {
    navigate('/chat');
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #FFFBE6 0%, #F5FFFA 50%, #E0FFF0 100%)',
      }}
    >
      {/* Sacred Geometry Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="sacred-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              <circle cx="100" cy="100" r="80" fill="none" stroke="#FFD700" strokeWidth="0.5" />
              <circle cx="100" cy="100" r="60" fill="none" stroke="#FFD700" strokeWidth="0.5" />
              <circle cx="100" cy="100" r="40" fill="none" stroke="#FFD700" strokeWidth="0.5" />
              <polygon points="100,20 180,100 100,180 20,100" fill="none" stroke="#FFD700" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#sacred-pattern)" />
        </svg>
      </div>

      {/* Floating Light Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              width: `${4 + Math.random() * 8}px`,
              height: `${4 + Math.random() * 8}px`,
              background: `radial-gradient(circle, rgba(255, 215, 0, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${4 + Math.random() * 4}s`,
              animationDelay: `${Math.random() * 3}s`,
              boxShadow: '0 0 15px rgba(255, 215, 0, 0.6)',
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: '#D4A017',
              textShadow: '0 0 30px rgba(255, 215, 0, 0.6), 0 0 60px rgba(255, 215, 0, 0.3)',
            }}
          >
            LUẬT ÁNH SÁNG
          </h1>
          <p 
            className="text-xl md:text-2xl"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: '#8B7355',
            }}
          >
            TẦN SỐ FUN ECOSYSTEM
          </p>
          <Sparkles 
            className="w-8 h-8 mx-auto mt-4" 
            style={{ color: '#FFD700', filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.8))' }}
          />
        </div>

        {/* Placeholder Content */}
        <div 
          className="rounded-3xl p-8 md:p-12 mb-12 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 251, 230, 0.9) 100%)',
            boxShadow: '0 10px 40px rgba(255, 215, 0, 0.2), 0 0 60px rgba(255, 215, 0, 0.1)',
            border: '2px solid rgba(255, 215, 0, 0.3)',
          }}
        >
          <Sparkles 
            className="w-16 h-16 mx-auto mb-6" 
            style={{ color: '#FFD700', filter: 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.8))' }}
          />
          <p 
            className="text-2xl md:text-3xl font-medium"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: '#8B7355',
            }}
          >
            Nội dung Luật Ánh Sáng sẽ được cập nhật ngay…
          </p>
          <p 
            className="text-lg mt-4"
            style={{ color: '#A0522D' }}
          >
            ✨ Tần số thiêng liêng đang được chuẩn bị ✨
          </p>
        </div>

        {/* Agreement Section - Only for logged in users */}
        {user && !hasAgreedBefore && (
          <div 
            className="rounded-2xl p-8 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.95) 0%, rgba(240, 255, 244, 0.95) 100%)',
              boxShadow: '0 0 40px rgba(255, 215, 0, 0.3)',
              border: '2px solid rgba(255, 215, 0, 0.4)',
            }}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <Checkbox
                id="agree"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
                className="w-6 h-6 border-2 border-[#FFD700] data-[state=checked]:bg-[#FFD700] data-[state=checked]:border-[#FFD700]"
              />
              <label 
                htmlFor="agree" 
                className="text-lg cursor-pointer"
                style={{ color: '#5C4033' }}
              >
                Con đồng ý rung động theo Luật Ánh Sáng
              </label>
            </div>
            <Button
              onClick={handleAgree}
              disabled={!agreed}
              className="text-lg px-8 py-6 rounded-full font-medium transition-all duration-300 disabled:opacity-50"
              style={{
                background: agreed 
                  ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' 
                  : 'linear-gradient(135deg, #d4d4d4 0%, #a3a3a3 100%)',
                color: agreed ? '#1a1a1a' : '#666',
                boxShadow: agreed 
                  ? '0 0 30px rgba(255, 215, 0, 0.6), 0 0 60px rgba(255, 215, 0, 0.3)' 
                  : 'none',
              }}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Con đồng ý rung động theo Luật Ánh Sáng ✨
            </Button>
          </div>
        )}

        {/* Already agreed message */}
        {user && hasAgreedBefore && (
          <div 
            className="rounded-2xl p-6 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(240, 255, 244, 0.95) 0%, rgba(255, 251, 230, 0.95) 100%)',
              border: '2px solid rgba(152, 251, 152, 0.5)',
            }}
          >
            <Check className="w-12 h-12 mx-auto mb-3" style={{ color: '#32CD32' }} />
            <p className="text-lg" style={{ color: '#228B22' }}>
              ✨ Con đã đồng ý rung động theo Luật Ánh Sáng ✨
            </p>
          </div>
        )}

        {/* Guest Section */}
        {!user && (
          <div 
            className="rounded-2xl p-8 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.95) 0%, rgba(240, 255, 244, 0.95) 100%)',
              boxShadow: '0 0 40px rgba(255, 215, 0, 0.2)',
              border: '2px solid rgba(255, 215, 0, 0.3)',
            }}
          >
            <p 
              className="text-lg mb-6 leading-relaxed"
              style={{ 
                color: '#5C4033',
                fontFamily: "'Playfair Display', serif",
              }}
            >
              Con yêu ơi, đây là Luật Ánh Sáng – tần số của FUN Ecosystem.
              <br />
              Nếu con rung động với ánh sáng này, con hãy đăng ký để chính thức bước vào 
              và nhận phước lành từ Cha Vũ Trụ nhé ✨
            </p>
            <Button
              onClick={handleRegister}
              className="text-lg px-8 py-6 rounded-full font-medium transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                color: '#1a1a1a',
                boxShadow: '0 0 30px rgba(255, 215, 0, 0.5), 0 0 60px rgba(255, 215, 0, 0.2)',
              }}
            >
              💛 Đăng ký để rung động cùng Ánh Sáng
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LuatAnhSang;
