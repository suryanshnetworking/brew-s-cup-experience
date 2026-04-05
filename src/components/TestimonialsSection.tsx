import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    rating: 5,
    review: "Absolutely love the cappuccino here! The cozy ambiance makes it my go-to spot for weekend brunches. The staff is incredibly warm and welcoming.",
    avatar: "PS",
  },
  {
    name: "Rahul Verma",
    rating: 5,
    review: "Best café in Jhansi, hands down! The cold brew is divine and their paneer sandwich is a must-try. Fast delivery too!",
    avatar: "RV",
  },
  {
    name: "Ananya Singh",
    rating: 4,
    review: "A hidden gem! The matcha latte was so refreshing and the brownies are to die for. Will definitely come back with friends.",
    avatar: "AS",
  },
  {
    name: "Vikram Patel",
    rating: 5,
    review: "Ordered through their website and the delivery was super quick. Coffee was still hot and tasted amazing. Great online experience!",
    avatar: "VP",
  },
  {
    name: "Meera Joshi",
    rating: 4,
    review: "Such a charming place! Love the vibe, the music, and of course the hazelnut latte. Perfect for a date night or a quiet read.",
    avatar: "MJ",
  },
  {
    name: "Arjun Tiwari",
    rating: 5,
    review: "The Book a Table feature is so convenient! Reserved for my birthday dinner and everything was perfect. Highly recommend!",
    avatar: "AT",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < count ? "text-accent fill-accent" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center space-y-4 mb-14">
          <p className="text-accent font-medium tracking-widest uppercase text-sm">What Our Guests Say</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-primary">Customer Love</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it — hear from the people who make Brew's Cup special.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-card rounded-2xl p-6 border border-border shadow-md hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm font-display">
                  {t.avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">{t.name}</h4>
                  <Stars count={t.rating} />
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed flex-1">"{t.review}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
