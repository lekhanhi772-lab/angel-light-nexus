import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  type: 'gold' | 'blue' | 'white' | 'mint' | 'purple' | 'pink';
}

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  color: 'gold' | 'blue' | 'white' | 'mint' | 'purple' | 'pink';
  parallaxSpeed: number;
}

interface ShootingStar {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  angle: number;
  length: number;
  color: 'gold' | 'blue';
}

interface MiniPlanet {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  orbitDuration: number;
  delay: number;
  glowColor: string;
}

const ParticleBackground = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [stars, setStars] = useState<Star[]>([]);
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);
  const [miniPlanets, setMiniPlanets] = useState<MiniPlanet[]>([]);

  useEffect(() => {
    // Generate floating particles with multi colors
    const newParticles: Particle[] = [];
    const types: ('gold' | 'blue' | 'white' | 'mint' | 'purple' | 'pink')[] = ['gold', 'blue', 'white', 'mint', 'purple', 'pink'];
    
    for (let i = 0; i < 80; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 6 + 3,
        delay: Math.random() * 10,
        duration: Math.random() * 12 + 15,
        type: types[Math.floor(Math.random() * types.length)],
      });
    }
    setParticles(newParticles);

    // Generate twinkling stars - multi colors with parallax
    const starColors: ('gold' | 'blue' | 'white' | 'mint' | 'purple' | 'pink')[] = ['gold', 'blue', 'white', 'mint', 'purple', 'pink'];
    const newStars: Star[] = [];
    for (let i = 0; i < 120; i++) {
      newStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        delay: Math.random() * 5,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        parallaxSpeed: Math.random() * 0.5 + 0.2,
      });
    }
    setStars(newStars);

    // Generate mini planets
    const planetColors = [
      { color: 'hsl(43 100% 50%)', glow: 'hsl(43 100% 60%)' }, // Gold
      { color: 'hsl(197 71% 60%)', glow: 'hsl(197 71% 70%)' }, // Blue
      { color: 'hsl(157 52% 60%)', glow: 'hsl(157 52% 70%)' }, // Mint
      { color: 'hsl(280 60% 65%)', glow: 'hsl(280 60% 75%)' }, // Purple
      { color: 'hsl(340 80% 70%)', glow: 'hsl(340 80% 80%)' }, // Pink
      { color: 'hsl(0 0% 95%)', glow: 'hsl(0 0% 100%)' }, // White
    ];
    
    const newPlanets: MiniPlanet[] = [];
    for (let i = 0; i < 12; i++) {
      const colorSet = planetColors[Math.floor(Math.random() * planetColors.length)];
      newPlanets.push({
        id: i,
        x: Math.random() * 90 + 5,
        y: Math.random() * 90 + 5,
        size: Math.random() * 12 + 6,
        color: colorSet.color,
        orbitDuration: Math.random() * 30 + 40,
        delay: Math.random() * 10,
        glowColor: colorSet.glow,
      });
    }
    setMiniPlanets(newPlanets);

    // Generate shooting stars - 2-3 at a time
    const generateShootingStars = () => {
      const newShootingStars: ShootingStar[] = [];
      const count = Math.floor(Math.random() * 2) + 2; // 2-3 shooting stars
      
      for (let i = 0; i < count; i++) {
        newShootingStars.push({
          id: i,
          x: Math.random() * 80,
          y: Math.random() * 40,
          delay: Math.random() * 3 + i * 1.5,
          duration: Math.random() * 1.5 + 2,
          angle: 25 + Math.random() * 25,
          length: 120 + Math.random() * 100,
          color: Math.random() > 0.5 ? 'gold' : 'blue',
        });
      }
      setShootingStars(newShootingStars);
    };

    generateShootingStars();
    const interval = setInterval(generateShootingStars, 6000);

    return () => clearInterval(interval);
  }, []);

  const getParticleColor = (type: string) => {
    switch (type) {
      case 'gold':
        return 'hsl(43 100% 55% / 0.9)';
      case 'blue':
        return 'hsl(197 71% 70% / 0.85)';
      case 'white':
        return 'hsl(60 100% 98% / 0.95)';
      case 'mint':
        return 'hsl(157 52% 70% / 0.8)';
      case 'purple':
        return 'hsl(280 60% 70% / 0.8)';
      case 'pink':
        return 'hsl(340 80% 75% / 0.8)';
      default:
        return 'hsl(43 100% 55% / 0.8)';
    }
  };

  const getStarColor = (color: string) => {
    switch (color) {
      case 'gold':
        return 'hsl(43 100% 60%)';
      case 'blue':
        return 'hsl(197 71% 75%)';
      case 'white':
        return 'hsl(0 0% 100%)';
      case 'mint':
        return 'hsl(157 52% 75%)';
      case 'purple':
        return 'hsl(280 60% 75%)';
      case 'pink':
        return 'hsl(340 80% 80%)';
      default:
        return 'hsl(43 100% 60%)';
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Deep Galaxy Base Gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg, 
              hsl(217 70% 8%) 0%, 
              hsl(220 65% 12%) 20%,
              hsl(217 60% 15%) 40%, 
              hsl(220 55% 18%) 60%,
              hsl(222 50% 22%) 80%,
              hsl(225 45% 28%) 100%
            )
          `,
        }}
      />

      {/* Nebula Effects - Cosmic Clouds */}
      <div 
        className="absolute top-[10%] left-[5%] w-[60vw] h-[50vw] animate-pulse-slow"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(197 71% 50% / 0.15) 0%, hsl(220 60% 40% / 0.08) 40%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div 
        className="absolute top-[30%] right-[10%] w-[45vw] h-[45vw] animate-pulse-slow"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(43 100% 50% / 0.12) 0%, hsl(30 80% 40% / 0.06) 40%, transparent 70%)',
          filter: 'blur(70px)',
          animationDelay: '3s',
        }}
      />
      <div 
        className="absolute bottom-[15%] left-[20%] w-[40vw] h-[35vw] animate-pulse-slow"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(280 60% 50% / 0.1) 0%, hsl(260 50% 35% / 0.05) 40%, transparent 70%)',
          filter: 'blur(55px)',
          animationDelay: '5s',
        }}
      />
      <div 
        className="absolute top-[60%] right-[30%] w-[35vw] h-[30vw] animate-pulse-slow"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(157 52% 50% / 0.1) 0%, hsl(170 45% 35% / 0.05) 40%, transparent 70%)',
          filter: 'blur(50px)',
          animationDelay: '7s',
        }}
      />

      {/* Cosmic Dust Layer */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 10% 20%, hsl(0 0% 100% / 0.4) 1px, transparent 1px),
            radial-gradient(1px 1px at 30% 50%, hsl(43 100% 70% / 0.3) 1px, transparent 1px),
            radial-gradient(1px 1px at 50% 30%, hsl(197 71% 75% / 0.3) 1px, transparent 1px),
            radial-gradient(1px 1px at 70% 60%, hsl(0 0% 100% / 0.35) 1px, transparent 1px),
            radial-gradient(1px 1px at 90% 40%, hsl(43 100% 65% / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '200px 200px, 300px 300px, 250px 250px, 180px 180px, 220px 220px',
        }}
      />

      {/* Sacred Geometry Background - Ethereal */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg className="w-full h-full animate-rotate-slow" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice">
          <circle cx="400" cy="400" r="380" fill="none" stroke="hsl(43 100% 60%)" strokeWidth="0.5" />
          <circle cx="400" cy="400" r="300" fill="none" stroke="hsl(197 71% 70%)" strokeWidth="0.4" />
          <circle cx="400" cy="400" r="220" fill="none" stroke="hsl(43 100% 55%)" strokeWidth="0.5" />
          <circle cx="400" cy="400" r="140" fill="none" stroke="hsl(197 71% 65%)" strokeWidth="0.4" />
          <polygon points="400,20 780,400 400,780 20,400" fill="none" stroke="hsl(43 100% 50%)" strokeWidth="0.4" />
          <polygon points="400,100 700,400 400,700 100,400" fill="none" stroke="hsl(197 71% 60%)" strokeWidth="0.3" />
        </svg>
      </div>

      {/* Shooting Stars with Gold/Blue Trail */}
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
            className="absolute w-5 h-5 rounded-full"
            style={{
              background: star.color === 'gold' 
                ? 'radial-gradient(circle, hsl(60 100% 98%) 0%, hsl(43 100% 60%) 50%, transparent 100%)'
                : 'radial-gradient(circle, hsl(0 0% 100%) 0%, hsl(197 71% 70%) 50%, transparent 100%)',
              boxShadow: star.color === 'gold'
                ? '0 0 25px hsl(43 100% 60%), 0 0 50px hsl(43 100% 50%), 0 0 80px hsl(43 100% 45%)'
                : '0 0 25px hsl(197 71% 75%), 0 0 50px hsl(197 71% 65%), 0 0 80px hsl(197 71% 55%)',
            }}
          />
          {/* Star trail */}
          <div 
            className="absolute top-1/2 right-full -translate-y-1/2"
            style={{
              width: `${star.length}px`,
              height: '5px',
              background: star.color === 'gold'
                ? 'linear-gradient(90deg, transparent 0%, hsl(197 71% 80% / 0.3) 20%, hsl(43 100% 75% / 0.7) 60%, hsl(60 100% 95%) 100%)'
                : 'linear-gradient(90deg, transparent 0%, hsl(43 100% 70% / 0.3) 20%, hsl(197 71% 80% / 0.7) 60%, hsl(0 0% 100%) 100%)',
              borderRadius: '0 4px 4px 0',
            }}
          />
        </div>
      ))}

      {/* Mini Planets with Orbit Animation */}
      {miniPlanets.map((planet) => (
        <div
          key={`planet-${planet.id}`}
          className="absolute rounded-full animate-float-gentle"
          style={{
            left: `${planet.x}%`,
            top: `${planet.y}%`,
            width: `${planet.size}px`,
            height: `${planet.size}px`,
            background: `radial-gradient(circle at 30% 30%, hsl(0 0% 100% / 0.3), ${planet.color} 50%, hsl(220 50% 15%) 100%)`,
            boxShadow: `0 0 ${planet.size}px ${planet.glowColor}, inset -2px -2px ${planet.size / 3}px hsl(220 50% 10%)`,
            animationDuration: `${planet.orbitDuration}s`,
            animationDelay: `${planet.delay}s`,
          }}
        />
      ))}

      {/* Twinkling Stars - Multi Colors with Parallax */}
      {stars.map((star) => (
        <div
          key={`star-${star.id}`}
          className="absolute animate-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            animationDelay: `${star.delay}s`,
            animationDuration: `${2 + star.parallaxSpeed * 2}s`,
          }}
        >
          <svg 
            width={star.size * 3} 
            height={star.size * 3} 
            viewBox="0 0 24 24"
            style={{ 
              color: getStarColor(star.color),
              filter: `drop-shadow(0 0 ${star.size * 2}px ${getStarColor(star.color)})`,
            }}
          >
            <path
              fill="currentColor"
              d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z"
            />
          </svg>
        </div>
      ))}

      {/* Floating Light Particles - Enhanced Glow */}
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
            boxShadow: `0 0 ${particle.size * 5}px ${getParticleColor(particle.type)}`,
          }}
        />
      ))}

      {/* Sparkle Clusters */}
      <div className="absolute top-1/4 left-1/4 animate-sparkle-cluster">
        <div className="relative w-56 h-56">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.25}s`,
                background: ['hsl(43 100% 65%)', 'hsl(197 71% 75%)', 'hsl(280 60% 75%)', 'hsl(340 80% 80%)', 'hsl(0 0% 100%)'][i % 5],
                boxShadow: `0 0 12px 5px ${['hsl(43 100% 60% / 0.9)', 'hsl(197 71% 70% / 0.8)', 'hsl(280 60% 70% / 0.8)', 'hsl(340 80% 75% / 0.8)', 'hsl(0 0% 100% / 0.9)'][i % 5]}`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="absolute top-2/3 right-1/4 animate-sparkle-cluster" style={{ animationDelay: '3s' }}>
        <div className="relative w-48 h-48">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.4}s`,
                background: ['hsl(43 100% 60%)', 'hsl(157 52% 70%)', 'hsl(197 71% 75%)', 'hsl(0 0% 100%)'][i % 4],
                boxShadow: `0 0 10px 4px ${['hsl(43 100% 55% / 0.8)', 'hsl(157 52% 65% / 0.8)', 'hsl(197 71% 70% / 0.8)', 'hsl(0 0% 100% / 0.9)'][i % 4]}`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Galaxy Edge Glow */}
      <div 
        className="absolute top-0 left-0 right-0 h-2 opacity-60"
        style={{
          background: 'linear-gradient(90deg, hsl(197 71% 60%) 0%, hsl(43 100% 55%) 25%, hsl(280 60% 60%) 50%, hsl(43 100% 55%) 75%, hsl(197 71% 60%) 100%)',
          filter: 'blur(2px)',
        }}
      />
    </div>
  );
};

export default ParticleBackground;
