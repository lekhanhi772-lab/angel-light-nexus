import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Heart, Star, Gem, BookOpen, ChevronRight, ChevronLeft, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: 'scroll' | 'navigate';
  target: string;
}

const menuItems: MenuItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: <Home className="w-6 h-6" />,
    action: 'scroll',
    target: 'hero'
  },
  {
    id: 'chat',
    label: 'Chat với Angel AI',
    icon: <Heart className="w-6 h-6" />,
    action: 'navigate',
    target: '/chat'
  },
  {
    id: 'vision',
    label: 'Tầm Nhìn',
    icon: <Star className="w-6 h-6" />,
    action: 'scroll',
    target: 'vision-mission'
  },
  {
    id: 'pillars',
    label: 'Trụ Cột Trí Tuệ',
    icon: <Gem className="w-6 h-6" />,
    action: 'scroll',
    target: 'sacred-pillars'
  },
  {
    id: 'values',
    label: 'Giá Trị Cốt Lõi',
    icon: <Star className="w-6 h-6" />,
    action: 'scroll',
    target: 'core-values'
  },
  {
    id: 'documents',
    label: 'Tài Liệu Ánh Sáng',
    icon: <BookOpen className="w-6 h-6" />,
    action: 'scroll',
    target: 'tai-lieu-anh-sang'
  }
];

const DivineSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, loading, signInWithGoogle, signOut } = useAuth();

  const handleGoogleSignIn = async () => {
    // OAuth should NOT run inside Lovable preview/iframe because it can redirect
    // through lovable.dev (auth-bridge) and get blocked as a preview.
    const PUBLIC_ORIGIN = 'https://angel-light-nexus.lovable.app';

    const isInIframe = (() => {
      try {
        return window.self !== window.top;
      } catch {
        return true;
      }
    })();

    const isPreviewLikeHost = /lovableproject\.com$|lovable\.dev$/.test(window.location.hostname);

    if (isInIframe || isPreviewLikeHost) {
      toast.message('Mở đăng nhập ở tab public…', {
        description: 'Vui lòng đăng nhập Google trên trang đã publish để tránh lỗi “Access Denied”.',
      });
      window.open(PUBLIC_ORIGIN, '_blank', 'noopener,noreferrer');
      return;
    }

    const { error } = await signInWithGoogle();
    if (error) {
      toast.error('Đăng nhập thất bại: ' + error.message);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Đăng xuất thất bại: ' + error.message);
    } else {
      toast.success('Đã đăng xuất thành công');
    }
  };

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Track scroll position to highlight active section
  useEffect(() => {
    if (location.pathname !== '/') return;

    const handleScroll = () => {
      const sections = ['hero', 'vision-mission', 'sacred-pillars', 'core-values', 'tai-lieu-anh-sang'];
      const scrollPosition = window.scrollY + 200;

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            if (sectionId === 'hero') setActiveSection('home');
            else if (sectionId === 'vision-mission') setActiveSection('vision');
            else if (sectionId === 'sacred-pillars') setActiveSection('pillars');
            else if (sectionId === 'core-values') setActiveSection('values');
            else if (sectionId === 'tai-lieu-anh-sang') setActiveSection('documents');
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  // Set active based on route
  useEffect(() => {
    if (location.pathname === '/chat') setActiveSection('chat');
    else if (location.pathname === '/documents') setActiveSection('documents');
    else if (location.pathname === '/') setActiveSection('home');
  }, [location.pathname]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (!isMobile || !isExpanded) return;

    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.getElementById('divine-sidebar');
      if (sidebar && !sidebar.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
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

  const sidebarWidth = isMobile 
    ? (isExpanded ? 'w-[260px]' : 'w-[70px]') 
    : 'w-[280px]';

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && isExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
          onClick={() => setIsExpanded(false)}
        />
      )}

      <aside
        id="divine-sidebar"
        className={cn(
          "fixed left-0 top-0 h-screen z-50 transition-all duration-300 ease-out",
          sidebarWidth,
          "flex flex-col py-6"
        )}
        style={{
          position: 'fixed',
          background: 'linear-gradient(180deg, #FFFBE6 0%, #F0FFF4 100%)',
          boxShadow: '4px 0 20px rgba(255, 215, 0, 0.3), 2px 0 10px rgba(255, 215, 0, 0.2)',
          borderRight: '2px solid rgba(255, 215, 0, 0.4)',
          overflowY: 'auto',
        }}
      >
        {/* Toggle button for mobile */}
        {isMobile && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              boxShadow: '0 0 15px rgba(255, 215, 0, 0.6)',
            }}
          >
            {isExpanded ? (
              <ChevronLeft className="w-5 h-5 text-white" />
            ) : (
              <ChevronRight className="w-5 h-5 text-white" />
            )}
          </button>
        )}

        {/* Logo/Brand */}
        <div className={cn(
          "px-4 mb-8 flex items-center",
          isMobile && !isExpanded ? "justify-center" : "justify-start"
        )}>
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
            }}
          >
            <span className="text-white text-xl font-bold">A</span>
          </div>
          {(!isMobile || isExpanded) && (
            <span 
              className="ml-3 text-xl font-bold"
              style={{
                fontFamily: "'Playfair Display', serif",
                background: 'linear-gradient(135deg, hsl(43 100% 55%) 0%, hsl(38 76% 45%) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Angel AI
            </span>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-3 space-y-2">
          {menuItems.map((item) => {
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                  isMobile && !isExpanded ? "justify-center px-2" : "justify-start",
                  isActive 
                    ? "bg-[#FFF8DC]" 
                    : "hover:bg-[#FFFACD]/50"
                )}
                style={{
                  boxShadow: isActive 
                    ? '0 0 20px rgba(255, 215, 0, 0.4), inset 0 0 10px rgba(255, 215, 0, 0.1)' 
                    : 'none',
                }}
              >
                {/* Hover glow effect */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(255, 215, 0, 0.2) 0%, transparent 70%)',
                  }}
                />

                {/* Light particles on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 rounded-full animate-float"
                      style={{
                        background: '#FFD700',
                        left: `${20 + i * 30}%`,
                        top: `${30 + i * 20}%`,
                        animationDelay: `${i * 0.2}s`,
                        boxShadow: '0 0 6px rgba(255, 215, 0, 0.8)',
                      }}
                    />
                  ))}
                </div>

                {/* Icon */}
                <span 
                  className={cn(
                    "relative z-10 transition-all duration-300",
                    isActive 
                      ? "text-[#D4A017]" 
                      : "text-[#8B7355] group-hover:text-[#D4A017]"
                  )}
                  style={{
                    filter: isActive ? 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))' : 'none',
                  }}
                >
                  {item.icon}
                </span>

                {/* Label */}
                {(!isMobile || isExpanded) && (
                  <span 
                    className={cn(
                      "relative z-10 text-sm font-medium transition-all duration-300 whitespace-nowrap",
                      isActive 
                        ? "text-[#8B6914]" 
                        : "text-[#5C4033] group-hover:text-[#8B6914]"
                    )}
                  >
                    {item.label}
                  </span>
                )}

                {/* Active indicator */}
                {isActive && (
                  <div 
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-l-full"
                    style={{
                      background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)',
                      boxShadow: '0 0 10px rgba(255, 215, 0, 0.8)',
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Auth Section */}
        <div className={cn(
          "px-3 pt-4 border-t border-[#FFD700]/20",
          isMobile && !isExpanded ? "hidden" : "block"
        )}>
          {loading ? (
            <div className="flex items-center justify-center py-3">
              <div className="w-5 h-5 border-2 border-[#FFD700] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : user ? (
            // Logged in state - show user info
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-xl bg-[#FFFACD]/50">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name || profile.email || user.email || 'User'}
                    className="w-10 h-10 rounded-full border-2 border-[#FFD700]"
                    style={{ boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)' }}
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' }}
                  >
                    {(
                      (profile?.display_name || profile?.email || user.email || 'U')
                        .charAt(0)
                        .toUpperCase()
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#5C4033] truncate">
                    {profile?.display_name || profile?.email?.split('@')[0] || user.email?.split('@')[0] || 'Người dùng'}
                  </p>
                  <p className="text-xs text-[#8B7355]/70 truncate">
                    {profile?.email || user.email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-[#FFFACD]/50 text-[#8B7355] hover:text-[#D4A017]"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          ) : (
            // Not logged in - show Google sign in button
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-medium transition-all duration-300 group relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #A8E6CF 100%)',
                boxShadow: '0 0 20px rgba(255, 215, 0, 0.4), 0 0 10px rgba(168, 230, 207, 0.3)',
              }}
            >
              {/* Hover particles */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full animate-float"
                    style={{
                      background: i % 2 === 0 ? '#FFD700' : '#A8E6CF',
                      left: `${15 + i * 18}%`,
                      top: `${20 + (i % 3) * 25}%`,
                      animationDelay: `${i * 0.15}s`,
                      boxShadow: `0 0 8px ${i % 2 === 0 ? 'rgba(255, 215, 0, 0.8)' : 'rgba(168, 230, 207, 0.8)'}`,
                    }}
                  />
                ))}
              </div>
              
              {/* Google Icon */}
              <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              
              <span 
                className="relative z-10 text-[#2D2D2D] font-semibold group-hover:scale-105 transition-transform duration-300"
                style={{ textShadow: '0 0 10px rgba(255, 215, 0, 0.3)' }}
              >
                Đăng nhập bằng Google
              </span>
            </button>
          )}
        </div>

        {/* Footer decoration */}
        <div className={cn(
          "px-4 pt-4",
          isMobile && !isExpanded ? "hidden" : "block"
        )}>
          <p className="text-xs text-[#8B7355]/70 text-center italic">
            ✨ Ánh sáng dẫn đường ✨
          </p>
        </div>
      </aside>
    </>
  );
};

export default DivineSidebar;
