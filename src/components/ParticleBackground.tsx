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
      {/* Shimmer Gradient Overlay - Warm Golden */}
      <div 
        className="absolute inset-0 animate-shimmer"
        style={{
          background: `
            linear-gradient(
              45deg,
              transparent 30%,
              hsl(43 80% 85% / 0.08) 45%,
              hsl(43 85% 90% / 0.12) 50%,
              hsl(43 80% 85% / 0.08) 55%,
              transparent 70%
            )
          `,
          backgroundSize: '200% 200%',
        }}
      />

      {/* Sacred Geometry Background - Golden */}
      <div className="absolute inset-0 opacity-[0.04]">
        <svg className="w-full h-full animate-rotate-slow" viewBox="0 0 400 400">
          <circle cx="200" cy="200" r="150" fill="none" stroke="hsl(43 80% 55%)" strokeWidth="0.5" />
          <circle cx="200" cy="200" r="100" fill="none" stroke="hsl(43 80% 55%)" strokeWidth="0.5" />
          <circle cx="200" cy="200" r="50" fill="none" stroke="hsl(43 80% 55%)" strokeWidth="0.5" />
          <polygon points="200,50 350,200 200,350 50,200" fill="none" stroke="hsl(43 80% 55%)" strokeWidth="0.5" />
          <polygon points="200,80 320,200 200,320 80,200" fill="none" stroke="hsl(43 80% 55%)" strokeWidth="0.5" />
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
          {/* Star head */}
          <div 
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(43 90% 80%) 0%, hsl(43 85% 60%) 50%, transparent 100%)',
              boxShadow: '0 0 10px hsl(43 85% 70%), 0 0 20px hsl(43 85% 65%), 0 0 30px hsl(43 80% 60%)',
            }}
          />
          {/* Star tail */}
          <div 
            className="absolute top-1/2 right-full -translate-y-1/2"
            style={{
              width: `${star.length}px`,
              height: '2px',
              background: `linear-gradient(90deg, transparent 0%, hsl(43 85% 70% / 0.3) 30%, hsl(43 90% 80% / 0.8) 100%)`,
              borderRadius: '0 2px 2px 0',
            }}
          />
        </div>
      ))}

      {/* Twinkling Stars - Golden */}
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
            style={{ color: 'hsl(43 80% 55% / 0.5)' }}
          >
            <path
              fill="currentColor"
              d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z"
            />
          </svg>
        </div>
      ))}

      {/* Floating Particles - Warm Golden */}
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
            boxShadow: `0 0 ${particle.size * 2}px ${getParticleColor(particle.type)}`,
          }}
        />
      ))}

      {/* Sparkle Clusters - Golden */}
      <div className="absolute top-1/4 left-1/4 animate-sparkle-cluster">
        <div className="relative w-32 h-32">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                background: 'hsl(43 80% 70%)',
                boxShadow: '0 0 6px 2px hsl(43 85% 75% / 0.8)',
              }}
            />
          ))}
        </div>
      </div>

      <div className="absolute top-2/3 right-1/4 animate-sparkle-cluster" style={{ animationDelay: '2s' }}>
        <div className="relative w-24 h-24">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.7}s`,
                background: 'hsl(40 70% 75%)',
                boxShadow: '0 0 6px 2px hsl(43 80% 70% / 0.6)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Radial Glow - Warm Golden */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vh]"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(43 80% 85% / 0.2) 0%, transparent 50%)',
        }}
      />

      {/* Secondary Glow - Soft Cream */}
      <div 
        className="absolute top-1/3 right-1/4 w-[50vw] h-[50vh] animate-pulse-slow"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(45 60% 88% / 0.15) 0%, transparent 60%)',
        }}
      />
    </div>
  );
};

export default ParticleBackground;
