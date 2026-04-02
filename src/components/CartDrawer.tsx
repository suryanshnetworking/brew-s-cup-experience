import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

const FORMSPREE_URL = "https://formspree.io/f/mvzwgbdjamd";

export default function CartDrawer() {
  const { items, updateQuantity, removeItem, clearCart, total, isOpen, setIsOpen } = useCart();
  const [step, setStep] = useState<"cart" | "checkout">("cart");
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", pincode: "" });
  const [loading, setLoading] = useState(false);

  const validateJhansiPincode = (pin: string) => {
    const num = parseInt(pin);
    return pin.length === 6 && num >= 284001 && num <= 284010;
  };

  const isWithinWorkingHours = () => {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 10 && hour < 21;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, phone, address, pincode } = form;

    if (!name || !email || !phone || !address || !pincode) {
      toast.error("Please fill all required fields.");
      return;
    }
    if (!validateJhansiPincode(pincode)) {
      toast.error("Sorry, we only deliver within Jhansi. Please enter a valid Jhansi pincode (284001-284010).");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { toast.error("Please enter a valid email."); return; }
    if (phone.length < 10) { toast.error("Please enter a valid phone number."); return; }
    if (!isWithinWorkingHours()) {
      toast.error("Sorry, orders can only be placed between 10:00 AM and 9:00 PM. Please try again during working hours.");
      return;
    }

    setLoading(true);
    const orderNo = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const itemsSummary = items.map(i => `${i.name} x${i.quantity} = ₹${i.price * i.quantity}`).join(", ");

    try {
      const res = await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _subject: `New Order - ${orderNo}`,
          "Order Number": orderNo,
          Name: name, Email: email, Phone: phone,
          Address: `${address}, Jhansi - ${pincode}`,
          Items: itemsSummary,
          "Total Amount": `₹${total}`,
          Type: "Order",
        }),
      });
      if (res.ok) {
        toast.success(`Order placed! Your order number is ${orderNo}. Confirmation sent to ${email}.`, { duration: 8000 });
        clearCart();
        setStep("cart");
        setIsOpen(false);
        setForm({ name: "", email: "", phone: "", address: "", pincode: "" });
      } else toast.error("Something went wrong.");
    } catch { toast.error("Network error."); }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50" onClick={() => setIsOpen(false)} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background shadow-2xl z-50 flex flex-col animate-slide-right" style={{ animationDirection: "normal" }}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-accent" />
            {step === "cart" ? "Your Cart" : "Checkout"}
          </h2>
          <button onClick={() => { setIsOpen(false); setStep("cart"); }} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {step === "cart" ? (
            items.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">Your cart is empty</p>
                <p className="text-sm mt-1">Add items from our menu</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 bg-card rounded-xl p-3 border border-border">
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-foreground truncate">{item.name}</h4>
                      <p className="text-accent font-bold">₹{item.price}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 rounded-md bg-muted flex items-center justify-center hover:bg-border transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 rounded-md bg-muted flex items-center justify-center hover:bg-border transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button onClick={() => removeItem(item.id)} className="p-1 text-destructive hover:bg-destructive/10 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <p className="text-sm font-bold text-foreground">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">All fields are required. Delivery within Jhansi only (10AM–9PM).</p>
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" required maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" required maxLength={255} />
              </div>
              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="10-digit phone" required maxLength={15} />
              </div>
              <div className="space-y-2">
                <Label>Address (Jhansi only) *</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Your address in Jhansi" required maxLength={300} />
              </div>
              <div className="space-y-2">
                <Label>Pincode *</Label>
                <Input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} placeholder="e.g. 284001" required maxLength={6} />
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-border space-y-3">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-accent">₹{total}</span>
            </div>
            {step === "cart" ? (
              <Button onClick={() => setStep("checkout")} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 py-5 text-base font-semibold rounded-xl">
                Proceed to Checkout
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("cart")} className="flex-1 py-5 rounded-xl">
                  Back
                </Button>
                <Button type="submit" form="checkout-form" disabled={loading} className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 py-5 font-semibold rounded-xl">
                  {loading ? "Placing..." : "Place Order"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
