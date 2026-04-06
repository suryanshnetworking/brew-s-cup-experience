import heroImg from "@/assets/hero-couple.jpg";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  const scrollTo = (id: string) => {
    // Make ALL section-animate wrappers visible so layout is correct
    document.querySelectorAll('.section-animate').forEach(el => el.classList.add('visible'));
    setTimeout(() => {
      const section = document.querySelector(id);
      if (section) section.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, hsl(32 80% 45% / 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, hsl(24 60% 25% / 0.1) 0%, transparent 50%)`
        }} />
      </div>

      <div className="container mx-auto px-4 md:px-8 pt-24 md:pt-0">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
          {/* Image - left on desktop */}
          <div className="order-2 md:order-1 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={heroImg}
                alt="A couple enjoying coffee at Brew's Cup cafe"
                width={896}
                height={1024}
                className="w-full h-[400px] md:h-[550px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-accent/20 blur-xl" />
            <div className="absolute -top-4 -left-4 w-32 h-32 rounded-full bg-primary/10 blur-2xl" />
          </div>

          {/* Text - right */}
          <div className="order-1 md:order-2 space-y-6 md:space-y-8">
            <div className="space-y-3">
              <p className="text-accent font-medium tracking-widest uppercase text-sm">Welcome to</p>
              <h1 className="font-display text-5xl md:text-7xl font-bold text-primary leading-tight">
                Brew's<br />
                <span className="text-gradient-gold">Cup</span>
              </h1>
            </div>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg">
              Where every sip tells a story. Handcrafted coffee, fresh bites & a cozy ambiance — delivered to your door or enjoyed at our tables.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => scrollTo("#menu")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                View Menu
              </Button>
              <Button
                onClick={() => scrollTo("#booking")}
                variant="outline"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-6 text-base font-semibold rounded-xl transition-all"
              >
                Book a Table
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
