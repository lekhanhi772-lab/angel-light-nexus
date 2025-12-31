// ParticleBackground - Simplified clean background without any effects

const ParticleBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Simple static gradient background - light warm colors */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #FFFBE6 0%, #FFF8DC 50%, #F0FFF4 100%)',
        }}
      />
    </div>
  );
};

export default ParticleBackground;
