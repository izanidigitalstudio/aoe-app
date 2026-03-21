import React, { ReactNode, useSyncExternalStore } from 'react';
import { useMutation as useConvexMutation, useQuery as useConvexQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { USE_LIVE_BACKEND } from './backendConfig';

type Member = {
  _id: string;
  _creationTime: number;
  name: string;
  email: string;
  company?: string;
  role?: string;
  industry?: string;
  country?: string;
  city?: string;
  bio?: string;
  achievements?: string;
  currentProjects?: string;
  futureProjects?: string;
  skills?: string[];
  linkedIn?: string;
  website?: string;
  twitter?: string;
  image?: string;
  phone?: string;
  memberType?: string;
};

type EventItem = {
  _id: string;
  _creationTime: number;
  title: string;
  venue: string;
  city: string;
  country: string;
  date: number;
  description: string;
  status: string;
  capacity: number;
  rsvpCount: number;
  ticketPrice?: number;
  currency?: string;
  sponsors?: Array<{ name: string; tier: string; website?: string }>;
  guestSpeakers?: Array<Record<string, string>>;
  invitedGuests?: Array<Record<string, string>>;
};

type Project = {
  _id: string;
  _creationTime: number;
  title: string;
  description: string;
  industry: string;
  stage: string;
  aiIntegration: string;
  resourcesNeeded: string[];
  lookingFor: string[];
  tags: string[];
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  authorName?: string;
  authorCompany?: string;
};

type Connection = {
  _id: string;
  userId: string;
  status: 'accepted' | 'pending' | 'declined';
  isIncoming?: boolean;
};

type Conversation = {
  _id: string;
  otherUserId: string;
  lastMessage?: string;
  lastMessageAt?: number;
};

type Message = {
  _id: string;
  _creationTime: number;
  conversationId: string;
  content: string;
  isMine: boolean;
};

type ConferenceRequest = {
  _id: string;
  conferenceName: string;
  status: 'pending' | 'approved' | 'declined';
  delegateType: string;
  fullName: string;
  email: string;
};

type Payment = {
  _id: string;
  _creationTime: number;
  eventId: string;
  memberId: string;
  memberName: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  reference: string;
};

type Note = {
  _id: string;
  _creationTime: number;
  memberId: string;
  content: string;
};

type Resource = {
  _id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  featured?: boolean;
  sourceUrl?: string;
};

const now = Date.now();

const store = {
  version: 0,
  currentUser: {
    _id: 'member-me',
    _creationTime: now - 1000 * 60 * 60 * 24 * 30,
    name: 'Amina Okafor',
    email: 'amina@aoe.africa',
    company: 'Lagos AI Studio',
    role: 'Founder',
    industry: 'FinTech',
    country: 'Nigeria',
    city: 'Lagos',
    bio: 'Building practical AI products for African SMEs.',
    achievements: 'Raised a pre-seed round and launched AI assistants across 4 markets.',
    currentProjects: 'Deploying customer support copilots for commerce brands.',
    futureProjects: 'Launching an AI operator toolkit for founders across Africa.',
    skills: ['AI Strategy', 'Product', 'Partnerships'],
    linkedIn: 'linkedin.com/in/aminaokafor',
    website: 'aoe.africa',
    memberType: 'business_community',
  } as Member,
  members: [
    {
      _id: 'member-me',
      _creationTime: now - 1000 * 60 * 60 * 24 * 30,
      name: 'Amina Okafor',
      email: 'amina@aoe.africa',
      company: 'Lagos AI Studio',
      role: 'Founder',
      industry: 'FinTech',
      country: 'Nigeria',
      city: 'Lagos',
      bio: 'Building practical AI products for African SMEs.',
      achievements: 'Raised a pre-seed round and launched AI assistants across 4 markets.',
      currentProjects: 'Deploying customer support copilots for commerce brands.',
      futureProjects: 'Launching an AI operator toolkit for founders across Africa.',
      skills: ['AI Strategy', 'Product', 'Partnerships'],
      linkedIn: 'linkedin.com/in/aminaokafor',
      website: 'aoe.africa',
      memberType: 'business_community',
    },
    {
      _id: 'member-1',
      _creationTime: now - 1000 * 60 * 60 * 24 * 12,
      name: 'Kwame Mensah',
      email: 'kwame@agriflow.africa',
      company: 'AgriFlow',
      role: 'CEO',
      industry: 'AgriTech',
      country: 'Ghana',
      city: 'Accra',
      bio: 'Using AI to improve crop planning and distribution.',
      achievements: 'Scaled procurement tools to 2,000 farmers.',
      currentProjects: 'Forecasting market demand for cassava and maize.',
      futureProjects: 'Cross-border agri logistics intelligence.',
      skills: ['Operations', 'Machine Learning', 'Supply Chain'],
      linkedIn: 'linkedin.com/in/kwamemensah',
      memberType: 'business_community',
    },
    {
      _id: 'member-2',
      _creationTime: now - 1000 * 60 * 60 * 24 * 9,
      name: 'Lerato Mokoena',
      email: 'lerato@healthgrid.africa',
      company: 'HealthGrid',
      role: 'CTO',
      industry: 'HealthTech',
      country: 'South Africa',
      city: 'Johannesburg',
      bio: 'Designing clinician-friendly AI triage tools.',
      achievements: 'Deployed diagnostics tooling in 18 clinics.',
      currentProjects: 'Remote patient triage workflows.',
      futureProjects: 'Clinical decision support tuned for African care settings.',
      skills: ['Clinical AI', 'Engineering Leadership'],
      linkedIn: 'linkedin.com/in/leratomokoena',
      memberType: 'business_community',
    },
    {
      _id: 'member-3',
      _creationTime: now - 1000 * 60 * 60 * 24 * 5,
      name: 'Tariro Dube',
      email: 'tariro@freightmind.africa',
      company: 'FreightMind',
      role: 'Product Lead',
      industry: 'Logistics',
      country: 'Zimbabwe',
      city: 'Harare',
      bio: 'Applying AI to route planning and customs workflows.',
      achievements: 'Reduced fleet idle time by 22%.',
      currentProjects: 'Predictive cross-border route optimization.',
      futureProjects: 'Regional freight capacity exchange.',
      skills: ['Product', 'Data', 'Trade Tech'],
      linkedIn: 'linkedin.com/in/tarirodube',
      memberType: 'business_community',
    },
  ] as Member[],
  events: [
    {
      _id: 'event-1',
      _creationTime: now - 1000 * 60 * 60 * 24 * 3,
      title: 'AOE Dinner Tour: Johannesburg',
      venue: 'Sandton Convention Centre',
      city: 'Johannesburg',
      country: 'South Africa',
      date: now + 1000 * 60 * 60 * 24 * 14,
      description: 'Founders, operators, and investors discussing practical AI adoption in African businesses.',
      status: 'upcoming',
      capacity: 150,
      rsvpCount: 84,
      ticketPrice: 450,
      currency: 'ZAR',
      sponsors: [{ name: 'AWS Startups', tier: 'gold', website: 'https://aws.amazon.com/startups/' }],
      guestSpeakers: [{ name: 'Lerato Mokoena', company: 'HealthGrid', designation: 'CTO', status: 'confirmed' }],
      invitedGuests: [{ name: 'Naledi Khumalo', company: 'AfriCapital', designation: 'Partner', status: 'invited' }],
    },
    {
      _id: 'event-2',
      _creationTime: now - 1000 * 60 * 60 * 24 * 2,
      title: 'AOE Dinner Tour: Lagos',
      venue: 'Eko Hotel',
      city: 'Lagos',
      country: 'Nigeria',
      date: now + 1000 * 60 * 60 * 24 * 28,
      description: 'A working dinner on AI infrastructure, GTM, and fundraising for African startups.',
      status: 'upcoming',
      capacity: 200,
      rsvpCount: 132,
      ticketPrice: 120000,
      currency: 'NGN',
      sponsors: [{ name: 'Google for Startups', tier: 'title', website: 'https://startup.google.com/' }],
      guestSpeakers: [{ name: 'Amina Okafor', company: 'Lagos AI Studio', designation: 'Founder', status: 'confirmed' }],
      invitedGuests: [],
    },
  ] as EventItem[],
  projects: [
    {
      _id: 'project-1',
      _creationTime: now - 1000 * 60 * 60 * 24 * 8,
      title: 'SME Support Copilot',
      description: 'A multilingual assistant for customer support across WhatsApp and web.',
      industry: 'FinTech',
      stage: 'mvp',
      aiIntegration: 'LLM routing, knowledge retrieval, and ticket summarization.',
      resourcesNeeded: ['Pilot partners', 'Technical advisors'],
      lookingFor: ['partnership', 'mentorship'],
      tags: ['support', 'automation'],
      likesCount: 12,
      commentsCount: 3,
      isLiked: false,
      authorName: 'Amina Okafor',
      authorCompany: 'Lagos AI Studio',
    },
    {
      _id: 'project-2',
      _creationTime: now - 1000 * 60 * 60 * 24 * 6,
      title: 'Crop Forecast Engine',
      description: 'Demand and weather forecasting for regional produce distributors.',
      industry: 'AgriTech',
      stage: 'growth',
      aiIntegration: 'Time-series forecasting and field-level risk scoring.',
      resourcesNeeded: ['Distribution partners'],
      lookingFor: ['funding'],
      tags: ['agri', 'forecasting'],
      likesCount: 8,
      commentsCount: 1,
      isLiked: true,
      authorName: 'Kwame Mensah',
      authorCompany: 'AgriFlow',
    },
  ] as Project[],
  connections: [
    { _id: 'conn-1', userId: 'member-1', status: 'accepted' },
    { _id: 'conn-2', userId: 'member-3', status: 'pending', isIncoming: true },
  ] as Connection[],
  conversations: [
    { _id: 'convo-1', otherUserId: 'member-1', lastMessage: 'Looking forward to the Lagos dinner.', lastMessageAt: now - 1000 * 60 * 32 },
  ] as Conversation[],
  messages: {
    'convo-1': [
      { _id: 'msg-1', _creationTime: now - 1000 * 60 * 38, conversationId: 'convo-1', content: 'Great to connect through AOE.', isMine: false },
      { _id: 'msg-2', _creationTime: now - 1000 * 60 * 32, conversationId: 'convo-1', content: 'Looking forward to the Lagos dinner.', isMine: true },
    ],
  } as Record<string, Message[]>,
  conferenceRequests: [] as ConferenceRequest[],
  payments: [
    {
      _id: 'payment-1',
      _creationTime: now - 1000 * 60 * 60 * 24,
      eventId: 'event-1',
      memberId: 'member-1',
      memberName: 'Kwame Mensah',
      amount: 450,
      currency: 'ZAR',
      status: 'paid',
      reference: 'AOE-001',
    },
    {
      _id: 'payment-2',
      _creationTime: now - 1000 * 60 * 60 * 18,
      eventId: 'event-2',
      memberId: 'member-2',
      memberName: 'Lerato Mokoena',
      amount: 120000,
      currency: 'NGN',
      status: 'pending',
      reference: 'AOE-002',
    },
  ] as Payment[],
  rsvps: [
    {
      _id: 'rsvp-1',
      eventId: 'event-1',
      userId: 'member-1',
      userName: 'Kwame Mensah',
      userEmail: 'kwame@agriflow.africa',
      userCompany: 'AgriFlow',
      userPhone: '',
      status: 'attending',
      paymentStatus: 'paid',
    },
    {
      _id: 'rsvp-2',
      eventId: 'event-2',
      userId: 'member-2',
      userName: 'Lerato Mokoena',
      userEmail: 'lerato@healthgrid.africa',
      userCompany: 'HealthGrid',
      userPhone: '',
      status: 'pending',
      paymentStatus: 'pending',
    },
  ] as Array<Record<string, any>>,
  notes: [
    { _id: 'note-1', _creationTime: now - 1000 * 60 * 60 * 6, memberId: 'member-1', content: 'Interested in a pilot with retail distributors.' },
  ] as Note[],
  resources: [
    {
      _id: 'resource-1',
      title: 'AI Adoption Playbook for SMEs',
      summary: 'A practical guide to introducing AI workflows in lean operating teams.',
      content: 'Start with repetitive internal processes, define a measurable success metric, and keep humans in the loop for every customer-facing automation.',
      category: 'guide',
      tags: ['operations', 'automation'],
      featured: true,
      sourceUrl: 'https://aoe.africa',
    },
    {
      _id: 'resource-2',
      title: 'Fundraising for Applied AI Startups',
      summary: 'What African founders should tighten before speaking to investors.',
      content: 'Investors want evidence of distribution, not just a model demo. Show repeatable demand, cost controls, and implementation timelines.',
      category: 'tutorial',
      tags: ['fundraising', 'gtm'],
    },
  ] as Resource[],
};

const subscribers = new Set<() => void>();

function subscribe(listener: () => void) {
  subscribers.add(listener);
  return () => subscribers.delete(listener);
}

function publish() {
  store.version += 1;
  subscribers.forEach((listener) => listener());
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function nextId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function getMember(memberId: string) {
  return store.members.find((member) => member._id === memberId);
}

function listMembers(args?: any) {
  let members = [...store.members];
  if (args?.search) {
    const search = String(args.search).toLowerCase();
    members = members.filter((member) =>
      [member.name, member.email, member.company, member.role, member.country, member.industry]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search))
    );
  }
  if (args?.memberType) {
    members = members.filter((member) => member.memberType === args.memberType);
  }
  if (args?.industry) {
    members = members.filter((member) => member.industry === args.industry);
  }
  return members.sort((a, b) => b._creationTime - a._creationTime);
}

