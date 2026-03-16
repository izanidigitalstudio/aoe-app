export interface Conference {
  name: string;
  focus: string;
  date: string;
  location: string;
  country: string;
  description: string;
  website: string;
  attendees: string;
  icon: string;
  delegateInfo?: {
    delegateFee?: string;
    earlyBirdDeadline?: string;
    includes?: string[];
    delegateTypes?: string[];
  };
}

export interface ProcessedConference extends Conference {
  passed: boolean;
  isLive: boolean;
  originalDate: string;
}

// ==========================================
// SOUTH AFRICA CONFERENCES (55+)
// ==========================================
export const SA_CONFERENCES: Conference[] = [
  // --- TECHNOLOGY ---
  {
    name: 'Africa Tech Festival 2026',
    focus: 'Technology',
    date: 'Nov 17-19, 2026',
    location: 'Cape Town, CTICC',
    country: 'South Africa',
    description: 'Uniting tech leaders, entrepreneurs, and policymakers to drive African innovation across AI, fintech, cloud, connectivity and startups.',
    website: 'https://africatechfestival.com',
    attendees: '15,000+',
    icon: 'globe',
    delegateInfo: {
      delegateFee: 'From R5,995',
      earlyBirdDeadline: 'Aug 31, 2026',
      delegateTypes: ['Conference Pass', 'Platinum Pass', 'Startup Pass', 'Exhibition Only'],
      includes: ['3-day conference access', 'Exhibition floor access', 'Networking events', 'Content on-demand'],
    },
  },
  {
    name: 'AI Expo Africa 2026',
    focus: 'AI',
    date: 'Oct 28-29, 2026',
    location: 'Sandton Convention Centre, Johannesburg',
    country: 'South Africa',
    description: "Africa's largest AI trade show & conference connecting enterprise buyers with global & local AI suppliers. 9th edition with 110+ vendors showcasing products & services.",
    website: 'https://www.aiexpoafrica.com',
    attendees: '3,500+',
    icon: 'cpu',
  },
  {
    name: 'Digital Transformation Summit South Africa',
    focus: 'Technology',
    date: 'Mar 11, 2026',
    location: 'Indaba Hotel, Johannesburg',
    country: 'South Africa',
    description: '45th edition. 200+ C-Level executives exploring AI, Web 3.0, IoT, quantum computing and cloud computing for digital business transformation. CPD Certified.',
    website: 'https://digitransformationsummit.com/south-africa/',
    attendees: '200+',
    icon: 'trending-up',
  },
  {
    name: 'The AI Summit Cape Town 2026',
    focus: 'AI',
    date: 'Nov 17-19, 2026',
    location: 'Cape Town, CTICC',
    country: 'South Africa',
    description: 'Part of Africa Tech Festival. AI Summit Series flagship event exploring how AI can create a brighter future for Africa. Platinum Pass access only.',
    website: 'https://africatechfestival.com/ai-summit/',
    attendees: '5,000+',
    icon: 'zap',
  },
  {
    name: 'AIBC Africa Summit 2026',
    focus: 'Technology',
    date: 'Mar 9-10, 2026',
    location: 'Cape Town',
    country: 'South Africa',
    description: 'Convergence of AI, blockchain, crypto, and emerging tech. Connecting innovators, regulators and investors.',
    website: 'https://aibc.world',
    attendees: '5,000+',
    icon: 'link',
  },
  {
    name: 'ITWeb AI Summit 2026',
    focus: 'AI',
    date: 'Apr 22, 2026',
    location: 'Johannesburg',
    country: 'South Africa',
    description: 'Building South Africa\'s AI ecosystem together. Expert insights, real-world case studies and practical guidelines on sustainable AI with SA business realities in mind.',
    website: 'https://www.itweb.co.za/event/itweb-ai-summit-2026/',
    attendees: '500+',
    icon: 'cpu',
  },
  {
    name: 'ITWeb Security Summit 2026',
    focus: 'Technology',
    date: 'Jun 3-4, 2026',
    location: 'Sandton Convention Centre, Johannesburg',
    country: 'South Africa',
    description: 'The definitive event for information security professionals. 60+ international, African and local speakers on AI-driven threats, supply chain security and quantum computing risks.',
    website: 'https://www.itweb.co.za/event/itweb-security-summit-2026/',
    attendees: '2,000+',
    icon: 'shield',
  },
  {
    name: 'ITWeb Data Insights Summit 2026',
    focus: 'Technology',
    date: 'Feb 12-13, 2026',
    location: 'The Forum, Bryanston, Johannesburg',
    country: 'South Africa',
    description: '"Insight to Impact: Powering the Data-Driven Enterprise." Africa\'s most influential data, analytics and AI leaders explore how intelligent enterprises are built.',
    website: 'https://www.itweb.co.za/event/itweb-data-insights-summit-2026/',
    attendees: '500+',
    icon: 'bar-chart',
  },
  {
    name: 'Chartered CIO Conference 2026',
    focus: 'Technology',
    date: 'Jun 11, 2026',
    location: 'Montecasino, Fourways, Johannesburg',
    country: 'South Africa',
    description: '"Resilient. Intelligent. Inclusive: Shaping South Africa\'s digital future." Inaugural Chartered CIO Council conference for senior technology executives.',
    website: 'https://www.itweb.co.za/events/',
    attendees: '300+',
    icon: 'monitor',
  },
  {
    name: 'SACAIR 2026',
    focus: 'AI',
    date: 'TBA 2026',
    location: 'KwaZulu-Natal',
    country: 'South Africa',
    description: 'Southern African Conference for Artificial Intelligence Research. Premier academic multi-disciplinary AI conference bringing together researchers from Computer Science, Mathematics, Physics and more.',
    website: 'https://sacair.org.za',
    attendees: '300+',
    icon: 'cpu',
  },
  {
    name: 'Connected Africa 2026',
    focus: 'Technology',
    date: 'Jul 9, 2026',
    location: 'Johannesburg',
    country: 'South Africa',
    description: 'Building a connected global economy through telecoms, IoT, digital transformation and smart connectivity solutions.',
    website: 'https://connected-africa.com',
    attendees: '1,000+',
    icon: 'wifi',
  },
  {
    name: 'Converge Africa 2026',
    focus: 'Technology',
    date: 'May 4-6, 2026',
    location: 'CTICC 1, Cape Town',
    country: 'South Africa',
    description: "Africa's premier digital commerce event by VUKA Group. Connecting leaders in eCommerce, payments, fintech, digital marketing, logistics and fulfilment to unlock Africa's $75 billion digital economy.",
    website: 'https://wearevuka.com/retail/converge-africa/',
    attendees: '3,000+',
    icon: 'shopping-cart',
  },
  {
    name: 'MyBroadband Cloud & Security Conference 2026',
    focus: 'Technology',
    date: 'TBA 2026',
    location: 'Melrose Arch, Johannesburg',
    country: 'South Africa',
    description: "South Africa's premier cloud computing, virtualization, data centres, AI and cybersecurity event.",
    website: 'https://cloudconference.co.za',
    attendees: '500+',
    icon: 'cloud',
  },

  // --- CYBERSECURITY ---
  {
    name: 'Cyber Security Summit South Africa 2026',
    focus: 'Technology',
    date: 'Mar 12, 2026',
    location: 'Indaba Hotel, Johannesburg',
    country: 'South Africa',
    description: "South Africa's premier cybersecurity forum. 200+ C-level executives exploring AI, cloud security, blockchain and IoT security strategies.",
    website: 'https://exito-e.com/cybersecuritysummit/south-africa/',
    attendees: '200+',
    icon: 'shield',
  },
  {
    name: 'Cyber Security Compliance Conference 2026',
    focus: 'Technology',
    date: 'Apr 21-22, 2026',
    location: 'Indaba Hotel, Johannesburg',
    country: 'South Africa',
    description: 'Two-day event for CISOs, CIOs and risk leaders on cyber compliance, AI-driven threats and governance frameworks.',
    website: 'https://www.tci-sa.co.za/cyber-security-conference-2026/',
    attendees: '100+',
    icon: 'lock',
  },
  {
    name: 'CYSEC Africa 2026',
    focus: 'Technology',
    date: 'Feb 26, 2026',
    location: 'Gallagher Convention Centre, Johannesburg',
    country: 'South Africa',
    description: "19th edition of Africa's leading cybersecurity leadership platform. 250+ executives addressing Africa's evolving threat landscape.",
    website: 'https://globalriskcommunity.com',
    attendees: '250+',
    icon: 'alert-triangle',
  },

  // --- INVESTMENT ---
  {
    name: 'South Africa Investment Conference 2026',
    focus: 'Investment',
    date: 'TBA 2026',
    location: 'Johannesburg',
    country: 'South Africa',
    description: "Part of President Ramaphosa's investment drive to attract R1.2 trillion. Connecting local and global investors across mining, manufacturing, agriculture and digital economy.",
    website: 'https://stateofthenation.gov.za/page/investment-conference',
    attendees: '1,500+',
    icon: 'dollar-sign',
  },
  {
    name: 'SuperReturn Africa 2026',
    focus: 'Investment',
    date: 'Dec 2-4, 2026',
    location: 'The Westin, Cape Town',
    country: 'South Africa',
    description: "Africa's biggest private capital conference. 200+ LPs with $1.5trn in AUM, 350+ GPs. Covers private equity, credit, infrastructure, AI and tech.",
    website: 'https://informaconnect.com/superreturn-africa/',
    attendees: '1,200+',
    icon: 'bar-chart-2',
  },
  {
    name: 'SAVCA Private Equity & VC Conference 2026',
    focus: 'Investment',
    date: 'Mar 10-11, 2026',
    location: 'Cape Town',
    country: 'South Africa',
    description: 'Southern African Venture Capital Association conference connecting LPs, GPs, and venture capitalists across infrastructure, consumer and fintech.',
    website: 'https://savca.co.za',
    attendees: '800+',
    icon: 'pie-chart',
  },
  {
    name: 'SA REIT Conference 2026',
    focus: 'Investment',
    date: 'Feb 12, 2026',
    location: 'Houghton Hotel, Johannesburg',
    country: 'South Africa',
    description: "SA REIT Association's flagship biennial conference for listed property experts, investors, policymakers and analysts.",
    website: 'https://www.mrisoftware.com/za/event/sa-reit-conference-2026/',
    attendees: '500+',
    icon: 'home',
  },
  {
    name: 'Africa Property Investment Summit 2026',
    focus: 'Investment',
    date: 'Sep 17-18, 2026',
    location: 'The Westin, Cape Town',
    country: 'South Africa',
    description: 'Dedicated to real estate investment, development and management in Africa. Covers financing, legal, infrastructure and future trends.',
    website: 'https://www.clocate.com/africa-property-investment-api-summit/54428/',
    attendees: '400+',
    icon: 'map-pin',
  },
  {
    name: 'Cape Town VC Summit 2026',
    focus: 'Investment',
    date: 'May 7-8, 2026',
    location: 'Cape Town',
    country: 'South Africa',
    description: 'Connecting venture capital investors, fund managers and startups seeking growth capital in the Western Cape.',
    website: 'https://startupmapafrica.com/events',
    attendees: '500+',
    icon: 'pie-chart',
  },

  // --- FINTECH ---
  {
    name: 'FinTech Summit Africa 2026',
    focus: 'Technology',
    date: 'Jun 24-25, 2026',
    location: 'Sandton, Johannesburg',
    country: 'South Africa',
    description: "6th Annual FinTech Summit exploring agentic AI, digital identity, embedded finance, open banking and real-time payments for Africa's digital future.",
    website: 'https://fintechsummit.co.za',
    attendees: '1,000+',
    icon: 'credit-card',
  },
  {
    name: 'Africa Payments & RegTech Forum 2026',
    focus: 'Technology',
    date: 'Feb 12, 2026',
    location: 'Hilton Sandton, Johannesburg',
    country: 'South Africa',
    description: 'Premier event for payment innovations, regulatory compliance and financial inclusion in Africa.',
    website: 'https://fintechnews.africa',
    attendees: '500+',
    icon: 'repeat',
  },
  {
    name: 'Seamless Africa 2026',
    focus: 'Technology',
    date: 'Sep 8-9, 2026',
    location: 'Johannesburg',
    country: 'South Africa',
    description: "Leading platform for payments, digital commerce and banking innovation across Africa's financial ecosystem.",
    website: 'https://seamlessafrica.com',
    attendees: '2,000+',
    icon: 'layers',
  },
  {
    name: 'BFSI Innovation & Technology Summit SA 2026',
    focus: 'Technology',
    date: 'Jun 10, 2026',
    location: 'Focus Rooms, Johannesburg',
    country: 'South Africa',
    description: "36th edition for South Africa's banking and financial services IT leaders exploring digital banking, financial inclusion and data privacy.",
    website: 'https://bfsiitsummit.com/south-africa/',
    attendees: '200+',
    icon: 'database',
  },
  {
    name: 'Blockchain Africa Conference 2026',
    focus: 'Technology',
    date: 'TBA 2026',
    location: 'Gauteng',
    country: 'South Africa',
    description: "12th edition of Africa's premier blockchain and cryptocurrency conference. 10,900+ attendees from 165 countries since inception.",
    website: 'https://blockchainafrica.co',
    attendees: '1,500+',
    icon: 'link-2',
  },

  // --- INFRASTRUCTURE ---
  {
    name: 'Infrastructure Africa 2026',
    focus: 'Infrastructure',
    date: 'Mar 2-3, 2026',
    location: 'Cape Town, CTICC',
    country: 'South Africa',
    description: 'Alongside Africa Energy Indaba. Connecting policymakers, project owners, financiers, developers, DFIs and EPCs moving infrastructure projects from pipeline to execution.',
    website: 'https://www.infrastructure-africa.com',
    attendees: '1,000+',
    icon: 'tool',
  },
  {
    name: 'Big 5 Construct South Africa 2026',
    focus: 'Infrastructure',
    date: 'Jun 9-11, 2026',
    location: 'Gallagher Convention Centre, Johannesburg',
    country: 'South Africa',
    description: "Southern Africa's leading construction and infrastructure expo. 9,000+ attendees, 250+ exhibitors from 20+ countries. Halls 4, 5 and outdoor area.",
    website: 'https://www.big5constructsouthafrica.com',
    attendees: '9,000+',
    icon: 'tool',
  },
  {
    name: 'South Africa Infrastructure Expo & Summit 2026',
    focus: 'Infrastructure',
    date: 'Jun 9, 2026',
    location: 'Gallagher Convention Centre, Johannesburg',
    country: 'South Africa',
    description: 'CPD-certified summit on infrastructure financing, transport reform, digital transformation, energy resilience and localization. Co-located with Big 5 Construct.',
    website: 'https://www.southafricainfrastructureexpo.com',
    attendees: '2,000+',
    icon: 'layers',
  },
  {
    name: 'Reside Conference & Expo 2026',
    focus: 'Infrastructure',
    date: 'May 20-21, 2026',
    location: 'Sandton Convention Centre, Johannesburg',
    country: 'South Africa',
    description: "South Africa's only multisector residential investment and development event covering affordable, social, student and multi-family housing.",
    website: 'https://resideconference.co.za',
    attendees: '800+',
    icon: 'home',
  },

  // --- ENERGY & MINING ---
  {
    name: 'Africa Energy Indaba 2026',
    focus: 'Infrastructure',
    date: 'Mar 3-5, 2026',
    location: 'Cape Town, CTICC',
    country: 'South Africa',
    description: "18th edition. Africa's flagship energy event with 100+ exhibitors. Endorsed by SA Minister of Electricity and Energy. Covers renewables, grid modernisation, EVs, IPPs, PPAs and just transition.",
    website: 'https://africaenergyindaba.com',
    attendees: '5,000+',
    icon: 'zap',
  },
  {
    name: 'Enlit Africa & Water Security Africa 2026',
    focus: 'Infrastructure',
    date: 'May 19-21, 2026',
    location: 'Cape Town, CTICC',
    country: 'South Africa',
    description: "Africa's leading power, energy and water event by VUKA Group. 250+ exhibitors, 180+ speakers. Grid modernisation, smart water, distributed energy and climate-aligned development.",
    website: 'https://wearevuka.com/energy/enlit-africa/',
    attendees: '5,000+',
    icon: 'battery-charging',
  },
  {
    name: 'Solar Power Africa 2026',
    focus: 'Infrastructure',
    date: 'Mar 25-27, 2026',
    location: 'Gallagher Convention Centre, Johannesburg',
    country: 'South Africa',
    description: 'Advancing clean energy in Africa with the full value chain for solar PV and storage industries for private and public sectors.',
    website: 'https://solarpowerafrica.za.messefrankfurt.com',
    attendees: '3,000+',
    icon: 'sun',
    delegateInfo: {
      delegateFee: 'From R2,500',
      delegateTypes: ['Full Conference', 'Exhibition Only', 'Workshop Pass', 'Virtual'],
      includes: ['Conference sessions', 'Exhibition access', 'Networking sessions', 'Workshop materials'],
    },
  },
  {
    name: 'African Energy Week 2026',
    focus: 'Infrastructure',
    date: 'Oct 12-16, 2026',
    location: 'CTICC, Cape Town',
    country: 'South Africa',
    description: '"Invest in African Energies: Positioning Africa as the Global Energy Champion." 6,800+ delegates, 100+ ministerial delegations, 60+ countries. Africa\'s most consequential energy platform.',
    website: 'https://aecweek.com',
    attendees: '6,800+',
    icon: 'battery-charging',
  },
  {
    name: 'African Mining Week 2026',
    focus: 'Investment',
    date: 'Oct 14-16, 2026',
    location: 'CTICC, Cape Town',
    country: 'South Africa',
    description: '"Mining the Future: Critical Resources, Sustainability and Community Development." 2,000+ attendees from 30+ countries, 90+ speakers, 350+ companies.',
    website: 'https://african-miningweek.com',
    attendees: '2,000+',
    icon: 'layers',
  },
  {
    name: 'Electra Mining Africa 2026',
    focus: 'Technology',
    date: 'Sep 7-11, 2026',
    location: 'Johannesburg Expo Centre',
    country: 'South Africa',
    description: 'Largest trade show in Southern Africa and top 3 global mining exhibitions. Mining, electrical, automation, manufacturing, power and transport.',
    website: 'https://exhibit.electramining.co.za',
    attendees: '30,000+',
    icon: 'truck',
  },
  {
    name: 'IMPC 2026 - International Mineral Processing Congress',
    focus: 'Technology',
    date: 'Oct 18-22, 2026',
    location: 'Cape Town',
    country: 'South Africa',
    description: 'Global mineral processing congress bringing together international companies, thought leaders, institutions and academics.',
    website: 'https://impc2026.com',
    attendees: '2,000+',
    icon: 'hexagon',
  },
  {
    name: 'Mining Indaba 2026',
    focus: 'Investment',
    date: 'Feb 2-5, 2026',
    location: 'Cape Town',
    country: 'South Africa',
    description: "Record-breaking 32nd edition. 10,500+ delegates, 1,450+ mining execs, 1,300+ global investors, 625 speakers. Africa's largest mining conference.",
    website: 'https://miningindaba.com',
    attendees: '10,500+',
    icon: 'target',
    delegateInfo: {
      delegateFee: 'From $1,895',
      earlyBirdDeadline: 'Nov 30, 2025',
      delegateTypes: ['Delegate', 'Investor', 'Mining Company', 'Government'],
      includes: ['4-day conference access', 'Investor meetings', 'Networking functions', 'Exhibition access'],
    },
  },

  // --- ENTREPRENEURSHIP ---
  {
    name: 'Proudly Buy Local Summit',
    focus: 'Entrepreneurship',
    date: 'Mar 16-17, 2026',
    location: 'Durban ICC, Durban',
    country: 'South Africa',
    description: 'Championing local businesses and products. Connecting entrepreneurs, retailers and consumers to strengthen South Africa\'s local economy and promote proudly South African goods and services.',
    website: 'https://proudlysa.co.za',
    attendees: '1,500+',
    icon: 'shopping-cart',
  },
  {
    name: 'Durban Business Fair',
    focus: 'Entrepreneurship',
    date: 'Apr 30, 2026',
    location: 'Durban ICC, Durban',
    country: 'South Africa',
    description: 'KwaZulu-Natal\'s premier business expo connecting SMMEs, entrepreneurs and investors. Showcasing local talent, networking opportunities and business development resources for the Durban metro economy.',
    website: 'https://durbanbusinessfair.co.za',
    attendees: '2,000+',
    icon: 'shopping-bag',
  },
  {
    name: 'Cape Town Business Summit & Expo 2026',
    focus: 'Entrepreneurship',
    date: 'Jun 3, 2026',
    location: 'Cape Town, CTICC',
    country: 'South Africa',
    description: 'Gathering of entrepreneurs, investors, business leaders and innovators. From fintech to short-term insurance, featuring business banking and mobile solutions.',
    website: 'https://capetownbusinesssummit.co.za',
    attendees: '2,000+',
    icon: 'briefcase',
  },
  {
    name: 'FASA Conference & Expo 2026',
    focus: 'Entrepreneurship',
    date: 'Feb 19, 2026',
    location: 'Birchwood Hotel, Boksburg',
    country: 'South Africa',
    description: 'Franchise Association of South Africa conference themed "Building the South African Economy through Franchising." Franchising contributes 15% to GDP.',
    website: 'https://bizmag.co.za/fasa-2026-conference-and-expo/',
    attendees: '1,000+',
    icon: 'shopping-bag',
  },
  {
    name: 'ICED 2026 - Entrepreneurship & Development',
    focus: 'Entrepreneurship',
    date: 'Jun 28-30, 2026',
    location: 'Durban University of Technology, Durban',
    country: 'South Africa',
    description: 'International Conference on Entrepreneurship and Development exploring AI, blockchain, fintech and inclusive entrepreneurial ecosystems.',
    website: 'https://www.cut.ac.za/events/details/277',
    attendees: '500+',
    icon: 'users',
  },
  {
    name: 'Triga Entrepreneurs Conference 2026',
    focus: 'Entrepreneurship',
    date: 'Oct 31, 2026',
    location: 'Franschhoek, Western Cape',
    country: 'South Africa',
    description: 'Industry-leading speakers equipping entrepreneurs to establish and scale ventures with societal and cultural impact in Africa.',
    website: 'https://trigaventures.org/entrepreneurs-conference/',
    attendees: '300+',
    icon: 'award',
  },

  // --- HEALTHCARE ---
  {
    name: 'World Health Expo Johannesburg 2026',
    focus: 'Technology',
    date: 'Oct 6-8, 2026',
    location: 'Gallagher Convention Centre, Johannesburg',
    country: 'South Africa',
    description: "Formerly Africa Health. Africa's premier healthcare platform with 8,000+ attendees, 600+ exhibitors from 60+ countries. 20+ conferences covering health innovation.",
    website: 'https://www.worldhealthexpo.com/events/healthcare/johannesburg/',
    attendees: '8,000+',
    icon: 'heart',
  },
  {
    name: 'Healthcare Innovation Summit Africa 2026',
    focus: 'Technology',
    date: 'May 28, 2026',
    location: 'Johannesburg',
    country: 'South Africa',
    description: 'Conference focused on healthtech innovation, digital health, telemedicine and AI-driven healthcare solutions for Africa.',
    website: 'https://startupmapafrica.com/events',
    attendees: '500+',
    icon: 'activity',
  },

  // --- AGRICULTURE ---
  {
    name: 'Agbiz Congress 2026',
    focus: 'Entrepreneurship',
    date: 'Jun 3-5, 2026',
    location: 'Boardwalk International Convention Centre, Gqeberha',
    country: 'South Africa',
    description: '"Sustaining Growth in a Changing Global Landscape." Major food, feed, fibre and wine sector event. 350+ delegates from agribusiness, government and academia.',
    website: 'https://agbizcongress.co.za',
    attendees: '350+',
    icon: 'sun',
  },
  {
    name: 'Urban Agri World Summit 2026',
    focus: 'Technology',
    date: 'Oct 21-23, 2026',
    location: 'KwaZulu-Natal',
    country: 'South Africa',
    description: '7th edition exploring AI-driven precision farming, vertical farming and climate-smart food tech for urban resilience.',
    website: 'https://urbanagrisummit.magentaglobalevents.com',
    attendees: '500+',
    icon: 'trending-up',
  },
  {
    name: 'Agri-Data Revolution Summit 2026',
    focus: 'Technology',
    date: 'Mar 17-18, 2026',
    location: 'Johannesburg',
    country: 'South Africa',
    description: 'Empowering fresh produce sector through data, AI, predictive analytics and innovation for market forecasting.',
    website: 'https://www.agbiz.co.za',
    attendees: '200+',
    icon: 'bar-chart',
  },

  // --- WATER ---
  {
    name: 'SWAN Cape Town 2026 Workshop',
    focus: 'Infrastructure',
    date: 'Mar 9-11, 2026',
    location: 'CTICC 2, Cape Town',
    country: 'South Africa',
    description: '"Shaping Africa\'s Smart Water Future." Digital transformation across Africa\'s water sector. 20 utility speakers, de-risking smart water financing, Cape Town study tour.',
    website: 'https://swan-forum.com/events/2nd-swan-cape-town-workshop/',
    attendees: '300+',
    icon: 'droplet',
  },

  // --- GREEN ECONOMY ---
  {
    name: "Africa's Green Economy Summit 2026",
    focus: 'Infrastructure',
    date: 'Feb 25-26, 2026',
    location: 'Century City Convention Centre, Cape Town',
    country: 'South Africa',
    description: '"From Ambition to Action: Scaling Investment in Africa\'s Green and Blue Solutions." Climate investment, green entrepreneurs and blue economy solutions by VUKA Group.',
    website: 'https://wearevuka.com/green-economy/ages/',
    attendees: '1,000+',
    icon: 'sun',
  },

  // --- MORE SOUTH AFRICA ---
  {
    name: 'Smarter Mobility Africa 2026',
    focus: 'Technology',
    date: 'TBA 2026',
    location: 'Cape Town',
    country: 'South Africa',
    description: "Africa's mobility summit by VUKA Group exploring electric vehicles, ride-hailing, logistics tech and urban transport innovation.",
    website: 'https://wearevuka.com/mobility/smarter-mobility-africa/',
    attendees: '500+',
    icon: 'truck',
  },
  {
    name: 'Africa Agri Expo 2026',
    focus: 'Entrepreneurship',
    date: 'TBA 2026',
    location: 'Johannesburg',
    country: 'South Africa',
    description: 'Showcasing agricultural innovation, agritech startups and investment opportunities across the African agri value chain.',
    website: 'https://startupmapafrica.com/events',
    attendees: '1,000+',
    icon: 'sun',
  },
  {
    name: 'Africa PPP 2026',
    focus: 'Infrastructure',
    date: 'TBA 2026',
    location: 'South Africa',
    country: 'South Africa',
    description: '16th edition promoting viable public-private partnerships. Focuses on industrialisation, water, transport, climate and energy access.',
    website: 'https://africappp.com',
    attendees: '500+',
    icon: 'git-merge',
  },
  {
    name: 'South Africa Manufacturing IT Summit 2026',
    focus: 'Technology',
    date: 'TBA 2026',
    location: 'Johannesburg',
    country: 'South Africa',
    description: '150+ C-Level executives discussing AI, IoT, cybersecurity and 4IR technologies in manufacturing.',
    website: 'https://manufacturingitsummit.com/south-africa/',
    attendees: '150+',
    icon: 'settings',
  },
];

