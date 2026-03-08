import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

// Branded email wrapper
const emailWrapper = (title: string, body: string, footerText = "You're receiving this because you're a Mayfair Security client.") => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:20px">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1a2332,#2d5016);padding:24px 30px;border-radius:12px 12px 0 0;text-align:center">
      <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:800;letter-spacing:-0.5px">🛡️ Mayfair Security</h1>
    </div>
    <!-- Title Bar -->
    <div style="background:#f8fafc;padding:16px 30px;border-bottom:1px solid #e2e8f0">
      <h2 style="margin:0;font-size:18px;color:#1a2332">${title}</h2>
    </div>
    <!-- Body -->
    <div style="padding:24px 30px;background:#ffffff;border:1px solid #e2e8f0;border-top:none">
      ${body}
    </div>
    <!-- Footer -->
    <div style="padding:16px 30px;background:#f1f5f9;border-radius:0 0 12px 12px;text-align:center">
      <p style="margin:0;font-size:12px;color:#64748b">${footerText}</p>
      <p style="margin:4px 0 0;font-size:11px;color:#94a3b8">Mayfair Security &bull; Professional Protection Services</p>
    </div>
  </div>
</body>
</html>`;

// Email templates by type
const templates: Record<string, (data: any) => { subject: string; html: string }> = {
  // 1. Welcome email on registration
  welcome: (data) => ({
    subject: "Welcome to Mayfair Security — Your Account is Ready",
    html: emailWrapper("Welcome Aboard! 👋", `
      <p style="color:#334155;font-size:15px;line-height:1.6">Hi there,</p>
      <p style="color:#334155;font-size:15px;line-height:1.6">
        Thank you for registering with Mayfair Security. Your client portal is now active. Here's what you can do:
      </p>
      <ul style="color:#334155;font-size:14px;line-height:2;padding-left:20px">
        <li>📊 View patrol reports and guard check-ins</li>
        <li>🚨 Trigger emergency panic alerts</li>
        <li>📄 Access invoices and contracts</li>
        <li>👮 Request additional security personnel</li>
      </ul>
      <div style="text-align:center;margin:24px 0">
        <a href="${data.portal_url || '#'}" style="background:#2d5016;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block">
          Access Your Portal →
        </a>
      </div>
      <p style="color:#64748b;font-size:13px">If you have any questions, don't hesitate to reach out to our team.</p>
    `),
  }),

  // 2. Incident reported notification
  incident_reported: (data) => ({
    subject: `⚠️ Incident Report: ${data.incident_type} at ${data.location}`,
    html: emailWrapper("Incident Reported ⚠️", `
      <p style="color:#334155;font-size:15px;line-height:1.6">An incident has been reported in your area:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;background:#fef2f2;font-weight:600;width:140px;color:#991b1b">Type</td>
            <td style="padding:10px 12px;border:1px solid #e2e8f0;background:#fef2f2;font-weight:700;color:#dc2626">${data.incident_type}</td></tr>
        <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600">Location</td>
            <td style="padding:10px 12px;border:1px solid #e2e8f0">${data.location}</td></tr>
        <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600">Severity</td>
            <td style="padding:10px 12px;border:1px solid #e2e8f0">${data.severity}</td></tr>
        <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600">Description</td>
            <td style="padding:10px 12px;border:1px solid #e2e8f0">${data.description}</td></tr>
        <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600">Reported By</td>
            <td style="padding:10px 12px;border:1px solid #e2e8f0">${data.reporter_name}</td></tr>
      </table>
      <p style="color:#64748b;font-size:13px;margin-top:16px">Our team is monitoring the situation. Log in to your portal for live updates.</p>
    `),
  }),

  // 3. Emergency alert confirmation (sent to the client who triggered it)
  emergency_alert_confirmed: (data) => ({
    subject: `🚨 Emergency Alert Received — Help is on the way`,
    html: emailWrapper("Emergency Alert Confirmed 🚨", `
      <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:16px;border-radius:0 8px 8px 0;margin-bottom:16px">
        <p style="margin:0;font-weight:700;color:#dc2626;font-size:16px">Your emergency alert has been received!</p>
        <p style="margin:4px 0 0;color:#991b1b;font-size:14px">Our response team has been notified immediately.</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600;width:140px">Alert Type</td>
            <td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:700;color:#dc2626">${data.alert_type}</td></tr>
        <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600">Location</td>
            <td style="padding:10px 12px;border:1px solid #e2e8f0">${data.location || "Not specified"}</td></tr>
        <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600">Time</td>
            <td style="padding:10px 12px;border:1px solid #e2e8f0">${data.time}</td></tr>
      </table>
      <p style="color:#334155;font-size:14px;line-height:1.6"><strong>What happens next:</strong></p>
      <ol style="color:#334155;font-size:14px;line-height:2;padding-left:20px">
        <li>Our admin team reviews your alert immediately</li>
        <li>A response team is dispatched to your location</li>
        <li>You'll receive an update when the alert is resolved</li>
      </ol>
      <p style="color:#64748b;font-size:13px">If you need immediate phone assistance, call <strong>060 433 4341</strong></p>
    `),
  }),

  // 4. Emergency alert resolved
  emergency_alert_resolved: (data) => ({
    subject: `✅ Emergency Alert Resolved — ${data.alert_type}`,
    html: emailWrapper("Alert Resolved ✅", `
      <div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:16px;border-radius:0 8px 8px 0;margin-bottom:16px">
        <p style="margin:0;font-weight:700;color:#16a34a;font-size:16px">Your emergency alert has been resolved</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600;width:140px">Alert Type</td>
            <td style="padding:10px 12px;border:1px solid #e2e8f0">${data.alert_type}</td></tr>
        <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600">Resolution</td>
            <td style="padding:10px 12px;border:1px solid #e2e8f0">${data.admin_notes || "Resolved by admin"}</td></tr>
        <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600">Resolved At</td>
            <td style="padding:10px 12px;border:1px solid #e2e8f0">${data.resolved_at}</td></tr>
      </table>
      <p style="color:#64748b;font-size:13px">Thank you for using our emergency alert system. Stay safe!</p>
    `),
  }),

  // 5. Cancellation request status update
  cancellation_update: (data) => ({
    subject: `Contract Cancellation ${data.status === "approved" ? "Approved ✅" : data.status === "rejected" ? "Declined ❌" : "Update 📋"}`,
    html: emailWrapper(`Cancellation ${data.status === "approved" ? "Approved" : data.status === "rejected" ? "Declined" : "Update"}`, `
      <p style="color:#334155;font-size:15px;line-height:1.6">
        Your contract cancellation request has been <strong>${data.status}</strong>.
      </p>
      <div style="background:${data.status === "approved" ? "#f0fdf4" : data.status === "rejected" ? "#fef2f2" : "#f8fafc"};padding:16px;border-radius:8px;margin:16px 0">
        <p style="margin:0;font-size:14px;color:#334155"><strong>Status:</strong> ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}</p>
        <p style="margin:8px 0 0;font-size:14px;color:#334155"><strong>Your reason:</strong> ${data.reason}</p>
      </div>
      ${data.status === "approved"
        ? '<p style="color:#334155;font-size:14px">Our team will be in touch regarding the next steps for your contract termination.</p>'
        : data.status === "rejected"
        ? '<p style="color:#334155;font-size:14px">If you have questions about this decision, please contact our support team.</p>'
        : ""}
    `),
  }),

  // 6. New patrol report filed
  patrol_report: (data) => ({
    subject: `📋 Patrol Report: ${data.location}`,
    html: emailWrapper("New Patrol Report 📋", `
      <p style="color:#334155;font-size:15px;line-height:1.6">A new patrol report has been filed for your area:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600;width:140px">Guard</td>
            <td style="padding:10px 12px;border:1px solid #e2e8f0">${data.guard_name}</td></tr>
        <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600">Location</td>
            <td style="padding:10px 12px;border:1px solid #e2e8f0">${data.location}</td></tr>
        <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600">Type</td>
            <td style="padding:10px 12px;border:1px solid #e2e8f0">${data.report_type}</td></tr>
        <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600">Summary</td>
            <td style="padding:10px 12px;border:1px solid #e2e8f0">${data.summary}</td></tr>
      </table>
      <p style="color:#64748b;font-size:13px">View full details in your client portal.</p>
    `),
  }),

  // 7. Staff invitation credentials
  staff_invite: (data) => ({
    subject: "🛡️ Welcome to Mayfair Security — Your Staff Account",
    html: emailWrapper("Your Staff Account is Ready 👮", `
      <p style="color:#334155;font-size:15px;line-height:1.6">Hi ${data.full_name},</p>
      <p style="color:#334155;font-size:15px;line-height:1.6">
        You've been invited to join Mayfair Security as a staff member. Here are your login credentials:
      </p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:20px;border-radius:8px;margin:16px 0">
        <table style="width:100%">
          <tr><td style="padding:6px 0;font-weight:600;color:#334155">Email:</td>
              <td style="padding:6px 0;font-family:monospace;font-weight:700;color:#1a2332">${data.email}</td></tr>
          <tr><td style="padding:6px 0;font-weight:600;color:#334155">Temp Password:</td>
              <td style="padding:6px 0;font-family:monospace;font-weight:700;color:#1a2332">${data.temp_password}</td></tr>
        </table>
      </div>
      <div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:0 8px 8px 0;margin:16px 0">
        <p style="margin:0;font-size:13px;color:#92400e"><strong>Important:</strong> You'll be required to change your password on first login.</p>
      </div>
      <div style="text-align:center;margin:24px 0">
        <a href="${data.portal_url || '#'}" style="background:#2d5016;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block">
          Login to Staff Portal →
        </a>
      </div>
    `, "You're receiving this because an admin created a staff account for you."),
  }),

  // 8. Incident status update
  incident_resolved: (data) => ({
    subject: `✅ Incident Resolved: ${data.incident_type} at ${data.location}`,
    html: emailWrapper("Incident Resolved ✅", `
      <div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:16px;border-radius:0 8px 8px 0;margin-bottom:16px">
        <p style="margin:0;font-weight:700;color:#16a34a;font-size:16px">An incident in your area has been resolved</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600;width:140px">Type</td>
            <td style="padding:10px 12px;border:1px solid #e2e8f0">${data.incident_type}</td></tr>
        <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600">Location</td>
            <td style="padding:10px 12px;border:1px solid #e2e8f0">${data.location}</td></tr>
        <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600">Status</td>
            <td style="padding:10px 12px;border:1px solid #e2e8f0;color:#16a34a;font-weight:700">${data.status}</td></tr>
      </table>
    `),
  }),

  // 9. File shared with client
  file_shared: (data) => ({
    subject: `📁 New File Shared: ${data.file_name}`,
    html: emailWrapper("New File Shared With You 📁", `
      <p style="color:#334155;font-size:15px;line-height:1.6">A new file has been shared with you by the Mayfair Security team:</p>
      <div style="background:#f0f9ff;border:1px solid #bae6fd;padding:20px;border-radius:8px;margin:16px 0">
        <table style="width:100%">
          <tr><td style="padding:6px 0;font-weight:600;color:#334155">File Name:</td>
              <td style="padding:6px 0;font-weight:700;color:#1a2332">${data.file_name}</td></tr>
          <tr><td style="padding:6px 0;font-weight:600;color:#334155">Description:</td>
              <td style="padding:6px 0;color:#334155">${data.description}</td></tr>
        </table>
      </div>
      <div style="text-align:center;margin:24px 0">
        <a href="#" style="background:#2d5016;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block">
          View in Client Portal →
        </a>
      </div>
    `),
  }),

  // 10. Invoice created notification
  invoice_created: (data) => ({
    subject: `🧾 New Invoice: #${data.invoice_number}`,
    html: emailWrapper("New Invoice Created 🧾", `
      <p style="color:#334155;font-size:15px;line-height:1.6">A new invoice has been created for your account:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600;width:140px">Invoice #</td>
            <td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:700">${data.invoice_number}</td></tr>
        <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600">Amount</td>
            <td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:700;color:#1a2332">R${data.amount}</td></tr>
        ${data.due_date ? `<tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600">Due Date</td>
            <td style="padding:10px 12px;border:1px solid #e2e8f0">${data.due_date}</td></tr>` : ""}
        ${data.description ? `<tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600">Description</td>
            <td style="padding:10px 12px;border:1px solid #e2e8f0">${data.description}</td></tr>` : ""}
        <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600">Status</td>
            <td style="padding:10px 12px;border:1px solid #e2e8f0;color:#dc2626;font-weight:700">${data.status || "Unpaid"}</td></tr>
      </table>
      <div style="text-align:center;margin:24px 0">
        <a href="${data.portal_url || '#'}" style="background:#2d5016;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block">
          View Invoice in Portal →
        </a>
      </div>
      <p style="color:#64748b;font-size:13px">Please ensure payment is made before the due date to avoid late fees.</p>
    `),
  }),

  // 11. Guard request status update
  guard_request_update: (data) => ({
    subject: `${data.status === "approved" ? "✅" : "❌"} Guard Request ${data.status === "approved" ? "Approved" : "Rejected"}`,
    html: emailWrapper(`Guard Request ${data.status === "approved" ? "Approved ✅" : "Rejected ❌"}`, `
      <div style="background:${data.status === "approved" ? "#f0fdf4;border-left:4px solid #16a34a" : "#fef2f2;border-left:4px solid #dc2626"};padding:16px;border-radius:0 8px 8px 0;margin-bottom:16px">
        <p style="margin:0;font-weight:700;color:${data.status === "approved" ? "#16a34a" : "#dc2626"};font-size:16px">
          Your guard request has been ${data.status}
        </p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600;width:140px">Location</td>
            <td style="padding:10px 12px;border:1px solid #e2e8f0">${data.location}</td></tr>
        <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600">Date</td>
            <td style="padding:10px 12px;border:1px solid #e2e8f0">${data.date_needed}</td></tr>
        <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600">Guards</td>
            <td style="padding:10px 12px;border:1px solid #e2e8f0">${data.num_guards}</td></tr>
        <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600">Duration</td>
            <td style="padding:10px 12px;border:1px solid #e2e8f0">${data.duration}</td></tr>
        ${data.admin_notes ? `<tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600">Admin Notes</td>
            <td style="padding:10px 12px;border:1px solid #e2e8f0">${data.admin_notes}</td></tr>` : ""}
      </table>
      ${data.status === "approved"
        ? '<p style="color:#334155;font-size:14px;line-height:1.6">Our team will coordinate the deployment of guards for the requested date and location.</p>'
        : '<p style="color:#334155;font-size:14px;line-height:1.6">If you have questions about this decision, please contact our support team.</p>'}
    `),
  }),

  // 12. Support ticket reply notification
  ticket_reply: (data) => ({
    subject: `💬 New Reply on Ticket: ${data.subject}`,
    html: emailWrapper("New Support Reply 💬", `
      <p style="color:#334155;font-size:15px;line-height:1.6">You have a new reply on your support ticket:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600;width:140px">Ticket</td>
            <td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:700">${data.subject}</td></tr>
        <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600">Status</td>
            <td style="padding:10px 12px;border:1px solid #e2e8f0">${data.status || "In Progress"}</td></tr>
      </table>
      <div style="background:#f0f9ff;border-left:4px solid #3b82f6;padding:16px;border-radius:0 8px 8px 0;margin:16px 0">
        <p style="margin:0;font-size:14px;color:#1e40af;font-weight:600">Message from Support Team:</p>
        <p style="margin:8px 0 0;font-size:14px;color:#334155;line-height:1.6">${data.message}</p>
      </div>
      <div style="text-align:center;margin:24px 0">
        <a href="${data.helpdesk_url || '#'}" style="background:#2d5016;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block">
          View Ticket & Reply →
        </a>
      </div>
    `),
  }),

  // 13. Job application status update (sent to applicant)
  application_status_update: (data) => {
    const statusMessages: Record<string, { emoji: string; title: string; color: string; bg: string; body: string }> = {
      reviewed: { emoji: "👀", title: "Application Under Review", color: "#2563eb", bg: "#eff6ff", body: "Your application has been reviewed by our team. We'll be in touch with next steps soon." },
      shortlisted: { emoji: "⭐", title: "You've Been Shortlisted!", color: "#16a34a", bg: "#f0fdf4", body: "Great news! You've been shortlisted for the position. Our team will contact you to discuss next steps." },
      interview: { emoji: "📅", title: "Interview Invitation", color: "#9333ea", bg: "#faf5ff", body: "Congratulations! We'd like to invite you for an interview. Our team will reach out shortly to schedule a convenient time." },
      hired: { emoji: "🎉", title: "Welcome to the Team!", color: "#16a34a", bg: "#f0fdf4", body: "Congratulations! We're thrilled to offer you the position. Our HR team will contact you with onboarding details." },
      rejected: { emoji: "📋", title: "Application Update", color: "#dc2626", bg: "#fef2f2", body: "Thank you for your interest in Mayfair Security. After careful consideration, we've decided to proceed with other candidates. We encourage you to apply for future openings." },
    };
    const s = statusMessages[data.status] || statusMessages.reviewed;
    return {
      subject: `${s.emoji} Application Update: ${data.position} — ${s.title}`,
      html: emailWrapper(s.title, `
        <p style="color:#334155;font-size:15px;line-height:1.6">Hi ${data.name},</p>
        <div style="background:${s.bg};border-left:4px solid ${s.color};padding:16px;border-radius:0 8px 8px 0;margin:16px 0">
          <p style="margin:0;font-weight:700;color:${s.color};font-size:16px">${s.title}</p>
          <p style="margin:8px 0 0;color:#334155;font-size:14px;line-height:1.6">${s.body}</p>
        </div>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600;width:140px">Position</td>
              <td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:700">${data.position}</td></tr>
          <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600">Status</td>
              <td style="padding:10px 12px;border:1px solid #e2e8f0;color:${s.color};font-weight:700">${data.status.charAt(0).toUpperCase() + data.status.slice(1)}</td></tr>
        </table>
        <p style="color:#64748b;font-size:13px">If you have any questions, feel free to reply to this email.</p>
      `, "You're receiving this because you applied for a position at Mayfair Security."),
    };
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, to, data } = await req.json();

    if (!type || !templates[type]) {
      return new Response(JSON.stringify({ error: `Invalid email type: ${type}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!to || (Array.isArray(to) && to.length === 0)) {
      return new Response(JSON.stringify({ error: "Recipient(s) required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { subject, html } = templates[type](data || {});

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Mayfair Security <onboarding@resend.dev>",
        to: Array.isArray(to) ? to : [to],
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
