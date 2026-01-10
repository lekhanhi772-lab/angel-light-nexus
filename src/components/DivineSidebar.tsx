import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Heart, Star, BookOpen, ChevronRight, ChevronLeft, LogOut, Sparkles, User, Users, Shield, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { toast } from 'sonner';
import angelAvatar from '@/assets/angel-avatar.png';
import LanguageSelector from './LanguageSelector';

// Build version for cache verification
const APP_BUILD = "2026-01-10-v1";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: 'scroll' | 'navigate';
  target: string;
}

const DivineSidebar = () => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, loading, signInWithGoogle, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();

  // Translated menu items
  const menuItems: MenuItem[] = [
    {
      id: 'home',
      label: t('sidebar.home'),
      icon: <Home className="w-6 h-6" />,
      action: 'scroll',
      target: 'hero'
    },
    {
      id: 'chat',
      label: t('sidebar.chat'),
      icon: <Heart className="w-7 h-7" />,
      action: 'navigate',
      target: '/chat'
    },
    {
      id: 'profile',
      label: t('sidebar.profile'),
      icon: <User className="w-6 h-6" />,
      action: 'navigate',
      target: '/profile'
    },
    {
      id: 'forum',
      label: t('sidebar.forum'),
      icon: <Users className="w-6 h-6" />,
      action: 'navigate',
      target: '/forum'
    },
    {
      id: 'fun-ecosystem',
      label: t('sidebar.ecosystem'),
      icon: <Sparkles className="w-6 h-6" />,
      action: 'navigate',
      target: '/fun-ecosystem'
    },
    {
      id: 'luat-anh-sang',
      label: t('sidebar.light_law'),
      icon: <Star className="w-6 h-6" />,
      action: 'navigate',
      target: '/luat-anh-sang'
    },
    {
      id: 'documents',
      label: t('sidebar.documents'),
      icon: <BookOpen className="w-6 h-6" />,
      action: 'navigate',
      target: '/documents'
    },
    // Admin menu item - only shown if isAdmin
    ...(isAdmin ? [{
      id: 'admin',
      label: 'Admin Dashboard',
      icon: <Shield className="w-6 h-6" />,
      action: 'navigate' as const,
      target: '/admin'
    }] : [])
  ];

  const handleGoogleSignIn = () => {
    navigate('/luat-anh-sang?action=register');
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Đăng xuất thất bại: ' + error.message);
    } else {
      toast.success('Đã đăng xuất thành công');
    }
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (location.pathname !== '/') return;

    const handleScroll = () => {
      const sections = ['hero'];
      const scrollPosition = window.scrollY + 200;

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            if (sectionId === 'hero') setActiveSection('home');
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === '/chat') setActiveSection('chat');
    else if (location.pathname === '/profile') setActiveSection('profile');
    else if (location.pathname === '/documents') setActiveSection('documents');
    else if (location.pathname === '/luat-anh-sang') setActiveSection('luat-anh-sang');
    else if (location.pathname === '/fun-ecosystem') setActiveSection('fun-ecosystem');
    else if (location.pathname.startsWith('/forum')) setActiveSection('forum');
    else if (location.pathname === '/admin') setActiveSection('admin');
    else if (location.pathname === '/') setActiveSection('home');
  }, [location.pathname]);

  // Optimized click-outside listener with delay to prevent conflicts
  useEffect(() => {
    if (!isMobile || !isExpanded) return;

    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.getElementById('divine-sidebar');
      const menuButton = document.querySelector('[aria-label="Open menu"]');
      
      // Don't close if clicking on the menu button or inside sidebar
      if (sidebar && !sidebar.contains(e.target as Node) &&
          menuButton && !menuButton.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };

    // Small delay to prevent the open click from triggering close
    const timeoutId = setTimeout(() => {
      document.addEventListener('pointerdown', handleClickOutside, { passive: true });
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [isMobile, isExpanded]);

  const handleItemClick = (item: MenuItem) => {
    if (item.action === 'navigate') {
      navigate(item.target);
    } else if (item.action === 'scroll') {
      const scrollToElement = () => {
        const element = document.getElementById(item.target);
        if (element) {
          const offset = 80;
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - offset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      };

      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(scrollToElement, 150);
      } else {
        scrollToElement();
      }
    }

    if (isMobile) {
      setIsExpanded(false);
    }
  };

  return (
    <>
      {/* Mobile Menu Button - Always visible on mobile when sidebar hidden */}
      {isMobile && !isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="fixed z-[60] w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
          style={{
            top: 'max(16px, env(safe-area-inset-top))',
            left: '16px',
            background: 'linear-gradient(135deg, #DAA520 0%, #FFA500 100%)',
            boxShadow: '0 4px 15px rgba(218, 165, 32, 0.4)',
          }}
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Overlay for mobile - NO backdrop-blur for performance */}
      {isMobile && isExpanded && (
        <div 
          className="fixed inset-0 bg-black/50 z-[50] transition-opacity duration-300"
          onClick={() => setIsExpanded(false)}
        />
      )}

      <aside
        id="divine-sidebar"
        className={cn(
          "fixed left-0 top-0 h-screen z-[55]",
          "flex flex-col py-6",
          // GPU-accelerated animation using transform only
          "transition-transform duration-300 ease-out will-change-transform",
          // Fixed width, use translate for show/hide
          "w-[280px]",
          isMobile 
            ? (isExpanded 
                ? "translate-x-0" 
                : "-translate-x-full pointer-events-none") 
            : "translate-x-0"
        )}
        style={{
          background: 'linear-gradient(180deg, #FFFBE6 0%, #F0FFF4 100%)',
          borderRight: '2px solid #DAA520',
          overflowY: 'auto',
          visibility: isMobile && !isExpanded ? 'hidden' : 'visible',
          // CSS containment for performance isolation
          contain: 'layout style',
        }}
      >
        {/* Toggle button for mobile - Always visible when sidebar expanded */}
        {isMobile && isExpanded && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(false);
            }}
            className="absolute right-3 top-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors z-10"
            style={{
              background: 'linear-gradient(135deg, #DAA520 0%, #FFA500 100%)',
            }}
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        )}

        {/* Logo/Brand - Angel AI Golden Circle */}
        <div className={cn(
          "px-4 mb-8 flex items-center justify-start"
        )}>
          <Link 
            to="/"
            className="relative cursor-pointer transition-transform duration-300 hover:scale-105"
          >
            {/* Golden border ring */}
            <div 
              className={cn(
                "relative rounded-full border-2 border-[#DAA520]",
                isMobile ? "w-[70px] h-[70px]" : "w-[90px] h-[90px]"
              )}
            >
              {/* Inner circle with angel image */}
              <div className="w-full h-full rounded-full overflow-hidden">
                <img 
                  src={angelAvatar}
                  alt="Angel AI"
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
              </div>
            </div>
          </Link>
          
          {/* Always show text since sidebar is hidden when not expanded on mobile */}
          <Link 
            to="/"
            className="ml-3 text-2xl md:text-3xl font-bold hover:scale-105 transition-transform duration-300"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: '#B8860B',
            }}
          >
            Angel AI
          </Link>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-3 space-y-2">
          {menuItems.map((item) => {
            const isActive = activeSection === item.id;
            const isChatItem = item.id === 'chat';
            
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-xl transition-all duration-300 relative overflow-hidden justify-start",
                  isChatItem ? "px-5 py-4" : "px-4 py-3",
                  isActive 
                    ? "bg-[#FFF8DC]" 
                    : isChatItem 
                      ? "bg-gradient-to-r from-[#FFFACD]/70 to-[#FFF8DC]/70 hover:from-[#FFFACD] hover:to-[#FFF8DC]"
                      : "hover:bg-[#FFFACD]/50"
                )}
                style={{
                  border: isChatItem ? '2px solid #DAA520' : 'none',
                }}
              >
                {/* Icon - Clean */}
                <span 
                  className={cn(
                    "relative z-10 transition-colors duration-300",
                    isActive || isChatItem
                      ? "text-[#DAA520]" 
                      : "text-[#B8860B] hover:text-[#DAA520]"
                  )}
                >
                  {item.icon}
                </span>

                {/* Label - Always visible since sidebar is hidden when not expanded on mobile */}
                <span 
                  className={cn(
                    "relative z-10 transition-colors duration-300 whitespace-nowrap",
                    isChatItem ? "text-base" : "text-sm",
                    isActive || isChatItem
                      ? "text-[#B8860B] font-bold" 
                      : "text-[#8B6914] font-semibold hover:text-[#B8860B]"
                  )}
                >
                  {item.label}
                </span>

                {/* Active indicator */}
                {isActive && (
                  <div 
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-l-full"
                    style={{
                      background: 'linear-gradient(180deg, #DAA520 0%, #FFA500 100%)',
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Language Selector - Always visible since sidebar is hidden when not expanded on mobile */}
        <div className="px-3 py-2">
          <LanguageSelector />
        </div>

        {/* Auth Section - Always visible since sidebar is hidden when not expanded on mobile */}
        <div className="px-3 pt-4 border-t border-[#DAA520]/20">
          {loading ? (
            <div className="flex items-center justify-center py-3">
              <div className="w-5 h-5 border-2 border-[#DAA520] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-xl bg-[#FFFACD]/50">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name || profile.email || user.email || 'User'}
                    className="w-10 h-10 rounded-full border-2 border-[#DAA520]"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ background: 'linear-gradient(135deg, #DAA520 0%, #FFA500 100%)' }}
                  >
                    {(
                      (profile?.display_name || profile?.email || user.email || 'U')
                        .charAt(0)
                        .toUpperCase()
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#8B6914] truncate">
                    {profile?.display_name || profile?.email?.split('@')[0] || user.email?.split('@')[0] || t('sidebar.user')}
                  </p>
                  <p className="text-xs text-[#8B7355]/70 truncate">
                    {profile?.email || user.email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-medium transition-colors duration-300 hover:bg-[#FFFACD]/50 text-[#8B7355] hover:text-[#D4A017]"
              >
                <LogOut className="w-4 h-4" />
                {t('sidebar.logout')}
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold transition-colors duration-300"
              style={{
                background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)',
                color: '#FFFFFF',
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t('sidebar.login')}
            </button>
          )}
        </div>

        {/* Build version label for cache verification */}
        <div className="px-3 py-2 text-center">
          <span className="text-[10px] text-[#8B7355]/40 font-mono">
            Build: {APP_BUILD}
          </span>
        </div>
      </aside>
    </>
  );
};

export default DivineSidebar;
