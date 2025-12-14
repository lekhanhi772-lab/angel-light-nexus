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
    // Generate floating particles with multi colors - increased by 30%
    const newParticles: Particle[] = [];
    const types: ('gold' | 'blue' | 'white' | 'mint' | 'purple' | 'pink')[] = ['gold', 'blue', 'white', 'mint', 'purple', 'pink'];
    
    for (let i = 0; i < 105; i++) { // Increased from 80 to 105 (+30%)
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 8 + 4, // Slightly larger
        delay: Math.random() * 10,
        duration: Math.random() * 12 + 15,
        type: types[Math.floor(Math.random() * types.length)],
      });
    }
    setParticles(newParticles);

    // Generate twinkling stars - multi colors with parallax - increased
    const starColors: ('gold' | 'blue' | 'white' | 'mint' | 'purple' | 'pink')[] = ['gold', 'blue', 'white', 'mint', 'purple', 'pink'];
    const newStars: Star[] = [];
    for (let i = 0; i < 160; i++) { // Increased from 120 to 160
      newStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2, // Larger stars
        delay: Math.random() * 5,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        parallaxSpeed: Math.random() * 0.5 + 0.2,
      });
    }
    setStars(newStars);

    // Generate mini planets - brighter colors
    const planetColors = [
      { color: 'hsl(43 100% 65%)', glow: 'hsl(43 100% 75%)' }, // Gold - brighter
      { color: 'hsl(197 71% 75%)', glow: 'hsl(197 71% 85%)' }, // Blue - brighter
      { color: 'hsl(157 52% 75%)', glow: 'hsl(157 52% 85%)' }, // Mint - brighter
      { color: 'hsl(280 60% 80%)', glow: 'hsl(280 60% 90%)' }, // Purple - brighter
      { color: 'hsl(340 80% 85%)', glow: 'hsl(340 80% 92%)' }, // Pink - brighter
      { color: 'hsl(0 0% 100%)', glow: 'hsl(43 100% 90%)' }, // White with gold glow
    ];
    
    const newPlanets: MiniPlanet[] = [];
    for (let i = 0; i < 15; i++) { // Increased from 12 to 15
      const colorSet = planetColors[Math.floor(Math.random() * planetColors.length)];
      newPlanets.push({
        id: i,
        x: Math.random() * 90 + 5,
        y: Math.random() * 90 + 5,
        size: Math.random() * 14 + 8, // Larger planets
        color: colorSet.color,
        orbitDuration: Math.random() * 30 + 40,
        delay: Math.random() * 10,
        glowColor: colorSet.glow,
      });
    }
    setMiniPlanets(newPlanets);

    // Generate shooting stars - 2-3 at a time with brighter glow
    const generateShootingStars = () => {
      const newShootingStars: ShootingStar[] = [];
      const count = Math.floor(Math.random() * 2) + 2;
      
      for (let i = 0; i < count; i++) {
        newShootingStars.push({
          id: i,
          x: Math.random() * 80,
          y: Math.random() * 40,
          delay: Math.random() * 3 + i * 1.5,
          duration: Math.random() * 1.5 + 2,
          angle: 25 + Math.random() * 25,
          length: 140 + Math.random() * 120, // Longer trails
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
        return 'hsl(43 100% 70% / 1)';
      case 'blue':
        return 'hsl(197 71% 80% / 0.95)';
      case 'white':
        return 'hsl(60 100% 99% / 1)';
      case 'mint':
        return 'hsl(157 52% 80% / 0.9)';
      case 'purple':
        return 'hsl(280 60% 80% / 0.9)';
      case 'pink':
        return 'hsl(340 80% 85% / 0.9)';
      default:
        return 'hsl(43 100% 70% / 0.95)';
    }
  };

  const getStarColor = (color: string) => {
    switch (color) {
      case 'gold':
        return 'hsl(43 100% 75%)';
      case 'blue':
        return 'hsl(197 71% 85%)';
      case 'white':
        return 'hsl(0 0% 100%)';
      case 'mint':
        return 'hsl(157 52% 85%)';
      case 'purple':
        return 'hsl(280 60% 85%)';
      case 'pink':
        return 'hsl(340 80% 90%)';
      default:
        return 'hsl(43 100% 75%)';
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* BRIGHT 5D Galaxy Base Gradient - Sky Blue → Gold → White */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg, 
              hsl(197 71% 85%) 0%, 
              hsl(197 60% 88%) 15%,
              hsl(50 80% 92%) 35%, 
              hsl(45 90% 94%) 50%,
              hsl(60 100% 97%) 70%,
              hsl(0 0% 100%) 100%
            )
          `,
        }}
      />

      {/* Light Nebula Effects - Cosmic Clouds with bright glow */}
      <div 
        className="absolute top-[10%] left-[5%] w-[60vw] h-[50vw] animate-pulse-slow"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(197 71% 80% / 0.4) 0%, hsl(197 60% 85% / 0.2) 40%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div 
        className="absolute top-[30%] right-[10%] w-[45vw] h-[45vw] animate-pulse-slow"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(43 100% 75% / 0.35) 0%, hsl(43 90% 80% / 0.15) 40%, transparent 70%)',
          filter: 'blur(70px)',
          animationDelay: '3s',
        }}
      />
      <div 
        className="absolute bottom-[15%] left-[20%] w-[40vw] h-[35vw] animate-pulse-slow"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(340 80% 85% / 0.25) 0%, hsl(340 70% 88% / 0.12) 40%, transparent 70%)',
          filter: 'blur(55px)',
          animationDelay: '5s',
        }}
      />
      <div 
        className="absolute top-[60%] right-[30%] w-[35vw] h-[30vw] animate-pulse-slow"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(157 52% 80% / 0.3) 0%, hsl(157 45% 85% / 0.15) 40%, transparent 70%)',
          filter: 'blur(50px)',
          animationDelay: '7s',
        }}
      />

      {/* Golden Light Rays from top */}
      <div 
        className="absolute top-0 left-1/4 w-[50vw] h-[80vh]"
        style={{
          background: 'linear-gradient(180deg, hsl(43 100% 70% / 0.15) 0%, hsl(43 100% 80% / 0.05) 50%, transparent 100%)',
          filter: 'blur(40px)',
          transform: 'skewX(-15deg)',
        }}
      />
      <div 
        className="absolute top-0 right-1/4 w-[40vw] h-[70vh]"
        style={{
          background: 'linear-gradient(180deg, hsl(197 71% 80% / 0.12) 0%, hsl(197 60% 85% / 0.04) 50%, transparent 100%)',
          filter: 'blur(35px)',
          transform: 'skewX(10deg)',
        }}
      />

      {/* Cosmic Dust Layer - Brighter */}
      <div 
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: `
            radial-gradient(2px 2px at 10% 20%, hsl(43 100% 60% / 0.6) 1px, transparent 1px),
            radial-gradient(2px 2px at 30% 50%, hsl(43 100% 70% / 0.5) 1px, transparent 1px),
            radial-gradient(2px 2px at 50% 30%, hsl(197 71% 80% / 0.5) 1px, transparent 1px),
            radial-gradient(2px 2px at 70% 60%, hsl(0 0% 100% / 0.6) 1px, transparent 1px),
            radial-gradient(2px 2px at 90% 40%, hsl(43 100% 75% / 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '200px 200px, 300px 300px, 250px 250px, 180px 180px, 220px 220px',
        }}
      />

      {/* Sacred Geometry Background - Ethereal Light */}
      <div className="absolute inset-0 opacity-[0.08]">
        <svg className="w-full h-full animate-rotate-slow" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice">
          <circle cx="400" cy="400" r="380" fill="none" stroke="hsl(43 100% 50%)" strokeWidth="0.8" />
          <circle cx="400" cy="400" r="300" fill="none" stroke="hsl(197 71% 60%)" strokeWidth="0.6" />
          <circle cx="400" cy="400" r="220" fill="none" stroke="hsl(43 100% 55%)" strokeWidth="0.8" />
          <circle cx="400" cy="400" r="140" fill="none" stroke="hsl(197 71% 55%)" strokeWidth="0.6" />
          <polygon points="400,20 780,400 400,780 20,400" fill="none" stroke="hsl(43 100% 50%)" strokeWidth="0.6" />
          <polygon points="400,100 700,400 400,700 100,400" fill="none" stroke="hsl(197 71% 50%)" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Shooting Stars with Enhanced Gold/White Glow */}
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
          {/* Star head - brighter */}
          <div 
            className="absolute w-6 h-6 rounded-full"
            style={{
              background: star.color === 'gold' 
                ? 'radial-gradient(circle, hsl(60 100% 100%) 0%, hsl(43 100% 70%) 50%, transparent 100%)'
                : 'radial-gradient(circle, hsl(0 0% 100%) 0%, hsl(197 71% 80%) 50%, transparent 100%)',
              boxShadow: star.color === 'gold'
                ? '0 0 35px hsl(43 100% 70%), 0 0 70px hsl(43 100% 60%), 0 0 100px hsl(43 100% 55%)'
                : '0 0 35px hsl(197 71% 85%), 0 0 70px hsl(197 71% 75%), 0 0 100px hsl(197 71% 65%)',
            }}
          />
          {/* Star trail - brighter */}
          <div 
            className="absolute top-1/2 right-full -translate-y-1/2"
            style={{
              width: `${star.length}px`,
              height: '6px',
              background: star.color === 'gold'
                ? 'linear-gradient(90deg, transparent 0%, hsl(197 71% 90% / 0.4) 20%, hsl(43 100% 85% / 0.8) 60%, hsl(60 100% 98%) 100%)'
                : 'linear-gradient(90deg, transparent 0%, hsl(43 100% 80% / 0.4) 20%, hsl(197 71% 90% / 0.8) 60%, hsl(0 0% 100%) 100%)',
              borderRadius: '0 4px 4px 0',
            }}
          />
        </div>
      ))}

      {/* Mini Planets with Enhanced Halo Effect */}
      {miniPlanets.map((planet) => (
        <div
          key={`planet-${planet.id}`}
          className="absolute rounded-full animate-float-gentle"
          style={{
            left: `${planet.x}%`,
            top: `${planet.y}%`,
            width: `${planet.size}px`,
            height: `${planet.size}px`,
            background: `radial-gradient(circle at 30% 30%, hsl(0 0% 100% / 0.6), ${planet.color} 60%, hsl(43 100% 70% / 0.3) 100%)`,
            boxShadow: `
              0 0 ${planet.size * 1.5}px ${planet.glowColor}, 
              0 0 ${planet.size * 2.5}px hsl(43 100% 70% / 0.5),
              inset -2px -2px ${planet.size / 3}px hsl(43 100% 50% / 0.3)
            `,
            animationDuration: `${planet.orbitDuration}s`,
            animationDelay: `${planet.delay}s`,
          }}
        />
      ))}

      {/* Twinkling Stars - Multi Colors with Gold Halo */}
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
            width={star.size * 3.5} 
            height={star.size * 3.5} 
            viewBox="0 0 24 24"
            style={{ 
              color: getStarColor(star.color),
              filter: `drop-shadow(0 0 ${star.size * 3}px ${getStarColor(star.color)}) drop-shadow(0 0 ${star.size * 5}px hsl(43 100% 70% / 0.5))`,
            }}
          >
            <path
              fill="currentColor"
              d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z"
            />
          </svg>
        </div>
      ))}

      {/* Floating Light Particles - Enhanced Brightness */}
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
            boxShadow: `0 0 ${particle.size * 6}px ${getParticleColor(particle.type)}, 0 0 ${particle.size * 10}px hsl(43 100% 75% / 0.4)`,
          }}
        />
      ))}

      {/* Sparkle Clusters - Brighter */}
      <div className="absolute top-1/4 left-1/4 animate-sparkle-cluster">
        <div className="relative w-56 h-56">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.25}s`,
                background: ['hsl(43 100% 75%)', 'hsl(197 71% 85%)', 'hsl(280 60% 85%)', 'hsl(340 80% 90%)', 'hsl(0 0% 100%)'][i % 5],
                boxShadow: `0 0 15px 6px ${['hsl(43 100% 70% / 1)', 'hsl(197 71% 80% / 0.9)', 'hsl(280 60% 80% / 0.9)', 'hsl(340 80% 85% / 0.9)', 'hsl(0 0% 100% / 1)'][i % 5]}, 0 0 25px 10px hsl(43 100% 75% / 0.5)`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="absolute top-2/3 right-1/4 animate-sparkle-cluster" style={{ animationDelay: '3s' }}>
        <div className="relative w-48 h-48">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.4}s`,
                background: ['hsl(43 100% 70%)', 'hsl(157 52% 80%)', 'hsl(197 71% 85%)', 'hsl(0 0% 100%)'][i % 4],
                boxShadow: `0 0 12px 5px ${['hsl(43 100% 65% / 0.9)', 'hsl(157 52% 75% / 0.9)', 'hsl(197 71% 80% / 0.9)', 'hsl(0 0% 100% / 1)'][i % 4]}, 0 0 20px 8px hsl(43 100% 70% / 0.4)`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Top Edge Glow - Golden Light */}
      <div 
        className="absolute top-0 left-0 right-0 h-3 opacity-70"
        style={{
          background: 'linear-gradient(90deg, hsl(197 71% 70%) 0%, hsl(43 100% 65%) 25%, hsl(43 100% 70%) 50%, hsl(43 100% 65%) 75%, hsl(197 71% 70%) 100%)',
          filter: 'blur(3px)',
        }}
      />

      {/* Bottom Edge Glow - Soft White */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-2 opacity-50"
        style={{
          background: 'linear-gradient(90deg, hsl(197 71% 85%) 0%, hsl(0 0% 100%) 50%, hsl(197 71% 85%) 100%)',
          filter: 'blur(2px)',
        }}
      />
    </div>
  );
};

export default ParticleBackground;