function listConnections() {
  return store.connections.map((connection) => {
    const member = getMember(connection.userId);
    return {
      ...connection,
      name: member?.name,
      image: member?.image,
      role: member?.role,
      company: member?.company,
      country: member?.country,
    };
  });
}

function listConversations() {
  return store.conversations.map((conversation) => {
    const member = getMember(conversation.otherUserId);
    return {
      ...conversation,
      otherUserName: member?.name,
      otherUserImage: member?.image,
      otherUserCompany: member?.company,
      otherUserRole: member?.role,
    };
  });
}

function getStats() {
  const totalRevenue = store.payments
    .filter((payment) => payment.status === 'paid')
    .reduce((sum, payment) => sum + payment.amount, 0);
  return {
    totalMembers: store.members.length,
    totalEvents: store.events.length,
    totalRsvps: store.rsvps.length,
    totalRevenue,
    confirmedPayments: store.payments.filter((payment) => payment.status === 'paid').length,
    pendingPayments: store.payments.filter((payment) => payment.status === 'pending').length,
  };
}

function getIndustryCounts(memberType?: string) {
  const filtered = memberType ? store.members.filter((member) => member.memberType === memberType) : store.members;
  const counts = new Map<string, number>();
  filtered.forEach((member) => {
    if (!member.industry) return;
    counts.set(member.industry, (counts.get(member.industry) || 0) + 1);
  });
  return [...counts.entries()].map(([industry, count]) => ({ industry, count }));
}

