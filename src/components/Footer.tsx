import { Coffee } from "lucide-react";

export default function Footer() {
  const scrollTo = (id: string) => {
    if (window.location.pathname !== "/") {
      window.location.href = "/" + id;
      return;
    }
    document.querySelectorAll('.section-animate').forEach(el => el.classList.add('visible'));
    setTimeout(() => {
      const el = document.querySelector(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <footer className="bg-primary text-primary-foreground py-10">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Coffee className="w-6 h-6" />
            <span className="font-display text-xl font-bold">Brew's Cup</span>
          </div>
          <nav className="flex gap-4 text-sm text-primary-foreground/80">
            <button onClick={() => scrollTo("#menu")} className="hover:text-primary-foreground transition-colors">Menu</button>
            <button onClick={() => scrollTo("#booking")} className="hover:text-primary-foreground transition-colors">Book a Table</button>
            <button onClick={() => scrollTo("#contact")} className="hover:text-primary-foreground transition-colors">Contact</button>
          </nav>
          <p className="text-primary-foreground/70 text-sm text-center">
            © {new Date().getFullYear()} Brew's Cup, Jhansi. All rights reserved. Open daily 10AM – 9PM.
          </p>
        </div>
      </div>
    </footer>
  );
}
