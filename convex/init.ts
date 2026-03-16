import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedData = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Only seed if no events exist
    const existingEvents = await ctx.db.query("events").take(1);
    if (existingEvents.length > 0) return null;

    const events = [
      {
        title: "The Future is Here - Botswana (Powered by Starlink)",
        description:
          "The Future is Here Dinner Tour kicks off in Botswana at Hotel 430, Gaborone. An exclusive invitation-only event limited to 30 top entrepreneurs and innovators. Attendees must complete registration on this platform and pay 950 Pula to confirm attendance. Powered by Starlink, this is the flagship event launching the AI entrepreneurship movement across Africa.",
        city: "Gaborone",
        country: "Botswana",
        venue: "Hotel 430, Gaborone",
        date: 1775923200000, // April 10, 2026 18:00 SAST
        capacity: 30,
        imageUrl:
          "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop",
        status: "upcoming",
        ticketPrice: 950,
        currency: "BWP",
      },
      {
        title: "The Future is Here - Lagos",
        description:
          "Join Africa's boldest entrepreneurs for an exclusive dinner experience. Discover how AI is transforming businesses across the continent and forge partnerships that will shape the future.",
        city: "Lagos",
        country: "Nigeria",
        venue: "Eko Convention Centre, Victoria Island",
        date: Date.now() + 30 * 24 * 60 * 60 * 1000,
        capacity: 120,
        status: "upcoming",
      },
      {
        title: "The Future is Here - Nairobi",
        description:
          "East Africa's premier gathering of AI-powered entrepreneurs. Network with innovators, learn from industry leaders, and join the movement that's rebuilding Africa's economy.",
        city: "Nairobi",
        country: "Kenya",
        venue: "Kempinski Hotel, Nairobi",
        date: Date.now() + 45 * 24 * 60 * 60 * 1000,
        capacity: 100,
        status: "upcoming",
      },
      {
        title: "The Future is Here - Cape Town",
        description:
          "The Southern African edition of our continent-wide dinner tour. Connect with visionary founders and explore AI integration strategies for your business.",
        city: "Cape Town",
        country: "South Africa",
        venue: "The Westin Cape Town",
        date: Date.now() + 60 * 24 * 60 * 60 * 1000,
        capacity: 100,
        status: "upcoming",
      },
      {
        title: "The Future is Here - Accra",
        description:
          "Ghana welcomes the AI entrepreneurship revolution. An intimate dinner bringing together West Africa's most promising founders and AI innovators.",
        city: "Accra",
        country: "Ghana",
        venue: "Kempinski Hotel Gold Coast City",
        date: Date.now() + 75 * 24 * 60 * 60 * 1000,
        capacity: 80,
        status: "upcoming",
      },
      {
        title: "The Future is Here - Kigali",
        description:
          "Rwanda's innovation hub hosts Africa's brightest minds. Experience the convergence of technology and entrepreneurship at this landmark dinner event.",
        city: "Kigali",
        country: "Rwanda",
        venue: "Kigali Convention Centre",
        date: Date.now() + 90 * 24 * 60 * 60 * 1000,
        capacity: 80,
        status: "upcoming",
      },
    ];

    for (const event of events) {
      await ctx.db.insert("events", event);
    }

    // Seed AI Resources
    const existingResources = await ctx.db.query("aiResources").take(1);
    if (existingResources.length > 0) return null;

    const resources = [
      {
        title: "How African SMEs Are Using AI to Scale 10x Faster",
        summary:
          "Discover practical strategies that African small businesses are implementing today to leverage AI for rapid growth.",
        content:
          "From automated customer service to AI-driven supply chain optimization, African SMEs are finding innovative ways to integrate artificial intelligence into their operations. This guide covers real case studies from Lagos to Nairobi, showing how businesses with limited budgets are achieving remarkable results.\n\nKey strategies include:\n\n1. Chatbot-powered customer service reducing response times by 80%\n2. AI demand forecasting for inventory management\n3. Automated social media marketing with generative AI\n4. Machine learning for credit scoring in underserved markets\n5. Computer vision for quality control in manufacturing",
        category: "case-study",
        tags: ["AI", "SME", "Growth", "Africa"],
        featured: true,
      },
      {
        title: "Getting Started with AI: A Guide for African Entrepreneurs",
        summary:
          "Your comprehensive roadmap to understanding and implementing AI in your business, no technical background required.",
        content:
          "This beginner-friendly guide walks you through the fundamentals of AI, identifies key opportunities in African markets, and provides step-by-step instructions for integrating AI tools into your daily business operations.\n\nTopics covered:\n\n- What is AI and how does it work?\n- Identifying AI opportunities in your business\n- Low-code AI tools you can use today\n- Building an AI strategy for your company\n- Measuring ROI on AI investments\n- Common pitfalls and how to avoid them",
        category: "guide",
        tags: ["Beginner", "AI", "Business"],
        featured: true,
      },
      {
        title: "Top 10 AI Tools Every African Founder Should Know",
        summary:
          "A curated list of accessible AI tools that can transform your productivity, marketing, and operations starting today.",
        content:
          "From ChatGPT to Jasper AI, from Midjourney to Notion AI — these tools are being used by successful African founders to multiply their output. Learn which tools fit your specific business needs and how to get the most out of each one.\n\n1. ChatGPT - General-purpose AI assistant\n2. Jasper AI - Content marketing\n3. Midjourney - Visual content creation\n4. Notion AI - Workspace and documentation\n5. GitHub Copilot - Software development\n6. Otter.ai - Meeting transcription\n7. Grammarly - Writing enhancement\n8. Canva AI - Design\n9. Runway - Video editing\n10. Zapier AI - Workflow automation",
        category: "tool",
        tags: ["Tools", "Productivity", "AI"],
        featured: true,
      },
      {
        title: "AI in African Agriculture: The Next Green Revolution",
        summary:
          "How AI-powered precision farming is transforming food production across the continent.",
        content:
          "African agriculture is experiencing a technological transformation. From drone-based crop monitoring to AI-powered weather prediction, learn how innovative startups are using technology to boost yields and reduce waste across the continent.\n\nNotable innovations:\n- PlantVillage: AI-powered crop disease detection via smartphone\n- Zenvus: Smart farming sensors for soil intelligence\n- Aerobotics: Drone analytics for crop monitoring\n- Apollo Agriculture: AI-driven micro-lending for farmers",
        category: "news",
        tags: ["Agriculture", "AI", "Innovation"],
        featured: false,
      },
      {
        title: "Building AI Products for African Markets",
        summary:
          "Key considerations for designing and launching AI products that solve uniquely African challenges.",
        content:
          "Successful AI products in Africa need to account for unique infrastructure constraints, linguistic diversity, and market dynamics. This tutorial covers essential principles for building AI solutions that resonate with African users and scale across borders.\n\nKey principles:\n1. Design for low-bandwidth environments\n2. Support multiple local languages\n3. Build offline-first capabilities\n4. Use transfer learning for limited datasets\n5. Partner with local domain experts\n6. Price for African purchasing power",
        category: "tutorial",
        tags: ["Product", "AI", "Development"],
        featured: false,
      },
    ];

    for (const resource of resources) {
      await ctx.db.insert("aiResources", resource);
    }

    return null;
  },
});

export const seedBotswanaEvent = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Find and update existing Botswana event, or create if missing
    const events = await ctx.db.query("events").collect();
    const existing = events.find((e: any) => e.title.includes("Botswana"));
    if (existing) {
      await ctx.db.patch(existing._id, { date: 1775836800000 });
      return null;
    }
    
    await ctx.db.insert("events", {
      title: "The Future is Here - Botswana (Powered by Starlink)",
      description: "The Future is Here Dinner Tour kicks off in Botswana at Hotel 430, Gaborone. An exclusive invitation-only event limited to 30 top entrepreneurs and innovators. Attendees must complete registration on this platform and pay 950 Pula to confirm attendance. Powered by Starlink, this is the flagship event launching the AI entrepreneurship movement across Africa.",
      city: "Gaborone",
      country: "Botswana",
      venue: "Hotel 430, Gaborone",
      date: 1775836800000, // April 10, 2026 18:00 SAST
      capacity: 30,
      imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop",
      status: "upcoming",
      ticketPrice: 950,
      currency: "BWP",
    });
    return null;
  },
});