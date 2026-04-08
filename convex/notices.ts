import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const noticeReturnValidator = v.object({
  _id: v.id("notices"),
  _creationTime: v.number(),
  authorId: v.id("users"),
  authorName: v.optional(v.string()),
  authorImage: v.optional(v.string()),
  authorCompany: v.optional(v.string()),
  authorRole: v.optional(v.string()),
  title: v.optional(v.string()),
  description: v.string(),
  category: v.string(),
  date: v.optional(v.number()),
  location: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
  interestCount: v.number(),
  commentCount: v.number(),
  isInterested: v.boolean(),
});

export const listNotices = query({
  args: {
    category: v.optional(v.string()),
  },
  returns: v.array(noticeReturnValidator),
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    let noticesQuery;
    if (args.category) {
      noticesQuery = ctx.db
        .query("notices")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .order("desc");
    } else {
      noticesQuery = ctx.db.query("notices").order("desc");
    }

    const notices = await noticesQuery.take(50);
    const results = [];

    for (const notice of notices) {
      const author = await ctx.db.get(notice.authorId);

      let isInterested = false;
      if (currentUserId) {
        const interest = await ctx.db
          .query("noticeInterests")
          .withIndex("by_notice_and_user", (q) =>
            q.eq("noticeId", notice._id).eq("userId", currentUserId)
          )
          .unique();
        isInterested = !!interest;
      }

      results.push({
        _id: notice._id,
        _creationTime: notice._creationTime,
        authorId: notice.authorId,
        authorName: author?.name,
        authorImage: author?.image,
        authorCompany: author?.company,
        authorRole: author?.role,
        title: notice.title,
        description: notice.description,
        category: notice.category,
        date: notice.date,
        location: notice.location,
        tags: notice.tags,
        interestCount: notice.interestCount ?? 0,
        commentCount: notice.commentCount ?? 0,
        isInterested,
      });
    }

    return results;
  },
});

export const getNotice = query({
  args: { noticeId: v.id("notices") },
  returns: v.union(noticeReturnValidator, v.null()),
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    const notice = await ctx.db.get(args.noticeId);
    if (!notice) return null;

    const author = await ctx.db.get(notice.authorId);

    let isInterested = false;
    if (currentUserId) {
      const interest = await ctx.db
        .query("noticeInterests")
        .withIndex("by_notice_and_user", (q) =>
          q.eq("noticeId", notice._id).eq("userId", currentUserId)
        )
        .unique();
      isInterested = !!interest;
    }

    return {
      _id: notice._id,
      _creationTime: notice._creationTime,
      authorId: notice.authorId,
      authorName: author?.name,
      authorImage: author?.image,
      authorCompany: author?.company,
      authorRole: author?.role,
      title: notice.title,
      description: notice.description,
      category: notice.category,
      date: notice.date,
      location: notice.location,
      tags: notice.tags,
      interestCount: notice.interestCount ?? 0,
      commentCount: notice.commentCount ?? 0,
      isInterested,
    };
  },
});

export const createNotice = mutation({
  args: {
    title: v.optional(v.string()),
    description: v.string(),
    category: v.string(),
    date: v.optional(v.number()),
    location: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  returns: v.id("notices"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    return await ctx.db.insert("notices", {
      authorId: user._id,
      title: args.title,
      description: args.description,
      category: args.category,
      date: args.date,
      location: args.location,
      tags: args.tags,
      interestCount: 0,
      commentCount: 0,
    });
  },
});

export const deleteNotice = mutation({
  args: { noticeId: v.id("notices") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const notice = await ctx.db.get(args.noticeId);
    if (!notice) throw new Error("Notice not found");
    if (notice.authorId !== user._id && !user.isAdmin) {
      throw new Error("Not authorized");
    }

    // Delete related comments
    const comments = await ctx.db
      .query("noticeComments")
      .withIndex("by_notice", (q) => q.eq("noticeId", args.noticeId))
      .collect();
    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    // Delete related interests
    const interests = await ctx.db
      .query("noticeInterests")
      .withIndex("by_notice", (q) => q.eq("noticeId", args.noticeId))
      .collect();
    for (const interest of interests) {
      await ctx.db.delete(interest._id);
    }

    await ctx.db.delete(args.noticeId);
    return null;
  },
});

export const toggleInterest = mutation({
  args: { noticeId: v.id("notices") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("noticeInterests")
      .withIndex("by_notice_and_user", (q) =>
        q.eq("noticeId", args.noticeId).eq("userId", user._id)
      )
      .unique();

    const notice = await ctx.db.get(args.noticeId);
    if (!notice) throw new Error("Notice not found");

    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.noticeId, {
        interestCount: Math.max(0, (notice.interestCount ?? 0) - 1),
      });
    } else {
      await ctx.db.insert("noticeInterests", {
        noticeId: args.noticeId,
        userId: user._id,
      });
      await ctx.db.patch(args.noticeId, {
        interestCount: (notice.interestCount ?? 0) + 1,
      });
    }
    return null;
  },
});