function getReportData() {
  const countBy = (items: string[]) =>
    [...items.reduce((map, value) => map.set(value, (map.get(value) || 0) + 1), new Map<string, number>()).entries()]
      .map(([label, count]) => ({ label, count }));

  return {
    membersByCountry: countBy(store.members.map((member) => member.country || 'Unknown')).map((item) => ({ country: item.label, count: item.count })),
    membersByIndustry: countBy(store.members.map((member) => member.industry || 'Other')).map((item) => ({ industry: item.label, count: item.count })),
    monthlyGrowth: [
      { month: 'Jan', count: 4 },
      { month: 'Feb', count: 7 },
      { month: 'Mar', count: store.members.length },
    ],
    eventPerformance: store.events.map((event) => ({
      event: event.title,
      attendees: event.rsvpCount,
      revenue: store.payments.filter((payment) => payment.eventId === event._id && payment.status === 'paid').reduce((sum, payment) => sum + payment.amount, 0),
    })),
    rsvpConversion: {
      total: store.rsvps.length,
      attending: store.rsvps.filter((rsvp) => rsvp.status === 'attending').length,
      cancelled: store.rsvps.filter((rsvp) => rsvp.status === 'cancelled').length,
      waitlist: store.rsvps.filter((rsvp) => rsvp.status === 'waitlist').length,
    },
    recentMembers: listMembers({}).slice(0, 5),
  };
}

