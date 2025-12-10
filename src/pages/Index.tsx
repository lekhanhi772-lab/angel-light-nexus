import ParticleBackground from '@/components/ParticleBackground';
import GrokStyleChat from '@/components/GrokStyleChat';
import SacredPillars from '@/components/SacredPillars';
import VisionMission from '@/components/VisionMission';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      {/* Animated Background */}
      <ParticleBackground />

      {/* Main Content */}
      <main className="relative z-10">
        <GrokStyleChat />
        <SacredPillars />
        <VisionMission />
        <CTASection />
        <Footer />
      </main>
    </div>
  );
};

export default Index;
