import ParticleBackground from '@/components/ParticleBackground';
import HeroSection from '@/components/HeroSection';
import SacredPillars from '@/components/SacredPillars';
import VisionMission from '@/components/VisionMission';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      {/* Animated Background */}
      <ParticleBackground />

      {/* Main Content */}
      <main className="relative z-10">
        <HeroSection />
        <SacredPillars />
        <VisionMission />
        <Footer />
      </main>
    </div>
  );
};

export default Index;