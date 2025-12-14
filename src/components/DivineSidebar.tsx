import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Heart, Star, Gem, BookOpen, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    id: 'values',
    label: 'Giá Trị Cốt Lõi',
    icon: <Gem className="w-6 h-6" />,
    action: 'scroll',
    target: 'sacred-pillars'
  },
  {
    id: 'documents',
    label: 'Tài Liệu Ánh Sáng',
    icon: <BookOpen className="w-6 h-6" />,
    action: 'navigate',
    target: '/documents'
  }
];

const DivineSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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
      const sections = ['hero', 'vision-mission', 'sacred-pillars'];
      const scrollPosition = window.scrollY + 200;

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            if (sectionId === 'hero') setActiveSection('home');
            else if (sectionId === 'vision-mission') setActiveSection('vision');
            else if (sectionId === 'sacred-pillars') setActiveSection('values');
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
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const element = document.getElementById(item.target);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        const element = document.getElementById(item.target);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
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
          background: 'linear-gradient(180deg, #FFFBE6 0%, #F0FFF4 100%)',
          boxShadow: '4px 0 20px rgba(255, 215, 0, 0.3), 2px 0 10px rgba(255, 215, 0, 0.2)',
          borderRight: '2px solid rgba(255, 215, 0, 0.4)',
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

        {/* Footer decoration */}
        <div className={cn(
          "px-4 pt-4 border-t border-[#FFD700]/20",
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
