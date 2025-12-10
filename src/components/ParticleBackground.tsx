import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

const ParticleBackground = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles: Particle[] = [];
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 2,
          delay: Math.random() * 10,
          duration: Math.random() * 10 + 10,
        });
      }
      setParticles(newParticles);
    };
    generateParticles();
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
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
            background: `radial-gradient(circle, hsl(43 85% 70% / 0.8) 0%, hsl(43 85% 70% / 0) 70%)`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}

      {/* Radial Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vh]"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(43 80% 90% / 0.15) 0%, transparent 50%)',
        }}
      />
    </div>
  );
};

export default ParticleBackground;
