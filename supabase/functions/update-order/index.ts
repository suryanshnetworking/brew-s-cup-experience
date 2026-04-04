import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { order_number, status, return_status, return_reason, return_note } = await req.json();

    if (!order_number) {
      return new Response(
        JSON.stringify({ error: "order_number is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch current order to validate status transitions
    const { data: currentOrder, error: fetchError } = await supabase
      .from("orders")
      .select("status")
      .eq("order_number", order_number)
      .single();

    if (fetchError || !currentOrder) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Validate status transitions
    if (status) {
      const currentStatus = currentOrder.status;
      if (status === "Cancelled" && !["Pending", "Confirmed"].includes(currentStatus)) {
        return new Response(
          JSON.stringify({ error: "Order can only be cancelled when Pending or Confirmed" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      if (status === "Delivered" && ["Cancelled", "Delivered"].includes(currentStatus)) {
        return new Response(
          JSON.stringify({ error: "Order is already " + currentStatus }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
    }

    const updates: Record<string, unknown> = {};
    if (status) updates.status = status;
    if (return_status) updates.return_status = return_status;
    if (return_reason !== undefined) updates.return_reason = return_reason;
    if (return_note !== undefined) updates.return_note = return_note;

    const { data, error } = await supabase
      .from("orders")
      .update(updates)
      .eq("order_number", order_number)
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, order: data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
