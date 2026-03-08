import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const NOTIFICATION_EMAIL = "koketsonare65@outlook.com";

interface NotificationPayload {
  type: "contact" | "job_application" | "emergency_alert";
  data: Record<string, string>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data } = (await req.json()) as NotificationPayload;

    let subject = "";
    let html = "";

    if (type === "contact") {
      subject = `New Contact Form: ${data.name}`;
      html = `
        <h2>New Contact Form Submission</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;border:1px solid #ddd"><strong>Name</strong></td><td style="padding:8px;border:1px solid #ddd">${data.name}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd"><strong>Email</strong></td><td style="padding:8px;border:1px solid #ddd">${data.email}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd"><strong>Phone</strong></td><td style="padding:8px;border:1px solid #ddd">${data.phone}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd"><strong>Company</strong></td><td style="padding:8px;border:1px solid #ddd">${data.company || "N/A"}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd"><strong>Service</strong></td><td style="padding:8px;border:1px solid #ddd">${data.service || "N/A"}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd"><strong>Message</strong></td><td style="padding:8px;border:1px solid #ddd">${data.message}</td></tr>
        </table>
      `;
    } else if (type === "job_application") {
      subject = `New Job Application: ${data.name} — ${data.position}`;
      html = `
        <h2>New Job Application</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;border:1px solid #ddd"><strong>Name</strong></td><td style="padding:8px;border:1px solid #ddd">${data.name}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd"><strong>Email</strong></td><td style="padding:8px;border:1px solid #ddd">${data.email}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd"><strong>Phone</strong></td><td style="padding:8px;border:1px solid #ddd">${data.phone}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd"><strong>Position</strong></td><td style="padding:8px;border:1px solid #ddd">${data.position}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd"><strong>Experience</strong></td><td style="padding:8px;border:1px solid #ddd">${data.experience || "N/A"}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd"><strong>Message</strong></td><td style="padding:8px;border:1px solid #ddd">${data.message || "N/A"}</td></tr>
          ${data.cv_url ? `<tr><td style="padding:8px;border:1px solid #ddd"><strong>CV</strong></td><td style="padding:8px;border:1px solid #ddd">File uploaded: ${data.cv_url}</td></tr>` : ""}
        </table>
      `;
    } else if (type === "emergency_alert") {
      subject = `🚨 EMERGENCY ALERT: ${data.alert_type}`;
      html = `
        <div style="background:#dc2626;color:white;padding:20px;border-radius:8px;margin-bottom:20px">
          <h1 style="margin:0;font-size:24px">🚨 EMERGENCY ALERT</h1>
          <p style="margin:5px 0 0;font-size:16px">Immediate response required!</p>
        </div>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:12px;border:1px solid #ddd;background:#fef2f2"><strong>Alert Type</strong></td><td style="padding:12px;border:1px solid #ddd;background:#fef2f2;font-weight:bold;color:#dc2626">${data.alert_type}</td></tr>
          <tr><td style="padding:12px;border:1px solid #ddd"><strong>Location</strong></td><td style="padding:12px;border:1px solid #ddd">${data.location}</td></tr>
          <tr><td style="padding:12px;border:1px solid #ddd"><strong>Description</strong></td><td style="padding:12px;border:1px solid #ddd">${data.description}</td></tr>
          <tr><td style="padding:12px;border:1px solid #ddd"><strong>Client Email</strong></td><td style="padding:12px;border:1px solid #ddd">${data.user_email}</td></tr>
          <tr><td style="padding:12px;border:1px solid #ddd"><strong>Time</strong></td><td style="padding:12px;border:1px solid #ddd">${data.time}</td></tr>
        </table>
        <p style="margin-top:20px;padding:15px;background:#fef2f2;border-left:4px solid #dc2626;border-radius:4px">
          <strong>Action Required:</strong> Log in to the Admin Dashboard to respond to this alert immediately.
        </p>
      `;
    } else {
      return new Response(JSON.stringify({ error: "Invalid type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Mayfair Security <onboarding@resend.dev>",
        to: [NOTIFICATION_EMAIL],
        subject,
        html,
      }),
    });

    const resData = await res.json();

    if (!res.ok) {
      console.error("Resend error:", resData);
      return new Response(JSON.stringify({ error: "Failed to send email", details: resData }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, id: resData.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
