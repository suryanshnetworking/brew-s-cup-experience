import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ArrowLeft, Lock, Truck, CheckCircle } from "lucide-react";

const DELIVERY_PIN = "1234";
const FORMSPREE_URL = "https://formspree.io/f/mvzwgbdjamd";

export default function DeliveryConfirm() {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [orderInput, setOrderInput] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handlePinSubmit = () => {
    if (pin === DELIVERY_PIN) {
      setAuthenticated(true);
      toast.success("Access granted!");
    } else {
      toast.error("Incorrect PIN.");
    }
  };

  const lookupOrder = async () => {
    if (!orderInput.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("lookup-order", {
        body: { order_number: orderInput.trim().toUpperCase() },
      });
      if (error || !data?.order) {
        toast.error("Order not found.");
        setOrder(null);
      } else {
        setOrder(data.order);
      }
    } catch { toast.error("Error looking up order."); }
    setLoading(false);
  };

  const markDelivered = async () => {
    if (!order) return;
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("update-order", {
        body: { order_number: order.order_number, status: "Delivered" },
      });
      if (error) throw error;

      await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _subject: `Order Delivered - ${order.order_number}`,
          "Order Number": order.order_number,
          Customer: order.customer_name,
          Email: order.customer_email,
          Type: "Delivery Confirmation",
        }),
      });

      setOrder({ ...order, status: "Delivered" });
      toast.success(`Order ${order.order_number} marked as delivered!`);
    } catch { toast.error("Failed to update order."); }
    setLoading(false);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-sm w-full">
          <div className="text-center mb-8">
            <Lock className="w-12 h-12 text-accent mx-auto mb-3" />
            <h1 className="font-display text-2xl font-bold text-primary">Delivery Staff Access</h1>
            <p className="text-muted-foreground mt-2">Enter your 4-digit PIN to continue</p>
          </div>
          <div className="space-y-4">
            <Input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="Enter PIN"
              className="text-center text-2xl tracking-[0.5em] font-mono"
              maxLength={4}
              onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
            />
            <Button onClick={handlePinSubmit} className="w-full bg-accent text-accent-foreground py-5 rounded-xl">
              Unlock
            </Button>
          </div>
          <Link to="/" className="block text-center text-sm text-muted-foreground hover:text-accent mt-6">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link to="/" className="inline-flex items-center gap-2 text-accent hover:text-accent/80 mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="text-center mb-8">
          <Truck className="w-10 h-10 text-accent mx-auto mb-3" />
          <h1 className="font-display text-3xl font-bold text-primary">Delivery Confirmation</h1>
          <p className="text-muted-foreground mt-2">Mark orders as delivered</p>
        </div>

        <div className="flex gap-3 mb-8">
          <Input
            value={orderInput}
            onChange={(e) => setOrderInput(e.target.value)}
            placeholder="Enter order number"
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && lookupOrder()}
          />
          <Button onClick={lookupOrder} disabled={loading} className="bg-accent text-accent-foreground">
            Look Up
          </Button>
        </div>

        {order && (
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Order</p>
                <p className="text-xl font-bold font-mono">{order.order_number}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                order.status === "Delivered" ? "bg-green-100 text-green-800" :
                order.status === "Cancelled" ? "bg-red-100 text-red-800" :
                "bg-blue-100 text-blue-800"
              }`}>
                {order.status}
              </span>
            </div>
            <div className="space-y-2 mb-6 text-sm">
              <p><strong>Customer:</strong> {order.customer_name}</p>
              <p><strong>Address:</strong> {order.customer_address}</p>
              <p><strong>Phone:</strong> {order.customer_phone}</p>
              <p><strong>Total:</strong> ₹{order.total}</p>
            </div>
            {order.status !== "Delivered" && order.status !== "Cancelled" ? (
              <Button onClick={markDelivered} disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white py-5 rounded-xl gap-2">
                <CheckCircle className="w-5 h-5" />
                {loading ? "Updating..." : "Mark as Delivered"}
              </Button>
            ) : (
              <div className="text-center py-3 text-sm text-muted-foreground">
                {order.status === "Delivered" ? "✅ Already delivered" : "❌ Order cancelled"}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
