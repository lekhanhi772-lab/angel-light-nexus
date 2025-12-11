import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  type: 'gold' | 'white' | 'purple';
}

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

const ParticleBackground = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    // Generate floating particles
    const newParticles: Particle[] = [];
    const types: ('gold' | 'white' | 'purple')[] = ['gold', 'white', 'purple'];
    
    for (let i = 0; i < 60; i++) {
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
    for (let i = 0; i < 80; i++) {
      newStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        delay: Math.random() * 5,
      });
    }
    setStars(newStars);
  }, []);

  const getParticleColor = (type: string) => {
    switch (type) {
      case 'gold':
        return 'hsl(43 85% 70% / 0.8)';
      case 'white':
        return 'hsl(0 0% 100% / 0.6)';
      case 'purple':
        return 'hsl(280 60% 70% / 0.5)';
      default:
        return 'hsl(43 85% 70% / 0.8)';
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Shimmer Gradient Overlay */}
      <div 
        className="absolute inset-0 animate-shimmer"
        style={{
          background: `
            linear-gradient(
              45deg,
              transparent 30%,
              hsl(43 85% 90% / 0.05) 45%,
              hsl(43 85% 95% / 0.1) 50%,
              hsl(43 85% 90% / 0.05) 55%,
              transparent 70%
            )
          `,
          backgroundSize: '200% 200%',
        }}
      />

      {/* Sacred Geometry Background */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg className="w-full h-full animate-rotate-slow" viewBox="0 0 400 400">
          <circle cx="200" cy="200" r="150" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-divine-gold" />
          <circle cx="200" cy="200" r="100" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-divine-gold" />
          <circle cx="200" cy="200" r="50" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-divine-gold" />
          <polygon points="200,50 350,200 200,350 50,200" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-divine-gold" />
          <polygon points="200,80 320,200 200,320 80,200" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-divine-gold" />
        </svg>
      </div>

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
            className="text-divine-gold/60"
          >
            <path
              fill="currentColor"
              d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z"
            />
          </svg>
        </div>
      ))}

      {/* Floating Particles */}
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

      {/* Sparkle Clusters */}
      <div className="absolute top-1/4 left-1/4 animate-sparkle-cluster">
        <div className="relative w-32 h-32">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                boxShadow: '0 0 6px 2px hsl(43 85% 80% / 0.8)',
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
              className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.7}s`,
                boxShadow: '0 0 6px 2px hsl(280 60% 80% / 0.6)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Radial Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vh]"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(43 80% 90% / 0.15) 0%, transparent 50%)',
        }}
      />

      {/* Secondary Glow - Purple tint */}
      <div 
        className="absolute top-1/3 right-1/4 w-[50vw] h-[50vh] animate-pulse-slow"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(280 60% 85% / 0.08) 0%, transparent 60%)',
        }}
      />
    </div>
  );
};

export default ParticleBackground;
