// SETAs (Sector Education and Training Authorities) - South African training organizations
export interface SETA {
_id?: string;
name: string;
sector: string;
description: string;
focus: string;
country: string;
email: string;
phone?: string;
website: string;
location: string;
founded?: number;
board?: string[];
}

export const SETAS: SETA[] = [
{
name: 'AgriSETA',
sector: 'Agriculture',
description: 'Sector Education and Training Authority for Agriculture sector in South Africa',
focus: 'Skills development, training, and qualification in agriculture',
country: 'South Africa',
email: 'info@agriseta.org.za',
phone: '+27 12 123 4567',
website: 'agriseta.org.za',
location: 'Pretoria',
founded: 2000,
},
{
name: 'ETDP SETA',
sector: 'Education, Training & Development Practices',
description: 'SETA focused on education, training and development practices sector',
focus: 'Professional services training, adult education',
country: 'South Africa',
email: 'info@etdpseta.org.za',
phone: '+27 11 123 4567',
website: 'etdpseta.org.za',
location: 'Johannesburg',
founded: 2000,
},
{
name: 'Energy Sector SETA',
sector: 'Energy',
description: 'SETA for the energy and water sectors in South Africa',
focus: 'Technical skills in energy production, distribution and water management',
country: 'South Africa',
email: 'info@eseta.org.za',
phone: '+27 12 456 7890',
website: 'eseta.org.za',
location: 'Pretoria',
founded: 2000,
},
{
name: 'Finance Sector Education & Training Authority',
sector: 'Finance',
description: 'SETA for the financial services sector',
focus: 'Finance, banking, insurance and investment skills',
country: 'South Africa',
email: 'info@fseta.co.za',
phone: '+27 11 234 5678',
website: 'fseta.co.za',
location: 'Johannesburg',
founded: 2000,
},
{
name: 'Safety & Security Sector Education & Training Authority',
sector: 'Safety & Security',
description: 'SETA for the safety and security industry',
focus: 'Training for security personnel, emergency services, and safety professionals',
country: 'South Africa',
email: 'info@sasseta.org.za',
phone: '+27 11 567 8901',
website: 'sasseta.org.za',
location: 'Johannesburg',
founded: 2000,
},
{
name: 'Health & Welfare Sector Education & Training Authority',
sector: 'Health & Welfare',
description: 'SETA for health and social welfare sectors',
focus: 'Healthcare professional training, social work, wellness programs',
country: 'South Africa',
email: 'info@hwseta.org.za',
phone: '+27 12 678 9012',
website: 'hwseta.org.za',
location: 'Pretoria',
founded: 2000,
},
{
name: 'Hospitality Sector Education & Training Authority',
sector: 'Hospitality',
description: 'SETA for tourism and hospitality industries',
focus: 'Tourism, catering, accommodation and event management training',
country: 'South Africa',
email: 'info@hostessa.co.za',
phone: '+27 11 789 0123',
website: 'hostessa.co.za',
location: 'Cape Town',
founded: 2000,
},
{
name: 'Manufacturing, Engineering & Related Services SETA',
sector: 'Manufacturing & Engineering',
description: 'SETA for manufacturing and engineering sectors',
focus: 'Technical training, engineering skills, manufacturing processes',
country: 'South Africa',
email: 'info@merseta.org.za',
phone: '+27 11 890 1234',
website: 'merseta.org.za',
location: 'Johannesburg',
founded: 2000,
},
];
