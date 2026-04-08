import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * Email service using Resend API v2
 * Sends transactional emails to guests when they're added to events
 */

const API_KEY = "re_cLvwVNRL_CPmePFktXnVJt4rYtvXVHsht";

export const sendEventEmailToGuest = action({
  args: {
    guestName: v.string(),
    guestEmail: v.string(),
    guestType: v.union(v.literal("speaker"), v.literal("invited"), v.literal("paid")),
    eventTitle: v.string(),
    eventDate: v.number(),
    eventLocation: v.string(),
    eventCity: v.string(),
    eventCountry: v.string(),
    eventDescription: v.optional(v.string()),
    amountPaid: v.optional(v.number()),
    currency: v.optional(v.string()),
  },
  returns: v.object({ success: v.boolean(), message: v.string() }),
  handler: async (ctx, args) => {
    const key = API_KEY;
    const keyLen = key.length;
    console.log(`[Email v2] Key length: ${keyLen}, starts with: ${key.substring(0, 8)}`);

    if (!key || keyLen < 10) {
      console.log(`[Email v2] No API key - demo mode`);
      return { success: true, message: "Email service not configured (demo mode)" };
    }

    try {
      const emailTemplate = generateEmailTemplate(args);

      console.log(`[Email v2] Sending to ${args.guestEmail}, subject: ${emailTemplate.subject}`);

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          from: "noreply@aoeafrica.org.za",
          to: args.guestEmail,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
        }),
      });

      const result = await response.json();
      console.log(`[Email v2] Response status: ${response.status}`, JSON.stringify(result));

      if (!response.ok) {
        return { success: false, message: `Email service error: ${result.message || JSON.stringify(result)}` };
      }

      return { success: true, message: "Email sent successfully" };
    } catch (error) {
      console.error("[Email v2] Error:", error);
      return { success: false, message: `Error: ${String(error)}` };
    }
  },
});

export const sendWelcomeEmail = action({
  args: {
    memberName: v.string(),
    memberEmail: v.string(),
  },
  returns: v.object({ success: v.boolean(), message: v.string() }),
  handler: async (ctx, args) => {
    const key = API_KEY;
    const keyLen = key.length;
    console.log(`[Email] Welcome email - Key length: ${keyLen}, starts with: ${key.substring(0, 8)}`);

    if (!key || keyLen < 10) {
      console.log(`[Email] No API key - demo mode`);
      return { success: true, message: "Email service not configured (demo mode)" };
    }

    try {
      const emailTemplate = generateWelcomeEmailTemplate(args.memberName);

      console.log(`[Email] Sending welcome email to ${args.memberEmail}`);

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          from: "welcome@aoeafrica.org.za",
          to: args.memberEmail,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
        }),
      });

      const result = await response.json();
      console.log(`[Email] Response status: ${response.status}`, JSON.stringify(result));

      if (!response.ok) {
        return { success: false, message: `Email service error: ${result.message || JSON.stringify(result)}` };
      }

      return { success: true, message: "Welcome email sent successfully" };
    } catch (error) {
      console.error("[Email] Error:", error);
      return { success: false, message: `Error: ${String(error)}` };
    }
  },
});

