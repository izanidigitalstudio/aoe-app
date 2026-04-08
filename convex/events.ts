import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listEvents = query({
  args: {
    status: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("events"),
      title: v.string(),
      description: v.string(),
      city: v.string(),
      country: v.string(),
      venue: v.string(),
      date: v.number(),
      imageUrl: v.optional(v.string()),
      capacity: v.number(),
      status: v.string(),
      rsvpCount: v.number(),
      ticketPrice: v.optional(v.number()),
      currency: v.optional(v.string()),
      sortOrder: v.optional(v.number()),
      category: v.optional(v.string()),
      sponsors: v.optional(v.array(v.object({
        name: v.string(),
        tier: v.string(),
        logo: v.optional(v.string()),
        website: v.optional(v.string()),
      }))),
      guestSpeakers: v.optional(v.array(v.object({
        name: v.string(),
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        designation: v.optional(v.string()),
        company: v.optional(v.string()),
        status: v.string(),
        notes: v.optional(v.string()),
      }))),
      invitedGuests: v.optional(v.array(v.object({
        name: v.string(),
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        designation: v.optional(v.string()),
        company: v.optional(v.string()),
        status: v.string(),
        notes: v.optional(v.string()),
      }))),
    })
  ),
  handler: async (ctx, args) => {
    let q = ctx.db.query("events");
    if (args.category) {
      q = q.withIndex("by_category", (qb) => qb.eq("category", args.category));
    } else if (args.status) {
      q = q.withIndex("by_status", (qb) => qb.eq("status", args.status));
    }
    const events = await q.collect();
    // Sort by sortOrder if present, otherwise by date
    const sorted = events.sort((a, b) => {
      const aOrder = a.sortOrder ?? a.date;
      const bOrder = b.sortOrder ?? b.date;
      return aOrder - bOrder;
    });
    return sorted.map((event) => (
      {
      _id: event._id,
      title: event.title,
      description: event.description,
      city: event.city,
      country: event.country,
      venue: event.venue,
      date: event.date,
      imageUrl: event.imageUrl,
      capacity: event.capacity,
      status: event.status,
      rsvpCount: event.rsvpCount || 0,
      ticketPrice: event.ticketPrice,
      currency: event.currency,
      sortOrder: event.sortOrder,
      category: event.category,
      sponsors: event.sponsors,
      guestSpeakers: event.guestSpeakers,
      invitedGuests: event.invitedGuests,
    }
    ));
  },
});

export const rsvpEvent = mutation({
  args: {
    eventId: v.id("events"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("eventRsvps")
      .withIndex("by_event_and_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", user._id)
      )
      .unique();

    if (existing) {
      if (existing.status === "attending") {
        await ctx.db.patch(existing._id, { status: "cancelled" });
      } else {
        await ctx.db.patch(existing._id, { status: "attending" });
      }
    } else {
      const event = await ctx.db.get(args.eventId);
      if (!event) throw new Error("Event not found");
      const rsvps = await ctx.db
        .query("eventRsvps")
        .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
        .collect();
      const attendingCount = rsvps.filter((r) => r.status === "attending").length;
      const status = attendingCount >= event.capacity ? "waitlist" : "attending";
      await ctx.db.insert("eventRsvps", {
        eventId: args.eventId,
        userId: user._id,
        status,
      });
    }
    return null;
  },
});

export const tagDinnerTourEvents = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const events = await ctx.db.query("events").collect();
    for (const event of events) {
      if (!event.category) {
        await ctx.db.patch(event._id, { category: "dinner_tour" });
      }
    }
    return null;
  },
});