// ==========================================
// REST OF AFRICA CONFERENCES (55+)
// ==========================================
export const AFRICA_CONFERENCES: Conference[] = [
  // --- KENYA ---
  {
    name: 'Africa Tech Summit Nairobi 2026',
    focus: 'Technology',
    date: 'Feb 11-12, 2026',
    location: 'Sarit Expo Centre, Nairobi',
    country: 'Kenya',
    description: '8th edition connecting tech leaders across Africa Money, AI & Digital, Climate Tech and Startup tracks. 2,000+ delegates, 1,000+ companies.',
    website: 'https://www.africatechsummit.com/nairobi/',
    attendees: '2,000+',
    icon: 'globe',
  },
  {
    name: 'AI Everything Kenya x GITEX Kenya 2026',
    focus: 'AI',
    date: 'May 19-21, 2026',
    location: 'KICC, Nairobi',
    country: 'Kenya',
    description: "Africa's largest public-private AI event. 75+ countries, 500+ AI enterprises & startups, 100+ global investors, 15,000+ tech executives.",
    website: 'https://www.aieverythingkenya.com',
    attendees: '15,000+',
    icon: 'cpu',
  },
  {
    name: 'Sankalp Africa Summit 2026',
    focus: 'Investment',
    date: 'Feb 25-26, 2026',
    location: 'Sarit Expo Centre, Nairobi',
    country: 'Kenya',
    description: '13th edition marketplace for ideas, capital and impact-first entrepreneurship. 1,000+ delegates, 400+ startups, 200+ investors from 50+ countries.',
    website: 'https://www.sankalpforum.com',
    attendees: '1,000+',
    icon: 'target',
  },
  {
    name: 'AVCA Annual Conference & VC Summit 2026',
    focus: 'Investment',
    date: 'Apr 1, 2026',
    location: 'Nairobi',
    country: 'Kenya',
    description: 'African Venture Capital Association annual conference connecting VCs, LPs and GPs across the African private capital ecosystem.',
    website: 'https://www.avca-africa.org',
    attendees: '800+',
    icon: 'trending-up',
  },
  {
    name: 'Africa Fintech Live 2026',
    focus: 'Technology',
    date: 'May 7, 2026',
    location: 'Sarit Expo Centre, Nairobi',
    country: 'Kenya',
    description: 'Part of Africa Tech Series by Eventhive. Convening fintech leaders from payments, telecoms, banking, e-commerce and digital economy. 3rd edition.',
    website: 'https://thecondia.com/partners/africa-fintech-live-2026-nairobi/',
    attendees: '1,500+',
    icon: 'credit-card',
  },
  {
    name: 'Kenya International Investment Conference 2026',
    focus: 'Investment',
    date: 'Mar 25-27, 2026',
    location: 'Nairobi',
    country: 'Kenya',
    description: "Kenya's flagship investment conference (KIICO). Three days featuring KIICO 2026, 2nd COMESA Investment Forum and Africa Green Industrialization Initiative Forum.",
    website: 'https://www.investafrica.com/upcoming-events',
    attendees: '1,500+',
    icon: 'dollar-sign',
  },
  {
    name: 'KPMG Africa Private Enterprise Venture Summit 2026',
    focus: 'Entrepreneurship',
    date: 'May 19-22, 2026',
    location: 'Nairobi',
    country: 'Kenya',
    description: '3rd edition. 50+ speakers, 250+ attendees. Startups, SMEs, policymakers, VCs, PE funds, family businesses and ecosystem players.',
    website: 'https://kpmg.com/ke/en/insights/2026/05/2026-kpmg-africa-private-enterprise-venture-summit.html',
    attendees: '250+',
    icon: 'briefcase',
  },
  {
    name: 'East African Business & Investment Summit 2026',
    focus: 'Investment',
    date: 'Feb 24-25, 2026',
    location: 'Nairobi',
    country: 'Kenya',
    description: '"Promoting Private Sector Driven Regional Integration for Increased Intra and Extra EAC Trade and Investment." By EABC in partnership with EAC.',
    website: 'https://eabc-online.com/businesssummit2026/',
    attendees: '500+',
    icon: 'globe',
  },
  {
    name: 'Seamless East Africa 2026',
    focus: 'Technology',
    date: 'Jul 7-8, 2026',
    location: 'Nairobi',
    country: 'Kenya',
    description: "The future of fintech and digital payments in East Africa's rapidly growing ecosystem.",
    website: 'https://seamlesseastafrica.com',
    attendees: '2,000+',
    icon: 'repeat',
  },
  {
    name: 'Big 5 Construct Kenya 2026',
    focus: 'Infrastructure',
    date: 'TBA 2026',
    location: 'Nairobi',
    country: 'Kenya',
    description: "Kenya's leading construction industry event connecting the East African infrastructure ecosystem.",
    website: 'https://www.big5constructkenya.com',
    attendees: '3,000+',
    icon: 'tool',
  },
  {
    name: 'Africa Climate Tech Summit 2026',
    focus: 'Technology',
    date: 'Feb 11-12, 2026',
    location: 'Nairobi',
    country: 'Kenya',
    description: 'Part of Africa Tech Summit, focused on climate technology investment and scaling sustainable solutions across Africa.',
    website: 'https://www.africatechsummit.com/nairobi/',
    attendees: '1,000+',
    icon: 'cloud',
  },
  {
    name: 'Africa Startup Summit 2026',
    focus: 'Entrepreneurship',
    date: 'Feb 11-12, 2026',
    location: 'Nairobi',
    country: 'Kenya',
    description: 'Part of Africa Tech Summit connecting high-growth startups with investors, mentors and ecosystem partners.',
    website: 'https://www.africatechsummit.com/nairobi/',
    attendees: '500+',
    icon: 'star',
  },

  // --- MOROCCO ---
  {
    name: 'GITEX Africa 2026',
    focus: 'Technology',
    date: 'Apr 7-9, 2026',
    location: 'Marrakech',
    country: 'Morocco',
    description: "Africa's largest tech & startup show. 55,000+ attendees, 1,500+ exhibitors, 700+ speakers, 145 countries, 390+ investors managing $350Bn+ in assets.",
    website: 'https://gitexafrica.com',
    attendees: '55,000+',
    icon: 'globe',
    delegateInfo: {
      delegateFee: 'From $295',
      earlyBirdDeadline: 'Feb 28, 2026',
      delegateTypes: ['Visitor Pass', 'Conference Pass', 'VIP Pass', 'Startup Pass', 'Exhibitor'],
      includes: ['Exhibition access', 'Conference sessions', 'Networking events', 'AI demos & showcases'],
    },
  },
  {
    name: 'GITEX Future Health Africa 2026',
    focus: 'Technology',
    date: 'May 4, 2026',
    location: 'Casablanca',
    country: 'Morocco',
    description: 'Healthtech expo exploring digital health, telemedicine, AI-driven diagnostics and health system innovation.',
    website: 'https://gitexafrica.com',
    attendees: '3,000+',
    icon: 'heart',
  },
  {
    name: 'Seamless North Africa 2026',
    focus: 'Technology',
    date: 'Apr 6-7, 2026',
    location: 'Morocco',
    country: 'Morocco',
    description: "North Africa's leading platform for fintech, payments and digital commerce innovation.",
    website: 'https://seamlessnorthafrica.com',
    attendees: '2,000+',
    icon: 'layers',
  },

  // --- NIGERIA ---
  {
    name: 'Lagos Tech Fest 2026',
    focus: 'Technology',
    date: 'Feb 17, 2026',
    location: 'Lagos',
    country: 'Nigeria',
    description: 'Major tech conference connecting innovators, investors and ecosystem builders across West Africa.',
    website: 'https://startupmapafrica.com/events',
    attendees: '3,000+',
    icon: 'zap',
  },
  {
    name: 'West Africa Infrastructure Expo 2026',
    focus: 'Infrastructure',
    date: 'Apr 7-9, 2026',
    location: 'Landmark Centre, Lagos',
    country: 'Nigeria',
    description: "Advancing infrastructure development in West Africa's $668 billion market. 2,000+ targeted attendees, 50+ exhibitors.",
    website: 'https://www.westafricainfrastructureexpo.com',
    attendees: '2,000+',
    icon: 'tool',
  },
  {
    name: 'Big 5 Construct Nigeria 2026',
    focus: 'Infrastructure',
    date: 'TBA 2026',
    location: 'Lagos',
    country: 'Nigeria',
    description: 'Major construction expo connecting contractors, developers, architects and infrastructure professionals in West Africa.',
    website: 'https://www.big5constructnigeria.com',
    attendees: '5,000+',
    icon: 'tool',
  },
  {
    name: 'RegTech Africa Conference (RACE) 2026',
    focus: 'Technology',
    date: 'May 20-22, 2026',
    location: 'Abuja',
    country: 'Nigeria',
    description: '"Building Trust, Infrastructure, Inclusion and Policy for a Borderless Economy." Hosted by the Office of the Vice President in partnership with GIABA.',
    website: 'https://blueprint.ng',
    attendees: '2,000+',
    icon: 'shield',
  },
  {
    name: 'AeroWest Annual Conference 2026',
    focus: 'Infrastructure',
    date: 'Sep 2-4, 2026',
    location: 'Lagos',
    country: 'Nigeria',
    description: 'Premier aviation conference & exhibition for West & Central Africa. Region projected to exceed 110 million air passengers by 2040.',
    website: 'https://www.aerowestafrica.com',
    attendees: '500+',
    icon: 'navigation',
  },
  {
    name: 'Nigeria FinTech Week 2026',
    focus: 'Technology',
    date: 'TBA 2026',
    location: 'Lagos',
    country: 'Nigeria',
    description: 'Week-long series of events focused on digital finance, payments innovation and blockchain in Nigeria.',
    website: 'https://fintechnews.africa',
    attendees: '2,000+',
    icon: 'credit-card',
  },

  // --- RWANDA ---
  {
    name: 'Inclusive FinTech Forum 2026',
    focus: 'Investment',
    date: 'Mar 10-12, 2026',
    location: 'Kigali Convention Centre',
    country: 'Rwanda',
    description: '3,000+ global leaders advancing inclusive finance. Hosted with Kigali International Financial Centre and National Bank of Rwanda. Focus on AI-powered inclusion, digital currency corridors and climate fintech.',
    website: 'https://iff.kigaliinternationalfinancialcentre.com',
    attendees: '3,000+',
    icon: 'users',
  },
  {
    name: 'Africa CEO Forum 2026',
    focus: 'Entrepreneurship',
    date: 'May 14, 2026',
    location: 'Kigali',
    country: 'Rwanda',
    description: "Premier gathering of Africa's top CEOs, business leaders, investors and government officials shaping the continent's economic future.",
    website: 'https://www.theafricaceoforum.com',
    attendees: '2,000+',
    icon: 'award',
  },
  {
    name: 'Africa Fintech Summit Kigali 2026',
    focus: 'Technology',
    date: 'Nov 19-20, 2026',
    location: 'Kigali Convention Center',
    country: 'Rwanda',
    description: "African edition of AFTS convening fintech leaders exploring Africa's fintech opportunities in financial services, mobile money and DeFi.",
    website: 'https://africafintechsummit.com',
    attendees: '500+',
    icon: 'smartphone',
  },
  {
    name: 'Transform Africa Summit 2026',
    focus: 'Technology',
    date: 'TBA 2026',
    location: 'Kigali',
    country: 'Rwanda',
    description: "Africa's premier digital transformation summit organized by Smart Africa Alliance connecting governments, private sector and tech innovators.",
    website: 'https://transformafricasummit.org',
    attendees: '3,000+',
    icon: 'globe',
  },

  // --- ETHIOPIA ---
  {
    name: 'Africa Business Forum 2026',
    focus: 'Investment',
    date: 'Feb 16-17, 2026',
    location: 'Addis Ababa',
    country: 'Ethiopia',
    description: 'UN Economic Commission for Africa forum themed "Financing the Future of Africa: Jobs and Innovation for Sustainable Transformation."',
    website: 'http://www.uneca.org/eca-events/africa-business-forum-2026',
    attendees: '1,500+',
    icon: 'briefcase',
  },
  {
    name: 'East Africa Infrastructure Expo 2026',
    focus: 'Infrastructure',
    date: 'Apr 23-25, 2026',
    location: 'Addis Ababa',
    country: 'Ethiopia',
    description: 'Showcasing infrastructure solutions for East Africa including digital infrastructure, power, water and urban connectivity.',
    website: 'https://www.eastafricainfrastructureexpo.com',
    attendees: '2,000+',
    icon: 'tool',
  },
  {
    name: 'Big 5 Construct Ethiopia 2026',
    focus: 'Infrastructure',
    date: 'TBA 2026',
    location: 'Addis Ababa',
    country: 'Ethiopia',
    description: "East Africa's leading construction industry event connecting developers, architects and infrastructure professionals.",
    website: 'https://www.big5constructethiopia.com',
    attendees: '3,000+',
    icon: 'tool',
  },

  // --- EGYPT ---
  {
    name: 'AI Everything Middle East & Africa Egypt 2026',
    focus: 'AI',
    date: 'Feb 11-12, 2026',
    location: 'Egypt International Exhibition Center, Cairo',
    country: 'Egypt',
    description: "Region's first dedicated all-AI summit. 350+ global enterprises and startups from 30+ countries. AI projected to add $1.5 trillion to Africa by 2030.",
    website: 'https://thenextafrica.com',
    attendees: '5,000+',
    icon: 'cpu',
  },
  {
    name: 'RiseUp Summit Egypt 2026',
    focus: 'Entrepreneurship',
    date: 'TBA 2026',
    location: 'Cairo',
    country: 'Egypt',
    description: "MENA's largest entrepreneurship and innovation platform connecting startups with investors and corporates.",
    website: 'https://riseupsummit.com',
    attendees: '8,000+',
    icon: 'trending-up',
  },
  {
    name: 'Big 5 Construct Egypt 2026',
    focus: 'Infrastructure',
    date: 'TBA 2026',
    location: 'Cairo',
    country: 'Egypt',
    description: "Egypt's construction and infrastructure development expo connecting the construction value chain.",
    website: 'https://www.big5constructegypt.com',
    attendees: '5,000+',
    icon: 'tool',
  },

  // --- GHANA ---
  {
    name: 'eLearning Africa 2026',
    focus: 'Technology',
    date: 'Jun 3, 2026',
    location: 'Accra',
    country: 'Ghana',
    description: "Africa's largest conference on technology-supported learning and training. Connecting educators, tech leaders and policymakers.",
    website: 'https://www.elearning-africa.com',
    attendees: '2,000+',
    icon: 'book',
  },
  {
    name: 'Digital Assets Summit Africa 2026',
    focus: 'Technology',
    date: 'Sep 29-30, 2026',
    location: 'Kempinski Hotel, Accra',
    country: 'Ghana',
    description: '"From Policy to Prosperity" – in collaboration with Bank of Ghana and SEC. Scaling digital assets for investment, jobs and economic growth.',
    website: 'https://dasummitafrica.com',
    attendees: '500+',
    icon: 'dollar-sign',
  },
  {
    name: 'Pan African AI & Innovation Summit 2026',
    focus: 'AI',
    date: 'TBA 2026',
    location: 'Accra',
    country: 'Ghana',
    description: 'Deep dive into using AI to strengthen healthcare, agriculture and infrastructure across Africa.',
    website: 'https://panafricanaisummit.com',
    attendees: '1,000+',
    icon: 'cpu',
  },
  {
    name: 'AfCFTA Trade & Investment Forum 2026',
    focus: 'Investment',
    date: 'TBA 2026',
    location: 'Accra',
    country: 'Ghana',
    description: 'Forum supporting implementation of the African Continental Free Trade Area connecting a $3.4 trillion market of 1.4 billion people.',
    website: 'https://au-afcfta.org',
    attendees: '2,000+',
    icon: 'globe',
  },

  // --- DRC ---
  {
    name: 'DRC Mining Week 2026',
    focus: 'Investment',
    date: 'Jun 17-19, 2026',
    location: 'Pullman Lubumbashi Grand Karavia Hotel, Lubumbashi',
    country: 'DRC',
    description: '21st edition by VUKA Group. 20 years of connecting the mining community in the DRC. Covers cobalt, copper, lithium, critical minerals and energy.',
    website: 'https://wearevuka.com/mining/drc-mining-week/',
    attendees: '2,000+',
    icon: 'layers',
  },

  // --- COTE D\'IVOIRE ---
  {
    name: 'EU Regional Business Forum - West Africa Corridors 2026',
    focus: 'Infrastructure',
    date: 'Mar 30 - Apr 1, 2026',
    location: 'Sofitel Abidjan',
    country: "Cote d'Ivoire",
    description: "Unlocking investments along West Africa's strategic corridors. 500 participants. Road, rail, maritime transport, urban mobility and trade facilitation. EU Global Gateway strategy.",
    website: 'https://international-partnerships.ec.europa.eu/eu-business-fora/',
    attendees: '500+',
    icon: 'truck',
  },

  // --- UGANDA ---
  {
    name: 'Trans Africa Investment Summit 2026',
    focus: 'Investment',
    date: 'Nov 4-6, 2026',
    location: 'Kampala',
    country: 'Uganda',
    description: '20th anniversary edition focused on renewable energy, entrepreneurship and collaboration between Africa and the Diaspora.',
    website: 'https://investafricasummit.com',
    attendees: '1,000+',
    icon: 'dollar-sign',
  },

  // --- SENEGAL ---
  {
    name: 'Dakar Bitcoin Days III 2026',
    focus: 'Technology',
    date: 'Oct 29-31, 2026',
    location: 'Dakar',
    country: 'Senegal',
    description: 'West Africa Bitcoin and crypto conference bringing together blockchain builders, regulators and investors.',
    website: 'https://dev.events/AF/fintech',
    attendees: '500+',
    icon: 'link',
  },

  // --- BURKINA FASO ---
  {
    name: 'EAI AFRICATEK 2026',
    focus: 'Technology',
    date: 'Jun 25-27, 2026',
    location: 'Ouagadougou',
    country: 'Burkina Faso',
    description: '9th International Conference on Emerging Technologies for Developing Countries. Focused on AI, digital transformation and African startups.',
    website: 'https://africatek.eai-conferences.org/2026/',
    attendees: '300+',
    icon: 'cpu',
  },

  // --- NAMIBIA ---
  {
    name: 'Namibia Investment Conference 2026',
    focus: 'Investment',
    date: 'TBA 2026',
    location: 'Windhoek',
    country: 'Namibia',
    description: 'Promoting investment opportunities in Namibia across mining, tourism, agriculture and technology sectors.',
    website: 'https://nipdb.com',
    attendees: '500+',
    icon: 'dollar-sign',
  },

  // --- BOTSWANA ---
  {
    name: 'Botswana Innovation Hub Summit 2026',
    focus: 'Technology',
    date: 'TBA 2026',
    location: 'Gaborone',
    country: 'Botswana',
    description: "Showcasing Botswana's emerging innovation and tech ecosystem with focus on diversification beyond diamonds.",
    website: 'https://bih.co.bw',
    attendees: '500+',
    icon: 'star',
  },

  // --- ZAMBIA ---
  {
    name: 'Zambia Tech Week 2026',
    focus: 'Technology',
    date: 'TBA 2026',
    location: 'Lusaka',
    country: 'Zambia',
    description: "Celebrating Zambia's growing tech scene with startup showcases, investor meetups and policy dialogues.",
    website: 'https://startupmapafrica.com/events',
    attendees: '500+',
    icon: 'globe',
  },

  // --- MOZAMBIQUE ---
  {
    name: 'Mozambique Gas & Energy Summit 2026',
    focus: 'Infrastructure',
    date: 'TBA 2026',
    location: 'Maputo',
    country: 'Mozambique',
    description: "Exploring Mozambique's massive gas reserves and energy infrastructure development opportunities.",
    website: 'https://startupmapafrica.com/events',
    attendees: '800+',
    icon: 'battery-charging',
  },

  // --- MAURITIUS ---
  {
    name: 'Mauritius FinTech & Innovation Summit 2026',
    focus: 'Technology',
    date: 'TBA 2026',
    location: 'Port Louis',
    country: 'Mauritius',
    description: 'Indian Ocean island fintech hub connecting global fintech innovators with African and Asian markets.',
    website: 'https://startupmapafrica.com/events',
    attendees: '500+',
    icon: 'smartphone',
  },

  // --- TUNISIA ---
  {
    name: 'Tunisia Digital Summit 2026',
    focus: 'Technology',
    date: 'TBA 2026',
    location: 'Tunis',
    country: 'Tunisia',
    description: 'North Africa digital innovation summit connecting Tunisian and international tech ecosystems.',
    website: 'https://tunisiadigitalsummit.com',
    attendees: '1,000+',
    icon: 'monitor',
  },
  {
    name: 'North Africa Startup Summit 2026',
    focus: 'Entrepreneurship',
    date: 'TBA 2026',
    location: 'Tunis',
    country: 'Tunisia',
    description: 'Connecting North African entrepreneurs with investors, accelerators and ecosystem support programs.',
    website: 'https://startupmapafrica.com/events',
    attendees: '500+',
    icon: 'star',
  },

  // --- ANGOLA ---
  {
    name: 'Angola International Mining Conference 2026',
    focus: 'Investment',
    date: 'TBA 2026',
    location: 'Luanda',
    country: 'Angola',
    description: 'Major mining conference by VUKA Group addressing mineral resource opportunities and energy transition in Southern Africa.',
    website: 'https://wearevuka.com/mining/angola-international-mining-conference/',
    attendees: '1,000+',
    icon: 'layers',
  },

  // --- PAN-AFRICAN ---
  {
    name: 'AI for Peace Africa Summit 2026',
    focus: 'AI',
    date: 'Apr 24, 2026',
    location: 'TBA',
    country: 'Pan-African',
    description: 'Advancing AI for peace, governance and resilience in fragile African contexts. Aligned with AU Agenda 2063.',
    website: 'https://aiforpeaceafrica.com/ai-summit',
    attendees: '500+',
    icon: 'shield',
  },
  {
    name: 'Africa Startup & VC Landscape Preview 2026',
    focus: 'Investment',
    date: 'Jan 29, 2026',
    location: 'Virtual (Pan-African)',
    country: 'Pan-African',
    description: 'Agenda-setting virtual forum for VCs, angel investors, LPs, DFIs, family offices, founders and regulators from Africa and MENA.',
    website: 'https://www.nigeriacommunicationsweek.com.ng',
    attendees: '1,000+',
    icon: 'bar-chart-2',
  },
  {
    name: 'AfriLabs Annual Gathering 2026',
    focus: 'Entrepreneurship',
    date: 'TBA 2026',
    location: 'TBA (Pan-African)',
    country: 'Pan-African',
    description: 'Annual gathering of 400+ tech hubs and innovation centres across 52 African countries.',
    website: 'https://afrilabs.com',
    attendees: '1,000+',
    icon: 'grid',
  },
  {
    name: 'African Development Bank Annual Meetings 2026',
    focus: 'Investment',
    date: 'TBA 2026',
    location: 'TBA',
    country: 'Pan-African',
    description: 'Annual meetings of AfDB addressing infrastructure financing, climate adaptation and economic development across Africa.',
    website: 'https://www.afdb.org',
    attendees: '3,000+',
    icon: 'dollar-sign',
  },
  {
    name: 'Africa Investment Forum 2026',
    focus: 'Investment',
    date: 'TBA 2026',
    location: 'TBA',
    country: 'Pan-African',
    description: "AfDB's flagship investment marketplace designed to advance projects to bankable stage and connect to investors.",
    website: 'https://www.africainvestmentforum.com',
    attendees: '2,000+',
    icon: 'trending-up',
  },
  {
    name: 'African Women in Tech Summit 2026',
    focus: 'Entrepreneurship',
    date: 'TBA 2026',
    location: 'TBA (Pan-African)',
    country: 'Pan-African',
    description: 'Empowering women in technology across Africa through mentorship, funding and ecosystem support.',
    website: 'https://startupmapafrica.com/events',
    attendees: '500+',
    icon: 'users',
  },
  {
    name: 'Africa Internet Summit 2026',
    focus: 'Technology',
    date: 'TBA 2026',
    location: 'TBA (Pan-African)',
    country: 'Pan-African',
    description: 'Annual event organized by AFRINIC focusing on internet governance, infrastructure and policy across Africa.',
    website: 'https://internetsummit.africa',
    attendees: '500+',
    icon: 'wifi',
  },

  // --- FROM STARTUP MAP AFRICA EVENTS ---
  {
    name: 'Africa Media Festival 2026',
    focus: 'Entrepreneurship',
    date: 'Feb 25-26, 2026',
    location: 'Nairobi',
    country: 'Kenya',
    description: 'A pan-African gathering for media and creatives to reflect on how media is practised, funded and sustained in Africa.',
    website: 'https://startupmapafrica.com/events',
    attendees: '1,000+',
    icon: 'volume-2',
  },
  {
    name: 'ICT Africa Summit 2026',
    focus: 'Technology',
    date: 'Apr 21-23, 2026',
    location: 'Algiers',
    country: 'Algeria',
    description: 'A major pan-African ICT event bringing together technology leaders, innovators, startups, investors and public sector across the continent.',
    website: 'https://startupmapafrica.com/events',
    attendees: '2,000+',
    icon: 'globe',
  },
  {
    name: 'Africa CEO Forum 2026',
    focus: 'Entrepreneurship',
    date: 'May 14-15, 2026',
    location: 'Kigali',
    country: 'Rwanda',
    description: "Premier gathering of Africa's top CEOs, business leaders, investors and government officials. Driving private sector leadership, investment and entrepreneurship.",
    website: 'https://www.theafricaceoforum.com',
    attendees: '2,000+',
    icon: 'award',
  },
  {
    name: 'RubyConf Africa 2026',
    focus: 'Technology',
    date: 'Aug 21-22, 2026',
    location: 'Nairobi',
    country: 'Kenya',
    description: 'A two-day conference bringing together developers, entrepreneurs and open-source contributors across Africa to learn about Ruby and software engineering.',
    website: 'https://rubyconf.africa',
    attendees: '500+',
    icon: 'code',
  },
  {
    name: 'Africa Startup Festival Kenya 2026',
    focus: 'Entrepreneurship',
    date: 'Oct 29-30, 2026',
    location: 'Nairobi',
    country: 'Kenya',
    description: 'A high-energy festival bringing together African startup founders, venture investors, ecosystem enablers and corporates to network, pitch and collaborate.',
    website: 'https://startupmapafrica.com/events',
    attendees: '2,000+',
    icon: 'send',
  },
  {
    name: 'Africa Cyber Defense Forum 2026',
    focus: 'Technology',
    date: 'Nov 2-5, 2026',
    location: 'Nairobi',
    country: 'Kenya',
    description: 'A forum connecting government CSOs, policy-makers, cyber startups, ethical hackers and investors around cybersecurity, digital defense and capacity building.',
    website: 'https://startupmapafrica.com/events',
    attendees: '1,000+',
    icon: 'shield',
  },
  {
    name: 'AWIEF 2026 (African Women Innovation & Entrepreneurship Forum)',
    focus: 'Entrepreneurship',
    date: 'Nov 5-6, 2026',
    location: 'Lagos',
    country: 'Nigeria',
    description: "Leading pan-African forum advancing women's participation in entrepreneurship. Includes the AWIEF Awards recognizing top women-led startups.",
    website: 'https://awief.org',
    attendees: '1,500+',
    icon: 'users',
  },
  {
    name: 'AfricArena Grand Summit 2026',
    focus: 'Investment',
    date: 'Dec 2-3, 2026',
    location: 'Cape Town',
    country: 'South Africa',
    description: "AfricArena's year-end summit showcases Africa's best startups (50+ finalists) to international investors, following a tour of regional pitch competitions.",
    website: 'https://africarena.com',
    attendees: '1,500+',
    icon: 'trophy',
  },
  {
    name: 'Art of Technology Lagos 2026',
    focus: 'Technology',
    date: 'Dec 4-5, 2026',
    location: 'Lagos',
    country: 'Nigeria',
    description: "Lagos's premier tech event connecting startups, investors and policymakers to drive tech adoption in the city's ecosystem. 8th edition.",
    website: 'https://startupmapafrica.com/events',
    attendees: '1,000+',
    icon: 'aperture',
  },
  {
    name: 'GITEX Nigeria 2027',
    focus: 'Technology',
    date: 'Mar 16-17, 2027',
    location: 'Lagos',
    country: 'Nigeria',
    description: "Debut of GITEX in West Africa – connecting Nigeria's vibrant tech ecosystem with global innovation as part of GITEX's expanding global network.",
    website: 'https://gitexafrica.com',
    attendees: '10,000+',
    icon: 'globe',
  },
  {
    name: 'Africa Tech Summit London 2027',
    focus: 'Investment',
    date: 'May 29, 2027',
    location: 'London, UK',
    country: 'Pan-African',
    description: 'Boutique summit connecting African tech companies with UK and European investors, expanding deal flow beyond the continent.',
    website: 'https://www.africatechsummit.com/london/',
    attendees: '500+',
    icon: 'globe',
  },
  {
    name: 'Africa Early Stage Investor Summit (AESIS) 2027',
    focus: 'Investment',
    date: 'Nov 26-27, 2027',
    location: 'Cape Town',
    country: 'South Africa',
    description: 'Continental investor summit convening early-stage funders and ecosystem leaders to drive startup investment in Africa.',
    website: 'https://startupmapafrica.com/events',
    attendees: '500+',
    icon: 'bar-chart-2',
  },

  // --- GOVTECH ---
  {
    name: 'GovTech South Africa 2025',
    focus: 'Technology',
    date: 'Sep 8-10, 2025',
    location: 'Inkosi Albert Luthuli ICC, Durban',
    country: 'South Africa',
    description: '16th edition of South Africa\'s world-class ICT platform. Theme: "Building a Smart and Inclusive Digital Government." Hosted by SITA and Department of Communications and Digital Technologies. 80+ speakers.',
    website: 'https://www.govtech.gov.za',
    attendees: '3,000+',
    icon: 'flag',
  },
  {
    name: 'GovTech South Africa 2026',
    focus: 'Technology',
    date: 'Sep 21-23, 2026',
    location: 'Durban ICC, Durban',
    country: 'South Africa',
    description: 'South Africa\'s premier government technology conference driving collaboration, innovation and solutions for a digitally transformed, citizen-centric government. Hosted by SITA.',
    website: 'https://www.govtech.gov.za',
    attendees: '3,000+',
    icon: 'flag',
  },
];

