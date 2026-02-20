import HeroSection from '../components/home/HeroSection';
import Features from '../components/home/Features';
import HowItWorks from '../components/home/HowItWorks';
import PopularDestinations from '../components/home/PopularDestinations';
import Testimonials from '../components/home/Testimonials';
import FAQ from '../components/home/FAQ';
import CTASection from '../components/home/CTASection';
import Footer from '../components/home/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <Features />
      <HowItWorks />
      <PopularDestinations />
      <Testimonials />
      <FAQ />
      <CTASection />
      <Footer />
    </div>
  );
}
