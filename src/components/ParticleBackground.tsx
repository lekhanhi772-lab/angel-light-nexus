import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  type: 'gold' | 'white' | 'cream';
}

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
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
    // Generate floating particles with warm golden colors
    const newParticles: Particle[] = [];
    const types: ('gold' | 'white' | 'cream')[] = ['gold', 'white', 'cream'];
    
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        delay: Math.random() * 10,
        duration: Math.random() * 10 + 10,
        type: types[Math.floor(Math.random() * 3)],
      });
    }
    setParticles(newParticles);

    // Generate twinkling stars
    const newStars: Star[] = [];
    for (let i = 0; i < 60; i++) {
      newStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        delay: Math.random() * 5,
      });
    }
    setStars(newStars);

    // Generate shooting stars continuously
    const generateShootingStars = () => {
      const newShootingStars: ShootingStar[] = [];
      for (let i = 0; i < 8; i++) {
        newShootingStars.push({
          id: i,
          x: Math.random() * 80,
          y: Math.random() * 50,
          delay: Math.random() * 6 + i * 2,
          duration: Math.random() * 1 + 1.5,
          angle: 30 + Math.random() * 20,
          length: 80 + Math.random() * 60,
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
        return 'hsl(43 85% 60% / 0.7)';
      case 'white':
        return 'hsl(45 50% 95% / 0.8)';
      case 'cream':
        return 'hsl(40 60% 75% / 0.6)';
      default:
        return 'hsl(43 85% 65% / 0.7)';
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Ethereal Base Gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg, 
              hsl(45 70% 97%) 0%, 
              hsl(43 60% 95%) 30%, 
              hsl(45 50% 96%) 60%, 
              hsl(43 55% 94%) 100%
            )
          `,
        }}
      />

      {/* Soft Celestial Orbs */}
      <div 
        className="absolute top-[10%] left-[20%] w-[40vw] h-[40vw] animate-pulse-slow"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(43 80% 90% / 0.5) 0%, transparent 60%)',
          filter: 'blur(60px)',
        }}
      />
      <div 
        className="absolute top-[50%] right-[10%] w-[30vw] h-[30vw] animate-pulse-slow"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(200 60% 92% / 0.4) 0%, transparent 60%)',
          filter: 'blur(50px)',
          animationDelay: '2s',
        }}
      />
      <div 
        className="absolute bottom-[20%] left-[15%] w-[25vw] h-[25vw] animate-pulse-slow"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(280 50% 92% / 0.3) 0%, transparent 60%)',
          filter: 'blur(40px)',
          animationDelay: '4s',
        }}
      />

      {/* Shimmer Gradient Overlay */}
      <div 
        className="absolute inset-0 animate-shimmer"
        style={{
          background: `
            linear-gradient(
              45deg,
              transparent 30%,
              hsl(43 80% 90% / 0.15) 45%,
              hsl(45 90% 95% / 0.2) 50%,
              hsl(43 80% 90% / 0.15) 55%,
              transparent 70%
            )
          `,
          backgroundSize: '200% 200%',
        }}
      />

      {/* Sacred Geometry Background - Enhanced */}
      <div className="absolute inset-0 opacity-[0.025]">
        <svg className="w-full h-full animate-rotate-slow" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice">
          {/* Outer circles */}
          <circle cx="400" cy="400" r="380" fill="none" stroke="hsl(43 80% 50%)" strokeWidth="0.5" />
          <circle cx="400" cy="400" r="300" fill="none" stroke="hsl(43 80% 50%)" strokeWidth="0.5" />
          <circle cx="400" cy="400" r="220" fill="none" stroke="hsl(43 80% 50%)" strokeWidth="0.5" />
          <circle cx="400" cy="400" r="140" fill="none" stroke="hsl(43 80% 50%)" strokeWidth="0.5" />
          
          {/* Diamond shapes */}
          <polygon points="400,20 780,400 400,780 20,400" fill="none" stroke="hsl(43 80% 50%)" strokeWidth="0.5" />
          <polygon points="400,100 700,400 400,700 100,400" fill="none" stroke="hsl(43 80% 50%)" strokeWidth="0.5" />
          
          {/* Flower of Life - 6 petals */}
          <circle cx="400" cy="260" r="140" fill="none" stroke="hsl(43 80% 50%)" strokeWidth="0.3" />
          <circle cx="521" cy="330" r="140" fill="none" stroke="hsl(43 80% 50%)" strokeWidth="0.3" />
          <circle cx="521" cy="470" r="140" fill="none" stroke="hsl(43 80% 50%)" strokeWidth="0.3" />
          <circle cx="400" cy="540" r="140" fill="none" stroke="hsl(43 80% 50%)" strokeWidth="0.3" />
          <circle cx="279" cy="470" r="140" fill="none" stroke="hsl(43 80% 50%)" strokeWidth="0.3" />
          <circle cx="279" cy="330" r="140" fill="none" stroke="hsl(43 80% 50%)" strokeWidth="0.3" />
        </svg>
      </div>

      {/* Golden Shooting Stars */}
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
            className="absolute w-3 h-3 rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(45 100% 95%) 0%, hsl(43 90% 70%) 50%, transparent 100%)',
              boxShadow: '0 0 15px hsl(43 90% 75%), 0 0 30px hsl(43 85% 70%), 0 0 45px hsl(43 80% 65%)',
            }}
          />
          <div 
            className="absolute top-1/2 right-full -translate-y-1/2"
            style={{
              width: `${star.length}px`,
              height: '3px',
              background: `linear-gradient(90deg, transparent 0%, hsl(43 85% 80% / 0.4) 40%, hsl(45 100% 90% / 0.9) 100%)`,
              borderRadius: '0 3px 3px 0',
            }}
          />
        </div>
      ))}

      {/* Twinkling Stars */}
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
            style={{ color: 'hsl(43 70% 60% / 0.6)' }}
          >
            <path
              fill="currentColor"
              d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z"
            />
          </svg>
        </div>
      ))}

      {/* Floating Light Particles */}
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
            boxShadow: `0 0 ${particle.size * 3}px ${getParticleColor(particle.type)}`,
          }}
        />
      ))}

      {/* Sparkle Clusters */}
      <div className="absolute top-1/4 left-1/4 animate-sparkle-cluster">
        <div className="relative w-40 h-40">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.4}s`,
                background: 'hsl(43 85% 75%)',
                boxShadow: '0 0 8px 3px hsl(43 90% 80% / 0.8)',
              }}
            />
          ))}
        </div>
      </div>

      <div className="absolute top-2/3 right-1/4 animate-sparkle-cluster" style={{ animationDelay: '2s' }}>
        <div className="relative w-32 h-32">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.6}s`,
                background: 'hsl(45 80% 80%)',
                boxShadow: '0 0 6px 2px hsl(43 85% 75% / 0.7)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Rainbow Prism Edge Effect */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 opacity-40"
        style={{
          background: 'linear-gradient(90deg, hsl(280 60% 75%) 0%, hsl(200 70% 75%) 25%, hsl(160 60% 70%) 50%, hsl(43 80% 70%) 75%, hsl(340 60% 75%) 100%)',
        }}
      />
    </div>
  );
};

export default ParticleBackground;