// Helper to parse conference date strings into sortable Date values
function parseConferenceDate(dateStr: string): number {
  const monthMap: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };

  // Handle TBA dates - push to end
  if (dateStr.startsWith('TBA')) {
    const yearMatch = dateStr.match(/\d{4}/);
    return yearMatch ? new Date(parseInt(yearMatch[0]), 11, 31).getTime() + 1 : Infinity;
  }

  // Handle "Mar 2026" (month + year only, no day)
  const monthYearOnly = dateStr.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (monthYearOnly && monthMap[monthYearOnly[1]] !== undefined) {
    return new Date(parseInt(monthYearOnly[2]), monthMap[monthYearOnly[1]], 1).getTime();
  }

  // Handle "Mar 30 - Apr 1, 2026" (cross-month ranges)
  const crossMonth = dateStr.match(/^([A-Za-z]+)\s+(\d+)\s*-\s*[A-Za-z]+\s+\d+,\s*(\d{4})$/);
  if (crossMonth && monthMap[crossMonth[1]] !== undefined) {
    return new Date(parseInt(crossMonth[3]), monthMap[crossMonth[1]], parseInt(crossMonth[2])).getTime();
  }

  // Handle "Feb 2-5, 2026" or "Feb 12, 2026" or "Nov 17-19, 2026"
  const standard = dateStr.match(/^([A-Za-z]+)\s+(\d+)(?:-\d+)?,\s*(\d{4})$/);
  if (standard && monthMap[standard[1]] !== undefined) {
    return new Date(parseInt(standard[3]), monthMap[standard[1]], parseInt(standard[2])).getTime();
  }

  // Fallback: push to end
  return Infinity;
}