export const seedMasterclassEvents = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const aiMasterclasses = [
      {
        title: "AI for Beginners: Getting Started with Machine Learning",
        description: "A hands-on introductory masterclass designed for entrepreneurs with zero AI experience. Learn the fundamentals of machine learning, understand key AI terminology, and discover how to identify AI opportunities in your business. Walk away with a practical roadmap for integrating AI into your operations.",
        date: new Date("2026-05-15T09:00:00+02:00").getTime(),
        capacity: 40,
        ticketPrice: 450,
        currency: "ZAR",
        sortOrder: 10,
        guestSpeakers: [{ name: "Dr. Thabo Mokoena", designation: "AI Research Lead", company: "Wits University", status: "confirmed" }],
        sponsors: [{ name: "Microsoft for Startups", tier: "title" }],
      },
      {
        title: "ChatGPT & AI Assistants: Automate Your Business",
        description: "Discover how to leverage ChatGPT, Claude, and other AI assistants to automate customer service, content creation, email marketing, and internal workflows. This masterclass includes live demos and templates you can implement immediately in your business.",
        date: new Date("2026-06-05T09:00:00+02:00").getTime(),
        capacity: 40,
        ticketPrice: 500,
        currency: "ZAR",
        sortOrder: 11,
        guestSpeakers: [{ name: "Naledi Khumalo", designation: "AI Automation Consultant", company: "AutomateAfrica", status: "confirmed" }],
        sponsors: [{ name: "OpenAI", tier: "title" }],
      },
      {
        title: "Building AI-Powered Products: From Idea to MVP",
        description: "Learn how to conceptualise, design, and build AI-powered products without a technical background. Covers no-code AI tools, API integrations, prompt engineering, and how to validate your AI product idea with real customers. Perfect for non-technical founders.",
        date: new Date("2026-07-10T09:00:00+02:00").getTime(),
        capacity: 35,
        ticketPrice: 600,
        currency: "ZAR",
        sortOrder: 12,
        guestSpeakers: [{ name: "Sipho Dlamini", designation: "CTO & Co-Founder", company: "TechBridge Africa", status: "confirmed" }],
        sponsors: [{ name: "AWS Activate", tier: "title" }],
      },
      {
        title: "AI-Driven Marketing: Grow Your Business 10x Faster",
        description: "Master the art of AI-powered marketing. Learn to use AI for audience segmentation, personalised campaigns, social media automation, SEO optimisation, and predictive analytics. Includes hands-on exercises with real marketing tools used by top agencies.",
        date: new Date("2026-08-14T09:00:00+02:00").getTime(),
        capacity: 40,
        ticketPrice: 500,
        currency: "ZAR",
        sortOrder: 13,
        guestSpeakers: [{ name: "Lerato Moloi", designation: "Head of Digital", company: "Ogilvy Africa", status: "confirmed" }],
        sponsors: [{ name: "Google for Startups", tier: "title" }],
      },
      {
        title: "AI Ethics & Responsible Innovation for Entrepreneurs",
        description: "Navigate the complex landscape of AI ethics, data privacy, and responsible innovation. Understand POPIA compliance, bias in AI systems, and how to build trustworthy AI products. Essential knowledge for any entrepreneur deploying AI in Africa.",
        date: new Date("2026-09-18T09:00:00+02:00").getTime(),
        capacity: 35,
        ticketPrice: 400,
        currency: "ZAR",
        sortOrder: 14,
        guestSpeakers: [{ name: "Prof. Ameera Patel", designation: "Director of AI Ethics", company: "University of Pretoria", status: "confirmed" }],
        sponsors: [{ name: "IBM", tier: "title" }],
      },
    ];

    const financeTax = [
      {
        title: "Finance Basics for Entrepreneurs: Master Your Numbers",
        description: "A comprehensive masterclass covering financial literacy essentials every entrepreneur needs. Learn to read financial statements, understand cash flow management, create budgets, and make data-driven financial decisions. No accounting background required.",
        date: new Date("2026-05-22T09:00:00+02:00").getTime(),
        capacity: 40,
        ticketPrice: 450,
        currency: "ZAR",
        sortOrder: 20,
        guestSpeakers: [{ name: "Kabelo Ntsoane", designation: "CFO & Financial Advisor", company: "Prosperity Partners", status: "confirmed" }],
        sponsors: [{ name: "FNB Business", tier: "title" }],
      },
      {
        title: "Tax Strategy for Small Businesses & Startups",
        description: "Demystify South African tax law for SMEs. Covers income tax, VAT registration, provisional tax, tax deductions for startups, and SARS compliance. Learn legal strategies to minimise your tax burden and avoid common pitfalls that cost entrepreneurs thousands.",
        date: new Date("2026-06-19T09:00:00+02:00").getTime(),
        capacity: 40,
        ticketPrice: 500,
        currency: "ZAR",
        sortOrder: 21,
        guestSpeakers: [{ name: "Mpho Ratlhagane", designation: "Tax Partner", company: "KPMG South Africa", status: "confirmed" }],
        sponsors: [{ name: "Sage", tier: "title" }],
      },
      {
        title: "Raising Capital: Funding Options for African Startups",
        description: "Explore every funding avenue available to African entrepreneurs — from angel investors and venture capital to government grants, crowdfunding, and revenue-based financing. Learn how to pitch, what investors look for, and how to structure deals that protect your equity.",
        date: new Date("2026-07-24T09:00:00+02:00").getTime(),
        capacity: 35,
        ticketPrice: 600,
        currency: "ZAR",
        sortOrder: 22,
        guestSpeakers: [{ name: "Zanele Mthembu", designation: "Managing Partner", company: "Knife Capital", status: "confirmed" }],
        sponsors: [{ name: "Nedbank Business", tier: "title" }],
      },
      {
        title: "Financial Modelling & Forecasting for Growth",
        description: "Build robust financial models that impress investors and guide your business decisions. Learn Excel/Google Sheets techniques for revenue forecasting, scenario planning, unit economics, and break-even analysis. Hands-on with real templates you keep.",
        date: new Date("2026-08-28T09:00:00+02:00").getTime(),
        capacity: 35,
        ticketPrice: 550,
        currency: "ZAR",
        sortOrder: 23,
        guestSpeakers: [{ name: "David Sobel", designation: "Financial Modelling Expert", company: "Deloitte Africa", status: "confirmed" }],
        sponsors: [{ name: "Standard Bank", tier: "title" }],
      },
      {
        title: "ESD Compliance & B-BBEE: Unlocking Corporate Contracts",
        description: "Understand Enterprise & Supplier Development programmes and how to position your business to win corporate contracts. Covers B-BBEE scorecard optimisation, ESD programme applications, procurement processes, and building relationships with corporate buyers.",
        date: new Date("2026-09-25T09:00:00+02:00").getTime(),
        capacity: 40,
        ticketPrice: 500,
        currency: "ZAR",
        sortOrder: 24,
        guestSpeakers: [{ name: "Nomsa Kekana", designation: "ESD Programme Director", company: "Sasol Foundation", status: "confirmed" }],
        sponsors: [{ name: "Absa Business", tier: "title" }],
      },
    ];

    for (const mc of aiMasterclasses) {
      await ctx.db.insert("events", {
        title: mc.title,
        description: mc.description,
        city: "Sandton",
        country: "South Africa",
        venue: "Core Office Park, Sandton",
        date: mc.date,
        capacity: mc.capacity,
        status: "upcoming",
        rsvpCount: 0,
        ticketPrice: mc.ticketPrice,
        currency: mc.currency,
        sortOrder: mc.sortOrder,
        category: "ai_masterclass",
        sponsors: mc.sponsors,
        guestSpeakers: mc.guestSpeakers,
      });
    }

    for (const ft of financeTax) {
      await ctx.db.insert("events", {
        title: ft.title,
        description: ft.description,
        city: "Sandton",
        country: "South Africa",
        venue: "Core Office Park, Sandton",
        date: ft.date,
        capacity: ft.capacity,
        status: "upcoming",
        rsvpCount: 0,
        ticketPrice: ft.ticketPrice,
        currency: ft.currency,
        sortOrder: ft.sortOrder,
        category: "finance_tax",
        sponsors: ft.sponsors,
        guestSpeakers: ft.guestSpeakers,
      });
    }

    return null;
  },
});

