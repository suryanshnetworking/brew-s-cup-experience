import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { Menu, X, ShoppingCart, Coffee, Package } from "lucide-react";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Menu", href: "#menu" },
  { label: "Booking", href: "#booking" },
  { label: "Contact", href: "#contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { itemCount, setIsOpen } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    if (window.location.pathname !== "/") {
      window.location.href = "/" + href;
      return;
    }
    document.querySelectorAll('.section-animate').forEach(el => {
      (el as HTMLElement).style.transition = 'none';
      el.classList.add('visible');
    });
    document.body.offsetHeight;
    document.querySelectorAll('.section-animate').forEach(el => {
      (el as HTMLElement).style.transition = '';
    });
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md shadow-lg border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between h-16 md:h-20">
        <button onClick={() => scrollTo("#home")} className="flex items-center gap-2 group">
          <Coffee className="w-8 h-8 text-accent transition-transform group-hover:rotate-12" />
          <span className="font-display text-xl md:text-2xl font-bold text-primary">
            Brew's Cup
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-foreground/80 hover:text-primary hover:bg-secondary transition-all"
            >
              {link.label}
            </button>
          ))}
          <a
            href="/orders"
            className="px-4 py-2 rounded-lg text-sm font-medium text-foreground/80 hover:text-primary hover:bg-secondary transition-all flex items-center gap-1.5"
          >
            <Package className="w-4 h-4" />
            Track Order
          </a>
          <button
            onClick={() => setIsOpen(true)}
            className="relative ml-2 p-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-all"
          >
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-bold">
                {itemCount}
              </span>
            )}
          </button>
        </nav>

        {/* Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <button onClick={() => setIsOpen(true)} className="relative p-2 rounded-lg bg-accent text-accent-foreground">
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-bold">
                {itemCount}
              </span>
            )}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-foreground">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background/98 backdrop-blur-md border-b border-border animate-fade-in">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="px-4 py-3 rounded-lg text-left font-medium text-foreground/80 hover:text-primary hover:bg-secondary transition-all"
              >
                {link.label}
              </button>
            ))}
            <a
              href="/orders"
              className="px-4 py-3 rounded-lg text-left font-medium text-foreground/80 hover:text-primary hover:bg-secondary transition-all flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              Track Order
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
