import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ADMIN_EMAILS = ["koketsonare65@outlook.com", "jeweliq.tech@outlook.com"];

const emailWrapper = (title: string, body: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:20px">
    <div style="background:linear-gradient(135deg,#1a2332,#2d5016);padding:24px 30px;border-radius:12px 12px 0 0;text-align:center">
      <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:800;letter-spacing:-0.5px">🛡️ Mayfair Security</h1>
    </div>
    <div style="background:#f8fafc;padding:16px 30px;border-bottom:1px solid #e2e8f0">
      <h2 style="margin:0;font-size:18px;color:#1a2332">${title}</h2>
    </div>
    <div style="padding:24px 30px;background:#ffffff;border:1px solid #e2e8f0;border-top:none">
      ${body}
    </div>
    <div style="padding:16px 30px;background:#f1f5f9;border-radius:0 0 12px 12px;text-align:center">
      <p style="margin:0;font-size:12px;color:#64748b">Daily automated digest for Mayfair Security admins.</p>
    </div>
  </div>
</body>
</html>`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get applications from the last 24 hours
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: newApps, error } = await supabase
      .from("job_applications")
      .select("name, email, phone, position, experience, created_at, status")
      .gte("created_at", since)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Also get summary stats
    const { data: allApps } = await supabase
      .from("job_applications")
      .select("status");

    const totalPending = allApps?.filter((a: any) => a.status === "pending").length || 0;
    const totalAll = allApps?.length || 0;

    // If no new applications, send a brief "all clear" email
    const count = newApps?.length || 0;

    let body: string;

    if (count === 0) {
      body = `
        <p style="color:#334155;font-size:15px;line-height:1.6">Good morning! 👋</p>
        <p style="color:#334155;font-size:15px;line-height:1.6">No new job applications were received in the last 24 hours.</p>
        <div style="background:#f0f9ff;padding:16px;border-radius:8px;margin:16px 0">
          <p style="margin:0;font-size:14px;color:#334155"><strong>Total Applications:</strong> ${totalAll} &nbsp;|&nbsp; <strong>Pending Review:</strong> ${totalPending}</p>
        </div>
      `;
    } else {
      const rows = newApps!.map((app: any) => `
        <tr>
          <td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600">${app.name}</td>
          <td style="padding:10px 12px;border:1px solid #e2e8f0">${app.position}</td>
          <td style="padding:10px 12px;border:1px solid #e2e8f0">${app.email}</td>
          <td style="padding:10px 12px;border:1px solid #e2e8f0">${app.phone}</td>
          <td style="padding:10px 12px;border:1px solid #e2e8f0">${app.experience || "N/A"}</td>
        </tr>
      `).join("");

      body = `
        <p style="color:#334155;font-size:15px;line-height:1.6">Good morning! 👋</p>
        <p style="color:#334155;font-size:15px;line-height:1.6">
          <strong>${count}</strong> new job application${count > 1 ? "s were" : " was"} received in the last 24 hours:
        </p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:13px">
          <thead>
            <tr style="background:#f8fafc">
              <th style="padding:10px 12px;border:1px solid #e2e8f0;text-align:left;font-weight:700">Name</th>
              <th style="padding:10px 12px;border:1px solid #e2e8f0;text-align:left;font-weight:700">Position</th>
              <th style="padding:10px 12px;border:1px solid #e2e8f0;text-align:left;font-weight:700">Email</th>
              <th style="padding:10px 12px;border:1px solid #e2e8f0;text-align:left;font-weight:700">Phone</th>
              <th style="padding:10px 12px;border:1px solid #e2e8f0;text-align:left;font-weight:700">Experience</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div style="background:#f0fdf4;padding:16px;border-radius:8px;margin:16px 0">
          <p style="margin:0;font-size:14px;color:#334155"><strong>Total Applications:</strong> ${totalAll} &nbsp;|&nbsp; <strong>Pending Review:</strong> ${totalPending}</p>
        </div>
        <p style="color:#64748b;font-size:13px">Log in to the Admin Dashboard to review and respond to these applications.</p>
      `;
    }

    const subject = count > 0
      ? `📋 Daily Digest: ${count} New Job Application${count > 1 ? "s" : ""}`
      : "📋 Daily Digest: No New Applications";

    const html = emailWrapper("Daily Applications Digest 📋", body);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Mayfair Security <onboarding@resend.dev>",
        to: ADMIN_EMAILS,
        subject,
        html,
      }),
    });

    const resData = await res.json();

    if (!res.ok) {
      console.error("Resend error:", resData);
      return new Response(JSON.stringify({ error: "Failed to send digest", details: resData }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Application digest sent: ${count} new applications`);
    return new Response(JSON.stringify({ success: true, applications: count }), {
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
