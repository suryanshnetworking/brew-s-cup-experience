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
    const { action, email, otp } = await req.json();

    if (!email || !action) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (action === "send") {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      // Remove existing OTPs for this email
      await supabase.from("otps").delete().eq("email", email);

      // Store new OTP
      const { error } = await supabase.from("otps").insert({
        email,
        otp: generatedOtp,
        expires_at: expiresAt,
      });

      if (error) throw error;

      // TODO: Integrate email service (EmailJS, Resend, etc.) to send OTP to customer
      // For development, the OTP is returned in the response
      return new Response(
        JSON.stringify({ success: true, message: "OTP sent", otp: generatedOtp }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "verify") {
      if (!otp) {
        return new Response(
          JSON.stringify({ verified: false, message: "OTP is required" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      const { data, error } = await supabase
        .from("otps")
        .select("*")
        .eq("email", email)
        .eq("verified", false)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return new Response(
          JSON.stringify({ verified: false, message: "No valid OTP found. Please request a new one." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      if (new Date(data.expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ verified: false, message: "OTP has expired. Please request a new one." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      if (data.attempts >= 3) {
        return new Response(
          JSON.stringify({ verified: false, message: "Too many attempts. Please request a new OTP." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      if (data.otp === otp) {
        await supabase.from("otps").update({ verified: true }).eq("id", data.id);
        return new Response(
          JSON.stringify({ verified: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        await supabase.from("otps").update({ attempts: data.attempts + 1 }).eq("id", data.id);
        const attemptsLeft = 2 - data.attempts;
        return new Response(
          JSON.stringify({ verified: false, message: "Incorrect OTP", attemptsLeft }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
