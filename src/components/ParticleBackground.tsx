import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  type: 'gold' | 'blue' | 'white' | 'mint';
}

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  color: 'gold' | 'blue';
}

interface ShootingStar {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  angle: number;
  length: number;
}

const ParticleBackground = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [stars, setStars] = useState<Star[]>([]);
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);

  useEffect(() => {
    // Generate floating particles with blue-gold-white colors
    const newParticles: Particle[] = [];
    const types: ('gold' | 'blue' | 'white' | 'mint')[] = ['gold', 'blue', 'white', 'mint'];
    
    for (let i = 0; i < 60; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 5 + 3,
        delay: Math.random() * 10,
        duration: Math.random() * 10 + 12,
        type: types[Math.floor(Math.random() * 4)],
      });
    }
    setParticles(newParticles);

    // Generate twinkling stars - alternating gold and blue
    const newStars: Star[] = [];
    for (let i = 0; i < 70; i++) {
      newStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1.5,
        delay: Math.random() * 5,
        color: i % 2 === 0 ? 'gold' : 'blue',
      });
    }
    setStars(newStars);

    // Generate shooting stars
    const generateShootingStars = () => {
      const newShootingStars: ShootingStar[] = [];
      for (let i = 0; i < 10; i++) {
        newShootingStars.push({
          id: i,
          x: Math.random() * 80,
          y: Math.random() * 50,
          delay: Math.random() * 6 + i * 2,
          duration: Math.random() * 1 + 1.5,
          angle: 30 + Math.random() * 20,
          length: 100 + Math.random() * 80,
        });
      }
      setShootingStars(newShootingStars);
    };

    generateShootingStars();
    const interval = setInterval(generateShootingStars, 8000);

    return () => clearInterval(interval);
  }, []);

  const getParticleColor = (type: string) => {
    switch (type) {
      case 'gold':
        return 'hsl(43 100% 50% / 0.8)';
      case 'blue':
        return 'hsl(197 71% 73% / 0.8)';
      case 'white':
        return 'hsl(60 100% 98% / 0.9)';
      case 'mint':
        return 'hsl(157 52% 73% / 0.7)';
      default:
        return 'hsl(43 100% 50% / 0.7)';
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* 5D Base Gradient - White warm → Mint → Blue light */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg, 
              hsl(50 100% 97%) 0%, 
              hsl(150 50% 97%) 25%,
              hsl(180 40% 96%) 50%, 
              hsl(197 50% 95%) 75%,
              hsl(165 40% 96%) 100%
            )
          `,
        }}
      />

      {/* Soft Celestial Orbs - Blue and Gold */}
      <div 
        className="absolute top-[5%] left-[15%] w-[50vw] h-[50vw] animate-pulse-slow"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(197 71% 85% / 0.4) 0%, transparent 60%)',
          filter: 'blur(80px)',
        }}
      />
      <div 
        className="absolute top-[40%] right-[5%] w-[40vw] h-[40vw] animate-pulse-slow"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(43 100% 70% / 0.35) 0%, transparent 60%)',
          filter: 'blur(70px)',
          animationDelay: '2s',
        }}
      />
      <div 
        className="absolute bottom-[10%] left-[10%] w-[35vw] h-[35vw] animate-pulse-slow"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(157 52% 80% / 0.35) 0%, transparent 60%)',
          filter: 'blur(60px)',
          animationDelay: '4s',
        }}
      />
      <div 
        className="absolute top-[60%] left-[50%] w-[30vw] h-[30vw] animate-pulse-slow"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(60 100% 90% / 0.4) 0%, transparent 60%)',
          filter: 'blur(50px)',
          animationDelay: '3s',
        }}
      />

      {/* Shimmer Gradient Overlay - Blue Gold */}
      <div 
        className="absolute inset-0 animate-shimmer"
        style={{
          background: `
            linear-gradient(
              45deg,
              transparent 25%,
              hsl(197 71% 85% / 0.15) 40%,
              hsl(43 100% 70% / 0.2) 50%,
              hsl(197 71% 85% / 0.15) 60%,
              transparent 75%
            )
          `,
          backgroundSize: '200% 200%',
        }}
      />

      {/* Sacred Geometry Background - Gold with blue accents */}
      <div className="absolute inset-0 opacity-[0.04]">
        <svg className="w-full h-full animate-rotate-slow" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice">
          {/* Outer circles - Gold */}
          <circle cx="400" cy="400" r="380" fill="none" stroke="hsl(43 100% 50%)" strokeWidth="0.8" />
          <circle cx="400" cy="400" r="300" fill="none" stroke="hsl(197 71% 60%)" strokeWidth="0.6" />
          <circle cx="400" cy="400" r="220" fill="none" stroke="hsl(43 100% 50%)" strokeWidth="0.8" />
          <circle cx="400" cy="400" r="140" fill="none" stroke="hsl(197 71% 60%)" strokeWidth="0.6" />
          
          {/* Diamond shapes */}
          <polygon points="400,20 780,400 400,780 20,400" fill="none" stroke="hsl(43 100% 50%)" strokeWidth="0.8" />
          <polygon points="400,100 700,400 400,700 100,400" fill="none" stroke="hsl(197 71% 60%)" strokeWidth="0.6" />
          
          {/* Flower of Life - 6 petals */}
          <circle cx="400" cy="260" r="140" fill="none" stroke="hsl(43 100% 55%)" strokeWidth="0.5" />
          <circle cx="521" cy="330" r="140" fill="none" stroke="hsl(197 71% 65%)" strokeWidth="0.5" />
          <circle cx="521" cy="470" r="140" fill="none" stroke="hsl(43 100% 55%)" strokeWidth="0.5" />
          <circle cx="400" cy="540" r="140" fill="none" stroke="hsl(197 71% 65%)" strokeWidth="0.5" />
          <circle cx="279" cy="470" r="140" fill="none" stroke="hsl(43 100% 55%)" strokeWidth="0.5" />
          <circle cx="279" cy="330" r="140" fill="none" stroke="hsl(197 71% 65%)" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Corner Sacred Geometry - Gold glow */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle cx="150" cy="50" r="80" fill="none" stroke="hsl(43 100% 50%)" strokeWidth="0.5" />
          <circle cx="150" cy="50" r="60" fill="none" stroke="hsl(43 100% 55%)" strokeWidth="0.4" />
          <circle cx="150" cy="50" r="40" fill="none" stroke="hsl(43 100% 60%)" strokeWidth="0.3" />
          <polygon points="150,0 200,50 150,100 100,50" fill="none" stroke="hsl(43 100% 50%)" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Golden Shooting Stars with Blue Trail */}
      {shootingStars.map((star) => (
        <div
          key={`shooting-${star.id}-${Math.random()}`}
          className="absolute"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            transform: `rotate(${star.angle}deg)`,
            animation: `shooting-star ${star.duration}s ease-out ${star.delay}s forwards`,
            animationIterationCount: 'infinite',
          }}
        >
          <div 
            className="absolute w-4 h-4 rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(60 100% 98%) 0%, hsl(43 100% 55%) 50%, transparent 100%)',
              boxShadow: '0 0 20px hsl(43 100% 55%), 0 0 40px hsl(197 71% 73%), 0 0 60px hsl(43 100% 50%)',
            }}
          />
          <div 
            className="absolute top-1/2 right-full -translate-y-1/2"
            style={{
              width: `${star.length}px`,
              height: '4px',
              background: `linear-gradient(90deg, transparent 0%, hsl(197 71% 80% / 0.4) 30%, hsl(43 100% 70% / 0.8) 70%, hsl(60 100% 95% / 0.95) 100%)`,
              borderRadius: '0 4px 4px 0',
            }}
          />
        </div>
      ))}

      {/* Twinkling Stars - Gold and Blue */}
      {stars.map((star) => (
        <div
          key={`star-${star.id}`}
          className="absolute animate-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            animationDelay: `${star.delay}s`,
          }}
        >
          <svg 
            width={star.size * 4} 
            height={star.size * 4} 
            viewBox="0 0 24 24"
            style={{ 
              color: star.color === 'gold' 
                ? 'hsl(43 100% 55% / 0.8)' 
                : 'hsl(197 71% 70% / 0.7)',
              filter: star.color === 'gold'
                ? 'drop-shadow(0 0 4px hsl(43 100% 50%))'
                : 'drop-shadow(0 0 4px hsl(197 71% 73%))'
            }}
          >
            <path
              fill="currentColor"
              d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z"
            />
          </svg>
        </div>
      ))}

      {/* Floating Light Particles - Blue Gold White Mint */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full animate-particle-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: `radial-gradient(circle, ${getParticleColor(particle.type)} 0%, transparent 70%)`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            boxShadow: `0 0 ${particle.size * 4}px ${getParticleColor(particle.type)}`,
          }}
        />
      ))}

      {/* Sparkle Clusters - Gold */}
      <div className="absolute top-1/4 left-1/4 animate-sparkle-cluster">
        <div className="relative w-48 h-48">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.3}s`,
                background: i % 2 === 0 ? 'hsl(43 100% 60%)' : 'hsl(197 71% 75%)',
                boxShadow: i % 2 === 0 
                  ? '0 0 10px 4px hsl(43 100% 55% / 0.9)' 
                  : '0 0 10px 4px hsl(197 71% 73% / 0.8)',
              }}
            />
          ))}
        </div>
      </div>

      <div className="absolute top-2/3 right-1/4 animate-sparkle-cluster" style={{ animationDelay: '2s' }}>
        <div className="relative w-40 h-40">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                background: i % 2 === 0 ? 'hsl(43 100% 55%)' : 'hsl(157 52% 73%)',
                boxShadow: '0 0 8px 3px hsl(43 100% 60% / 0.8)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Rainbow Prism Edge - Blue to Gold gradient */}
      <div 
        className="absolute top-0 left-0 right-0 h-1.5 opacity-50"
        style={{
          background: 'linear-gradient(90deg, hsl(197 71% 73%) 0%, hsl(157 52% 73%) 25%, hsl(43 100% 50%) 50%, hsl(197 71% 73%) 75%, hsl(43 100% 55%) 100%)',
        }}
      />
    </div>
  );
};

export default ParticleBackground;