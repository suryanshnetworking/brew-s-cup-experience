import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendOtpEmail(email: string, otp: string) {
  const EMAILJS_SERVICE_ID = Deno.env.get("EMAILJS_SERVICE_ID");
  const EMAILJS_TEMPLATE_ID = Deno.env.get("EMAILJS_TEMPLATE_ID");
  const EMAILJS_PUBLIC_KEY = Deno.env.get("EMAILJS_PUBLIC_KEY");

  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.error("Missing EmailJS environment variables");
    throw new Error("Email service not configured");
  }

  const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: {
        to_email: email,
        otp_code: otp,
        message: `Your Brew's Cup verification code is: ${otp}. It expires in 5 minutes.`,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("EmailJS error:", text);
    throw new Error("Failed to send OTP email");
  }
}

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

      await supabase.from("otps").delete().eq("email", email);

      const { error } = await supabase.from("otps").insert({
        email,
        otp: generatedOtp,
        expires_at: expiresAt,
      });

      if (error) throw error;

      // Send OTP via EmailJS
      await sendOtpEmail(email, generatedOtp);

      return new Response(
        JSON.stringify({ success: true, message: "OTP sent" }),
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