function useStoreVersion() {
  useSyncExternalStore(subscribe, () => store.version);
}

export function useQuery(reference: any, args?: any) {
  if (USE_LIVE_BACKEND) {
    return useConvexQuery(reference, args);
  }

  useStoreVersion();
  if (args === 'skip') return undefined;

  if (reference === api.users.getCurrentUser) return clone(store.currentUser);
  if (reference === api.users.listMembers) return clone(listMembers(args));
  if (reference === api.events.listEvents) return clone([...store.events].sort((a, b) => a.date - b.date));
  if (reference === api.projects.listProjects) return clone([...store.projects].sort((a, b) => b._creationTime - a._creationTime));
  if (reference === api.admin.getStats) return clone(getStats());
  if (reference === api.connections.getMyConnections) return clone(listConnections());
  if (reference === api.messaging.getMyConversations) return clone(listConversations());
  if (reference === api.messaging.getMessages) return clone(store.messages[args?.conversationId] || []);
  if (reference === api.conferenceRequests.getMyRequest) {
    return clone(store.conferenceRequests.find((request) => request.conferenceName === args?.conferenceName) || null);
  }
  if (reference === api.aiResources.listResources) {
    const resources = args?.category ? store.resources.filter((resource) => resource.category === args.category) : store.resources;
    return clone(resources);
  }
  if (reference === api.admin.listAllMembers) return clone(listMembers(args));
  if (reference === api.admin.getMemberIndustryCounts) return clone(getIndustryCounts(args?.memberType));
  if (reference === api.admin.getEventRsvps) return clone(store.rsvps.filter((rsvp) => rsvp.eventId === args?.eventId));
  if (reference === api.admin.listPayments) {
    const payments = args?.status ? store.payments.filter((payment) => payment.status === args.status) : store.payments;
    return clone(payments);
  }
  if (reference === api.admin.getReportData) return clone(getReportData());
  if (reference === api.admin.getMemberNotes) return clone(store.notes.filter((note) => note.memberId === args?.memberId));

  return undefined;
}