// Check if a conference is currently live (today falls within its date range)
function isConferenceLive(dateStr: string): boolean {
  if (dateStr.startsWith('TBA')) return false;

  const monthMap: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).getTime();

  // "Feb 2-5, 2026" or "Nov 17-19, 2026" - same month range
  const rangeMatch = dateStr.match(/^([A-Za-z]+)\s+(\d+)-(\d+),\s*(\d{4})$/);
  if (rangeMatch && monthMap[rangeMatch[1]] !== undefined) {
    const startDate = new Date(parseInt(rangeMatch[4]), monthMap[rangeMatch[1]], parseInt(rangeMatch[2]), 0, 0, 0).getTime();
    const endDate = new Date(parseInt(rangeMatch[4]), monthMap[rangeMatch[1]], parseInt(rangeMatch[3]), 23, 59, 59).getTime();
    return todayStart >= startDate && todayEnd <= endDate;
  }

  // "Mar 30 - Apr 1, 2026" cross-month range
  const crossMonth = dateStr.match(/^([A-Za-z]+)\s+(\d+)\s*-\s*([A-Za-z]+)\s+(\d+),\s*(\d{4})$/);
  if (crossMonth && monthMap[crossMonth[1]] !== undefined && monthMap[crossMonth[3]] !== undefined) {
    const startDate = new Date(parseInt(crossMonth[5]), monthMap[crossMonth[1]], parseInt(crossMonth[2]), 0, 0, 0).getTime();
    const endDate = new Date(parseInt(crossMonth[5]), monthMap[crossMonth[3]], parseInt(crossMonth[4]), 23, 59, 59).getTime();
    return todayStart >= startDate && todayEnd <= endDate;
  }

  // "Mar 2026" month only - live for the entire month
  const monthOnly = dateStr.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (monthOnly && monthMap[monthOnly[1]] !== undefined) {
    const startDate = new Date(parseInt(monthOnly[2]), monthMap[monthOnly[1]], 1, 0, 0, 0).getTime();
    const endDate = new Date(parseInt(monthOnly[2]), monthMap[monthOnly[1]] + 1, 0, 23, 59, 59).getTime();
    return todayStart >= startDate && todayEnd <= endDate;
  }

  // "Feb 12, 2026" single day
  const singleDay = dateStr.match(/^([A-Za-z]+)\s+(\d+),\s*(\d{4})$/);
  if (singleDay && monthMap[singleDay[1]] !== undefined) {
    const confDate = new Date(parseInt(singleDay[3]), monthMap[singleDay[1]], parseInt(singleDay[2]));
    const confStart = new Date(confDate.getFullYear(), confDate.getMonth(), confDate.getDate(), 0, 0, 0).getTime();
    const confEnd = new Date(confDate.getFullYear(), confDate.getMonth(), confDate.getDate(), 23, 59, 59).getTime();
    return todayStart >= confStart && todayEnd <= confEnd;
  }

  return false;
}