export const sendRegistrationWelcomeEmail = action({
  args: {
    memberName: v.string(),
    memberEmail: v.string(),
    memberType: v.string(),
  },
  returns: v.object({ success: v.boolean(), message: v.string() }),
  handler: async (ctx, args) => {
    const key = API_KEY;
    if (!key || key.length < 10) {
      return { success: true, message: "Email service not configured (demo mode)" };
    }

    const categoryLabels: Record<string, string> = {
      platinum_network: "Platinum Network",
      esd_corporate: "ESD Corporate",
      business_community: "Business Community",
      entrepreneurs: "Entrepreneurs",
      short_term_funders: "Short-Term Funders",
    };

    const categoryLabel = categoryLabels[args.memberType] || args.memberType;

    try {
      const subject = `Welcome to AOE Africa, ${args.memberName}! Your ${categoryLabel} membership is active`;

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background: #f5f5f5; }
              .email-container { background: white; margin: 20px auto; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #C8932E 0%, #A67C1A 100%); padding: 40px 30px; text-align: center; color: white; }
              .header-logo { font-size: 32px; font-weight: 900; letter-spacing: 2px; margin: 0; }
              .header-subtitle { font-size: 14px; margin: 8px 0 0; opacity: 0.95; }
              .badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-top: 12px; letter-spacing: 0.5px; }
              .content { padding: 40px 30px; }
              .greeting { font-size: 22px; font-weight: 600; color: #1f2937; margin: 0 0 20px; }
              .intro { font-size: 15px; color: #4b5563; margin: 0 0 25px; line-height: 1.8; }
              .feature { margin: 12px 0; padding: 16px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #C8932E; }
              .feature-title { font-weight: 600; color: #1f2937; margin: 0 0 4px; }
              .feature-desc { font-size: 13px; color: #6b7280; margin: 0; }
              .cta { text-align: center; margin: 30px 0; }
              .cta-button { display: inline-block; background: linear-gradient(135deg, #C8932E, #A67C1A); color: white; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; }
              .steps { background: #f0f4f8; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .steps h3 { margin: 0 0 12px; font-size: 15px; color: #1f2937; }
              .steps ol { margin: 0; padding-left: 20px; font-size: 13px; color: #4b5563; }
              .steps li { margin: 8px 0; }
              .footer { background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="header">
                <h1 class="header-logo">AOE</h1>
                <p class="header-subtitle">Art of Entrepreneurship Africa</p>
                <div class="badge">${categoryLabel} Member</div>
              </div>
              <div class="content">
                <h2 class="greeting">Welcome aboard, ${args.memberName}!</h2>
                <p class="intro">
                  You've successfully registered as a <strong>${categoryLabel}</strong> member of AOE Africa.
                  You're now part of the continent's premier network of entrepreneurs, innovators, and investors
                  shaping the future through AI and collaboration.
                </p>

                <div class="feature">
                  <div class="feature-title">Exclusive Dinner Tour Events</div>
                  <div class="feature-desc">Attend world-class events across Africa — Johannesburg, Lagos, Nairobi, Kigali, and more.</div>
                </div>
                <div class="feature">
                  <div class="feature-title">AI & Innovation Hub</div>
                  <div class="feature-desc">Access AI tools, case studies, and guides tailored for African entrepreneurs.</div>
                </div>
                <div class="feature">
                  <div class="feature-title">Community & Networking</div>
                  <div class="feature-desc">Connect with 500+ members, share ideas, and find collaborators or funding.</div>
                </div>

                <div class="steps">
                  <h3>Get started in 4 easy steps:</h3>
                  <ol>
                    <li>Complete your profile with your background and interests</li>
                    <li>Explore upcoming events and RSVP</li>
                    <li>Join the community forum and introduce yourself</li>
                    <li>Connect with other members</li>
                  </ol>
                </div>

                <div class="cta">
                  <a href="https://app.aoeafrica.org.za" class="cta-button">Explore the Platform</a>
                </div>

                <p style="font-size: 14px; color: #4b5563; margin: 20px 0;">
                  Questions? Reach out to us at <strong>hello@aoeafrica.org.za</strong>.
                </p>
                <p style="font-size: 14px; color: #4b5563; font-weight: 500;">
                  The AOE Team
                </p>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} AOE Africa. All rights reserved.</p>
                <p style="margin-top: 8px;">Art of Entrepreneurship Africa — The Future is Here</p>
              </div>
            </div>
          </body>
        </html>
      `;

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          from: "welcome@aoeafrica.org.za",
          to: args.memberEmail,
          subject,
          html,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        return { success: false, message: `Email error: ${result.message || JSON.stringify(result)}` };
      }
      return { success: true, message: "Welcome email sent successfully" };
    } catch (error) {
      return { success: false, message: `Error: ${String(error)}` };
    }
  },
});

export const sendSpeakerPropositionDraft = action({
  args: {
    recipientEmail: v.string(),
  },
  returns: v.object({ success: v.boolean(), message: v.string() }),
  handler: async (ctx, args) => {
    const key = API_KEY;
    if (!key || key.length < 10) {
      return { success: false, message: "Email service not configured" };
    }

    try {
      const subject = "DRAFT FOR REVIEW: Speaker Proposition — Lebogang Gunguluza | AI & Entrepreneurship in Africa";

      const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
body { font-family: Georgia, 'Times New Roman', serif; margin: 0; padding: 0; background: #f4f3ef; color: #333; }
.wrapper { max-width: 680px; margin: 0 auto; background: #ffffff; }
.header { background: linear-gradient(135deg, #0a2e1a 0%, #1a5c3a 100%); padding: 45px 40px 35px; text-align: center; }
.header h1 { color: #d4af37; font-size: 28px; margin: 0 0 4px; letter-spacing: 2px; font-family: Georgia, serif; }
.header .subtitle { color: #b0b0b0; font-size: 12px; letter-spacing: 4px; margin: 0 0 20px; text-transform: uppercase; }
.header .divider { border: none; border-top: 1px solid #d4af37; width: 80px; margin: 0 auto 18px; }
.header .tagline { color: #a8d5ba; font-size: 13px; font-style: italic; margin: 0; }
.draft-notice { background: #fff8e1; padding: 18px 35px; border-bottom: 2px solid #f0c040; font-size: 13px; color: #5a4e00; line-height: 1.6; }
.draft-notice strong { color: #333; }
.draft-notice .placeholder { background: #fff3cd; padding: 1px 5px; border-radius: 3px; font-family: monospace; font-size: 12px; }
.body { padding: 40px 40px 30px; }
.body p { font-size: 15px; line-height: 1.8; color: #333; margin: 0 0 18px; }
.body .salutation { font-size: 16px; }
.credentials { background: #f5faf7; border-left: 4px solid #1a5c3a; padding: 22px 28px; margin: 28px 0; border-radius: 0 8px 8px 0; }
.credentials h3 { color: #1a5c3a; margin: 0 0 14px; font-size: 16px; }
.credentials ul { margin: 0; padding-left: 20px; font-size: 14px; line-height: 2.2; color: #333; }
.credentials li strong { color: #1a5c3a; }
.section-title { color: #1a5c3a; font-size: 17px; margin: 32px 0 16px; padding-bottom: 8px; border-bottom: 2px solid #d4af37; }
.session-box { background: #fafafa; padding: 18px 24px; border-radius: 8px; text-align: center; margin: 16px 0 24px; font-size: 16px; font-style: italic; color: #1a5c3a; }
.session-box strong { color: #0a2e1a; }
.topics-table { width: 100%; border-collapse: collapse; margin: 12px 0 24px; }
.topics-table td { padding: 11px 16px; border-bottom: 1px solid #eee; font-size: 14px; color: #333; }
.topics-table tr:last-child td { border-bottom: none; }
.aoe-section { background: #f9f9f6; border: 1px solid #e8e6df; border-radius: 8px; padding: 24px 28px; margin: 24px 0; }
.aoe-section h4 { color: #1a5c3a; margin: 0 0 10px; font-size: 15px; }
.aoe-section p { font-size: 14px; line-height: 1.7; color: #555; margin: 0; }
.value-list { margin: 20px 0; padding: 0; list-style: none; }
.value-list li { padding: 8px 0 8px 28px; font-size: 14px; color: #333; position: relative; line-height: 1.6; }
.value-list li:before { content: "\\2713"; position: absolute; left: 0; color: #1a5c3a; font-weight: bold; font-size: 16px; }
.sign-off { margin-top: 35px; }
.sign-off .name { color: #1a5c3a; font-size: 16px; font-weight: bold; margin: 0; }
.sign-off .role { color: #666; font-size: 13px; margin: 3px 0; }
.footer { background: #0a2e1a; padding: 28px 40px; text-align: center; }
.footer .org { color: #d4af37; font-size: 14px; font-weight: bold; margin: 0 0 6px; letter-spacing: 1px; }
.footer .mission { color: #a8d5ba; font-size: 12px; margin: 0 0 10px; }
.footer .contact { color: #777; font-size: 11px; margin: 0; }
</style>
</head>
<body>
<div class="wrapper">

<div class="header">
<h1>ART OF ENTREPRENEURSHIP</h1>
<p class="subtitle">Foundation</p>
<hr class="divider">
<p class="tagline">Speaker Proposition — Draft for Your Review</p>
</div>

<div class="draft-notice">
<strong>NOTE:</strong> This is a <strong>draft email</strong> for your review and approval, Lebo. Once approved, this will be personalised and sent to all conference speaker email addresses listed in the AOE app. The placeholders <span class="placeholder">[Conference Name]</span> and <span class="placeholder">[Organizer Name]</span> will be replaced with each conference's actual details.
</div>

<div class="body">

<p class="salutation">Dear <span style="background: #fff3cd; padding: 2px 6px; border-radius: 3px;">[Conference Organizer Name]</span>,</p>

<p>On behalf of the <strong>Art of Entrepreneurship (AOE) Foundation</strong>, I am writing to formally propose <strong>Lebogang "Lebo" Gunguluza</strong> as a keynote speaker for <span style="background: #fff3cd; padding: 2px 6px; border-radius: 3px;">[Conference Name]</span>.</p>

<p>Mr. Gunguluza is a distinguished African entrepreneur, venture capitalist, author, and global business speaker recognized for his leadership in entrepreneurship development and enterprise innovation across Africa. He is the Founder and Executive Chairman of <strong>GEM Group (Gunguluza Enterprises &amp; Media)</strong>, a diversified investment and advisory firm with interests spanning media, technology, corporate communications, hospitality, venture capital, and strategic consulting.</p>

<p>Gunguluza rose to prominence as one of South Africa's youngest self-made millionaires, building successful enterprises from humble beginnings through innovation, resilience, and a strong entrepreneurial vision. He founded the <strong>South African Black Entrepreneurs Forum (SABEF)</strong>, an organization dedicated to promoting entrepreneurship, mentorship, and access to opportunities for emerging business leaders. Through this platform and other initiatives, he has mentored thousands of entrepreneurs across Africa.</p>

<div class="credentials">
<h3>Speaker Credentials</h3>
<ul>
<li>Author of <strong>"The Art of Entrepreneurship"</strong></li>
<li>Founder of the <strong>AOE Foundation &amp; Digital Platform</strong> — Africa's premier entrepreneurship ecosystem</li>
<li>Investor on <strong>Dragon's Den South Africa</strong></li>
<li>Founder &amp; Executive Chairman of <strong>GEM Group</strong></li>
<li>Founder of the <strong>South African Black Entrepreneurs Forum (SABEF)</strong></li>
<li>One of South Africa's <strong>youngest self-made millionaires</strong></li>
<li>Mentored <strong>thousands of entrepreneurs</strong> across the African continent</li>
<li>Internationally recognized <strong>keynote speaker</strong> at conferences and leadership summits</li>
</ul>
</div>

<h3 class="section-title">Proposed Session</h3>

<div class="session-box">
"<strong>AI-Powered Entrepreneurship: Driving African Innovation &amp; Economic Transformation</strong>"
</div>

<p>This session would explore how African entrepreneurs can harness AI as a competitive advantage, the role of technology platforms in democratizing business opportunities across the continent, and practical strategies for building sustainable, AI-enabled ventures that create lasting continental impact.</p>

<h3 class="section-title">Key Topics</h3>

<table class="topics-table">
<tr><td>&#9670;&nbsp; Leveraging AI to scale enterprises in emerging African markets</td></tr>
<tr><td>&#9670;&nbsp; Creating pathways for African entrepreneurs to access capital and opportunity</td></tr>
<tr><td>&#9670;&nbsp; Economic empowerment through strategic innovation and mentorship</td></tr>
<tr><td>&#9670;&nbsp; Bridging the innovation gap: From idea to scalable enterprise</td></tr>
<tr><td>&#9670;&nbsp; The intersection of entrepreneurship, technology, and economic transformation</td></tr>
</table>

<h3 class="section-title">About the AOE Foundation</h3>

<div class="aoe-section">
<h4>Art of Entrepreneurship (AOE) Platform</h4>
<p>The AOE Foundation has built a comprehensive digital ecosystem — including a mobile app and web platform — connecting African entrepreneurs with resources, mentorship, investors, AI tools, and market opportunities. The AOE initiative actively promotes AI adoption and innovation across the continent as a catalyst for economic growth and transformation.</p>
</div>

<h3 class="section-title">Value to Your Conference</h3>

<ul class="value-list">
<li>Elevate your conference's credibility as a hub for serious entrepreneurial discourse</li>
<li>Provide genuine, lived insights from a founder actively building in the African tech ecosystem</li>
<li>Create direct engagement with the growing AOE platform community across Africa</li>
<li>Generate compelling, shareable content around AI and African entrepreneurship</li>
<li>Inspire attendees with actionable strategies for leveraging AI in their ventures</li>
</ul>

<h3 class="section-title">Format &amp; Availability</h3>

<p>Mr. Gunguluza is available for <strong>keynote addresses, panel discussions, workshops, masterclasses, or fireside chats</strong>. The content can be customised to complement your conference's specific focus areas and audience profile.</p>

<p>We would welcome the opportunity to discuss how this engagement can serve both your conference objectives and the broader mission of advancing AI-driven entrepreneurship across Africa.</p>

<p>Please let us know your preferred format, and we will provide additional materials, speaking samples, or references as needed.</p>

<p style="margin-top: 30px;">We look forward to collaborating.</p>

<p>With kind regards,</p>

<div class="sign-off">
<p class="name">The AOE Foundation</p>
<p class="role">Art of Entrepreneurship</p>
<p class="role">On behalf of Lebogang "Lebo" Gunguluza</p>
<p class="role" style="margin-top: 10px;">Email: info@aoeafrica.org.za</p>
<p class="role">Phone: +267 76 543 228</p>
</div>

</div>

<div class="footer">
<p class="org">AOE FOUNDATION</p>
<p class="mission">Connecting African Entrepreneurs with Opportunity, Innovation &amp; Capital</p>
<p class="contact">www.aoeafrica.org.za &nbsp;|&nbsp; info@aoeafrica.org.za &nbsp;|&nbsp; +267 76 543 228</p>
</div>

</div>
</body>
</html>`;

      console.log(`[Email] Sending speaker proposition draft to ${args.recipientEmail}`);

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          from: "AOE Foundation <noreply@aoeafrica.org.za>",
          to: args.recipientEmail,
          subject,
          html,
        }),
      });

      const result = await response.json();
      console.log(`[Email] Response status: ${response.status}`, JSON.stringify(result));

      if (!response.ok) {
        return { success: false, message: `Email service error: ${result.message || JSON.stringify(result)}` };
      }

      return { success: true, message: "Speaker proposition draft sent successfully" };
    } catch (error) {
      console.error("[Email] Error:", error);
      return { success: false, message: `Error: ${String(error)}` };
    }
  },
});

function generateEmailTemplate(args: {
  guestName: string;
  guestType: string;
  eventTitle: string;
  eventDate: number;
  eventLocation: string;
  eventCity: string;
  eventCountry: string;
  eventDescription?: string;
  amountPaid?: number;
  currency?: string;
}) {
  const eventDate = new Date(args.eventDate);
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let subject = "";
  let bodyText = "";

  if (args.guestType === "speaker") {
    subject = `You're Invited to Speak at ${args.eventTitle}`;
    bodyText = `
      <p>Dear ${args.guestName},</p>
      <p>We're delighted to invite you to speak at <strong>${args.eventTitle}</strong>!</p>
      <p><strong>Event Details:</strong></p>
      <ul>
        <li><strong>Date:</strong> ${formattedDate}</li>
        <li><strong>Location:</strong> ${args.eventLocation}, ${args.eventCity}, ${args.eventCountry}</li>
        ${args.eventDescription ? `<li><strong>About:</strong> ${args.eventDescription}</li>` : ""}
      </ul>
      <p>We look forward to your participation and insights.</p>
      <p>If you have any questions or need more information, please don't hesitate to reach out.</p>
    `;
  } else if (args.guestType === "invited") {
    subject = `You're Invited to ${args.eventTitle}`;
    bodyText = `
      <p>Dear ${args.guestName},</p>
      <p>You are cordially invited to attend <strong>${args.eventTitle}</strong>!</p>
      <p><strong>Event Details:</strong></p>
      <ul>
        <li><strong>Date:</strong> ${formattedDate}</li>
        <li><strong>Location:</strong> ${args.eventLocation}, ${args.eventCity}, ${args.eventCountry}</li>
        ${args.eventDescription ? `<li><strong>About:</strong> ${args.eventDescription}</li>` : ""}
      </ul>
      <p>We're excited to have you join us for this special event.</p>
      <p>Please confirm your attendance at your earliest convenience.</p>
    `;
  } else if (args.guestType === "paid") {
    subject = `Confirmation: Your Ticket for ${args.eventTitle}`;
    bodyText = `
      <p>Dear ${args.guestName},</p>
      <p>Thank you for registering and paying for <strong>${args.eventTitle}</strong>!</p>
      <p><strong>Event Details:</strong></p>
      <ul>
        <li><strong>Date:</strong> ${formattedDate}</li>
        <li><strong>Location:</strong> ${args.eventLocation}, ${args.eventCity}, ${args.eventCountry}</li>
        ${args.eventDescription ? `<li><strong>About:</strong> ${args.eventDescription}</li>` : ""}
        ${
          args.amountPaid
            ? `<li><strong>Amount Paid:</strong> ${args.currency || "USD"} ${args.amountPaid.toFixed(2)}</li>`
            : ""
        }
      </ul>
      <p>We're excited to see you at this event. Your ticket is confirmed!</p>
      <p>For any questions, please contact us.</p>
    `;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9fafb;
            border-radius: 8px;
            padding: 30px;
            border: 1px solid #e5e7eb;
          }
          h2 {
            color: #1f2937;
            margin-top: 0;
          }
          p {
            margin: 12px 0;
          }
          ul {
            padding-left: 20px;
          }
          li {
            margin: 8px 0;
          }
          strong {
            color: #1f2937;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          ${bodyText}
          <div class="footer">
            <p>AOE Africa - Art of Entrepreneurship Africa</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return { subject, html };
}

function generateWelcomeEmailTemplate(memberName: string) {
  const subject = "Welcome to AOE Africa – Art of Entrepreneurship Africa";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 0;
            background-color: #f5f5f5;
          }
          .email-container {
            background: white;
            margin: 20px auto;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #C8932E 0%, #A67C1A 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
          }
          .header-logo {
            font-size: 32px;
            font-weight: 900;
            letter-spacing: 2px;
            margin: 0;
          }
          .header-subtitle {
            font-size: 14px;
            font-weight: 500;
            margin: 8px 0 0 0;
            opacity: 0.95;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 22px;
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 20px 0;
          }
          .intro-text {
            font-size: 15px;
            color: #4b5563;
            margin: 0 0 25px 0;
            line-height: 1.8;
          }
          .features {
            margin: 30px 0;
          }
          .feature {
            display: flex;
            margin: 16px 0;
            padding: 16px;
            background-color: #f9fafb;
            border-radius: 8px;
            border-left: 4px solid #C8932E;
          }
          .feature-icon {
            font-size: 22px;
            margin-right: 12px;
            flex-shrink: 0;
          }
          .feature-content {
            flex: 1;
          }
          .feature-title {
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 4px 0;
          }
          .feature-description {
            font-size: 13px;
            color: #6b7280;
            margin: 0;
          }
          .cta-section {
            margin: 30px 0;
            text-align: center;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #C8932E 0%, #A67C1A 100%);
            color: white;
            padding: 14px 40px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 15px;
            transition: transform 0.2s;
          }
          .cta-button:hover {
            transform: translateY(-2px);
          }
          .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 30px 0;
          }
          .next-steps {
            background-color: #f0f4f8;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .next-steps h3 {
            margin: 0 0 12px 0;
            font-size: 15px;
            color: #1f2937;
          }
          .next-steps ol {
            margin: 0;
            padding-left: 20px;
            font-size: 13px;
            color: #4b5563;
          }
          .next-steps li {
            margin: 8px 0;
          }
          .footer {
            background-color: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
          }
          .footer-text {
            margin: 8px 0;
          }
          .social-links {
            margin: 15px 0 0 0;
          }
          .social-link {
            color: #C8932E;
            text-decoration: none;
            margin: 0 10px;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1 class="header-logo">AOE</h1>
            <p class="header-subtitle">Art of Entrepreneurship Africa</p>
          </div>

          <div class="content">
            <h2 class="greeting">Welcome to AOE, ${memberName}! 🎉</h2>
            
            <p class="intro-text">
              We're thrilled to have you join our vibrant community of entrepreneurs, innovators, and changemakers across Africa. AOE is dedicated to empowering the next generation of entrepreneurial talent through events, knowledge sharing, and meaningful connections.
            </p>

            <div class="features">
              <div class="feature">
                <div class="feature-icon">📅</div>
                <div class="feature-content">
                  <div class="feature-title">Exclusive Events</div>
                  <div class="feature-description">Attend world-class entrepreneurship events, workshops, and networking sessions tailored for your growth.</div>
                </div>
              </div>

              <div class="feature">
                <div class="feature-icon">👥</div>
                <div class="feature-content">
                  <div class="feature-title">Network & Collaborate</div>
                  <div class="feature-description">Connect with like-minded entrepreneurs, mentors, and investors in our thriving community.</div>
                </div>
              </div>

              <div class="feature">
                <div class="feature-icon">🤖</div>
                <div class="feature-content">
                  <div class="feature-title">AI Hub</div>
                  <div class="feature-description">Access AI-powered tools and resources to accelerate your entrepreneurial journey.</div>
                </div>
              </div>

              <div class="feature">
                <div class="feature-icon">💡</div>
                <div class="feature-content">
                  <div class="feature-title">Community Forum</div>
                  <div class="feature-description">Share ideas, ask questions, and learn from the collective wisdom of our community.</div>
                </div>
              </div>
            </div>

            <div class="next-steps">
              <h3>Here's how to get started:</h3>
              <ol>
                <li>Complete your profile with your background and entrepreneurial interests</li>
                <li>Explore upcoming events and register for ones that interest you</li>
                <li>Join our community forum and introduce yourself</li>
                <li>Connect with other members and start building relationships</li>
              </ol>
            </div>

            <div class="cta-section">
              <a href="https://app.aoeafrica.org.za" class="cta-button">Explore the Platform</a>
            </div>

            <div class="divider"></div>

            <p style="font-size: 14px; color: #4b5563; margin: 20px 0;">
              If you have any questions or need support as you get started, our team is here to help. Don't hesitate to reach out to us at <strong>hello@aoeafrica.org.za</strong>.
            </p>

            <p style="font-size: 14px; color: #4b5563; margin: 20px 0;">
              We're excited to see the impact you'll make as part of the AOE community. Welcome aboard!
            </p>

            <p style="font-size: 14px; color: #4b5563; margin: 20px 0; font-weight: 500;">
              The AOE Team
            </p>
          </div>

          <div class="footer">
            <div class="footer-text">© 2024 AOE Africa. All rights reserved.</div>
            <div class="social-links">
              <a href="#" class="social-link">Twitter</a>
              <a href="#" class="social-link">LinkedIn</a>
              <a href="#" class="social-link">Instagram</a>
            </div>
            <div class="footer-text" style="margin-top: 15px;">
              Art of Entrepreneurship Africa<br>
              Empowering entrepreneurs across the continent
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return { subject, html };
}