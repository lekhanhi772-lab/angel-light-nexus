import ParticleBackground from '@/components/ParticleBackground';
import HeroSection from '@/components/HeroSection';
import SacredPillars from '@/components/SacredPillars';
import VisionMission from '@/components/VisionMission';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import ChatInterface from '@/components/ChatInterface';

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
        <CTASection />
        <Footer />
      </main>

      {/* AI Chat */}
      <ChatInterface />
    </div>
  );
};

export default Index;