export const addComment = mutation({
  args: {
    noticeId: v.id("notices"),
    text: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const notice = await ctx.db.get(args.noticeId);
    if (!notice) throw new Error("Notice not found");

    await ctx.db.insert("noticeComments", {
      noticeId: args.noticeId,
      authorId: user._id,
      content: args.text,
    });

    await ctx.db.patch(args.noticeId, {
      commentCount: (notice.commentCount ?? 0) + 1,
    });
    return null;
  },
});

export const getComments = query({
  args: { noticeId: v.id("notices") },
  returns: v.array(
    v.object({
      _id: v.id("noticeComments"),
      _creationTime: v.number(),
      content: v.string(),
      authorId: v.id("users"),
      authorName: v.optional(v.string()),
      authorImage: v.optional(v.string()),
      authorCompany: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("noticeComments")
      .withIndex("by_notice", (q) => q.eq("noticeId", args.noticeId))
      .order("desc")
      .take(100);

    const results = [];
    for (const comment of comments) {
      const author = await ctx.db.get(comment.authorId);
      results.push({
        _id: comment._id,
        _creationTime: comment._creationTime,
        content: comment.content,
        authorId: comment.authorId,
        authorName: author?.name,
        authorImage: author?.image,
        authorCompany: author?.company,
      });
    }
    return results;
  },
});

export const getInterestedMembers = query({
  args: { noticeId: v.id("notices") },
  returns: v.array(
    v.object({
      _id: v.id("users"),
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      company: v.optional(v.string()),
      role: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    const interests = await ctx.db
      .query("noticeInterests")
      .withIndex("by_notice", (q) => q.eq("noticeId", args.noticeId))
      .take(50);

    const results = [];
    for (const interest of interests) {
      const user = await ctx.db.get(interest.userId);
      if (user) {
        results.push({
          _id: user._id,
          name: user.name,
          image: user.image,
          company: user.company,
          role: user.role,
        });
      }
    }
    return results;
  },
});

export const seedDemoNotices = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Check if demo data already exists
    const existing = await ctx.db.query("notices").take(1);
    if (existing.length > 0) return null;

    // Demo users from the database
    const amara = "kx732v20ez77jggptbxdw776n582fb00" as any; // Amara Okafor - CEO AgroTech
    const kwame = "kx77gjm719dp9v69xde7y38pc582exa8" as any; // Kwame Mensah - CTO FinStack
    const zara = "kx78j0pv56jfeztrgj9s5pmzx982ewa8" as any;  // Zara Ndlovu - Founder MediAI
    const tendai = "kx78ah8764mmq7v5aqqcvmw3w982e9ge" as any; // Tendai Moyo - MD SolarGrid
    const fatima = "kx7dn5r9m49q452gqqcnbzpazx82e6ms" as any; // Fatima Al-Rashidi - Co-Founder EduLeap
    const chibueze = "kx7b3t61hvwsfey1fxvmswyyk982e1en" as any; // Chibueze Eze - Founder LogiFlow
    const naledi = "kx7affc7kha269khk14h0pnywx82ftb8" as any; // Naledi Kgosi - CEO AfroBuild
    const aisha = "kx7fxxanqfyq2sarkc87az1bt582eapn" as any;  // Aisha Bello - Managing Partner AfriVentures
    const grace = "kx761qqmp5v5ht00s1fqer11rx82frsp" as any;  // Grace Wanjiku - COO TalentBridge
    const omar = "kx7d4kagcqjydfy0kmkka0jg7x82e32s" as any;   // Omar Hassan - CTO CyberShield
    const ibrahim = "kx7cf712714xmn33eq26z7r2bd82f7ya" as any; // Ibrahim Diallo - Founder LinguaAI
    const lindiwe = "kx7a4vv3kntyhd05wqtbzssh8h82ezsh" as any; // Lindiwe Dlamini - CEO FashionForge
    const samuel = "kx71mtexm1ggpfd6dfcd8eg4p582feet" as any;  // Samuel Osei - Head of Innovation AquaAI
    const jeanpierre = "kx70tkdrebt3b2ehmms9wgndd982ee9g" as any; // Jean-Pierre - CEO DroneServe

    const now = Date.now();

    // ── Notice 1: Event - Pan-African AI Summit ──
    const notice1 = await ctx.db.insert("notices", {
      authorId: aisha,
      title: "Pan-African AI & Innovation Summit 2025",
      description: "Excited to announce we're co-hosting the Pan-African AI & Innovation Summit in Nairobi this July! The summit will bring together 500+ founders, investors, and tech leaders from across the continent to explore how AI is transforming African industries.\n\nKey themes:\n• AI in Agriculture & Food Security\n• Fintech & Financial Inclusion\n• HealthTech & Telemedicine\n• Sustainable Energy Solutions\n\nEarly bird tickets are available now. DM me for a special AOE member discount code. Let's make this the biggest gathering of African tech innovators yet!",
      category: "event",
      date: now + 45 * 24 * 60 * 60 * 1000, // 45 days from now
      location: "Kenyatta International Convention Centre, Nairobi, Kenya",
      tags: ["AI", "Summit", "Nairobi", "Innovation", "Networking"],
      interestCount: 8,
      commentCount: 5,
    });

    // Comments on Notice 1
    await ctx.db.insert("noticeComments", {
      noticeId: notice1,
      authorId: kwame,
      content: "This is exactly what the ecosystem needs! Count me in. Will there be a fintech-specific track? Happy to moderate a panel on AI-powered credit scoring for the unbanked.",
    });
    await ctx.db.insert("noticeComments", {
      noticeId: notice1,
      authorId: amara,
      content: "Amazing initiative, Aisha! Would love to present our AI crop monitoring system at the AgriTech track. We've seen 40% yield improvements across 3 countries. Let's connect!",
    });
    await ctx.db.insert("noticeComments", {
      noticeId: notice1,
      authorId: zara,
      content: "MediAI Africa will definitely be there. We're launching our telemedicine AI platform that month — perfect timing. Can we get a booth for demos?",
    });
    await ctx.db.insert("noticeComments", {
      noticeId: notice1,
      authorId: fatima,
      content: "EduLeap is in! We'd love to showcase how AI is personalizing education across East Africa. Also happy to help with logistics since we're Nairobi-based. 🙌",
    });
    await ctx.db.insert("noticeComments", {
      noticeId: notice1,
      authorId: tendai,
      content: "Brilliant! Will fly in from Harare for this. The energy sector track is a must — there's so much happening with AI-optimized solar grids across Southern Africa.",
    });

    // Interests on Notice 1
    for (const userId of [kwame, amara, zara, fatima, tendai, grace, omar, ibrahim]) {
      await ctx.db.insert("noticeInterests", { noticeId: notice1, userId });
    }

    // ── Notice 2: Project - Cross-border Logistics Platform ──
    const notice2 = await ctx.db.insert("notices", {
      authorId: chibueze,
      title: "Building Africa's First AI-Powered Cross-Border Logistics Platform",
      description: "After 2 years of building LogiFlow, we're expanding into cross-border freight optimization using machine learning. The challenge? Customs delays, route inefficiencies, and fragmented last-mile delivery across West and East Africa.\n\nWe've already reduced delivery times by 35% within Nigeria. Now we're training models on cross-border trade data from 8 African countries.\n\nLooking for:\n→ Data partnerships with logistics companies in East Africa\n→ A senior ML engineer with supply chain experience\n→ Pilot partners for the Lagos-Nairobi corridor\n\nIf you're working in logistics, trade, or supply chain tech, let's talk!",
      category: "project",
      tags: ["Logistics", "AI", "Cross-border", "Supply Chain", "ML"],
      interestCount: 6,
      commentCount: 4,
    });

    await ctx.db.insert("noticeComments", {
      noticeId: notice2,
      authorId: grace,
      content: "This is a massive pain point. TalentBridge has been helping logistics companies find tech talent — we have several ML engineers in our network who specialize in operations research. Let me make some introductions.",
    });
    await ctx.db.insert("noticeComments", {
      noticeId: notice2,
      authorId: jeanpierre,
      content: "DroneServe could partner on last-mile delivery in Rwanda and Kenya. We handle 200+ drone deliveries daily. The combination of ground logistics + drone last-mile could be a game changer for the corridor.",
    });
    await ctx.db.insert("noticeComments", {
      noticeId: notice2,
      authorId: aisha,
      content: "Really exciting, Chibueze. AfriVentures has been looking at logistics-as-a-service plays. Would love to schedule a call to discuss the fundraise. Are you raising a Series A?",
    });
    await ctx.db.insert("noticeComments", {
      noticeId: notice2,
      authorId: kwame,
      content: "The payment and customs clearance side is where we can help. FinStack already handles cross-border B2B payments in 12 African markets. Happy to explore an integration.",
    });

    for (const userId of [grace, jeanpierre, aisha, kwame, omar, samuel]) {
      await ctx.db.insert("noticeInterests", { noticeId: notice2, userId });
    }

    // ── Notice 3: Activity - Hackathon ──
    const notice3 = await ctx.db.insert("notices", {
      authorId: omar,
      title: "48-Hour Cybersecurity Hackathon for African Startups",
      description: "CyberShield Africa is hosting a virtual hackathon focused on building security tools for African SMEs. Most security solutions are built for enterprise — African startups and SMEs need affordable, accessible security.\n\nChallenge tracks:\n1. Fraud detection for mobile money platforms\n2. Identity verification for the unbanked\n3. Supply chain data security\n4. Privacy-first data collection tools\n\nPrize pool: $15,000 + mentorship from CyberShield's security team + fast-track pilot opportunities with our partner banks.\n\nTeams of 2-4. Registration closes in 2 weeks!",
      category: "activity",
      location: "Virtual (Zoom + Discord)",
      date: now + 21 * 24 * 60 * 60 * 1000, // 21 days from now
      tags: ["Cybersecurity", "Hackathon", "SME", "Mobile Money", "Privacy"],
      interestCount: 7,
      commentCount: 4,
    });

    await ctx.db.insert("noticeComments", {
      noticeId: notice3,
      authorId: kwame,
      content: "Track 1 is right up our alley. FinStack deals with mobile money fraud daily — we'd love to have our fraud analytics team participate. Can corporate teams join or is it indie only?",
    });
    await ctx.db.insert("noticeComments", {
      noticeId: notice3,
      authorId: ibrahim,
      content: "Great initiative! LinguaAI could contribute NLP models for detecting phishing in local African languages. Most spam filters don't catch Yoruba or Swahili phishing attempts. Looking for a team if anyone's interested!",
    });
    await ctx.db.insert("noticeComments", {
      noticeId: notice3,
      authorId: naledi,
      content: "Construction supply chains have massive data security gaps. AfroBuild would love to sponsor Track 3 and potentially adopt the winning solution. Let's talk, Omar.",
    });
    await ctx.db.insert("noticeComments", {
      noticeId: notice3,
      authorId: zara,
      content: "Patient data privacy is our biggest challenge at MediAI. Track 4 is exactly what we need. We'll be registering a team and can offer healthcare data anonymization as a test case.",
    });

    for (const userId of [kwame, ibrahim, naledi, zara, tendai, lindiwe, chibueze]) {
      await ctx.db.insert("noticeInterests", { noticeId: notice3, userId });
    }

    // ── Notice 4: Announcement - Funding Round ──
    const notice4 = await ctx.db.insert("notices", {
      authorId: zara,
      title: "MediAI Africa Closes $3.2M Seed Round — Thank You AOE Community!",
      description: "Thrilled to share that MediAI Africa has closed a $3.2M seed round led by AfriVentures AI, with participation from Google for Startups Africa and Techstars.\n\nThis community played a huge role. I met our lead investor Aisha at an AOE dinner in Johannesburg, and two of our advisors came from connections made on this platform.\n\nWhat's next:\n• Expanding AI diagnostics to 5 new countries\n• Launching our rural telemedicine kiosks in Q3\n• Hiring 15 engineers across Nairobi, Lagos, and Cape Town\n\nIf you're building in HealthTech or interested in AI diagnostics, my DMs are open. Grateful for this community! 🚀",
      category: "announcement",
      tags: ["Funding", "HealthTech", "AI", "Seed Round", "Hiring"],
      interestCount: 12,
      commentCount: 5,
    });

    await ctx.db.insert("noticeComments", {
      noticeId: notice4,
      authorId: aisha,
      content: "So proud to back MediAI! Zara's vision for democratizing healthcare across Africa through AI is exactly the kind of transformative impact we look for. The AOE community creates real connections that lead to real deals.",
    });
    await ctx.db.insert("noticeComments", {
      noticeId: notice4,
      authorId: tendai,
      content: "Congratulations Zara! This is well deserved. SolarGrid is deploying to rural areas too — would love to explore powering your telemedicine kiosks with our solar solutions. Off-grid healthcare + off-grid energy = perfect match.",
    });
    await ctx.db.insert("noticeComments", {
      noticeId: notice4,
      authorId: grace,
      content: "Incredible news! If you're hiring 15 engineers, TalentBridge can help you source top-tier AI/ML talent across all three locations. We have a specialized HealthTech recruitment track. Let's connect this week!",
    });
    await ctx.db.insert("noticeComments", {
      noticeId: notice4,
      authorId: fatima,
      content: "This is so inspiring, Zara! The fact that you met your lead investor through AOE shows the power of this community. Congratulations on the round — can't wait to see the kiosks in Kenya! 🎉",
    });
    await ctx.db.insert("noticeComments", {
      noticeId: notice4,
      authorId: amara,
      content: "Massive congratulations! Rural communities need this. AgroTech's farmer network spans 50,000+ smallholders — many of them lack basic healthcare access. Let's explore co-locating your kiosks at our farmer hubs.",
    });

    for (const userId of [aisha, tendai, grace, fatima, amara, kwame, omar, chibueze, naledi, ibrahim, lindiwe, samuel]) {
      await ctx.db.insert("noticeInterests", { noticeId: notice4, userId });
    }

    // ── Notice 5: Project - Fashion AI ──
    const notice5 = await ctx.db.insert("notices", {
      authorId: lindiwe,
      title: "Seeking Beta Testers: AI-Powered African Fashion Design Tool",
      description: "FashionForge AI is launching a generative AI tool that helps African fashion designers create new patterns inspired by traditional textiles from across the continent. The AI has been trained on 50,000+ traditional African textile patterns — from Ankara to Kente to Shweshwe.\n\nDesigners can input a description, select cultural inspirations, and the AI generates unique, culturally-respectful designs that blend tradition with modern aesthetics.\n\nWe need 50 beta testers (designers, fashion brands, textile manufacturers) to test the platform for 4 weeks starting next month.\n\nBeta testers get:\n✓ Free 1-year subscription after launch\n✓ Input into feature development\n✓ Early access to the commercial API",
      category: "project",
      tags: ["Fashion", "Generative AI", "Culture", "Design", "Beta"],
      interestCount: 5,
      commentCount: 3,
    });

    await ctx.db.insert("noticeComments", {
      noticeId: notice5,
      authorId: naledi,
      content: "This is fascinating! In construction, we use AI for design too but fashion is a completely different challenge. The cultural sensitivity aspect is crucial — how are you handling IP and cultural attribution for the patterns?",
    });
    await ctx.db.insert("noticeComments", {
      noticeId: notice5,
      authorId: ibrahim,
      content: "Love this! LinguaAI has been working on cultural context models. We could help ensure the pattern descriptions and cultural attributions are accurate in multiple African languages. Would love to explore a collaboration.",
    });
    await ctx.db.insert("noticeComments", {
      noticeId: notice5,
      authorId: fatima,
      content: "My sister runs a fashion brand in Nairobi — I'll connect you! She's been looking for exactly this kind of tool. The intersection of tech and African culture is so powerful. Sign me up as a beta tester too!",
    });

    for (const userId of [naledi, ibrahim, fatima, grace, samuel]) {
      await ctx.db.insert("noticeInterests", { noticeId: notice5, userId });
    }

    // ── Notice 6: Event - AOE Dinner ──
    const notice6 = await ctx.db.insert("notices", {
      authorId: tendai,
      title: "AOE Dinner Meetup: Harare Edition — Sustainable Energy & AI",
      description: "Calling all AOE members in Southern Africa! We're organizing an intimate dinner meetup in Harare focused on how AI is reshaping the energy sector across the continent.\n\nAgenda:\n• 6:30 PM — Welcome drinks & networking\n• 7:00 PM — Fireside chat: \"AI-Optimized Microgrids for Rural Africa\"\n• 8:00 PM — Dinner + roundtable discussions\n• 9:30 PM — Open networking\n\nLimited to 30 seats to keep the conversation meaningful. Members from Zimbabwe, South Africa, Botswana, Zambia, and Mozambique especially welcome.\n\nNo charge for AOE members — dinner is on SolarGrid AI!",
      category: "event",
      date: now + 14 * 24 * 60 * 60 * 1000, // 14 days
      location: "The Venue, Sam Levy's Village, Harare, Zimbabwe",
      tags: ["Dinner", "Networking", "Energy", "Southern Africa", "AI"],
      interestCount: 5,
      commentCount: 3,
    });

    await ctx.db.insert("noticeComments", {
      noticeId: notice6,
      authorId: naledi,
      content: "Flying in from Gaborone for this! AfroBuild has been exploring solar-powered construction sites. Would love to discuss energy solutions for our projects with the group.",
    });
    await ctx.db.insert("noticeComments", {
      noticeId: notice6,
      authorId: samuel,
      content: "I'll make the trip from Accra. AquaAI's water purification systems are solar-powered and we're expanding into Southern Africa. Great opportunity to learn about the energy landscape there.",
    });
    await ctx.db.insert("noticeComments", {
      noticeId: notice6,
      authorId: lindiwe,
      content: "Count me in! I've been wanting to connect with more Southern African founders. FashionForge's Cape Town office is close enough. Will bring a few team members if that's okay?",
    });

    for (const userId of [naledi, samuel, lindiwe, zara, omar]) {
      await ctx.db.insert("noticeInterests", { noticeId: notice6, userId });
    }

    // ── Notice 7: Announcement - Partnership ──
    const notice7 = await ctx.db.insert("notices", {
      authorId: kwame,
      title: "FinStack x LogiFlow Partnership: Seamless Cross-Border Payments for Logistics",
      description: "Excited to announce that FinStack Africa and LogiFlow have officially partnered to solve one of the biggest friction points in African trade — cross-border payments for logistics companies.\n\nStarting next quarter, LogiFlow's platform will integrate FinStack's multi-currency payment rails, enabling:\n• Instant settlement in 12 African currencies\n• Automated customs duty payments\n• Real-time FX rates for trade corridors\n• Mobile money integration for last-mile drivers\n\nThis partnership started right here on the AOE notice board when Chibueze posted about his cross-border expansion. We connected, realized the synergy, and built the integration in 8 weeks.\n\nProof that this community creates real business value!",
      category: "announcement",
      tags: ["Partnership", "Fintech", "Logistics", "Payments", "Trade"],
      interestCount: 9,
      commentCount: 4,
    });

    await ctx.db.insert("noticeComments", {
      noticeId: notice7,
      authorId: chibueze,
      content: "What Kwame said! This partnership has been transformational for LogiFlow. Our drivers no longer have to deal with cash at borders. The AOE community is where the magic happens — post your projects, you never know who's reading!",
    });
    await ctx.db.insert("noticeComments", {
      noticeId: notice7,
      authorId: aisha,
      content: "This is the kind of ecosystem building we need more of. Two African companies solving African problems together. AfriVentures is watching this space closely — the integration story is compelling for investors.",
    });
    await ctx.db.insert("noticeComments", {
      noticeId: notice7,
      authorId: amara,
      content: "This could be huge for agricultural exports too. AgroTech's farmers struggle with cross-border payments when selling produce regionally. Would love to explore integrating this for our supply chain.",
    });
    await ctx.db.insert("noticeComments", {
      noticeId: notice7,
      authorId: jeanpierre,
      content: "Fantastic news! DroneServe's cross-border medical deliveries face the same payment challenges. This integration could streamline our operations significantly. Let's talk about adding drone logistics to the platform!",
    });

    for (const userId of [chibueze, aisha, amara, jeanpierre, omar, zara, fatima, grace, tendai]) {
      await ctx.db.insert("noticeInterests", { noticeId: notice7, userId });
    }

    return null;
  },
});