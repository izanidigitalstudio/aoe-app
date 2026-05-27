import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedConferences = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    // Check if admin
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", userId.email || ""))
      .first();

    if (!user?.isAdmin) throw new Error("Not authorized - admin only");

    // Sample conferences to seed (you can expand this list)
    const conferences = [
      {
        name: "Africa Tech Festival 2026",
        focus: "Technology",
        date: "Nov 17-19, 2026",
        location: "Cape Town, CTICC",
        country: "South Africa",
        description:
          "Uniting tech leaders, entrepreneurs, and policymakers to drive African innovation across AI, fintech, cloud, connectivity and startups.",
        website: "https://africatechfestival.com",
        contactEmail: "info@africatechfestival.com",
        speakerEmail: "kadi.diallo@informa.com",
        speakerContact: "Kadi Diallo – Speaking Opportunities",
        attendees: "15,000+",
        icon: "globe",
      },
      {
        name: "AI Expo Africa 2026",
        focus: "AI",
        date: "Oct 28-29, 2026",
        location: "Sandton Convention Centre, Johannesburg",
        country: "South Africa",
        description:
          "Africa's largest AI trade show & conference connecting enterprise buyers with global & local AI suppliers. 9th edition.",
        website: "https://www.aiexpoafrica.com",
        contactEmail: "enquiries@saaiassociation.co.za",
        speakerEmail: "enquiries@aiexpoafrica.com",
        speakerContact: "Dr. Nick Bradshaw – Founder, AI Expo Africa & Chair, SA AI Association",
        attendees: "3,500+",
        icon: "cpu",
      },
      {
        name: "Mining Indaba 2026",
        focus: "Investment",
        date: "Feb 9-12, 2026",
        location: "CTICC, Cape Town",
        country: "South Africa",
        description:
          "Africa's largest mining conference with 11,000+ delegates. Connecting people, capital and ideas across Africa's mining industry.",
        website: "https://miningindaba.com",
        contactEmail: "info@miningindaba.com",
        speakerEmail: "marketing@miningindaba.com",
        speakerContact: "Laura (Cornish) Nicholson – Product Director, Content Team Lead",
        attendees: "11,000+",
        icon: "target",
      },
      {
        name: "Inclusive FinTech Forum 2026",
        focus: "Technology",
        date: "Mar 10-12, 2026",
        location: "Kigali Convention Centre",
        country: "Rwanda",
        description:
          "3,500+ global leaders advancing inclusive finance. Hosted by KIFC, National Bank of Rwanda & GFTN. 260+ speakers across 8 thematic platforms.",
        website: "https://www.inclusivefintechforum.com",
        contactEmail: "info@rfl.rw",
        speakerEmail: "info@rfl.rw",
        speakerContact: "Hortense Mudenge – CEO, Kigali International Financial Centre (KIFC). Speaker proposals via form: inclusivefintechforum.com/apply-to-speak",
        attendees: "3,500+",
        icon: "users",
      },
    ];

    let count = 0;
    for (const conf of conferences) {
      try {
        await ctx.db.insert("conferences", conf);
        count++;
      } catch (e) {
        console.error(`Failed to seed ${conf.name}:`, e);
      }
    }

    return `Seeded ${count} conferences`;
  },
});