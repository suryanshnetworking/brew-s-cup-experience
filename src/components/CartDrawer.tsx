import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus, Minus, Trash2, ShoppingBag, CheckCircle, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";

const FORMSPREE_URL = "https://formspree.io/f/mvzwgbdjamd";

const VALID_JHANSI_PINCODES = new Set([
  "284001", "284002", "284003", "284120", "284121", "284122", "284123",
  "284124", "284125", "284126", "284127", "284128", "284135", "284136",
  "284140", "284141", "284143", "284145", "284149",
]);

export default function CartDrawer() {
  const { items, updateQuantity, removeItem, clearCart, total, isOpen, setIsOpen, isBuyNow, setIsBuyNow } = useCart();
  const [step, setStep] = useState<"cart" | "checkout" | "otp" | "confirmed">("cart");
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", pincode: "" });
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [orderNumber, setOrderNumber] = useState("");
  const [confirmedTotal, setConfirmedTotal] = useState(0);

  useEffect(() => {
    if (isBuyNow && isOpen) {
      setStep("checkout");
    }
  }, [isBuyNow, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      if (step !== "confirmed") {
        setStep("cart");
      }
      setOtp("");
      setOtpAttempts(0);
      setIsBuyNow(false);
    }
  }, [isOpen]);

  const validateJhansiPincode = (pin: string) => {
    return VALID_JHANSI_PINCODES.has(pin.trim());
  };

  const isWithinWorkingHours = () => {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 10 && hour < 21;
  };

  const validateForm = () => {
    const { name, email, phone, address, pincode } = form;
    if (!name || !email || !phone || !address || !pincode) {
      toast.error("Please fill all required fields.");
      return false;
    }
    if (!validateJhansiPincode(pincode)) {
      toast.error("Sorry, we currently deliver only within Jhansi. Your address appears to be outside our delivery zone. Please check your pincode and try again.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { toast.error("Please enter a valid email."); return false; }
    if (phone.length < 10) { toast.error("Please enter a valid phone number."); return false; }
    if (!isWithinWorkingHours()) {
      toast.error("Orders can only be placed between 10 AM and 9 PM.");
      return false;
    }
    return true;
  };

  const handleSendOtp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("handle-otp", {
        body: { action: "send", email: form.email },
      });
      if (error) throw error;

      setOtpAttempts(0);
      setOtp("");
      setStep("otp");
      toast.success("OTP sent to your email!");
    } catch {
      toast.error("Failed to send OTP. Please try again.");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("handle-otp", {
        body: { action: "verify", email: form.email, otp },
      });

      if (error || !data?.verified) {
        const newAttempts = otpAttempts + 1;
        setOtpAttempts(newAttempts);
        if (newAttempts >= 3) {
          toast.error("Too many failed attempts. Please start over.");
          setStep("checkout");
          setOtp("");
          setOtpAttempts(0);
        } else {
          toast.error(`Incorrect OTP. ${3 - newAttempts} attempt(s) left.`);
        }
        setLoading(false);
        return;
      }

      // OTP verified — create order
      const orderNo = `CAFE-${Date.now().toString(36).toUpperCase()}`;
      setOrderNumber(orderNo);
      setConfirmedTotal(total);
      const itemsSummary = items.map(i => `${i.name} x${i.quantity} = ₹${i.price * i.quantity}`).join(", ");

      // Insert order via edge function with server-side validation
      const { error: createError } = await supabase.functions.invoke("create-order", {
        body: {
          order_number: orderNo,
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone,
          customer_address: `${form.address}, Jhansi - ${form.pincode}`,
          customer_pincode: form.pincode,
          items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
          total,
        },
      });
      if (createError) throw createError;

      // Submit to Formspree
      await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _subject: `New Order - ${orderNo}`,
          "Order Number": orderNo,
          Name: form.name,
          Email: form.email,
          Phone: form.phone,
          Address: `${form.address}, Jhansi - ${form.pincode}`,
          Items: itemsSummary,
          "Total Amount": `₹${total}`,
          Type: "Order",
        }),
      });

      clearCart();
      setStep("confirmed");
      toast.success(`Order ${orderNo} placed successfully!`);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setStep("cart");
    setOtp("");
    setOtpAttempts(0);
    setOrderNumber("");
    setConfirmedTotal(0);
    setForm({ name: "", email: "", phone: "", address: "", pincode: "" });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50" onClick={handleClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background shadow-2xl z-50 flex flex-col animate-slide-right">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-accent" />
            {step === "cart" ? "Your Cart" : step === "checkout" ? "Checkout" : step === "otp" ? "Verify OTP" : "Order Confirmed"}
          </h2>
          <button onClick={handleClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {step === "cart" && (
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
          )}

          {step === "checkout" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">All fields required. Delivery within Jhansi only (10AM–9PM).</p>
              <div className="bg-card rounded-xl p-3 border border-border space-y-2">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name} x{item.quantity}</span>
                    <span className="font-medium">₹{item.price * item.quantity}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-accent">₹{total}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" maxLength={255} />
              </div>
              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="10-digit phone" maxLength={15} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Address (Jhansi only) *</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Your address in Jhansi" maxLength={300} />
              </div>
              <div className="space-y-1">
                <Label>Pincode *</Label>
                <Input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })} placeholder="e.g. 284001" maxLength={6} />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Delivery available within Jhansi district only (e.g. 284001–284149)
                </p>
              </div>
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-6 text-center py-8">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold">Enter OTP</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  We've sent a 6-digit code to <strong>{form.email}</strong>
                </p>
              </div>
              <Input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                className="text-center text-2xl tracking-[0.5em] font-mono"
                maxLength={6}
              />
              <p className="text-xs text-muted-foreground">
                {otpAttempts > 0 && `${3 - otpAttempts} attempt(s) remaining • `}
                OTP expires in 5 minutes
              </p>
              <Button onClick={handleSendOtp} variant="ghost" size="sm" className="text-accent">
                Resend OTP
              </Button>
            </div>
          )}

          {step === "confirmed" && (
            <div className="text-center py-12 space-y-6">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
              <div>
                <h3 className="font-display text-2xl font-bold text-foreground">Order Confirmed!</h3>
                <p className="text-muted-foreground mt-2">Your order has been placed successfully.</p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border">
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="text-2xl font-bold text-accent font-mono mt-1">{orderNumber}</p>
                <p className="text-sm text-muted-foreground mt-3">
                  Total: <span className="font-bold text-foreground">₹{confirmedTotal}</span>
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Track your order at{" "}
                <a href="/orders" className="text-accent underline font-medium">
                  /orders
                </a>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === "cart" && items.length > 0 && (
          <div className="p-5 border-t border-border space-y-3">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-accent">₹{total}</span>
            </div>
            <Button onClick={() => setStep("checkout")} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 py-5 text-base font-semibold rounded-xl">
              Proceed to Checkout
            </Button>
          </div>
        )}

        {step === "checkout" && (
          <div className="p-5 border-t border-border space-y-3">
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { if (isBuyNow) handleClose(); else setStep("cart"); }} className="flex-1 py-5 rounded-xl">
                Back
              </Button>
              <Button onClick={handleSendOtp} disabled={loading} className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 py-5 font-semibold rounded-xl gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            </div>
          </div>
        )}

        {step === "otp" && (
          <div className="p-5 border-t border-border space-y-3">
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setStep("checkout"); setOtp(""); }} className="flex-1 py-5 rounded-xl">
                Back
              </Button>
              <Button onClick={handleVerifyOtp} disabled={loading || otp.length !== 6} className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 py-5 font-semibold rounded-xl gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Verifying..." : "Verify & Place Order"}
              </Button>
            </div>
          </div>
        )}

        {step === "confirmed" && (
          <div className="p-5 border-t border-border">
            <Button onClick={handleClose} className="w-full bg-primary text-primary-foreground py-5 rounded-xl">
              Close
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
