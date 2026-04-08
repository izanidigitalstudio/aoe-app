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
        speakerEmail: "speakers@africatechfestival.com",
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
          "Africa's largest AI trade show & conference connecting enterprise buyers with global & local AI suppliers.",
        website: "https://www.aiexpoafrica.com",
        contactEmail: "info@aiexpoafrica.com",
        speakerEmail: "speakers@aiexpoafrica.com",
        attendees: "3,500+",
        icon: "cpu",
      },
      {
        name: "Mining Indaba 2026",
        focus: "Investment",
        date: "Feb 2-5, 2026",
        location: "Cape Town",
        country: "South Africa",
        description:
          "Africa's largest mining conference with 10,500+ delegates, 1,450+ mining execs.",
        website: "https://miningindaba.com",
        contactEmail: "info@miningindaba.com",
        speakerEmail: "speakers@miningindaba.com",
        attendees: "10,500+",
        icon: "target",
      },
      {
        name: "Inclusive FinTech Forum 2026",
        focus: "Technology",
        date: "Mar 10-12, 2026",
        location: "Kigali Convention Centre",
        country: "Rwanda",
        description:
          "3,000+ global leaders advancing inclusive finance. Focus on AI-powered inclusion.",
        website: "https://iff.kigaliinternationalfinancialcentre.com",
        contactEmail: "info@kigalifinancialcentre.com",
        speakerEmail: "speakers@kigalifinancialcentre.com",
        attendees: "3,000+",
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
