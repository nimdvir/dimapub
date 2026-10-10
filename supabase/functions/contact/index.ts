// Dima Publishing — contact form + updates sign-up endpoint.
// Stores every submission in Postgres, then emails a notification through Resend.
// Deployed with verify_jwt = false: this is a public form, guarded by validation,
// a honeypot field, a minimum fill time and per-IP rate limiting instead.
import { createClient } from "npm:@supabase/supabase-js@2";

const NOTIFY_TO = Deno.env.get("NOTIFY_TO") ?? "dimapublishingllc@gmail.com";
const NOTIFY_FROM = Deno.env.get("NOTIFY_FROM") ?? "Dima Publishing <notifications@dimapublishing.com>";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const ALLOWED_ORIGINS = new Set([
  "https://dimapub.com",
  "https://www.dimapub.com",
  "https://nimdvir.github.io",
  "http://localhost:4321",
  "http://127.0.0.1:4321",
]);

const TOPICS = new Set(["general", "adoption", "instructor", "bulk", "authors", "partnerships", "press", "portal", "support"]);
const TOPIC_LABELS: Record<string, string> = {
  general: "General question",
  adoption: "Course adoption",
  instructor: "Instructor resources",
  bulk: "Bulk / institutional access",
  authors: "Publishing with us",
  partnerships: "Partnerships",
  press: "Press & media",
  portal: "Portal access request",
  support: "Reader support",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function cors(origin: string | null) {
  const allow = origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://dimapub.com";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function json(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(origin), "Content-Type": "application/json" },
  });
}

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

async function sha256(input: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sendEmail(subject: string, html: string, text: string, replyTo?: string) {
  if (!RESEND_API_KEY) return "skipped";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: NOTIFY_FROM, to: [NOTIFY_TO], subject, html, text, reply_to: replyTo }),
  });
  if (!res.ok) {
    console.error("Resend error", res.status, await res.text());
    return "failed";
  }
  return "sent";
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405, origin);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request." }, 400, origin);
  }

  // Bots fill the hidden field or submit instantly; pretend success so they move on.
  if (clean(body.website, 200) || Number(body.elapsed_ms ?? 99999) < 1500) {
    return json({ ok: true }, 200, origin);
  }

  const kind = body.kind === "subscribe" ? "subscribe" : "contact";
  const email = clean(body.email, 320).toLowerCase();
  if (!EMAIL_RE.test(email)) return json({ error: "Please enter a valid email address." }, 422, origin);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
  const ipHash = ip ? await sha256(`${ip}|${Deno.env.get("SUPABASE_URL")}`) : null;
  const sourcePage = clean(body.source_page, 300);

  if (kind === "subscribe") {
    const { error } = await supabase
      .from("subscribers")
      .upsert({ email, source_page: sourcePage, unsubscribed: false }, { onConflict: "email" });
    if (error) {
      console.error(error);
      return json({ error: "We couldn't save that right now. Please try again." }, 500, origin);
    }
    return json({ ok: true }, 200, origin);
  }

  const name = clean(body.name, 200);
  const organization = clean(body.organization, 200);
  const message = clean(body.message, 5000);
  const topic = TOPICS.has(String(body.topic)) ? String(body.topic) : "general";
  if (!name) return json({ error: "Please tell us your name." }, 422, origin);
  if (message.length < 5) return json({ error: "Please add a short message." }, 422, origin);

  if (ipHash) {
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", since);
    if ((count ?? 0) >= 5) {
      return json({ error: "Too many messages in a short time. Please try again in a few minutes." }, 429, origin);
    }
  }

  const { data: row, error } = await supabase
    .from("contact_messages")
    .insert({ name, email, organization: organization || null, topic, message, source_page: sourcePage, ip_hash: ipHash })
    .select("id, created_at")
    .single();
  if (error || !row) {
    console.error(error);
    return json({ error: "We couldn't send your message right now. Please email info@dimapub.com." }, 500, origin);
  }

  const label = TOPIC_LABELS[topic];
  const subject = `New inquiry · ${label} · ${name}`;
  const text = [
    `Topic: ${label}`,
    `Name: ${name}`,
    `Email: ${email}`,
    organization ? `Organization: ${organization}` : "",
    sourcePage ? `Sent from: ${sourcePage}` : "",
    "",
    message,
  ].filter(Boolean).join("\n");
  const html = `
    <div style="font-family:Georgia,serif;max-width:600px;margin:auto;padding:24px;color:#14120f">
      <p style="font:600 11px/1 monospace;letter-spacing:.14em;text-transform:uppercase;color:#a87b25;margin:0 0 12px">dimapub.com · ${escapeHtml(label)}</p>
      <h1 style="font-size:22px;margin:0 0 16px">${escapeHtml(name)} wrote in</h1>
      <table style="font:14px/1.5 Arial,sans-serif;border-collapse:collapse;margin-bottom:16px">
        <tr><td style="color:#6b645a;padding:2px 12px 2px 0">Email</td><td><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
        ${organization ? `<tr><td style="color:#6b645a;padding:2px 12px 2px 0">Organization</td><td>${escapeHtml(organization)}</td></tr>` : ""}
        ${sourcePage ? `<tr><td style="color:#6b645a;padding:2px 12px 2px 0">Page</td><td>${escapeHtml(sourcePage)}</td></tr>` : ""}
      </table>
      <div style="font:15px/1.6 Arial,sans-serif;white-space:pre-wrap;border-left:3px solid #c9a24a;padding:4px 0 4px 16px">${escapeHtml(message)}</div>
      <p style="font:12px Arial,sans-serif;color:#6b645a;margin-top:24px">Reply to this email to answer ${escapeHtml(name)} directly.</p>
    </div>`;

  const status = await sendEmail(subject, html, text, email);
  await supabase.from("contact_messages").update({ email_status: status }).eq("id", row.id);

  return json({ ok: true }, 200, origin);
});
