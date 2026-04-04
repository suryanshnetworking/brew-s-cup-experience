import { useState, useMemo } from "react";
import { menuItems } from "@/data/menuItems";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Zap, Search, Coffee, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";

type Category = "all" | "beverage" | "snack";

const tabs: { value: Category; label: string; icon: React.ReactNode }[] = [
  { value: "all", label: "All", icon: null },
  { value: "beverage", label: "Beverages", icon: <Coffee className="w-4 h-4" /> },
  { value: "snack", label: "Snacks", icon: <UtensilsCrossed className="w-4 h-4" /> },
];

export default function MenuSection() {
  const { addItem, setIsOpen, buyNow } = useCart();
  const [activeTab, setActiveTab] = useState<Category>("all");
  const [search, setSearch] = useState("");

  const handleAddToCart = (item: typeof menuItems[0]) => {
    addItem({ id: item.id, name: item.name, price: item.price, image: item.image });
    toast.success(`${item.name} added to cart!`);
  };

  const handleBuyNow = (item: typeof menuItems[0]) => {
    buyNow({ id: item.id, name: item.name, price: item.price, image: item.image });
  };

  const filtered = useMemo(() => {
    let items = menuItems;
    if (activeTab !== "all") items = items.filter((i) => i.category === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    }
    return items;
  }, [activeTab, search]);

  return (
    <section id="menu" className="py-20 md:py-28 bg-secondary/30">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center space-y-4 mb-10">
          <p className="text-accent font-medium tracking-widest uppercase text-sm">Our Offerings</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-primary">Beverages & Snacks</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Handcrafted with love, served with a smile. All prices in ₹ (Indian Rupees).
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-10 max-w-2xl mx-auto">
          <div className="flex rounded-xl bg-card border border-border p-1 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.value
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search menu..."
              className="pl-10 rounded-xl"
            />
          </div>
        </div>

        {/* Items */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg">No items found</p>
            <p className="text-sm">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="group bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border"
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-display text-xl font-semibold text-foreground">{item.name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent font-medium capitalize">
                          {item.category === "beverage" ? "☕ Drink" : "🍽️ Snack"}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                    </div>
                    <div className="mt-4 space-y-3">
                      <p className="font-display text-2xl font-bold text-accent">₹{item.price}</p>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          onClick={() => handleAddToCart(item)}
                          className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 gap-2"
                          size="sm"
                        >
                          <ShoppingCart className="w-4 h-4" /> Add to Cart
                        </Button>
                        <Button
                          onClick={() => handleBuyNow(item)}
                          size="sm"
                          className="bg-accent text-accent-foreground hover:bg-accent/90 flex-1 gap-2"
                        >
                          <Zap className="w-4 h-4" /> Buy Now
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
        )}
      </div>
    </section>
  );
}