// Check if a conference date has already passed
function isDatePassed(dateStr: string): boolean {
  if (dateStr.startsWith('TBA')) return false;

  const monthMap: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };

  const now = Date.now();

  // "Feb 2-5, 2026" or "Nov 17-19, 2026" - use last day of range
  const rangeMatch = dateStr.match(/^([A-Za-z]+)\s+\d+-(\d+),\s*(\d{4})$/);
  if (rangeMatch && monthMap[rangeMatch[1]] !== undefined) {
    const endDate = new Date(parseInt(rangeMatch[3]), monthMap[rangeMatch[1]], parseInt(rangeMatch[2]), 23, 59, 59);
    return endDate.getTime() < now;
  }

  // "Mar 30 - Apr 1, 2026" cross-month - use end month/day
  const crossMonth = dateStr.match(/^[A-Za-z]+\s+\d+\s*-\s*([A-Za-z]+)\s+(\d+),\s*(\d{4})$/);
  if (crossMonth && monthMap[crossMonth[1]] !== undefined) {
    const endDate = new Date(parseInt(crossMonth[3]), monthMap[crossMonth[1]], parseInt(crossMonth[2]), 23, 59, 59);
    return endDate.getTime() < now;
  }

  // "Mar 2026" month only - use last day of month
  const monthOnly = dateStr.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (monthOnly && monthMap[monthOnly[1]] !== undefined) {
    const endDate = new Date(parseInt(monthOnly[2]), monthMap[monthOnly[1]] + 1, 0, 23, 59, 59);
    return endDate.getTime() < now;
  }

  // "Feb 12, 2026" single day
  const singleDay = dateStr.match(/^([A-Za-z]+)\s+(\d+),\s*(\d{4})$/);
  if (singleDay && monthMap[singleDay[1]] !== undefined) {
    const endDate = new Date(parseInt(singleDay[3]), monthMap[singleDay[1]], parseInt(singleDay[2]), 23, 59, 59);
    return endDate.getTime() < now;
  }

  // Fallback: use parseConferenceDate timestamp
  const ts = parseConferenceDate(dateStr);
  return ts !== Infinity && ts < now;
}

