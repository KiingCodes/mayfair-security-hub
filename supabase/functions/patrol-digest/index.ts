import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Get patrol reports from last 24 hours
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: reports, error: reportsErr } = await adminClient
      .from("patrol_reports")
      .select("*")
      .gte("created_at", since)
      .order("created_at", { ascending: false });

    if (reportsErr) throw reportsErr;

    if (!reports || reports.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "No patrol reports in last 24h, no digest sent." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get all client emails
    const { data: clients } = await adminClient
      .from("user_roles")
      .select("user_id")
      .eq("role", "client");

    if (!clients || clients.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "No clients to send digest to." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const clientIds = clients.map((c) => c.user_id);
    const { data: { users } } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
    const clientEmails = users
      .filter((u) => clientIds.includes(u.id) && u.email)
      .map((u) => u.email!);

    if (clientEmails.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "No client emails found." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build digest email
    const today = new Date().toLocaleDateString("en-ZA", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const reportRows = reports.map((r) => `
      <tr>
        <td style="padding:10px 12px;border:1px solid #e2e8f0;font-size:13px">${new Date(r.created_at).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}</td>
        <td style="padding:10px 12px;border:1px solid #e2e8f0;font-size:13px;font-weight:600">${r.guard_name}</td>
        <td style="padding:10px 12px;border:1px solid #e2e8f0;font-size:13px">${r.location}</td>
        <td style="padding:10px 12px;border:1px solid #e2e8f0;font-size:13px;text-transform:capitalize">${r.report_type.replace(/_/g, " ")}</td>
        <td style="padding:10px 12px;border:1px solid #e2e8f0;font-size:13px">${r.summary}</td>
      </tr>
    `).join("");

    // Count by type
    const typeCounts: Record<string, number> = {};
    reports.forEach((r) => {
      typeCounts[r.report_type] = (typeCounts[r.report_type] || 0) + 1;
    });
    const summaryBadges = Object.entries(typeCounts).map(([type, count]) =>
      `<span style="display:inline-block;background:#e2e8f0;color:#334155;padding:4px 10px;border-radius:12px;font-size:12px;font-weight:600;margin:2px 4px">${type.replace(/_/g, " ")} (${count})</span>`
    ).join("");

    // Unique guards and locations
    const uniqueGuards = [...new Set(reports.map((r) => r.guard_name))];
    const uniqueLocations = [...new Set(reports.map((r) => r.location))];

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:700px;margin:0 auto;padding:20px">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1a2332,#2d5016);padding:24px 30px;border-radius:12px 12px 0 0;text-align:center">
      <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:800">🛡️ Mayfair Security</h1>
      <p style="margin:6px 0 0;color:#ffffff;opacity:0.8;font-size:13px">Daily Patrol Summary</p>
    </div>

    <!-- Date & Stats -->
    <div style="background:#f8fafc;padding:20px 30px;border-bottom:1px solid #e2e8f0">
      <h2 style="margin:0;font-size:16px;color:#1a2332">📋 ${today}</h2>
      <div style="margin-top:12px;display:flex;gap:16px">
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px;flex:1;text-align:center">
          <p style="margin:0;font-size:24px;font-weight:800;color:#2d5016">${reports.length}</p>
          <p style="margin:2px 0 0;font-size:11px;color:#64748b">Reports Filed</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px;flex:1;text-align:center">
          <p style="margin:0;font-size:24px;font-weight:800;color:#2d5016">${uniqueGuards.length}</p>
          <p style="margin:2px 0 0;font-size:11px;color:#64748b">Active Guards</p>
        </div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px;flex:1;text-align:center">
          <p style="margin:0;font-size:24px;font-weight:800;color:#2d5016">${uniqueLocations.length}</p>
          <p style="margin:2px 0 0;font-size:11px;color:#64748b">Locations Covered</p>
        </div>
      </div>
      <div style="margin-top:12px">${summaryBadges}</div>
    </div>

    <!-- Report Table -->
    <div style="padding:20px 30px;background:#ffffff;border:1px solid #e2e8f0;border-top:none">
      <h3 style="margin:0 0 12px;font-size:14px;color:#334155">Patrol Reports</h3>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#f1f5f9">
            <th style="padding:8px 12px;border:1px solid #e2e8f0;font-size:12px;text-align:left;color:#64748b">Time</th>
            <th style="padding:8px 12px;border:1px solid #e2e8f0;font-size:12px;text-align:left;color:#64748b">Guard</th>
            <th style="padding:8px 12px;border:1px solid #e2e8f0;font-size:12px;text-align:left;color:#64748b">Location</th>
            <th style="padding:8px 12px;border:1px solid #e2e8f0;font-size:12px;text-align:left;color:#64748b">Type</th>
            <th style="padding:8px 12px;border:1px solid #e2e8f0;font-size:12px;text-align:left;color:#64748b">Summary</th>
          </tr>
        </thead>
        <tbody>
          ${reportRows}
        </tbody>
      </table>
    </div>

    <!-- Footer -->
    <div style="padding:16px 30px;background:#f1f5f9;border-radius:0 0 12px 12px;text-align:center">
      <p style="margin:0;font-size:12px;color:#64748b">This is your daily patrol digest. Log in to your portal for full details.</p>
      <p style="margin:4px 0 0;font-size:11px;color:#94a3b8">Mayfair Security &bull; Professional Protection Services</p>
    </div>
  </div>
</body>
</html>`;

    // Send email
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Mayfair Security <onboarding@resend.dev>",
        to: clientEmails,
        subject: `📋 Daily Patrol Summary — ${today}`,
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

    return new Response(JSON.stringify({
      success: true,
      reports_count: reports.length,
      recipients: clientEmails.length,
      id: resData.id,
    }), {
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
