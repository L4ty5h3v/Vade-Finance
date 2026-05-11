import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/sections/HowItWorks";
import MarketplacePreview from "@/components/sections/MarketplacePreview";
import SecuritySection from "@/components/sections/SecuritySection";
import TrustBadges from "@/components/sections/TrustBadges";

export default function Home() {
  return (
    <div className="relative overflow-x-clip">
      <Header />
      <main>
        <HeroSection />
        <TrustBadges />
        <HowItWorks />
        <MarketplacePreview />
        <SecuritySection />
      </main>
      <Footer />
    </div>
  );
}
