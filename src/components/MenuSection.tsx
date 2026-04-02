import { menuItems } from "@/data/menuItems";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye } from "lucide-react";
import { toast } from "sonner";

export default function MenuSection() {
  const { addItem, setIsOpen } = useCart();

  const handleAddToCart = (item: typeof menuItems[0]) => {
    addItem({ id: item.id, name: item.name, price: item.price, image: item.image });
    toast.success(`${item.name} added to cart!`);
  };

  const beverages = menuItems.filter((i) => i.category === "beverage");
  const snacks = menuItems.filter((i) => i.category === "snack");

  const renderItems = (items: typeof menuItems) => (
    <div className="grid md:grid-cols-2 gap-6 md:gap-8">
      {items.map((item) => (
        <div
          key={item.id}
          className="group bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border"
        >
          <div className="flex flex-col sm:flex-row">
            <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">{item.name}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
              </div>
              <div className="mt-4 space-y-3">
                <p className="font-display text-2xl font-bold text-accent">₹{item.price}</p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAddToCart(item)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 gap-2"
                    size="sm"
                  >
                    <ShoppingCart className="w-4 h-4" /> Add to Cart
                  </Button>
                  <Button
                    onClick={() => { handleAddToCart(item); setIsOpen(true); }}
                    variant="outline"
                    size="sm"
                    className="border-accent text-accent hover:bg-accent hover:text-accent-foreground gap-2"
                  >
                    <Eye className="w-4 h-4" /> View Cart
                  </Button>
                </div>
              </div>
            </div>
            <div className="sm:w-48 md:w-56 flex-shrink-0">
              <img
                src={item.image}
                alt={item.name}
                loading="lazy"
                width={640}
                height={640}
                className="w-full h-48 sm:h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <section id="menu" className="py-20 md:py-28 bg-secondary/30">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center space-y-4 mb-14">
          <p className="text-accent font-medium tracking-widest uppercase text-sm">Our Offerings</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-primary">Beverages & Snacks</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Handcrafted with love, served with a smile. All prices in ₹ (Indian Rupees).
          </p>
        </div>

        <div className="space-y-12">
          <div>
            <h3 className="font-display text-2xl font-semibold text-primary mb-6 flex items-center gap-2">
              ☕ Beverages
            </h3>
            {renderItems(beverages)}
          </div>
          <div>
            <h3 className="font-display text-2xl font-semibold text-primary mb-6 flex items-center gap-2">
              🍽️ Snacks
            </h3>
            {renderItems(snacks)}
          </div>
        </div>
      </div>
    </section>
  );
}
