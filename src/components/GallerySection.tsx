import interiorImg from "@/assets/gallery-interior.jpg";
import teamImg from "@/assets/gallery-team.jpg";
import counterImg from "@/assets/gallery-counter.jpg";
import outdoorImg from "@/assets/gallery-outdoor.jpg";

const images = [
  { src: interiorImg, alt: "Warm cafe interior with Edison bulbs", label: "Our Space" },
  { src: teamImg, alt: "Our friendly barista team", label: "Our Team" },
  { src: counterImg, alt: "Coffee bar counter with equipment", label: "The Bar" },
  { src: outdoorImg, alt: "Cozy outdoor seating area", label: "Outdoor Seating" },
];

export default function GallerySection() {
  return (
    <section id="gallery" className="py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center space-y-4 mb-14">
          <p className="text-accent font-medium tracking-widest uppercase text-sm">Take a Look</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-primary">Our Gallery</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Step inside Brew's Cup — where warmth meets style.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {images.map((img, i) => (
            <div key={i} className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                width={1024}
                height={768}
                className="w-full h-48 md:h-64 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <p className="absolute bottom-3 left-3 text-primary-foreground font-display font-semibold text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                {img.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
