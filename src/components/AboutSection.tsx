import aboutImg from "@/assets/about-coffee.jpg";

export default function AboutSection() {
  return (
    <section id="about" className="py-20 md:py-28 bg-secondary/30">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Text - left */}
          <div className="space-y-6">
            <p className="text-accent font-medium tracking-widest uppercase text-sm">Our Story</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary">About Us</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                At <strong className="text-foreground">Brew's Cup</strong>, we believe that great coffee is more than just a drink — it's an experience. Nestled in the heart of Jhansi, our cafe is a haven for coffee lovers and food enthusiasts alike.
              </p>
              <p>
                Every cup is handcrafted with passion using the finest beans sourced from sustainable farms. Our baristas are artists, turning each order into a moment of pure joy.
              </p>
              <p>
                Whether you're here for a quiet morning brew, a cozy evening with friends, or a quick bite on the go, Brew's Cup offers the perfect blend of flavors, warmth, and hospitality.
              </p>
            </div>
            <div className="flex gap-8 pt-4">
              <div className="text-center">
                <p className="font-display text-3xl font-bold text-accent">5+</p>
                <p className="text-sm text-muted-foreground">Years Brewing</p>
              </div>
              <div className="text-center">
                <p className="font-display text-3xl font-bold text-accent">10K+</p>
                <p className="text-sm text-muted-foreground">Happy Customers</p>
              </div>
              <div className="text-center">
                <p className="font-display text-3xl font-bold text-accent">20+</p>
                <p className="text-sm text-muted-foreground">Special Brews</p>
              </div>
            </div>
          </div>

          {/* Image - right */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={aboutImg}
                alt="A tempting cup of artisan coffee with latte art"
                loading="lazy"
                width={1024}
                height={768}
                className="w-full h-[400px] md:h-[500px] object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-40 h-40 rounded-full bg-accent/15 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
