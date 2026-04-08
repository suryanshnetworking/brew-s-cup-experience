import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function validateOrder(body: unknown): { valid: boolean; error?: string; data?: any } {
  if (!body || typeof body !== "object") return { valid: false, error: "Invalid request body" };

  const b = body as Record<string, unknown>;

  const requiredStrings = ["order_number", "customer_name", "customer_email", "customer_phone", "customer_address", "customer_pincode"];
  for (const field of requiredStrings) {
    if (typeof b[field] !== "string" || (b[field] as string).trim().length === 0) {
      return { valid: false, error: `${field} is required` };
    }
  }

  const name = (b.customer_name as string).trim();
  if (name.length > 200) return { valid: false, error: "customer_name too long" };

  const email = (b.customer_email as string).trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
    return { valid: false, error: "Invalid email" };
  }

  const phone = (b.customer_phone as string).trim();
  if (!/^[0-9+\-() ]{7,20}$/.test(phone)) {
    return { valid: false, error: "Invalid phone number" };
  }

  const address = (b.customer_address as string).trim();
  if (address.length > 500) return { valid: false, error: "Address too long" };

  const pincode = (b.customer_pincode as string).trim();
  if (!/^\d{6}$/.test(pincode)) return { valid: false, error: "Invalid pincode" };

  if (!Array.isArray(b.items) || b.items.length === 0 || b.items.length > 50) {
    return { valid: false, error: "Items must be a non-empty array (max 50)" };
  }

  for (const item of b.items) {
    if (!item || typeof item !== "object") return { valid: false, error: "Invalid item" };
    if (typeof item.name !== "string" || item.name.length === 0 || item.name.length > 200) {
      return { valid: false, error: "Invalid item name" };
    }
    if (typeof item.price !== "number" || item.price <= 0 || item.price > 100000) {
      return { valid: false, error: "Invalid item price" };
    }
    if (typeof item.quantity !== "number" || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) {
      return { valid: false, error: "Invalid item quantity" };
    }
  }

  if (typeof b.total !== "number" || !Number.isInteger(b.total) || b.total <= 0 || b.total > 10000000) {
    return { valid: false, error: "Invalid total" };
  }

  return {
    valid: true,
    data: {
      order_number: (b.order_number as string).trim().toUpperCase().slice(0, 30),
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      customer_address: address,
      customer_pincode: pincode,
      items: (b.items as any[]).map(i => ({
        id: String(i.id || "").slice(0, 100),
        name: String(i.name).slice(0, 200),
        price: i.price,
        quantity: i.quantity,
      })),
      total: b.total,
      status: "Confirmed",
    },
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const result = validateOrder(body);

    if (!result.valid) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await supabase
      .from("orders")
      .insert(result.data)
      .select("order_number, status")
      .single();

    if (error) {
      console.error("Insert error:", error.message);
      return new Response(
        JSON.stringify({ error: "Failed to create order" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, order: data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
