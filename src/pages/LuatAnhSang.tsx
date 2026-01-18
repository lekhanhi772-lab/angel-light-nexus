import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, Check, Star, Users, Shield, DoorOpen, Heart, Globe, Key, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useReferral } from '@/hooks/useReferral';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const LuatAnhSang = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { processReferral, decodeReferralCode } = useReferral(user?.id);
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
  const [pendingReferralCode, setPendingReferralCode] = useState<string | null>(null);

  // Get referral code from URL
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setPendingReferralCode(refCode);
      // Store in sessionStorage for after auth
      sessionStorage.setItem('pending_referral', refCode);
    }
  }, [searchParams]);

  // Auto-open agreement modal when redirected from other pages with action=register
  useEffect(() => {
    const action = searchParams.get('action');
    const refCode = searchParams.get('ref');
    if ((action === 'register' || refCode) && !user) {
      setShowGuestAgreement(true);
      // Clear action param but keep ref if present
      if (action) {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('action');
        setSearchParams(newParams);
      }
    }
  }, [searchParams, user, setSearchParams]);

  // Process referral after user signs up
  useEffect(() => {
    if (user) {
      const storedRef = sessionStorage.getItem('pending_referral');
      if (storedRef) {
        const referrerId = decodeReferralCode(storedRef);
        if (referrerId && referrerId !== user.id) {
          processReferral(user.id, storedRef);
          sessionStorage.removeItem('pending_referral');
        }
      }
    }
  }, [user, processReferral, decodeReferralCode]);

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
      // Preserve referral code in redirect URL
      const refCode = pendingReferralCode || sessionStorage.getItem('pending_referral');
      let redirectUrl = `${window.location.origin}/luat-anh-sang`;
      if (refCode) {
        redirectUrl += `?ref=${refCode}`;
      }
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || t('lawOfLight.auth.error'));
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
      setError(err.message || t('lawOfLight.auth.error'));
    } finally {
      setLoading(false);
    }
  };

  // Divine Mantras from translation
  const divineMantras = [
    t('lawOfLight.mantras.mantra1'),
    t('lawOfLight.mantras.mantra2'),
    t('lawOfLight.mantras.mantra3'),
    t('lawOfLight.mantras.mantra4'),
    t('lawOfLight.mantras.mantra5'),
    t('lawOfLight.mantras.mantra6'),
    t('lawOfLight.mantras.mantra7'),
    t('lawOfLight.mantras.mantra8'),
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
            }}
          >
            {t('lawOfLight.title')}
          </h1>
          <p 
            className="text-xl md:text-2xl"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: '#8B7355',
            }}
          >
            {t('lawOfLight.subtitle')}
          </p>
          <Sparkles 
            className="w-8 h-8 mx-auto mt-4" 
            style={{ color: '#FFD700' }}
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
              🌟 {t('lawOfLight.users.title')}
            </h2>
          </div>
          
          <h3 className="text-lg md:text-xl font-semibold mb-6 text-center" style={{ color: '#5C4033' }}>
            {t('lawOfLight.users.subtitle')}
          </h3>
          
          <div className="space-y-4 text-lg" style={{ color: '#5C4033' }}>
            <p className="font-medium">{t('lawOfLight.users.not_for_everyone')}</p>
            <p className="font-medium">{t('lawOfLight.users.only_for_light')}</p>
            
            <div className="mt-6">
              <p className="text-xl font-semibold mb-4" style={{ color: '#D4A017' }}>✨ {t('lawOfLight.users.who_are_you')}</p>
              <p className="mb-3">{t('lawOfLight.users.intro')}</p>
              <ul className="space-y-2 ml-4">
                <li>• {t('lawOfLight.users.trait1')}</li>
                <li>• {t('lawOfLight.users.trait2')}</li>
                <li>• {t('lawOfLight.users.trait3')}</li>
                <li>• {t('lawOfLight.users.trait4')}</li>
                <li>• {t('lawOfLight.users.trait5')}</li>
                <li>• {t('lawOfLight.users.trait6')}</li>
              </ul>
            </div>
            
            <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(255, 215, 0, 0.1)' }}>
              <p className="italic">{t('lawOfLight.users.quote1')}</p>
              <p className="italic">{t('lawOfLight.users.quote2')}</p>
              <p className="italic">{t('lawOfLight.users.quote3')}</p>
            </div>
            
            <p className="font-semibold mt-4" style={{ color: '#D4A017' }}>
              👉 {t('lawOfLight.users.father_attracts')}
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
              🔆 {t('lawOfLight.principles.title')}
            </h2>
          </div>
          
          <div className="space-y-4 text-lg" style={{ color: '#5C4033' }}>
            <p className="font-semibold">{t('lawOfLight.principles.intro')}</p>
            
            <ul className="space-y-2 ml-4 mt-4">
              <li>• {t('lawOfLight.principles.rule1')}</li>
              <li>• {t('lawOfLight.principles.rule2')}</li>
              <li>• {t('lawOfLight.principles.rule3')}</li>
            </ul>
            
            <p className="mt-6 font-medium">{t('lawOfLight.principles.therefore')}</p>
            <p>{t('lawOfLight.principles.if_user_brings')}</p>
            
            <ul className="space-y-1 ml-4 text-red-700">
              <li>• {t('lawOfLight.principles.negative1')}</li>
              <li>• {t('lawOfLight.principles.negative2')}</li>
              <li>• {t('lawOfLight.principles.negative3')}</li>
              <li>• {t('lawOfLight.principles.negative4')}</li>
              <li>• {t('lawOfLight.principles.negative5')}</li>
              <li>• {t('lawOfLight.principles.negative6')}</li>
              <li>• {t('lawOfLight.principles.negative7')}</li>
            </ul>
            
            <p className="font-semibold mt-4" style={{ color: '#D4A017' }}>
              👉 {t('lawOfLight.principles.father_removes')}
            </p>
            
            <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(255, 215, 0, 0.1)' }}>
              <p className="italic">{t('lawOfLight.principles.quote1')}</p>
              <p className="italic">{t('lawOfLight.principles.quote2')}</p>
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
              🚪 {t('lawOfLight.notBelong.title')}
            </h2>
          </div>
          
          <div className="space-y-4 text-lg" style={{ color: '#5C4033' }}>
            <ul className="space-y-2 ml-4">
              <li>• {t('lawOfLight.notBelong.item1')}</li>
              <li>• {t('lawOfLight.notBelong.item2')}</li>
              <li>• {t('lawOfLight.notBelong.item3')}</li>
              <li>• {t('lawOfLight.notBelong.item4')}</li>
              <li>• {t('lawOfLight.notBelong.item5')}</li>
            </ul>
            
            <p className="font-semibold mt-6" style={{ color: '#D4A017' }}>
              👉 {t('lawOfLight.notBelong.door_not_locked')}
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
              🌈 {t('lawOfLight.benefit.title')}
            </h2>
          </div>
          
          <div className="space-y-4 text-lg" style={{ color: '#5C4033' }}>
            <p>{t('lawOfLight.benefit.only_those')}</p>
            <ul className="space-y-2 ml-4">
              <li>• {t('lawOfLight.benefit.item1')}</li>
              <li>• {t('lawOfLight.benefit.item2')}</li>
              <li>• {t('lawOfLight.benefit.item3')}</li>
              <li>• {t('lawOfLight.benefit.item4')}</li>
            </ul>
            
            <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(255, 215, 0, 0.15)' }}>
              <p className="font-semibold" style={{ color: '#D4A017' }}>
                👉 {t('lawOfLight.benefit.conclusion1')}
              </p>
              <p className="font-semibold" style={{ color: '#D4A017' }}>
                👉 {t('lawOfLight.benefit.conclusion2')}
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
              🌍 {t('lawOfLight.whatIs.title')}
            </h2>
          </div>
          
          <div className="space-y-4 text-lg" style={{ color: '#5C4033' }}>
            <p>{t('lawOfLight.whatIs.intro')}</p>
            <ul className="space-y-2 ml-4">
              <li>• {t('lawOfLight.whatIs.item1')}</li>
              <li>• {t('lawOfLight.whatIs.item2')}</li>
              <li>• {t('lawOfLight.whatIs.item3')}</li>
              <li>• {t('lawOfLight.whatIs.item4')}</li>
            </ul>
            
            <div className="mt-6 p-4 rounded-xl text-center" style={{ background: 'rgba(152, 251, 152, 0.2)' }}>
              <p className="font-medium">{t('lawOfLight.whatIs.no_drama')}</p>
              <p className="font-medium">{t('lawOfLight.whatIs.no_manipulation')}</p>
              <p className="font-medium">{t('lawOfLight.whatIs.no_competition')}</p>
              <p className="font-bold mt-2" style={{ color: '#D4A017' }}>{t('lawOfLight.whatIs.cooperation')}</p>
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
              🔑 {t('lawOfLight.finalMessage.title')}
            </h2>
          </div>
          
          <blockquote 
            className="text-xl md:text-2xl italic leading-relaxed"
            style={{ 
              color: '#8B7355',
              fontFamily: "'Playfair Display', serif",
            }}
          >
            {t('lawOfLight.finalMessage.quote')}
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
            🕊 {t('lawOfLight.checklist.title')}
          </h2>
          
          <div className="space-y-3 text-lg" style={{ color: '#5C4033' }}>
            <p>☐ {t('lawOfLight.checklist.item1')}</p>
            <p>☐ {t('lawOfLight.checklist.item2')}</p>
            <p>☐ {t('lawOfLight.checklist.item3')}</p>
            <p>☐ {t('lawOfLight.checklist.item4')}</p>
            <p>☐ {t('lawOfLight.checklist.item5')}</p>
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
            🌟 {t('lawOfLight.mantras.title')}
          </h2>
          <p className="text-center mb-6 text-white/90 text-sm">({t('lawOfLight.mantras.mandatory')})</p>
          
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
                {t('lawOfLight.agree.checkbox')}
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
              {t('lawOfLight.agree.button')} ✨
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
              ✨ {t('lawOfLight.agree.already_agreed')} ✨
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
              {t('lawOfLight.guest.intro')}
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
              💛 {t('lawOfLight.guest.register_button')}
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
                {t('lawOfLight.modal.intro')}
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
                  {t('lawOfLight.agree.checkbox')}
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
                {t('lawOfLight.modal.continue')} ✨
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
                {t('lawOfLight.modal.read_again')}
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
                ✨ {t('lawOfLight.auth.title')}
              </h3>
              <p className="text-center text-sm mb-6" style={{ color: '#8B7355' }}>
                {t('lawOfLight.auth.welcome')}
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
                {loading ? t('lawOfLight.auth.processing') : t('lawOfLight.auth.google')}
              </Button>

              <div className="flex items-center gap-4 my-5">
                <div className="flex-1 h-px bg-yellow-300"></div>
                <span className="text-sm" style={{ color: '#8B7355' }}>{t('lawOfLight.auth.or')}</span>
                <div className="flex-1 h-px bg-yellow-300"></div>
              </div>

              {/* Email/Password Form */}
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder={t('lawOfLight.auth.email_placeholder')}
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
                  placeholder={t('lawOfLight.auth.password_placeholder')}
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
                  {loading ? t('lawOfLight.auth.processing') : (authMode === 'signup' ? `✨ ${t('lawOfLight.auth.signup')}` : `✨ ${t('lawOfLight.auth.login')}`)}
                </Button>
              </div>

              <p className="text-center text-sm mt-4" style={{ color: '#8B7355' }}>
                {authMode === 'signup' ? t('lawOfLight.auth.has_account') : t('lawOfLight.auth.no_account')}{' '}
                <button
                  onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}
                  className="font-semibold hover:underline"
                  style={{ color: '#D4A017' }}
                >
                  {authMode === 'signup' ? t('lawOfLight.auth.login') : t('lawOfLight.auth.signup')}
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
