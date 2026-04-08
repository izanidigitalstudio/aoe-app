export interface AINewsArticle {
title: string;
summary: string;
source: string;
category: string;
date: string;
url: string;
}

export const AI_NEWS_CATEGORIES = [
'All', 'AI & Africa', 'Startups', 'Infrastructure', 'Policy', 'Investment', 'Technology',
];

export const AI_NEWS: AINewsArticle[] = [
{
title: 'How Africa\'s Data Centres Are Evolving to Support the Continent\'s AI Surge',
summary: 'Africa Data Centres CEO Adil El Youssefi explores how AI adoption across African industries — from banking fraud detection to logistics optimisation and healthcare diagnostics — is driving urgent demand for modern, AI-ready data centre infrastructure. Without local high-performance compute facilities, workloads pushed offshore face increased latency, higher costs, and data sovereignty concerns.',
source: 'BusinessTech',
category: 'Infrastructure',
date: 'Mar 2026',
url: 'https://businesstech.co.za/news/industry-news/855413/how-africas-data-centres-are-evolving-to-support-the-continents-ai-surge/',
},
{
title: 'Starlink\'s Rapid Expansion Across Africa Amid Regulatory Challenges',
summary: 'Starlink has expanded rapidly across Africa, operating in over 25 countries including Nigeria, Kenya, Zambia, and Mozambique with high-speed, low-latency satellite internet. However, it faces significant regulatory hurdles in Southern Africa: South Africa has not licensed Starlink due to local ownership requirements despite ~14,000 residents using international roaming, and Namibia officially declined Starlink\'s applications in March 2026, citing lack of local shareholding. The company continues exploring partnerships with Vodacom and MTN for remote area coverage.',
source: 'TeleGeography',
category: 'Infrastructure',
date: 'Mar 2026',
url: 'https://www.telegeography.com/',
},
{
title: 'AfDB and UNDP Launch $10 Billion AI Initiative for 40 Million African Jobs',
summary: 'The African Development Bank and UNDP launched the AI 10 Billion Initiative at the Nairobi AI Forum, aiming to mobilise $10 billion by 2035 to support AI-driven innovation, infrastructure, and skills development. The programme targets creating 40 million new jobs across Africa through investments in data, compute, skills, trust, and capital.',
source: 'Africa Solutions Media Hub',
category: 'Investment',
date: 'Feb 2026',
url: 'https://africasolutionsmediahub.org/2026/03/03/afdb-and-undp-launch-10-billion-ai-drive-to-create-40-million-jobs-across-africa/',
},
{
title: 'Ghana Launches National AI Strategy to Become Africa\'s AI Hub',
summary: 'Ghana has unveiled its National AI Strategy, emphasising data as a critical national resource. The strategy promotes safe, transparent AI deployment across agriculture, healthcare, education, transportation, and national security, with strong ethical standards and governance frameworks.',
source: 'TechAfrica News',
category: 'Policy',
date: 'Mar 2026',
url: 'https://techafricanews.com/2026/03/02/ghana-launches-national-ai-strategy-to-position-itself-as-africas-ai-hub/',
},
{
title: 'African Union and Google Sign Landmark AI Partnership',
summary: 'The African Union Commission signed an MoU with Google to advance AI and digital transformation across the continent. The partnership focuses on policy frameworks, startup ecosystem development, research and education, AI talent development, and cloud infrastructure advancement.',
source: 'African Union',
category: 'AI & Africa',
date: 'Feb 2026',
url: 'https://au.int/en/pressreleases/20260217/auc-google-sign-partnership-advance-africas-sovereign-ai-digital-capacity',
},
{
title: 'Google Selects 15 African Startups for AI Accelerator Programme',
summary: 'Google announced 15 African startups from Ghana, Ethiopia, Kenya, Nigeria, Rwanda, Senegal, and South Africa for its Accelerator Class 9. Selected from nearly 1,500 applications, startups receive mentorship, up to $350,000 in cloud credits, and support in AI implementation and scaling.',
source: 'Startup Africa',
category: 'Startups',
date: 'Jun 2025',
url: 'https://www.startup.africa/google-selects-15-african-ai-startups-for-2025-accelerator-programme/',
},
{
title: 'Cassava Technologies and Vambo AI Partner on African Language Models',
summary: 'Cassava Technologies and Vambo AI signed an MoU to develop open-source large language models purpose-built for African languages and contexts. Vambo AI will leverage Cassava\'s NVIDIA GPU-powered AI Factory to create culturally intelligent AI applications across education, health, fintech, and government.',
source: 'TechAfrica News',
category: 'Technology',
date: 'Jun 2025',
url: 'https://techafricanews.com/2025/06/13/cassava-technologies-and-vambo-ai-partner-to-develop-african-centric-large-language-models/',
},
{
title: 'Altron Launches South Africa\'s First AI Factory Powered by NVIDIA',
summary: 'Altron deployed South Africa\'s first operational AI Factory, powered by NVIDIA accelerated computing. The platform delivers enterprise-grade AI infrastructure while maintaining data sovereignty. Five launch customers including Lelapa AI and MathU are already live on the platform.',
source: 'TechCentral',
category: 'Infrastructure',
date: 'Oct 2025',
url: 'https://techcentral.co.za/south-africas-first-ai-factory-now-live-powered-by-altron-and-nvidia/272768/',
},
{
title: 'Africa\'s AI Productivity Report: Pathways to $1 Trillion GDP Boost',
summary: 'The AfDB released a landmark report outlining how responsible AI adoption could add an estimated $1 trillion to Africa\'s GDP by 2035. The three-phase roadmap focuses on AI readiness through five pillars: quality data access, computing capacity, skills development, governance frameworks, and financing.',
source: 'African Development Bank',
category: 'AI & Africa',
date: 'Jun 2025',
url: 'https://www.afdb.org/',
},
{
title: 'Kenya Leads African Startup Funding in 2025',
summary: 'Kenya emerged as Africa\'s most funded startup ecosystem in 2025, reinforcing its position at the centre of the continent\'s innovation landscape. The Big Four countries continue to dominate funding rounds, with AI-focused startups seeing the largest year-over-year growth in investment.',
source: 'Startup Africa',
category: 'Startups',
date: 'Jan 2026',
url: 'https://www.startup.africa/',
},
{
title: 'Nairobi AI Forum 2026 Charts Africa\'s AI Future',
summary: 'The Nairobi AI Forum 2026 brought together government officials, private sector leaders, development partners, and tech innovators to map out Africa\'s AI future. Key themes included ethical AI governance, local value creation, capacity building, and sustainable development.',
source: 'Fintechnews',
category: 'Policy',
date: 'Feb 2026',
url: 'https://fintechnews.ae/30431/fintech-africa/africa-ai-10-billion-initiative/',
},
{
title: 'Lelapa AI and MathU Among First on SA\'s AI Factory Platform',
summary: 'South African AI startups Lelapa AI and MathU are among the first companies operating on Altron\'s new AI Factory. The platform provides local compute power for training and deploying AI models while keeping data within South African jurisdiction, addressing critical sovereignty concerns for enterprises.',
source: 'IT-Online',
category: 'Technology',
date: 'Oct 2025',
url: 'https://it-online.co.za/2025/10/15/altron-goes-live-with-ai-factory/',
},
];
