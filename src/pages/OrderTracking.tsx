import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Search, ArrowLeft, XCircle, RotateCcw, Coffee } from "lucide-react";

const FORMSPREE_URL = "https://formspree.io/f/mvzwgbdjamd";

const RETURN_REASONS = [
  "Wrong item delivered",
  "Damaged item",
  "Missing item",
  "Quality issue",
  "Other",
];

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  items: { id: string; name: string; price: number; quantity: number }[];
  total: number;
  status: string;
  return_status: string | null;
  return_reason: string | null;
  return_note: string | null;
  created_at: string;
}

export default function OrderTracking() {
  const [orderInput, setOrderInput] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showReturn, setShowReturn] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [returnNote, setReturnNote] = useState("");

  const lookupOrder = async () => {
    if (!orderInput.trim()) { toast.error("Please enter an order number."); return; }
    setLoading(true);
    setOrder(null);
    try {
      const { data, error } = await supabase
        .from("orders" as any)
        .select("*")
        .eq("order_number", orderInput.trim().toUpperCase())
        .single();
      if (error || !data) {
        toast.error("Order not found. Please check the order number.");
      } else {
        setOrder(data as any);
      }
    } catch { toast.error("Error looking up order."); }
    setLoading(false);
  };

  const handleCancel = async () => {
    if (!order) return;
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("update-order", {
        body: { order_number: order.order_number, status: "Cancelled" },
      });
      if (error) throw error;

      await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _subject: `Order Cancelled - ${order.order_number}`,
          "Order Number": order.order_number,
          Customer: order.customer_name,
          Email: order.customer_email,
          Type: "Cancellation",
        }),
      });

      setOrder({ ...order, status: "Cancelled" });
      setShowCancel(false);
      toast.success("Order cancelled successfully.");
    } catch { toast.error("Failed to cancel order."); }
    setLoading(false);
  };

  const handleReturn = async () => {
    if (!order || !returnReason) { toast.error("Please select a reason."); return; }
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("update-order", {
        body: {
          order_number: order.order_number,
          return_status: "Requested",
          return_reason: returnReason,
          return_note: returnNote,
        },
      });
      if (error) throw error;

      await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _subject: `Return Request - ${order.order_number}`,
          "Order Number": order.order_number,
          Customer: order.customer_name,
          Email: order.customer_email,
          Reason: returnReason,
          Note: returnNote || "N/A",
          Type: "Return/Replace",
        }),
      });

      setOrder({ ...order, return_status: "Requested", return_reason: returnReason, return_note: returnNote });
      setShowReturn(false);
      setReturnReason("");
      setReturnNote("");
      toast.success("Return/replace request submitted.");
    } catch { toast.error("Failed to submit request."); }
    setLoading(false);
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Confirmed": return "bg-blue-100 text-blue-800";
      case "Out for Delivery": return "bg-purple-100 text-purple-800";
      case "Delivered": return "bg-green-100 text-green-800";
      case "Cancelled": return "bg-red-100 text-red-800";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link to="/" className="inline-flex items-center gap-2 text-accent hover:text-accent/80 mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="text-center mb-8">
          <Coffee className="w-10 h-10 text-accent mx-auto mb-3" />
          <h1 className="font-display text-3xl font-bold text-primary">Track Your Order</h1>
          <p className="text-muted-foreground mt-2">Enter your order number to view details</p>
        </div>

        <div className="flex gap-3 mb-8">
          <Input
            value={orderInput}
            onChange={(e) => setOrderInput(e.target.value)}
            placeholder="e.g. CAFE-XXXXXXX"
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && lookupOrder()}
          />
          <Button onClick={lookupOrder} disabled={loading} className="bg-accent text-accent-foreground gap-2">
            <Search className="w-4 h-4" /> Search
          </Button>
        </div>

        {order && (
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="text-xl font-bold font-mono text-foreground">{order.order_number}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
              </p>
            </div>

            <div className="p-6 border-b border-border">
              <h3 className="font-semibold mb-3">Items</h3>
              <div className="space-y-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{item.name} x{item.quantity}</span>
                    <span className="font-medium">₹{item.price * item.quantity}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-accent">₹{order.total}</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-b border-border">
              <h3 className="font-semibold mb-2">Delivery Details</h3>
              <p className="text-sm text-muted-foreground">{order.customer_name}</p>
              <p className="text-sm text-muted-foreground">{order.customer_address}</p>
              <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
            </div>

            {order.return_status && (
              <div className="p-6 border-b border-border bg-accent/5">
                <h3 className="font-semibold mb-2">Return/Replace Request</h3>
                <p className="text-sm"><strong>Status:</strong> {order.return_status}</p>
                <p className="text-sm"><strong>Reason:</strong> {order.return_reason}</p>
                {order.return_note && <p className="text-sm"><strong>Note:</strong> {order.return_note}</p>}
              </div>
            )}

            <div className="p-6 flex gap-3 flex-wrap">
              {(order.status === "Pending" || order.status === "Confirmed") && (
                <Button onClick={() => setShowCancel(true)} variant="destructive" className="gap-2">
                  <XCircle className="w-4 h-4" /> Cancel Order
                </Button>
              )}
              {order.status === "Delivered" && !order.return_status && (
                <Button onClick={() => setShowReturn(true)} variant="outline" className="gap-2 border-accent text-accent">
                  <RotateCcw className="w-4 h-4" /> Return / Replace
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Cancel dialog */}
        {showCancel && (
          <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-2xl p-6 max-w-sm w-full border border-border shadow-xl">
              <h3 className="font-display text-xl font-bold mb-3">Cancel Order?</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Are you sure you want to cancel order <strong>{order?.order_number}</strong>? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowCancel(false)} className="flex-1">No, Keep</Button>
                <Button variant="destructive" onClick={handleCancel} disabled={loading} className="flex-1">
                  {loading ? "Cancelling..." : "Yes, Cancel"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Return form */}
        {showReturn && (
          <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-2xl p-6 max-w-sm w-full border border-border shadow-xl">
              <h3 className="font-display text-xl font-bold mb-4">Return / Replace Order</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Reason *</Label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select a reason</option>
                    {RETURN_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Additional Note</Label>
                  <textarea
                    value={returnNote}
                    onChange={(e) => setReturnNote(e.target.value)}
                    placeholder="Any additional details..."
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm min-h-[80px] resize-none"
                    maxLength={500}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowReturn(false)} className="flex-1">Cancel</Button>
                <Button onClick={handleReturn} disabled={loading || !returnReason} className="flex-1 bg-accent text-accent-foreground">
                  {loading ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