// Combined list for the app - sorted by date (earliest first, TBA at end)
// Past conferences are marked as passed, date changed to TBA 2027, and pushed to bottom
const allConferences = [...SA_CONFERENCES, ...AFRICA_CONFERENCES];

export const CONFERENCES: ProcessedConference[] = allConferences
  .map(c => {
    const passed = isDatePassed(c.date);
    const isLive = !passed && isConferenceLive(c.date);
    return {
      ...c,
      passed,
      isLive,
      originalDate: c.date,
      date: passed ? 'TBA 2027' : c.date,
    };
  })
  .sort((a, b) => {
    // Live conferences always go to the very top
    if (a.isLive && !b.isLive) return -1;
    if (!a.isLive && b.isLive) return 1;

    // Past conferences always go to the very bottom
    if (a.passed && !b.passed) return 1;
    if (!a.passed && b.passed) return -1;
    if (a.passed && b.passed) return a.name.localeCompare(b.name);

    // TBA conferences (not passed) go below dated conferences
    const aIsTBA = a.date.startsWith('TBA');
    const bIsTBA = b.date.startsWith('TBA');
    if (aIsTBA && !bIsTBA) return 1;
    if (!aIsTBA && bIsTBA) return -1;
    if (aIsTBA && bIsTBA) return a.name.localeCompare(b.name);

    // Both have specific dates - sort earliest first
    return parseConferenceDate(a.date) - parseConferenceDate(b.date);
  });

// Focus areas for filtering
export const FOCUS_AREAS = ['All', 'AI', 'Technology', 'Investment', 'Entrepreneurship', 'Infrastructure'] as const;

// Countries for filtering
export const COUNTRIES = [
  'All',
  'South Africa',
  'Kenya',
  'Nigeria',
  'Morocco',
  'Rwanda',
  'Ethiopia',
  'Egypt',
  'Ghana',
  'Uganda',
  'DRC',
  'Senegal',
  'Tunisia',
  'Algeria',
  'Pan-African',
] as const;