export function useMutation(reference: any) {
  if (USE_LIVE_BACKEND) {
    return useConvexMutation(reference);
  }

  useStoreVersion();

  return async (args?: any) => {
    if (reference === api.init.seedData) return null;

    if (reference === api.events.rsvpEvent) {
      const event = store.events.find((item) => item._id === args?.eventId);
      if (event) {
        event.rsvpCount += 1;
        store.rsvps.push({
          _id: nextId('rsvp'),
          eventId: event._id,
          userId: store.currentUser._id,
          userName: store.currentUser.name,
          userEmail: store.currentUser.email,
          userCompany: store.currentUser.company,
          userPhone: store.currentUser.phone || '',
          status: 'attending',
          paymentStatus: event.ticketPrice ? 'pending' : 'paid',
        });
        publish();
      }
      return null;
    }

    if (reference === api.projects.createProject) {
      store.projects.unshift({
        _id: nextId('project'),
        _creationTime: Date.now(),
        title: args.title,
        description: args.description,
        industry: args.industry,
        stage: args.stage,
        aiIntegration: args.aiIntegration,
        resourcesNeeded: args.resourcesNeeded || [],
        lookingFor: args.lookingFor || [],
        tags: args.tags || [],
        likesCount: 0,
        commentsCount: 0,
        authorName: store.currentUser.name,
        authorCompany: store.currentUser.company,
      });
      publish();
      return null;
    }

    if (reference === api.projects.toggleLike) {
      const project = store.projects.find((item) => item._id === args?.projectId);
      if (project) {
        project.isLiked = !project.isLiked;
        project.likesCount += project.isLiked ? 1 : -1;
        publish();
      }
      return null;
    }

    if (reference === api.projects.addComment) {
      const project = store.projects.find((item) => item._id === args?.projectId);
      if (project) {
        project.commentsCount += 1;
        publish();
      }
      return null;
    }

    if (reference === api.connections.sendRequest) {
      if (!store.connections.some((connection) => connection.userId === args?.toUserId && connection.status !== 'declined')) {
        store.connections.push({ _id: nextId('conn'), userId: args.toUserId, status: 'pending', isIncoming: false });
        publish();
      }
      return null;
    }

    if (reference === api.connections.respondToRequest) {
      const connection = store.connections.find((item) => item._id === args?.connectionId);
      if (connection) {
        connection.status = args?.accept ? 'accepted' : 'declined';
        publish();
      }
      return null;
    }

    if (reference === api.messaging.getOrCreateConversation) {
      let conversation = store.conversations.find((item) => item.otherUserId === args?.otherUserId);
      if (!conversation) {
        conversation = { _id: nextId('convo'), otherUserId: args.otherUserId };
        store.conversations.unshift(conversation);
        store.messages[conversation._id] = [];
        publish();
      }
      return conversation._id;
    }

    if (reference === api.messaging.sendMessage) {
      const message: Message = {
        _id: nextId('msg'),
        _creationTime: Date.now(),
        conversationId: args.conversationId,
        content: args.content,
        isMine: true,
      };
      store.messages[args.conversationId] = [...(store.messages[args.conversationId] || []), message];
      const conversation = store.conversations.find((item) => item._id === args.conversationId);
      if (conversation) {
        conversation.lastMessage = args.content;
        conversation.lastMessageAt = message._creationTime;
      }
      publish();
      return message._id;
    }

    if (reference === api.conferenceRequests.submitRequest) {
      const request = {
        _id: nextId('request'),
        conferenceName: args.conferenceName,
        status: 'pending' as const,
        delegateType: args.delegateType,
        fullName: args.fullName,
        email: args.email,
      };
      store.conferenceRequests = store.conferenceRequests.filter((item) => item.conferenceName !== args.conferenceName);
      store.conferenceRequests.push(request);
      publish();
      return request._id;
    }

    if (reference === api.conferenceRequests.cancelRequest) {
      store.conferenceRequests = store.conferenceRequests.filter((item) => item._id !== args?.requestId);
      publish();
      return null;
    }

    if (reference === api.users.updateProfile) {
      store.currentUser = { ...store.currentUser, ...args };
      store.members = store.members.map((member) => (member._id === store.currentUser._id ? { ...member, ...args } : member));
      publish();
      return null;
    }

    if (reference === api.users.ensureCurrentUser) return store.currentUser._id;
    if (reference === api.users.generateUploadUrl) return 'about:blank';

    if (reference === api.users.updateProfileImage) {
      store.currentUser.image = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80';
      store.members = store.members.map((member) =>
        member._id === store.currentUser._id ? { ...member, image: store.currentUser.image } : member
      );
      publish();
      return null;
    }

    if (reference === api.admin.addMember) {
      store.members.unshift({
        _id: nextId('member'),
        _creationTime: Date.now(),
        name: args.name,
        email: args.email,
        company: args.company,
        role: args.role,
        industry: args.industry,
        country: args.country,
        city: args.city,
        bio: args.bio,
        achievements: args.achievements,
        currentProjects: args.currentProjects,
        linkedIn: args.linkedIn,
        website: args.website,
        memberType: args.memberType || 'business_community',
      });
      publish();
      return null;
    }

    if (reference === api.admin.bulkAddMembers) {
      (args?.members || []).forEach((member: any) => {
        store.members.unshift({ _id: nextId('member'), _creationTime: Date.now(), ...member });
      });
      publish();
      return null;
    }

    if (reference === api.admin.updateMember) {
      store.members = store.members.map((member) => (member._id === args.memberId ? { ...member, ...args } : member));
      publish();
      return null;
    }

    if (reference === api.admin.deleteMember) {
      store.members = store.members.filter((member) => member._id !== args.memberId);
      publish();
      return null;
    }

    if (reference === api.admin.createEvent) {
      store.events.unshift({
        _id: nextId('event'),
        _creationTime: Date.now(),
        title: args.title,
        venue: args.venue,
        city: args.city,
        country: args.country,
        date: new Date(args.date).getTime(),
        description: args.description,
        status: args.status || 'upcoming',
        capacity: Number(args.capacity || 100),
        rsvpCount: 0,
        ticketPrice: args.ticketPrice,
        currency: args.currency || 'ZAR',
        guestSpeakers: [],
        invitedGuests: [],
      });
      publish();
      return null;
    }

    if (reference === api.admin.updateEvent) {
      store.events = store.events.map((event) => (event._id === args.eventId ? { ...event, ...args } : event));
      publish();
      return null;
    }

    if (reference === api.admin.deleteEvent) {
      store.events = store.events.filter((event) => event._id !== args.eventId);
      store.rsvps = store.rsvps.filter((rsvp) => rsvp.eventId !== args.eventId);
      store.payments = store.payments.filter((payment) => payment.eventId !== args.eventId);
      publish();
      return null;
    }

    if (reference === api.admin.reorderEvent || reference === api.admin.sortEventsByDate) {
      store.events = [...store.events].sort((a, b) => a.date - b.date);
      publish();
      return null;
    }

    if (reference === api.admin.updateRsvpStatus) {
      store.rsvps = store.rsvps.map((rsvp) => (rsvp._id === args.rsvpId ? { ...rsvp, status: args.status } : rsvp));
      publish();
      return null;
    }

    if (reference === api.admin.recordPayment) {
      store.payments.unshift({
        _id: nextId('payment'),
        _creationTime: Date.now(),
        eventId: args.eventId,
        memberId: args.memberId,
        memberName: args.memberName || 'Member',
        amount: Number(args.amount || 0),
        currency: args.currency || 'ZAR',
        status: args.status || 'paid',
        reference: args.reference || nextId('ref'),
      });
      publish();
      return null;
    }

    if (reference === api.admin.updatePayment) {
      store.payments = store.payments.map((payment) => (payment._id === args.paymentId ? { ...payment, ...args } : payment));
      publish();
      return null;
    }

    if (reference === api.admin.deletePayment) {
      store.payments = store.payments.filter((payment) => payment._id !== args.paymentId);
      publish();
      return null;
    }

    if (reference === api.admin.addNote) {
      store.notes.unshift({ _id: nextId('note'), _creationTime: Date.now(), memberId: args.memberId, content: args.content });
      publish();
      return null;
    }

    if (reference === api.admin.deleteNote) {
      store.notes = store.notes.filter((note) => note._id !== args.noteId);
      publish();
      return null;
    }

    const mutateEventList = (
      key: 'guestSpeakers' | 'invitedGuests',
      type: 'add' | 'update' | 'remove',
      payload: any
    ) => {
      const event = store.events.find((item) => item._id === payload.eventId);
      if (!event) return;
      const list = [...(event[key] || [])];
      if (type === 'add') list.push(payload);
      if (type === 'update' && payload.index != null) list[payload.index] = { ...list[payload.index], ...payload };
      if (type === 'remove' && payload.index != null) list.splice(payload.index, 1);
      event[key] = list;
      publish();
    };

    if (reference === api.admin.addGuestSpeaker) return mutateEventList('guestSpeakers', 'add', args);
    if (reference === api.admin.updateGuestSpeaker) return mutateEventList('guestSpeakers', 'update', args);
    if (reference === api.admin.removeGuestSpeaker) return mutateEventList('guestSpeakers', 'remove', args);
    if (reference === api.admin.addInvitedGuest) return mutateEventList('invitedGuests', 'add', args);
    if (reference === api.admin.updateInvitedGuest) return mutateEventList('invitedGuests', 'update', args);
    if (reference === api.admin.removeInvitedGuest) return mutateEventList('invitedGuests', 'remove', args);

    return null;
  };
}

export function useAuthActions() {
  return {
    signIn: async () => null,
  };
}

export function Authenticated({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function Unauthenticated() {
  return null;
}

export function AuthLoading() {
  return null;
}
