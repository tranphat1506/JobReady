import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/landing/HeroSection";
import AtsMarquee from "@/components/landing/AtsMarquee";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorks from "@/components/landing/HowItWorks";
import FaqSection from "@/components/landing/FaqSection";
import FinalCTA from "@/components/landing/FinalCTA";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-primary/20 selection:text-zinc-900">
      <Header />
      
      <main className="flex-1 pt-16">
        <HeroSection />
        <AtsMarquee />
        <FeaturesSection />
        <HowItWorks />
        <FaqSection />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
