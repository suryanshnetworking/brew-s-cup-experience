import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import GallerySection from "@/components/GallerySection";
import MenuSection from "@/components/MenuSection";
import BookingSection from "@/components/BookingSection";
import ContactSection from "@/components/ContactSection";
import CartDrawer from "@/components/CartDrawer";
import ScrollAnimator from "@/components/ScrollAnimator";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <>
      <Header />
      <CartDrawer />
      <main>
        <ScrollAnimator index={0}>
          <HeroSection />
        </ScrollAnimator>
        <ScrollAnimator index={1}>
          <AboutSection />
        </ScrollAnimator>
        <ScrollAnimator index={2}>
          <GallerySection />
        </ScrollAnimator>
        <ScrollAnimator index={3}>
          <MenuSection />
        </ScrollAnimator>
        <ScrollAnimator index={4}>
          <BookingSection />
        </ScrollAnimator>
        <ScrollAnimator index={5}>
          <ContactSection />
        </ScrollAnimator>
      </main>
      <Footer />
    </>
  );
};

export default Index;
