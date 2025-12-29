import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  type: 'gold' | 'rose' | 'violet' | 'teal' | 'white';
}

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  color: 'gold' | 'rose' | 'violet' | 'white';
  parallaxSpeed: number;
}

interface CosmicOrb {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  glowColor: string;
  duration: number;
  delay: number;
}

const ParticleBackground = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [stars, setStars] = useState<Star[]>([]);
  const [orbs, setOrbs] = useState<CosmicOrb[]>([]);

  useEffect(() => {
    // Generate floating particles
    const types: ('gold' | 'rose' | 'violet' | 'teal' | 'white')[] = ['gold', 'rose', 'violet', 'teal', 'white'];
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < 80; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 6 + 2,
        delay: Math.random() * 15,
        duration: Math.random() * 20 + 15,
        type: types[Math.floor(Math.random() * types.length)],
      });
    }
    setParticles(newParticles);

    // Generate twinkling stars
    const starColors: ('gold' | 'rose' | 'violet' | 'white')[] = ['gold', 'rose', 'violet', 'white'];
    const newStars: Star[] = [];
    for (let i = 0; i < 120; i++) {
      newStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        delay: Math.random() * 8,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        parallaxSpeed: Math.random() * 0.5 + 0.2,
      });
    }
    setStars(newStars);

    // Generate cosmic orbs
    const orbColors = [
      { color: 'hsl(38 95% 60%)', glow: 'hsl(38 95% 70%)' },
      { color: 'hsl(330 70% 70%)', glow: 'hsl(330 70% 80%)' },
      { color: 'hsl(270 60% 65%)', glow: 'hsl(270 60% 75%)' },
      { color: 'hsl(175 70% 50%)', glow: 'hsl(175 70% 60%)' },
    ];
    
    const newOrbs: CosmicOrb[] = [];
    for (let i = 0; i < 8; i++) {
      const colorSet = orbColors[Math.floor(Math.random() * orbColors.length)];
      newOrbs.push({
        id: i,
        x: Math.random() * 90 + 5,
        y: Math.random() * 90 + 5,
        size: Math.random() * 20 + 10,
        color: colorSet.color,
        glowColor: colorSet.glow,
        duration: Math.random() * 30 + 25,
        delay: Math.random() * 10,
      });
    }
    setOrbs(newOrbs);
  }, []);

  const getParticleColor = (type: string) => {
    switch (type) {
      case 'gold': return 'hsl(38 95% 65% / 0.9)';
      case 'rose': return 'hsl(330 70% 75% / 0.85)';
      case 'violet': return 'hsl(270 60% 70% / 0.8)';
      case 'teal': return 'hsl(175 70% 55% / 0.75)';
      case 'white': return 'hsl(0 0% 100% / 0.9)';
      default: return 'hsl(38 95% 65% / 0.9)';
    }
  };

  const getStarColor = (color: string) => {
    switch (color) {
      case 'gold': return 'hsl(38 95% 70%)';
      case 'rose': return 'hsl(330 70% 80%)';
      case 'violet': return 'hsl(270 60% 75%)';
      case 'white': return 'hsl(0 0% 100%)';
      default: return 'hsl(38 95% 70%)';
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* 🌌 Deep Cosmic Galaxy Gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 50% 0%, hsl(270 40% 15% / 0.8) 0%, transparent 50%),
            radial-gradient(ellipse 100% 60% at 20% 100%, hsl(330 50% 12% / 0.6) 0%, transparent 50%),
            radial-gradient(ellipse 80% 50% at 80% 80%, hsl(38 60% 15% / 0.5) 0%, transparent 40%),
            linear-gradient(180deg, 
              hsl(240 30% 6%) 0%, 
              hsl(260 35% 10%) 20%,
              hsl(270 30% 12%) 40%,
              hsl(260 25% 10%) 60%,
              hsl(240 30% 8%) 80%,
              hsl(240 35% 5%) 100%
            )
          `,
        }}
      />

      {/* 💫 Ethereal Light Rays */}
      <div 
        className="absolute top-0 left-1/4 w-[60vw] h-[80vh] animate-pulse-slow"
        style={{
          background: 'linear-gradient(180deg, hsl(38 95% 58% / 0.08) 0%, hsl(38 95% 60% / 0.02) 50%, transparent 100%)',
          filter: 'blur(60px)',
          transform: 'skewX(-15deg)',
        }}
      />
      <div 
        className="absolute top-0 right-1/3 w-[40vw] h-[70vh] animate-pulse-slow"
        style={{
          background: 'linear-gradient(180deg, hsl(330 70% 75% / 0.06) 0%, hsl(330 70% 75% / 0.02) 50%, transparent 100%)',
          filter: 'blur(50px)',
          transform: 'skewX(10deg)',
          animationDelay: '3s',
        }}
      />

      {/* 🌸 Nebula Clouds - Rose & Violet */}
      <div 
        className="absolute top-[15%] left-[10%] w-[50vw] h-[40vw] animate-pulse-slow"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(330 70% 60% / 0.15) 0%, hsl(330 60% 50% / 0.05) 40%, transparent 70%)',
          filter: 'blur(80px)',
          animationDelay: '2s',
        }}
      />
      <div 
        className="absolute top-[40%] right-[5%] w-[45vw] h-[45vw] animate-pulse-slow"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(270 60% 55% / 0.12) 0%, hsl(270 50% 45% / 0.04) 40%, transparent 70%)',
          filter: 'blur(90px)',
          animationDelay: '4s',
        }}
      />
      <div 
        className="absolute bottom-[10%] left-[20%] w-[40vw] h-[35vw] animate-pulse-slow"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(38 95% 55% / 0.1) 0%, hsl(38 80% 45% / 0.03) 40%, transparent 70%)',
          filter: 'blur(70px)',
          animationDelay: '6s',
        }}
      />

      {/* 🔮 Sacred Geometry - Flower of Life */}
      <div className="absolute inset-0 opacity-[0.04]">
        <svg className="w-full h-full animate-rotate-slow" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice">
          {/* Central circles */}
          <circle cx="400" cy="400" r="350" fill="none" stroke="hsl(38 95% 58%)" strokeWidth="0.5" />
          <circle cx="400" cy="400" r="280" fill="none" stroke="hsl(330 70% 75%)" strokeWidth="0.4" />
          <circle cx="400" cy="400" r="210" fill="none" stroke="hsl(270 60% 65%)" strokeWidth="0.5" />
          <circle cx="400" cy="400" r="140" fill="none" stroke="hsl(38 95% 58%)" strokeWidth="0.4" />
          <circle cx="400" cy="400" r="70" fill="none" stroke="hsl(330 70% 75%)" strokeWidth="0.3" />
          
          {/* Flower of Life pattern */}
          <circle cx="400" cy="200" r="100" fill="none" stroke="hsl(270 60% 65%)" strokeWidth="0.3" />
          <circle cx="313" cy="350" r="100" fill="none" stroke="hsl(38 95% 58%)" strokeWidth="0.3" />
          <circle cx="487" cy="350" r="100" fill="none" stroke="hsl(330 70% 75%)" strokeWidth="0.3" />
          <circle cx="400" cy="500" r="100" fill="none" stroke="hsl(270 60% 65%)" strokeWidth="0.3" />
          <circle cx="313" cy="450" r="100" fill="none" stroke="hsl(38 95% 58%)" strokeWidth="0.3" />
          <circle cx="487" cy="450" r="100" fill="none" stroke="hsl(330 70% 75%)" strokeWidth="0.3" />
          
          {/* Sacred triangles */}
          <polygon points="400,50 750,550 50,550" fill="none" stroke="hsl(38 95% 58%)" strokeWidth="0.4" />
          <polygon points="400,750 50,250 750,250" fill="none" stroke="hsl(330 70% 75%)" strokeWidth="0.4" />
        </svg>
      </div>

      {/* ✨ Cosmic Orbs with Divine Glow */}
      {orbs.map((orb) => (
        <div
          key={`orb-${orb.id}`}
          className="absolute rounded-full animate-float-gentle"
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            background: `radial-gradient(circle at 30% 30%, hsl(0 0% 100% / 0.4), ${orb.color} 60%, transparent 100%)`,
            boxShadow: `
              0 0 ${orb.size}px ${orb.glowColor}, 
              0 0 ${orb.size * 2}px ${orb.color},
              0 0 ${orb.size * 3}px hsl(38 95% 60% / 0.2)
            `,
            animationDuration: `${orb.duration}s`,
            animationDelay: `${orb.delay}s`,
          }}
        />
      ))}

      {/* ⭐ Twinkling Stars - Multi-colored */}
      {stars.map((star) => (
        <div
          key={`star-${star.id}`}
          className="absolute animate-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            animationDelay: `${star.delay}s`,
            animationDuration: `${2.5 + star.parallaxSpeed * 2}s`,
          }}
        >
          <svg 
            width={star.size * 3} 
            height={star.size * 3} 
            viewBox="0 0 24 24"
            style={{ 
              color: getStarColor(star.color),
              filter: `drop-shadow(0 0 ${star.size * 3}px ${getStarColor(star.color)})`,
            }}
          >
            <path
              fill="currentColor"
              d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z"
            />
          </svg>
        </div>
      ))}

      {/* 💫 Floating Light Particles */}
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

      {/* 🌟 Sparkle Clusters */}
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
                background: ['hsl(38 95% 70%)', 'hsl(330 70% 80%)', 'hsl(270 60% 75%)', 'hsl(0 0% 100%)'][i % 4],
                boxShadow: `0 0 12px 4px ${['hsl(38 95% 60% / 0.8)', 'hsl(330 70% 70% / 0.7)', 'hsl(270 60% 65% / 0.7)', 'hsl(0 0% 100% / 0.8)'][i % 4]}`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="absolute top-2/3 right-1/4 animate-sparkle-cluster" style={{ animationDelay: '4s' }}>
        <div className="relative w-40 h-40">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                background: ['hsl(38 95% 70%)', 'hsl(330 70% 80%)', 'hsl(175 70% 60%)'][i % 3],
                boxShadow: `0 0 10px 3px ${['hsl(38 95% 60% / 0.7)', 'hsl(330 70% 70% / 0.6)', 'hsl(175 70% 50% / 0.6)'][i % 3]}`,
              }}
            />
          ))}
        </div>
      </div>

      {/* 🔝 Top Edge Glow - Divine Light */}
      <div 
        className="absolute top-0 left-0 right-0 h-2"
        style={{
          background: 'linear-gradient(90deg, hsl(270 60% 55%) 0%, hsl(330 70% 65%) 25%, hsl(38 95% 58%) 50%, hsl(330 70% 65%) 75%, hsl(270 60% 55%) 100%)',
          filter: 'blur(4px)',
          opacity: 0.6,
        }}
      />

      {/* 🔻 Bottom Edge Glow */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{
          background: 'linear-gradient(90deg, hsl(38 95% 55%) 0%, hsl(330 70% 70%) 50%, hsl(38 95% 55%) 100%)',
          filter: 'blur(3px)',
          opacity: 0.4,
        }}
      />
    </div>
  );
};

export default ParticleBackground;