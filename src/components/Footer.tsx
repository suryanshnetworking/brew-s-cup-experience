import { Coffee } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-10">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Coffee className="w-6 h-6" />
            <span className="font-display text-xl font-bold">Brew's Cup</span>
          </div>
          <p className="text-primary-foreground/70 text-sm text-center">
            © {new Date().getFullYear()} Brew's Cup, Jhansi. All rights reserved. Open daily 10AM – 9PM.
          </p>
          <div className="flex gap-6 text-sm text-primary-foreground/70">
            <span>Free Parking Available 🅿️</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
