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

    if (!order_number || typeof order_number !== "string") {
      return new Response(
        JSON.stringify({ error: "order_number is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const sanitizedOrderNumber = order_number.trim().toUpperCase().slice(0, 30);

    // Validate allowed status values
    const VALID_STATUSES = ["Pending", "Confirmed", "Out for Delivery", "Delivered", "Cancelled"];
    if (status && !VALID_STATUSES.includes(status)) {
      return new Response(
        JSON.stringify({ error: "Invalid status value" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const VALID_RETURN_STATUSES = ["Requested", "Approved", "Rejected", "Completed"];
    if (return_status && !VALID_RETURN_STATUSES.includes(return_status)) {
      return new Response(
        JSON.stringify({ error: "Invalid return_status value" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (return_reason !== undefined && typeof return_reason === "string" && return_reason.length > 500) {
      return new Response(
        JSON.stringify({ error: "return_reason too long" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (return_note !== undefined && typeof return_note === "string" && return_note.length > 1000) {
      return new Response(
        JSON.stringify({ error: "return_note too long" }),
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
      .eq("order_number", sanitizedOrderNumber)
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
      .eq("order_number", sanitizedOrderNumber)
      .select()
      .single();

    if (error) throw error;

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
