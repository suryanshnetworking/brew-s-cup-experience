import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CalendarDays, Clock, Users, MapPin } from "lucide-react";

const FORMSPREE_URL = "https://formspree.io/f/mvzwgbdjamd";
const TABLES = Array.from({ length: 10 }, (_, i) => `Table ${i + 1}`);
const TIME_SLOTS = [
  "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM",
  "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM",
];

const VALID_JHANSI_PINCODES = new Set([
  "284001", "284002", "284003", "284120", "284121", "284122", "284123",
  "284124", "284125", "284126", "284127", "284128", "284135", "284136",
  "284140", "284141", "284143", "284145", "284149",
]);

function getBookedKey(table: string, date: string, time: string) {
  return `booked_${table}_${date}_${time}`;
}

export default function BookingSection() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "", pincode: "",
    date: "", time: "", table: "", guests: "2",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, phone, address, pincode, date, time, table } = form;

    if (!name || !email || !phone || !address || !pincode || !date || !time || !table) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (!VALID_JHANSI_PINCODES.has(pincode.trim())) {
      toast.error("Sorry, we only serve within Jhansi district. Please enter a valid Jhansi pincode.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { toast.error("Please enter a valid email."); return; }
    if (phone.length < 10) { toast.error("Please enter a valid phone number."); return; }

    // Check selected date is not in the past
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      toast.error("Please select today's date or a future date.");
      return;
    }

    // Check if table is booked
    const key = getBookedKey(table, date, time);
    if (localStorage.getItem(key)) {
      toast.error(
        `Sorry, ${table} is already booked on ${date} at ${time}. Please try another table, day, or time.`,
        { duration: 5000 }
      );
      return;
    }

    setLoading(true);
    try {
      const bookingId = `BC-${Date.now().toString(36).toUpperCase()}`;
      const res = await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _subject: `Table Booking - ${bookingId}`,
          "Booking ID": bookingId,
          Name: name, Email: email, Phone: phone,
          Address: `${address}, Jhansi - ${pincode}`,
          Table: table, Date: date, Time: time, Guests: form.guests,
          Type: "Table Booking",
        }),
      });
      if (res.ok) {
        localStorage.setItem(key, "true");
        toast.success(`Table booked! Your booking ID is ${bookingId}. Confirmation sent to ${email}.`, { duration: 6000 });
        setForm({ name: "", email: "", phone: "", address: "", pincode: "", date: "", time: "", table: "", guests: "2" });
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <section id="booking" className="py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center space-y-4 mb-14">
          <p className="text-accent font-medium tracking-widest uppercase text-sm">Reserve Your Spot</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-primary">Book a Table</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We're open daily from <strong className="text-foreground">10:00 AM to 9:00 PM</strong>. Reserve your table now!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-card rounded-2xl shadow-xl border border-border p-6 md:p-10 space-y-6">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="b-name">Full Name *</Label>
              <Input id="b-name" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="b-email">Email *</Label>
              <Input id="b-email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" required maxLength={255} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="b-phone">Phone Number *</Label>
              <Input id="b-phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="10-digit phone" required maxLength={15} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="b-guests" className="flex items-center gap-1"><Users className="w-4 h-4" /> Guests</Label>
              <Input id="b-guests" name="guests" type="number" min={1} max={10} value={form.guests} onChange={handleChange} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="b-address" className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Address (Jhansi only) *</Label>
              <Input id="b-address" name="address" value={form.address} onChange={handleChange} placeholder="Your address in Jhansi" required maxLength={300} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="b-pincode">Pincode (Jhansi) *</Label>
              <Input id="b-pincode" name="pincode" value={form.pincode} onChange={handleChange} placeholder="e.g. 284001" required maxLength={6} />
              <p className="text-xs text-muted-foreground">Only Jhansi district pincodes accepted</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <div className="space-y-2">
              <Label htmlFor="b-date" className="flex items-center gap-1"><CalendarDays className="w-4 h-4" /> Date *</Label>
              <Input id="b-date" name="date" type="date" value={form.date} onChange={handleChange} min={new Date().toISOString().split("T")[0]} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="b-time" className="flex items-center gap-1"><Clock className="w-4 h-4" /> Time Slot *</Label>
              <select
                id="b-time"
                name="time"
                value={form.time}
                onChange={handleChange}
                required
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select time</option>
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="b-table">Select Table *</Label>
              <select
                id="b-table"
                name="table"
                value={form.table}
                onChange={handleChange}
                required
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Choose a table</option>
                {TABLES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-lg font-semibold rounded-xl">
            {loading ? "Booking..." : "Book My Table"}
          </Button>
        </form>
      </div>
    </section>
  );
}
