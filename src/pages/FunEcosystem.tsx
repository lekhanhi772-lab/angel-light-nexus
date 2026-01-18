import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, ExternalLink, Bot, User, Play, Gamepad2, Leaf, GraduationCap, Heart, Store, TrendingUp, Orbit, Wallet, Vault, TreePine } from 'lucide-react';
import ParticleBackground from '@/components/ParticleBackground';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import angelAvatar from '@/assets/angel-avatar.png';
import funEcosystemOverview from '@/assets/fun-ecosystem-overview.png';
import funPlayLogo from '@/assets/fun-play-logo.png';
import funFarmLogo from '@/assets/fun-farm-logo.png';
import funCharityLogo from '@/assets/fun-charity-logo.png';
import funProfileLogo from '@/assets/fun-profile-logo.png';
import funAcademyLogo from '@/assets/fun-academy-logo.png';
import funPlanetLogo from '@/assets/fun-planet-logo.png';
import funLifeLogo from '@/assets/fun-life-logo.png';
import funWalletLogo from '@/assets/fun-wallet-logo.png';
import funTreasuryLogo from '@/assets/fun-treasury-logo.png';
import greenEarthLogo from '@/assets/green-earth-logo.png';

interface Platform {
  id: number;
  name: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  link?: string;
  externalLink?: string;
  isPlaceholder?: boolean;
  isAngelAI?: boolean;
  customImage?: string;
}

interface PlatformData {
  id: number;
  key: string;
  name: string;
  icon: React.ReactNode;
  link?: string;
  externalLink?: string;
  isPlaceholder?: boolean;
  isAngelAI?: boolean;
  customImage?: string;
}

const platformsData: PlatformData[] = [
  {
    id: 1,
    key: "angel_ai",
    name: "ANGEL AI",
    icon: null,
    isAngelAI: true,
    externalLink: "https://angel-light-nexus.lovable.app"
  },
  {
    id: 2,
    key: "fun_profile",
    name: "FUN Profile",
    icon: null,
    customImage: funProfileLogo,
    externalLink: "https://fun.rich/"
  },
  {
    id: 3,
    key: "fun_play",
    name: "FUN Play",
    icon: null,
    customImage: funPlayLogo,
    externalLink: "https://play.fun.rich/"
  },
  {
    id: 4,
    key: "fun_planet",
    name: "FUN Planet",
    icon: null,
    customImage: funPlanetLogo,
    externalLink: "https://planet.fun.rich/"
  },
  {
    id: 5,
    key: "fun_farm",
    name: "FUN Farm",
    icon: null,
    customImage: funFarmLogo,
    externalLink: "https://farm.fun.rich/"
  },
  {
    id: 6,
    key: "fun_academy",
    name: "FUN Academy",
    icon: null,
    customImage: funAcademyLogo,
    externalLink: "https://funacademy-rich.lovable.app"
  },
  {
    id: 7,
    key: "fun_charity",
    name: "FUN Charity",
    icon: null,
    customImage: funCharityLogo,
    externalLink: "https://angelaivan.fun.rich/"
  },
  {
    id: 8,
    key: "fun_market",
    name: "FUN Market",
    icon: <Store className="w-8 h-8" />,
    isPlaceholder: true
  },
  {
    id: 9,
    key: "fun_invest",
    name: "FUN Invest",
    icon: <TrendingUp className="w-8 h-8" />,
    isPlaceholder: true
  },
  {
    id: 10,
    key: "fun_life",
    name: "FUNLife / Cosmic Game",
    icon: null,
    customImage: funLifeLogo,
    isPlaceholder: true
  },
  {
    id: 11,
    key: "fun_wallet",
    name: "FUN Wallet",
    icon: null,
    customImage: funWalletLogo,
    externalLink: "https://funwallet-rich.lovable.app"
  },
  {
    id: 12,
    key: "fun_treasury",
    name: "FUN Treasury",
    icon: null,
    customImage: funTreasuryLogo,
    externalLink: "https://funtreasury.lovable.app"
  },
  {
    id: 13,
    key: "green_earth",
    name: "Green Earth",
    icon: null,
    customImage: greenEarthLogo,
    externalLink: "https://greenearth-fun.lovable.app"
  },
];