export const seedMoreMasterclasses = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const moreAI = [
      {
        title: "Computer Vision for Business: Automating Visual Inspections",
        description: "Learn how computer vision is transforming industries from retail to manufacturing. Understand image recognition, object detection, and quality control automation. Hands-on demos with no-code CV tools you can deploy in your business within days.",
        date: new Date("2026-10-02T09:00:00+02:00").getTime(),
        capacity: 35, ticketPrice: 550, currency: "ZAR", sortOrder: 15,
        guestSpeakers: [{ name: "Dr. Fatima Osman", designation: "Computer Vision Lead", company: "Aerobotics", status: "confirmed" }],
        sponsors: [{ name: "NVIDIA Inception", tier: "title" }],
      },
      {
        title: "Natural Language Processing: Build Smart Chatbots",
        description: "Dive deep into NLP and learn to build intelligent chatbots that understand context, sentiment, and intent. Covers WhatsApp Business API integration, multilingual support for African languages, and deploying chatbots that actually convert leads.",
        date: new Date("2026-10-16T09:00:00+02:00").getTime(),
        capacity: 40, ticketPrice: 500, currency: "ZAR", sortOrder: 16,
        guestSpeakers: [{ name: "Tshego Motaung", designation: "NLP Engineer", company: "Lelapa AI", status: "confirmed" }],
        sponsors: [{ name: "Meta for Developers", tier: "title" }],
      },
      {
        title: "AI for E-Commerce: Personalisation & Recommendation Engines",
        description: "Transform your online store with AI-powered personalisation. Learn to implement product recommendation engines, dynamic pricing, customer segmentation, and predictive inventory management. Real case studies from African e-commerce leaders.",
        date: new Date("2026-10-30T09:00:00+02:00").getTime(),
        capacity: 40, ticketPrice: 500, currency: "ZAR", sortOrder: 17,
        guestSpeakers: [{ name: "Amara Okafor", designation: "Head of Data Science", company: "Takealot", status: "confirmed" }],
        sponsors: [{ name: "Shopify Partners", tier: "title" }],
      },
      {
        title: "Data Science Fundamentals for Business Leaders",
        description: "A non-technical masterclass on data science concepts every CEO needs to know. Learn to ask the right questions, interpret data dashboards, understand A/B testing, and build a data-driven culture in your organisation without writing a single line of code.",
        date: new Date("2026-11-13T09:00:00+02:00").getTime(),
        capacity: 45, ticketPrice: 450, currency: "ZAR", sortOrder: 18,
        guestSpeakers: [{ name: "Dr. Bongani Ndlovu", designation: "Chief Data Officer", company: "Discovery Limited", status: "confirmed" }],
        sponsors: [{ name: "Databricks", tier: "title" }],
      },
      {
        title: "AI in Healthcare: Opportunities for African Entrepreneurs",
        description: "Explore the booming healthtech sector and how AI is revolutionising diagnostics, telemedicine, drug discovery, and patient care across Africa. Identify market gaps, understand regulatory requirements, and learn from founders who've built successful healthtech startups.",
        date: new Date("2026-11-27T09:00:00+02:00").getTime(),
        capacity: 35, ticketPrice: 550, currency: "ZAR", sortOrder: 19,
        guestSpeakers: [{ name: "Dr. Lindiwe Mkhize", designation: "CEO & Founder", company: "Quro Medical", status: "confirmed" }],
        sponsors: [{ name: "Johnson & Johnson Innovation", tier: "title" }],
      },
      {
        title: "Voice AI & Conversational Interfaces for Business",
        description: "Master voice technology for business applications. Build Alexa skills, Google Assistant actions, and IVR systems. Learn how voice AI is solving the digital divide in Africa by serving customers who prefer speaking over typing.",
        date: new Date("2026-12-04T09:00:00+02:00").getTime(),
        capacity: 35, ticketPrice: 500, currency: "ZAR", sortOrder: 30,
        guestSpeakers: [{ name: "Katlego Maphai", designation: "VP of Product", company: "Yoco", status: "confirmed" }],
        sponsors: [{ name: "Amazon Alexa Fund", tier: "title" }],
      },
      {
        title: "AI-Powered Sales: Predictive Lead Scoring & CRM Automation",
        description: "Supercharge your sales pipeline with AI. Learn predictive lead scoring, automated follow-ups, deal probability forecasting, and CRM automation. Includes hands-on setup with HubSpot and Salesforce AI features tailored for SME budgets.",
        date: new Date("2027-01-15T09:00:00+02:00").getTime(),
        capacity: 40, ticketPrice: 500, currency: "ZAR", sortOrder: 31,
        guestSpeakers: [{ name: "Themba Maseko", designation: "Sales AI Consultant", company: "Salesforce Africa", status: "confirmed" }],
        sponsors: [{ name: "HubSpot for Startups", tier: "title" }],
      },
      {
        title: "Deep Learning Demystified: Neural Networks for Non-Engineers",
        description: "Understand the technology behind self-driving cars, facial recognition, and language translation — without the maths. This visual, intuitive masterclass explains neural networks, training data, and model deployment in plain English with interactive demos.",
        date: new Date("2027-01-29T09:00:00+02:00").getTime(),
        capacity: 35, ticketPrice: 550, currency: "ZAR", sortOrder: 32,
        guestSpeakers: [{ name: "Dr. Asha Moyo", designation: "Deep Learning Researcher", company: "Stellenbosch University", status: "confirmed" }],
        sponsors: [{ name: "Intel AI", tier: "title" }],
      },
      {
        title: "AI for Supply Chain & Logistics Optimisation",
        description: "Discover how AI is transforming supply chains across Africa. Learn demand forecasting, route optimisation, warehouse automation, and supplier risk assessment. Case studies from logistics companies that cut costs by 30% using AI-driven decisions.",
        date: new Date("2027-02-12T09:00:00+02:00").getTime(),
        capacity: 40, ticketPrice: 500, currency: "ZAR", sortOrder: 33,
        guestSpeakers: [{ name: "James Sobiri", designation: "Head of Logistics Innovation", company: "Imperial Logistics", status: "confirmed" }],
        sponsors: [{ name: "SAP Africa", tier: "title" }],
      },
      {
        title: "Generative AI: Creating Content, Code & Designs with AI",
        description: "Hands-on masterclass exploring the creative power of generative AI. Learn to use Midjourney, DALL-E, Runway, and Copilot to create marketing visuals, video content, website code, and business documents in minutes instead of days.",
        date: new Date("2027-02-26T09:00:00+02:00").getTime(),
        capacity: 45, ticketPrice: 500, currency: "ZAR", sortOrder: 34,
        guestSpeakers: [{ name: "Palesa Makgoba", designation: "Creative AI Director", company: "VMLY&R Africa", status: "confirmed" }],
        sponsors: [{ name: "Adobe Creative Cloud", tier: "title" }],
      },
    ];

    const moreFinance = [
      {
        title: "Bookkeeping Made Simple: Xero & QuickBooks for Startups",
        description: "Stop dreading your books. This practical masterclass walks you through setting up Xero or QuickBooks from scratch, recording transactions, reconciling bank feeds, generating financial reports, and preparing for tax season — all in one session.",
        date: new Date("2026-10-09T09:00:00+02:00").getTime(),
        capacity: 40, ticketPrice: 450, currency: "ZAR", sortOrder: 25,
        guestSpeakers: [{ name: "Refilwe Molefe", designation: "Cloud Accounting Specialist", company: "Xero South Africa", status: "confirmed" }],
        sponsors: [{ name: "Xero", tier: "title" }],
      },
      {
        title: "Understanding VAT: Registration, Returns & Compliance",
        description: "Everything you need to know about VAT as a South African entrepreneur. When to register, how to charge and claim VAT, filing returns with SARS eFiling, avoiding penalties, and managing VAT across multiple revenue streams. Includes live SARS portal walkthrough.",
        date: new Date("2026-10-23T09:00:00+02:00").getTime(),
        capacity: 40, ticketPrice: 450, currency: "ZAR", sortOrder: 26,
        guestSpeakers: [{ name: "Mandla Sithole", designation: "VAT Specialist", company: "PwC South Africa", status: "confirmed" }],
        sponsors: [{ name: "TaxTim", tier: "title" }],
      },
      {
        title: "Payroll Management & Employment Tax Essentials",
        description: "Navigate the complexities of hiring in South Africa. Covers UIF registration, PAYE calculations, SDL contributions, employment contracts, leave management, and payroll software setup. Essential for any entrepreneur planning to hire their first employee.",
        date: new Date("2026-11-06T09:00:00+02:00").getTime(),
        capacity: 35, ticketPrice: 500, currency: "ZAR", sortOrder: 27,
        guestSpeakers: [{ name: "Gugu Mthethwa", designation: "HR & Payroll Director", company: "PaySpace", status: "confirmed" }],
        sponsors: [{ name: "Payroll Hub SA", tier: "title" }],
      },
      {
        title: "Investment Strategies for Entrepreneurs: Growing Your Wealth",
        description: "Learn to invest wisely as an entrepreneur. Covers tax-free savings accounts, retirement annuities, unit trusts, property investment, and building a personal investment portfolio alongside your business. Balance risk between your business and personal wealth.",
        date: new Date("2026-11-20T09:00:00+02:00").getTime(),
        capacity: 40, ticketPrice: 500, currency: "ZAR", sortOrder: 28,
        guestSpeakers: [{ name: "Warren Sobel", designation: "Wealth Manager", company: "Allan Gray", status: "confirmed" }],
        sponsors: [{ name: "Allan Gray", tier: "title" }],
      },
      {
        title: "Cross-Border Trade Finance: Importing & Exporting Made Easy",
        description: "Master the financial side of international trade. Covers letters of credit, foreign exchange risk management, customs duties, trade agreements (AfCFTA), and financing options for import/export businesses. Real examples from entrepreneurs trading across SADC.",
        date: new Date("2026-12-11T09:00:00+02:00").getTime(),
        capacity: 35, ticketPrice: 600, currency: "ZAR", sortOrder: 29,
        guestSpeakers: [{ name: "Tshepo Mahlangu", designation: "Trade Finance Manager", company: "Investec", status: "confirmed" }],
        sponsors: [{ name: "Investec Business", tier: "title" }],
      },
      {
        title: "Cryptocurrency & Digital Assets: Tax Implications in SA",
        description: "Understand SARS's stance on cryptocurrency taxation. Learn how to declare crypto income, track cost base for capital gains, handle DeFi and NFT transactions, and stay compliant. Includes guidance on crypto as a business payment method and treasury asset.",
        date: new Date("2027-01-08T09:00:00+02:00").getTime(),
        capacity: 40, ticketPrice: 500, currency: "ZAR", sortOrder: 35,
        guestSpeakers: [{ name: "Farzam Ehsani", designation: "CEO & Crypto Tax Expert", company: "VALR", status: "confirmed" }],
        sponsors: [{ name: "Luno", tier: "title" }],
      },
      {
        title: "Business Insurance & Risk Management Essentials",
        description: "Protect your business from the unexpected. Covers professional indemnity, public liability, business interruption insurance, key-person cover, and cyber insurance. Learn to assess risk, choose the right policies, and avoid being underinsured.",
        date: new Date("2027-01-22T09:00:00+02:00").getTime(),
        capacity: 40, ticketPrice: 450, currency: "ZAR", sortOrder: 36,
        guestSpeakers: [{ name: "Nandi Khumalo", designation: "Commercial Insurance Manager", company: "Hollard Business", status: "confirmed" }],
        sponsors: [{ name: "Hollard Insurance", tier: "title" }],
      },
      {
        title: "Government Grants & Incentives for Small Businesses",
        description: "Navigate the maze of government funding programmes. Covers SEDA, SEFA, NEF, IDC, DTI incentives, the Youth Employment Tax Incentive, and Section 12J investments. Learn application strategies, eligibility criteria, and how to maximise your chances of approval.",
        date: new Date("2027-02-05T09:00:00+02:00").getTime(),
        capacity: 45, ticketPrice: 400, currency: "ZAR", sortOrder: 37,
        guestSpeakers: [{ name: "Thandi Mgwaba", designation: "SMME Development Specialist", company: "SEDA", status: "confirmed" }],
        sponsors: [{ name: "SEFA", tier: "title" }],
      },
      {
        title: "Debt Management & Business Recovery Strategies",
        description: "Struggling with cash flow? This masterclass covers debt restructuring, negotiating with creditors, business rescue proceedings, turnaround strategies, and rebuilding credit. Learn from entrepreneurs who've recovered from financial distress and emerged stronger.",
        date: new Date("2027-02-19T09:00:00+02:00").getTime(),
        capacity: 35, ticketPrice: 450, currency: "ZAR", sortOrder: 38,
        guestSpeakers: [{ name: "Pieter van Rensburg", designation: "Business Rescue Practitioner", company: "Werksmans Attorneys", status: "confirmed" }],
        sponsors: [{ name: "Capitec Business", tier: "title" }],
      },
      {
        title: "Exit Strategies: Selling Your Business & Wealth Preservation",
        description: "Plan your endgame. Covers business valuations, finding buyers, structuring deals, earn-outs, management buyouts, and the tax implications of selling your business. Whether you're planning to exit in 2 years or 10, this masterclass helps you maximise your payout.",
        date: new Date("2027-03-05T09:00:00+02:00").getTime(),
        capacity: 40, ticketPrice: 600, currency: "ZAR", sortOrder: 39,
        guestSpeakers: [{ name: "Andile Maseko", designation: "M&A Partner", company: "Webber Wentzel", status: "confirmed" }],
        sponsors: [{ name: "RMB", tier: "title" }],
      },
    ];

    for (const mc of moreAI) {
      await ctx.db.insert("events", {
        title: mc.title,
        description: mc.description,
        city: "Sandton",
        country: "South Africa",
        venue: "Core Office Park, Sandton",
        date: mc.date,
        capacity: mc.capacity,
        status: "upcoming",
        rsvpCount: 0,
        ticketPrice: mc.ticketPrice,
        currency: mc.currency,
        sortOrder: mc.sortOrder,
        category: "ai_masterclass",
        sponsors: mc.sponsors,
        guestSpeakers: mc.guestSpeakers,
      });
    }

    for (const ft of moreFinance) {
      await ctx.db.insert("events", {
        title: ft.title,
        description: ft.description,
        city: "Sandton",
        country: "South Africa",
        venue: "Core Office Park, Sandton",
        date: ft.date,
        capacity: ft.capacity,
        status: "upcoming",
        rsvpCount: 0,
        ticketPrice: ft.ticketPrice,
        currency: ft.currency,
        sortOrder: ft.sortOrder,
        category: "finance_tax",
        sponsors: ft.sponsors,
        guestSpeakers: ft.guestSpeakers,
      });
    }

    return null;
  },
});