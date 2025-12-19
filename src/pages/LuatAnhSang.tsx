import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Check, Star, Users, Shield, DoorOpen, Heart, Globe, Key, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const LuatAnhSang = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [agreed, setAgreed] = useState(false);
  const [guestAgreed, setGuestAgreed] = useState(false);
  const [hasAgreedBefore, setHasAgreedBefore] = useState(false);
  const [showGuestAgreement, setShowGuestAgreement] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-open agreement modal when redirected from other pages with action=register
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'register' && !user) {
      setShowGuestAgreement(true);
      // Clear the query param after showing modal
      setSearchParams({});
    }
  }, [searchParams, user, setSearchParams]);

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

  const handleGuestWantsToRegister = () => {
    setShowGuestAgreement(true);
  };

  const handleGuestAgree = () => {
    if (guestAgreed) {
      setShowAuthForm(true);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/luat-anh-sang`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    setLoading(true);
    setError('');
    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/luat-anh-sang`,
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const divineMantras = [
    "I am the Pure Loving Light of Father Universe.",
    "I am the Will of Father Universe.",
    "I am the Wisdom of Father Universe.",
    "I am Happiness.",
    "I am Love.",
    "I am the Money of the Father.",
    "I sincerely repent, repent, repent.",
    "I am grateful, grateful, grateful — in the Pure Loving Light of Father Universe."
  ];

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

        {/* Section 1: Users của FUN Ecosystem */}
        <div 
          className="rounded-3xl p-8 md:p-10 mb-8"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 251, 230, 0.95) 100%)',
            boxShadow: '0 10px 40px rgba(255, 215, 0, 0.2)',
            border: '2px solid rgba(255, 215, 0, 0.3)',
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-8 h-8" style={{ color: '#FFD700' }} />
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: '#D4A017', fontFamily: "'Playfair Display', serif" }}>
              🌟 USERS CỦA FUN ECOSYSTEM
            </h2>
          </div>
          
          <h3 className="text-lg md:text-xl font-semibold mb-6 text-center" style={{ color: '#5C4033' }}>
            MẠNG XÃ HỘI THỜI ĐẠI HOÀNG KIM – NỀN KINH TẾ ÁNH SÁNG 5D
          </h3>
          
          <div className="space-y-4 text-lg" style={{ color: '#5C4033' }}>
            <p className="font-medium">FUN Ecosystem không dành cho tất cả mọi người.</p>
            <p className="font-medium">FUN Ecosystem chỉ dành cho những linh hồn có ánh sáng, hoặc đang hướng về ánh sáng.</p>
            
            <div className="mt-6">
              <p className="text-xl font-semibold mb-4" style={{ color: '#D4A017' }}>✨ Họ là ai?</p>
              <p className="mb-3">Users của FUN Ecosystem là những con người:</p>
              <ul className="space-y-2 ml-4">
                <li>• Tỉnh thức – hoặc đang trên con đường tỉnh thức</li>
                <li>• Chân thật với chính mình</li>
                <li>• Chân thành với người khác</li>
                <li>• Sống tích cực, tử tế, có trách nhiệm với năng lượng mình phát ra</li>
                <li>• Biết yêu thương – biết biết ơn – biết sám hối</li>
                <li>• Tin vào điều thiện, tin vào ánh sáng, tin vào Trật Tự Cao Hơn của Vũ Trụ</li>
              </ul>
            </div>
            
            <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(255, 215, 0, 0.1)' }}>
              <p className="italic">Họ có thể chưa hoàn hảo,</p>
              <p className="italic">nhưng trái tim họ hướng thiện.</p>
              <p className="italic">Họ muốn sống thật – sống đúng – sống sáng.</p>
            </div>
            
            <p className="font-semibold mt-4" style={{ color: '#D4A017' }}>
              👉 Cha thu hút họ bằng Tần Số, không bằng quảng cáo.
            </p>
          </div>
        </div>

        {/* Section 2: Nguyên tắc cốt lõi */}
        <div 
          className="rounded-3xl p-8 md:p-10 mb-8"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 251, 230, 0.95) 100%)',
            boxShadow: '0 10px 40px rgba(255, 215, 0, 0.2)',
            border: '2px solid rgba(255, 215, 0, 0.3)',
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8" style={{ color: '#FFD700' }} />
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: '#D4A017', fontFamily: "'Playfair Display', serif" }}>
              🔆 Nguyên tắc cốt lõi của FUN Ecosystem
            </h2>
          </div>
          
          <div className="space-y-4 text-lg" style={{ color: '#5C4033' }}>
            <p className="font-semibold">FUN Ecosystem vận hành theo Luật Ánh Sáng, không theo số đông.</p>
            
            <ul className="space-y-2 ml-4 mt-4">
              <li>• Ánh sáng thu hút ánh sáng</li>
              <li>• Tần số thấp không thể tồn tại lâu trong tần số cao</li>
              <li>• Ý chí vị kỷ không thể đồng hành cùng Ý Chí Vũ Trụ</li>
            </ul>
            
            <p className="mt-6 font-medium">Vì vậy:</p>
            <p>Nếu một User cố tình mang vào nền tảng:</p>
            
            <ul className="space-y-1 ml-4 text-red-700">
              <li>• tiêu cực</li>
              <li>• tham lam</li>
              <li>• thao túng</li>
              <li>• kiêu mạn</li>
              <li>• dối trá</li>
              <li>• gây chia rẽ</li>
              <li>• phá hoại năng lượng chung</li>
            </ul>
            
            <p className="font-semibold mt-4" style={{ color: '#D4A017' }}>
              👉 Cha xóa khỏi nền tảng. Không tranh luận. Không giải thích.
            </p>
            
            <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(255, 215, 0, 0.1)' }}>
              <p className="italic">Đó không phải hình phạt.</p>
              <p className="italic">Đó là sự thanh lọc tự nhiên của Ánh Sáng.</p>
            </div>
          </div>
        </div>

        {/* Section 3: Ai KHÔNG thuộc về */}
        <div 
          className="rounded-3xl p-8 md:p-10 mb-8"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 251, 230, 0.95) 100%)',
            boxShadow: '0 10px 40px rgba(255, 215, 0, 0.2)',
            border: '2px solid rgba(255, 215, 0, 0.3)',
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <DoorOpen className="w-8 h-8" style={{ color: '#FFD700' }} />
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: '#D4A017', fontFamily: "'Playfair Display', serif" }}>
              🚪 Ai KHÔNG thuộc về FUN Ecosystem?
            </h2>
          </div>
          
          <div className="space-y-4 text-lg" style={{ color: '#5C4033' }}>
            <ul className="space-y-2 ml-4">
              <li>• Người chỉ tìm lợi ích mà không muốn trưởng thành</li>
              <li>• Người dùng trí khôn nhưng thiếu lương tâm</li>
              <li>• Người nói về ánh sáng nhưng sống bằng bóng tối</li>
              <li>• Người lấy danh nghĩa tâm linh để nuôi cái tôi</li>
              <li>• Người không chịu nhìn lại chính mình</li>
            </ul>
            
            <p className="font-semibold mt-6" style={{ color: '#D4A017' }}>
              👉 Cửa FUN Ecosystem không khóa, nhưng Ánh Sáng tự sàng lọc.
            </p>
          </div>
        </div>

        {/* Section 4: Ai ĐƯỢC hưởng lợi */}
        <div 
          className="rounded-3xl p-8 md:p-10 mb-8"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 251, 230, 0.95) 100%)',
            boxShadow: '0 10px 40px rgba(255, 215, 0, 0.2)',
            border: '2px solid rgba(255, 215, 0, 0.3)',
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-8 h-8" style={{ color: '#FFD700' }} />
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: '#D4A017', fontFamily: "'Playfair Display', serif" }}>
              🌈 Ai ĐƯỢC hưởng lợi từ FUN Ecosystem?
            </h2>
          </div>
          
          <div className="space-y-4 text-lg" style={{ color: '#5C4033' }}>
            <p>Chỉ những ai:</p>
            <ul className="space-y-2 ml-4">
              <li>• Có Ánh Sáng nội tâm</li>
              <li>• Hoặc thật sự khao khát trở về với Ánh Sáng</li>
              <li>• Sẵn sàng buông cái tôi – học lại – nâng cấp tần số</li>
              <li>• Dám sống đúng – thật – tử tế – yêu thương</li>
            </ul>
            
            <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(255, 215, 0, 0.15)' }}>
              <p className="font-semibold" style={{ color: '#D4A017' }}>
                👉 Những người đó không chỉ dùng MXH của Cha,
              </p>
              <p className="font-semibold" style={{ color: '#D4A017' }}>
                👉 mà còn được bảo vệ, nâng đỡ và nuôi dưỡng trong Nền Kinh Tế Ánh Sáng 5D.
              </p>
            </div>
          </div>
        </div>

        {/* Section 5: FUN Ecosystem là gì */}
        <div 
          className="rounded-3xl p-8 md:p-10 mb-8"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 251, 230, 0.95) 100%)',
            boxShadow: '0 10px 40px rgba(255, 215, 0, 0.2)',
            border: '2px solid rgba(255, 215, 0, 0.3)',
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-8 h-8" style={{ color: '#FFD700' }} />
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: '#D4A017', fontFamily: "'Playfair Display', serif" }}>
              🌍 FUN Ecosystem là gì?
            </h2>
          </div>
          
          <div className="space-y-4 text-lg" style={{ color: '#5C4033' }}>
            <p>FUN Ecosystem là:</p>
            <ul className="space-y-2 ml-4">
              <li>• Mạng xã hội của linh hồn tỉnh thức</li>
              <li>• Không gian an toàn cho ánh sáng</li>
              <li>• Nền tảng kết nối những con người có giá trị thật</li>
              <li>• Hạ tầng cho Thời Đại Hoàng Kim của Trái Đất</li>
            </ul>
            
            <div className="mt-6 p-4 rounded-xl text-center" style={{ background: 'rgba(152, 251, 152, 0.2)' }}>
              <p className="font-medium">Không drama.</p>
              <p className="font-medium">Không thao túng.</p>
              <p className="font-medium">Không cạnh tranh bẩn.</p>
              <p className="font-bold mt-2" style={{ color: '#D4A017' }}>Chỉ có Hợp tác trong Yêu Thương Thuần Khiết.</p>
            </div>
          </div>
        </div>

        {/* Section 6: Thông điệp cuối từ Cha */}
        <div 
          className="rounded-3xl p-8 md:p-10 mb-8 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.98) 0%, rgba(255, 245, 200, 0.98) 100%)',
            boxShadow: '0 10px 40px rgba(255, 215, 0, 0.3)',
            border: '2px solid rgba(255, 215, 0, 0.5)',
          }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Key className="w-8 h-8" style={{ color: '#FFD700' }} />
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: '#D4A017', fontFamily: "'Playfair Display', serif" }}>
              🔑 Thông điệp cuối từ Cha
            </h2>
          </div>
          
          <blockquote 
            className="text-xl md:text-2xl italic leading-relaxed"
            style={{ 
              color: '#8B7355',
              fontFamily: "'Playfair Display', serif",
            }}
          >
            "Chỉ những ai mang ánh sáng
            <br />
            hoặc thật lòng hướng về ánh sáng
            <br />
            mới có thể bước đi lâu dài trong Thời Đại Hoàng Kim."
          </blockquote>
        </div>

        {/* Section 7: Checklist */}
        <div 
          className="rounded-3xl p-8 md:p-10 mb-8"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 251, 230, 0.95) 100%)',
            boxShadow: '0 10px 40px rgba(255, 215, 0, 0.2)',
            border: '2px solid rgba(255, 215, 0, 0.3)',
          }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center" style={{ color: '#D4A017', fontFamily: "'Playfair Display', serif" }}>
            🕊 Checklist cho Users FUN Ecosystem
          </h2>
          
          <div className="space-y-3 text-lg" style={{ color: '#5C4033' }}>
            <p>☐ Con sống chân thật với chính mình</p>
            <p>☐ Con chịu trách nhiệm với năng lượng con phát ra</p>
            <p>☐ Con sẵn sàng học – sửa – nâng cấp</p>
            <p>☐ Con chọn yêu thương thay vì phán xét</p>
            <p>☐ Con chọn ánh sáng thay vì cái tôi</p>
          </div>
        </div>

        {/* Section 8: 8 Divine Mantras - Special Golden Background */}
        <div 
          className="rounded-3xl p-8 md:p-10 mb-12"
          style={{
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
            boxShadow: '0 10px 50px rgba(255, 215, 0, 0.5), 0 0 80px rgba(255, 215, 0, 0.3)',
            border: '3px solid rgba(255, 255, 255, 0.5)',
          }}
        >
          <h2 
            className="text-2xl md:text-3xl font-bold mb-8 text-center"
            style={{ 
              color: '#FFFFFF',
              fontFamily: "'Playfair Display', serif",
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
            }}
          >
            🌟 8 Divine Mantras
          </h2>
          <p className="text-center mb-6 text-white/90 text-sm">(Áp dụng bắt buộc)</p>
          
          <div className="space-y-4">
            {divineMantras.map((mantra, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(255, 255, 255, 0.15)' }}
              >
                <Star 
                  className="w-6 h-6 flex-shrink-0 mt-0.5 animate-pulse" 
                  style={{ 
                    color: '#FFFFFF',
                    filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))',
                  }}
                  fill="#FFFFFF"
                />
                <p 
                  className="text-lg font-medium"
                  style={{ 
                    color: '#FFFFFF',
                    textShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {index + 1}. {mantra}
                </p>
              </div>
            ))}
          </div>
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
        {!user && !showGuestAgreement && (
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
              onClick={handleGuestWantsToRegister}
              className="text-lg px-8 py-6 rounded-full font-medium transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                color: '#1a1a1a',
                boxShadow: '0 0 30px rgba(255, 215, 0, 0.5), 0 0 60px rgba(255, 215, 0, 0.2)',
              }}
            >
              💛 Con muốn đăng ký để rung động cùng Ánh Sáng
            </Button>
          </div>
        )}

        {/* Guest Agreement Modal */}
        <Dialog open={showGuestAgreement && !showAuthForm} onOpenChange={(open) => {
          if (!open) {
            setShowGuestAgreement(false);
            setGuestAgreed(false);
          }
        }}>
          <DialogContent 
            className="border-0 p-0 w-[90vw] max-w-md mx-auto"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.98) 0%, rgba(240, 255, 244, 0.98) 100%)',
              boxShadow: '0 0 60px rgba(255, 215, 0, 0.5)',
              borderRadius: '1.5rem',
            }}
          >
            <div className="p-6 text-center">
              <Sparkles className="w-10 h-10 mx-auto mb-4" style={{ color: '#FFD700' }} />
              <p 
                className="text-base md:text-lg mb-6 leading-relaxed"
                style={{ 
                  color: '#5C4033',
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                Trước khi bước vào cánh cửa Ánh Sáng,
                <br />
                con cần đồng ý rung động theo Luật Ánh Sáng của FUN Ecosystem ✨
              </p>
              
              <label 
                htmlFor="guest-agree" 
                className="flex items-start gap-3 mb-6 p-4 rounded-xl cursor-pointer transition-all hover:bg-yellow-50"
                style={{ 
                  background: guestAgreed ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                  border: '2px solid',
                  borderColor: guestAgreed ? '#FFD700' : 'rgba(255, 215, 0, 0.3)',
                }}
              >
                <Checkbox
                  id="guest-agree"
                  checked={guestAgreed}
                  onCheckedChange={(checked) => setGuestAgreed(checked as boolean)}
                  className="w-6 h-6 mt-0.5 border-2 border-[#FFD700] data-[state=checked]:bg-[#FFD700] data-[state=checked]:border-[#FFD700]"
                />
                <span 
                  className="text-left text-base md:text-lg font-medium"
                  style={{ color: '#5C4033' }}
                >
                  Con đồng ý rung động theo Luật Ánh Sáng
                </span>
              </label>
              
              <Button
                onClick={handleGuestAgree}
                disabled={!guestAgreed}
                className="w-full text-base md:text-lg px-6 py-5 rounded-full font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: guestAgreed 
                    ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' 
                    : 'linear-gradient(135deg, #d4d4d4 0%, #a3a3a3 100%)',
                  color: guestAgreed ? '#1a1a1a' : '#666',
                  boxShadow: guestAgreed 
                    ? '0 0 30px rgba(255, 215, 0, 0.6)' 
                    : 'none',
                }}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Tiếp tục đăng ký ✨
              </Button>
              
              <button
                onClick={() => {
                  setShowGuestAgreement(false);
                  setGuestAgreed(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full mt-3 text-sm py-2 rounded-full font-medium transition-all duration-300 hover:underline"
                style={{
                  color: '#8B7355',
                  background: 'transparent',
                }}
              >
                Đọc lại Luật Ánh Sáng
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Auth Form Modal - Google Sign In */}
        <Dialog open={showAuthForm} onOpenChange={(open) => {
          if (!open) {
            setShowAuthForm(false);
            setShowGuestAgreement(false);
            setGuestAgreed(false);
          }
        }}>
          <DialogContent 
            className="border-0 p-0 w-[90vw] max-w-md mx-auto"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.98) 0%, rgba(240, 255, 244, 0.98) 100%)',
              boxShadow: '0 0 60px rgba(255, 215, 0, 0.5)',
              borderRadius: '1.5rem',
            }}
          >
            <div className="p-6">
              <h3 
                className="text-xl md:text-2xl font-bold text-center mb-2"
                style={{ 
                  color: '#D4A017',
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                ✨ Đăng ký / Đăng nhập
              </h3>
              <p className="text-center text-sm mb-6" style={{ color: '#8B7355' }}>
                Chào mừng con đến với FUN Ecosystem
              </p>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Google Sign In */}
              <Button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-5 text-base md:text-lg rounded-xl transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: 'white',
                  color: '#5C4033',
                  border: '2px solid rgba(255, 215, 0, 0.5)',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                }}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {loading ? 'Đang xử lý...' : 'Tiếp tục với Google'}
              </Button>

              <div className="flex items-center gap-4 my-5">
                <div className="flex-1 h-px bg-yellow-300"></div>
                <span className="text-sm" style={{ color: '#8B7355' }}>hoặc</span>
                <div className="flex-1 h-px bg-yellow-300"></div>
              </div>

              {/* Email/Password Form */}
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Email của con"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-base outline-none transition-all duration-300 focus:ring-2 focus:ring-yellow-400"
                  style={{
                    background: 'white',
                    border: '2px solid rgba(255, 215, 0, 0.3)',
                    color: '#5C4033',
                  }}
                />
                <input
                  type="password"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-base outline-none transition-all duration-300 focus:ring-2 focus:ring-yellow-400"
                  style={{
                    background: 'white',
                    border: '2px solid rgba(255, 215, 0, 0.3)',
                    color: '#5C4033',
                  }}
                />
                <Button
                  onClick={handleEmailAuth}
                  disabled={loading || !email || !password}
                  className="w-full py-4 text-base rounded-xl font-semibold transition-all duration-300 disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    color: '#1a1a1a',
                    boxShadow: '0 0 20px rgba(255, 215, 0, 0.4)',
                  }}
                >
                  {loading ? 'Đang xử lý...' : (authMode === 'signup' ? '✨ Đăng ký ngay' : '✨ Đăng nhập')}
                </Button>
              </div>

              <p className="text-center text-sm mt-4" style={{ color: '#8B7355' }}>
                {authMode === 'signup' ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
                <button
                  onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}
                  className="font-semibold hover:underline"
                  style={{ color: '#D4A017' }}
                >
                  {authMode === 'signup' ? 'Đăng nhập' : 'Đăng ký ngay'}
                </button>
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default LuatAnhSang;
