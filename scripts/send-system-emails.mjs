import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const envPath = path.join(projectRoot, '.env.local');

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) continue;
    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadDotEnv(envPath);

const resendApiKey = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM_EMAIL ?? 'AOE Connect <noreply@aoe.africa>';
const to = process.env.SYSTEM_EMAIL_TEST_RECIPIENT ?? 'izanidigitalstudio@gmail.com';

if (!resendApiKey) {
  throw new Error('Missing RESEND_API_KEY in .env.local or environment.');
}

const systemEmails = [
  {
    key: 'welcome',
    subject: 'Welcome to AOE Connect',
    html: `
      <h1>Welcome to AOE Connect</h1>
      <p>Your account is ready.</p>
      <p>Connect with Africa's AI builders, discover events, and explore resources curated for founders and operators.</p>
    `,
  },
  {
    key: 'conference-request-received',
    subject: 'Conference Request Received',
    html: `
      <h1>Conference Request Received</h1>
      <p>We have received your request to participate in an upcoming AOE conference.</p>
      <p>Your submission is now pending review and our team will follow up with the next steps.</p>
    `,
  },
  {
    key: 'conference-request-approved',
    subject: 'Conference Request Approved',
    html: `
      <h1>Conference Request Approved</h1>
      <p>Your conference participation request has been approved.</p>
      <p>Please watch for event logistics, access instructions, and any ticketing details from the AOE team.</p>
    `,
  },
  {
    key: 'conference-request-declined',
    subject: 'Conference Request Update',
    html: `
      <h1>Conference Request Update</h1>
      <p>Your request was reviewed, but we are unable to confirm participation for this event.</p>
      <p>We encourage you to apply for future AOE events and ecosystem programs.</p>
    `,
  },
  {
    key: 'event-invitation',
    subject: 'You Are Invited to an AOE Event',
    html: `
      <h1>You Are Invited</h1>
      <p>You have been added to the guest list for an upcoming AOE event.</p>
      <p>Please confirm your attendance and keep this email for venue and schedule updates.</p>
    `,
  },
  {
    key: 'event-rsvp-confirmation',
    subject: 'Your RSVP Has Been Confirmed',
    html: `
      <h1>RSVP Confirmed</h1>
      <p>Your RSVP has been recorded successfully.</p>
      <p>We look forward to hosting you at the event.</p>
    `,
  },
  {
    key: 'payment-pending',
    subject: 'Payment Pending for Your Event Access',
    html: `
      <h1>Payment Pending</h1>
      <p>Your RSVP is recorded, but payment is still pending.</p>
      <p>Once payment is confirmed, your attendance will be fully secured.</p>
    `,
  },
  {
    key: 'payment-confirmed',
    subject: 'Payment Confirmed',
    html: `
      <h1>Payment Confirmed</h1>
      <p>Your payment has been confirmed successfully.</p>
      <p>Your spot is now secured for the event.</p>
    `,
  },
  {
    key: 'connection-request',
    subject: 'New Connection Request on AOE Connect',
    html: `
      <h1>New Connection Request</h1>
      <p>Another member wants to connect with you on AOE Connect.</p>
      <p>Open the app to review and respond to the request.</p>
    `,
  },
];

async function sendEmail(template) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `aoe-system-email-${template.key}-${Date.now()}`,
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: template.subject,
      html: template.html.trim(),
      text: template.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
      tags: [{ name: 'system_email', value: template.key }],
    }),
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`${template.key}: ${response.status} ${body}`);
  }

  return {
    key: template.key,
    response: body ? JSON.parse(body) : null,
  };
}

const results = [];
for (const email of systemEmails) {
  try {
    const result = await sendEmail(email);
    results.push({ key: email.key, ok: true, id: result.response?.id ?? null });
  } catch (error) {
    results.push({
      key: email.key,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

console.log(JSON.stringify({ from, to, sent: results }, null, 2));
