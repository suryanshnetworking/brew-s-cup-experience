import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Phone, Mail, MapPin, Clock, Car } from "lucide-react";

const FORMSPREE_URL = "https://formspree.io/f/mvzwgbdjamd";

export default function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", message: "", usedService: false });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill all required fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _subject: `Feedback from ${form.name}`,
          Name: form.name,
          Email: form.email,
          Message: form.message,
          "Has Used Service": form.usedService ? "Yes" : "No",
          Type: "Feedback",
        }),
      });
      if (res.ok) {
        toast.success("Thank you for your feedback! We'll get back to you soon.");
        setForm({ name: "", email: "", message: "", usedService: false });
      } else toast.error("Something went wrong.");
    } catch { toast.error("Network error."); }
    setLoading(false);
  };

  return (
    <section id="contact" className="py-20 md:py-28 bg-secondary/30">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center space-y-4 mb-14">
          <p className="text-accent font-medium tracking-widest uppercase text-sm">Get in Touch</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-primary">Feedback & Contact</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-8">
            <h3 className="font-display text-2xl font-semibold text-foreground">Visit Us</h3>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Address</p>
                  <p className="text-muted-foreground">Brew's Cup Cafe, Jhansi, Uttar Pradesh</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Suryansh</p>
                  <p className="text-muted-foreground">8540xxxxxx</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Email</p>
                  <p className="text-muted-foreground">suryanshbundela103@gmail.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Working Hours</p>
                  <p className="text-muted-foreground">Daily: 10:00 AM – 9:00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
                  <Car className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Parking Facility</p>
                  <p className="text-muted-foreground">
                    Free parking available for all customers. We have dedicated two-wheeler and four-wheeler parking space at the front and rear of the cafe. Valet service available on weekends.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Form */}
          <form onSubmit={handleSubmit} className="bg-card rounded-2xl shadow-xl border border-border p-6 md:p-8 space-y-5">
            <h3 className="font-display text-2xl font-semibold text-foreground">Share Your Feedback</h3>
            <div className="space-y-2">
              <Label htmlFor="c-name">Your Name *</Label>
              <Input id="c-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" required maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-email">Email *</Label>
              <Input id="c-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" required maxLength={255} />
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="c-service"
                checked={form.usedService}
                onCheckedChange={(val) => setForm({ ...form, usedService: val === true })}
              />
              <Label htmlFor="c-service" className="text-sm cursor-pointer">
                I have used Brew's Cup services before
              </Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-message">Your Message *</Label>
              <Textarea
                id="c-message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Tell us about your experience..."
                rows={4}
                required
                maxLength={1000}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 py-5 text-base font-semibold rounded-xl">
              {loading ? "Sending..." : "Submit Feedback"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