const FunEcosystemPage = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 50%, #0f0f1a 100%)' }}>
      <ParticleBackground />
      
      {/* Header */}
      <header className="relative z-10 p-4 md:p-6">
        <Link to="/">
          <Button
            variant="ghost"
            className="font-poppins transition-all duration-300 hover:scale-105"
            style={{ color: '#FFD700' }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('ecosystem.back_home')}
          </Button>
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-4 md:px-8 pb-12">
        {/* Hero Title */}
        <div className="text-center mb-12">
          <h1 
            className="font-cinzel text-3xl md:text-5xl font-bold mb-4"
            style={{ color: '#FFD700' }}
          >
            FUN ECOSYSTEM
          </h1>
          <h2 
            className="font-playfair text-xl md:text-2xl"
            style={{ color: '#FFD700' }}
          >
            ✨ {t('ecosystem.subtitle')} ✨
          </h2>
          <p 
            className="font-lora text-base md:text-lg mt-4 max-w-3xl mx-auto"
            style={{ color: '#87CEEB' }}
          >
            {t('ecosystem.description')}
          </p>
        </div>

        {/* Ecosystem Overview Image */}
        <div className="flex justify-center mb-12">
          <div 
            className="relative rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105"
            style={{
              maxWidth: '800px',
              boxShadow: '0 0 40px rgba(255, 215, 0, 0.3)',
            }}
          >
            <img 
              src={funEcosystemOverview} 
              alt="FUN Ecosystem Overview - Vũ Trụ FUN" 
              className="w-full h-auto object-contain"
            />
            {/* Glow effect on hover */}
            <div 
              className="absolute inset-0 opacity-0 hover:opacity-20 transition-opacity duration-500 pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%)',
              }}
            />
          </div>
        </div>

        {/* Platforms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {platformsData.map((platform) => {
            const title = t(`platforms.${platform.key}.title`);
            const description = t(`platforms.${platform.key}.description`);
            
            return (
            <div
              key={platform.id}
              className="group relative p-6 rounded-2xl backdrop-blur-md transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.95) 0%, rgba(240, 255, 244, 0.95) 100%)',
                border: '1px solid rgba(184, 134, 11, 0.3)',
                boxShadow: '0 4px 20px rgba(255, 215, 0, 0.2)',
              }}
            >
              {/* Hover glow effect */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(152, 251, 152, 0.2) 100%)',
                  boxShadow: 'inset 0 0 30px rgba(255, 215, 0, 0.3)',
                }}
              />
              
              {/* Gold particles on hover */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{
                      background: '#FFD700',
                      left: `${10 + Math.random() * 80}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${i * 0.1}s`,
                      boxShadow: '0 0 6px #FFD700',
                    }}
                  />
                ))}
              </div>

              {/* Icon */}
              <div 
                className="relative z-10 w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:scale-110"
                style={{
                  background: platform.isAngelAI || platform.customImage ? 'transparent' : 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  boxShadow: '0 0 20px rgba(255, 215, 0, 0.5), inset 0 0 10px rgba(255, 255, 255, 0.3)',
                  border: '2px solid rgba(255, 215, 0, 0.8)',
                }}
              >
                {platform.isAngelAI ? (
                  <img 
                    src={angelAvatar} 
                    alt="Angel AI" 
                    className="w-full h-full object-cover object-top"
                  />
                ) : platform.customImage ? (
                  <img 
                    src={platform.customImage} 
                    alt={platform.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div style={{ color: '#1a1a1a' }}>
                    {platform.icon}
                  </div>
                )}
              </div>

              {/* Platform Name */}
              <h3 
                className="relative z-10 font-cinzel text-lg font-bold text-center mb-1"
                style={{ color: '#B8860B' }}
              >
                {platform.name}
              </h3>

              {/* Platform Title */}
              <p 
                className="relative z-10 font-playfair text-sm text-center mb-3"
                style={{ color: '#006666' }}
              >
                {title}
              </p>

              {/* Description - shows truncated by default, full on hover */}
              <p 
                className="relative z-10 font-inter text-xs text-center mb-4 transition-all duration-300 line-clamp-4 group-hover:line-clamp-none"
                style={{ color: '#4a4a4a' }}
              >
                {description}
              </p>

              {/* Connect Button */}
              {platform.externalLink ? (
                <a 
                  href={platform.externalLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button
                    className="relative z-10 w-full font-poppins text-sm transition-all duration-300 group-hover:shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, #FFD700 0%, #98FB98 100%)',
                      color: '#1a1a1a',
                      boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {t('ecosystem.connect_now')}
                  </Button>
                </a>
              ) : (
                <Button
                  className="relative z-10 w-full font-poppins text-sm transition-all duration-300 group-hover:shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #98FB98 100%)',
                    color: '#1a1a1a',
                    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
                  }}
                  onClick={() => {
                    toast({
                      title: `✨ ${t('ecosystem.coming_soon')}`,
                      description: `${t('ecosystem.coming_soon_toast')} ✨`,
                    });
                  }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t('ecosystem.coming_soon')} ✨
                </Button>
              )}
            </div>
            );
          })}
        </div>

        {/* Footer Message */}
        <div className="text-center mt-12">
          <p 
            className="font-lora text-lg"
            style={{
              color: '#FFD700',
              textShadow: '0 0 10px rgba(255, 215, 0, 0.4)',
            }}
          >
            💛 {t('ecosystem.footer_message')} 🌿
          </p>
        </div>
      </main>
    </div>
  );
};

export default FunEcosystemPage;
