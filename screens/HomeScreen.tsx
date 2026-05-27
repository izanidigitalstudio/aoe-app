import React, { useEffect, useState, lazy, Suspense } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../lib/convexApi';
import { colors, spacing, fontSize, borderRadius } from '../lib/theme';
import { useDemo } from '../lib/DemoContext';
import { AFRICAN_VCS } from '../data/africanVCs';
import { AI_TOOLS } from '../data/aiTools';
import { AI_GUIDES } from '../data/aiGuides';
import { CASE_STUDIES } from '../data/caseStudies';
import { SA_PODCASTS } from '../data/podcasts';
const InviteScreen = lazy(() => import('./InviteScreen'));

const BOOK_COVER_URL = 'https://nabdgzjpwhkjfimljnql.supabase.co/storage/v1/object/public/project_assets/55afaa5e-77cb-4947-935d-cedba8dbe438/assets/dbd17ae2-2c40-40de-b3d1-778f2dabb193_IMG_0451.jpeg';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const UPCOMING_PROJECTS = [
  {
    title: 'Cassava AI Factory',
    location: 'South Africa, Egypt, Nigeria, Kenya, Morocco',
    description: 'NVIDIA-powered AI data centers with 15,000+ GPUs',
    icon: 'server',
    fullDescription: 'A continental initiative to build Africa\'s first network of AI data centers powered by NVIDIA GPU clusters. The project aims to deploy 15,000+ GPUs across five strategic locations, providing African startups and enterprises with world-class AI compute infrastructure. This will enable local training of large language models, reduce dependency on overseas cloud providers, and keep African data sovereign.',
    status: 'In Development',
    timeline: '2025 - 2027',
    partners: ['NVIDIA', 'Cassava Technologies', 'African Development Bank'],
    impact: 'Projected to create 10,000+ direct tech jobs and reduce AI compute costs by 60% for African companies.',
    website: 'https://cassavatech.com',
  },
  {
    title: 'Masakhane Language AI',
    location: 'Pan-African',
    description: 'Integrating 50+ African languages into AI models',
    icon: 'language',
    fullDescription: 'Masakhane is a grassroots NLP research initiative bringing together African researchers to build natural language processing tools for African languages. The project is working on integrating 50+ African languages into modern AI models including machine translation, speech recognition, and sentiment analysis. This addresses the critical gap where less than 5% of the world\'s languages are represented in AI systems.',
    status: 'Active Research',
    timeline: '2020 - Ongoing',
    partners: ['Masakhane Community', 'Google Research', 'Mozilla'],
    impact: 'Over 400 researchers across 30+ African countries contributing to open-source African language datasets.',
    website: 'https://masakhane.io',
  },
  {
    title: 'AfricAI Healthcare',
    location: 'Kenya, Rwanda, Uganda',
    description: 'AI-driven diagnostic systems for disease detection',
    icon: 'medical',
    fullDescription: 'Developing AI-powered diagnostic tools tailored for diseases prevalent in East Africa including malaria, tuberculosis, and cervical cancer. The system uses computer vision to analyze medical imagery from low-cost devices, enabling accurate diagnostics in rural clinics without specialist doctors. Integrated with mobile health platforms for real-time remote consultations.',
    status: 'Pilot Phase',
    timeline: '2024 - 2026',
    partners: ['WHO Africa', 'PATH', 'University of Nairobi'],
    impact: 'Targeting 500+ rural clinics with AI diagnostics, potentially reaching 2 million patients annually.',
    website: '',
  },
  {
    title: 'AgriTech AI Initiative',
    location: 'Nigeria, Zambia, Ghana',
    description: 'AI for crop optimization and yield prediction',
    icon: 'leaf',
    fullDescription: 'A comprehensive agricultural AI platform combining satellite imagery, weather data, and soil sensors to provide smallholder farmers with actionable intelligence. The AI models predict optimal planting times, detect crop diseases early, and recommend precise fertilizer applications. Includes a mobile-first interface supporting offline operation in areas with limited connectivity.',
    status: 'Growth Phase',
    timeline: '2023 - 2026',
    partners: ['FAO', 'Alliance for a Green Revolution in Africa', 'IBM Research Africa'],
    impact: 'Serving 100,000+ smallholder farmers with potential to increase crop yields by 30-40%.',
    website: '',
  },
  {
    title: 'FintechAI Expansion',
    location: 'South Africa, Kenya, Nigeria',
    description: 'AI-powered financial inclusion and payments',
    icon: 'wallet',
    fullDescription: 'Building next-generation financial services powered by AI to serve the 350 million+ unbanked adults in Africa. The platform uses alternative data sources and machine learning for credit scoring, fraud detection, and personalized financial products. Integrates with mobile money systems across the continent to provide seamless cross-border payments.',
    status: 'Scaling',
    timeline: '2024 - 2027',
    partners: ['Mastercard Foundation', 'Central Banks of SA, Kenya, Nigeria'],
    impact: 'Target to bring 50 million previously unbanked Africans into the formal financial system.',
    website: '',
  },
  {
    title: 'EduTech AI Platform',
    location: 'Tanzania, Ethiopia, Senegal',
    description: 'Adaptive learning with AI-driven personalization',
    icon: 'school',
    fullDescription: 'An AI-powered educational platform that adapts to each student\'s learning pace, style, and language preference. Uses natural language processing to deliver content in local languages and generates personalized learning paths. Includes offline-capable mobile apps for areas with limited internet, and AI teaching assistants that provide real-time feedback.',
    status: 'Pilot Phase',
    timeline: '2024 - 2026',
    partners: ['UNESCO', 'African Union', 'Khan Academy'],
    impact: 'Piloting in 200 schools with plans to reach 1 million students across 10 countries.',
    website: '',
  },
  {
    title: 'Climate AI Network',
    location: 'Pan-African',
    description: 'AI for environmental monitoring & climate resilience',
    icon: 'leaf',
    fullDescription: 'Deploying a network of IoT sensors and AI systems across the continent to monitor environmental changes, predict extreme weather events, and model climate impacts. The platform provides early warning systems for droughts, floods, and wildfires, while helping governments and communities develop data-driven climate adaptation strategies.',
    status: 'In Development',
    timeline: '2025 - 2028',
    partners: ['African Climate Foundation', 'UNEP', 'Google.org'],
    impact: 'Aiming to protect 100 million people through improved early warning systems.',
    website: '',
  },
  {
    title: 'Supply Chain AI Hub',
    location: 'Lagos, Nairobi, Johannesburg',
    description: 'Logistics optimization using machine learning',
    icon: 'cube',
    fullDescription: 'Creating AI-optimized logistics corridors connecting Africa\'s three largest economic hubs. The platform uses real-time data, demand forecasting, and route optimization to reduce shipping costs and delivery times. Includes a marketplace connecting manufacturers with distributors and a blockchain-based provenance tracking system.',
    status: 'Active',
    timeline: '2024 - 2026',
    partners: ['DHL Africa', 'AfCFTA Secretariat', 'Trade Mark Africa'],
    impact: 'Projected to reduce intra-African trade logistics costs by 25% and delivery times by 40%.',
    website: '',
  },
  {
    title: 'AI Energy Solutions',
    location: 'South Africa, Morocco',
    description: 'Renewable energy forecasting with AI',
    icon: 'flash',
    fullDescription: 'Using machine learning to optimize renewable energy production and grid management across Africa. AI models forecast solar and wind energy output, manage battery storage systems, and balance grid loads in real-time. The project is helping utilities transition from fossil fuels while maintaining grid stability and reducing energy costs.',
    status: 'Pilot Phase',
    timeline: '2024 - 2027',
    partners: ['IRENA', 'Eskom', 'MASEN Morocco'],
    impact: 'Targeting 30% improvement in renewable energy utilization and 20% reduction in grid losses.',
    website: '',
  },
  {
    title: 'Digital Sovereignty Initiative',
    location: 'Continental',
    description: 'Building African-owned AI compute infrastructure',
    icon: 'shield',
    fullDescription: 'A strategic initiative to ensure Africa owns and controls its digital infrastructure rather than depending entirely on foreign cloud providers. The project encompasses building sovereign data centers, establishing data governance frameworks, developing local AI talent pipelines, and creating open-source AI models trained on African data. This addresses critical concerns around data sovereignty, digital colonialism, and technological independence.',
    status: 'Planning',
    timeline: '2025 - 2030',
    partners: ['African Union', 'Smart Africa', 'African Development Bank'],
    impact: 'Framework for continental digital sovereignty benefiting 1.4 billion Africans.',
    website: '',
  },
];

export default function HomeScreen({ navigation }: any) {
  const { isDemo } = useDemo();
  const user = useQuery(api.users.getCurrentUser);
  const events = useQuery(api.events.listEvents, {});
  const projects = useQuery(api.projects.listProjects, {});
  const members = useQuery(api.users.listMembers, {});
  const stats = useQuery(api.admin.getStats, {});
  const featuredMembers = useQuery(api.users.listFeaturedMembers, {});
  const seedData = useMutation(api.init.seedData);
  const [selectedProject, setSelectedProject] = useState<(typeof UPCOMING_PROJECTS)[number] | null>(null);
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    seedData().catch(() => {});
  }, []);

  const upcomingEvents = events?.filter((e) => e.status === 'upcoming').slice(0, 3);
  const latestProjects = projects?.slice(0, 3);
  const greeting = getGreeting();
  const firstName = !isDemo && user?.name ? user.name.split(' ')[0] : 'Member';

  const AI_HUB_CARDS = [
    { icon: 'cash', title: 'Top 200 Funders & VCs', subtitle: `${AFRICAN_VCS.length}+ African investors`, color: colors.primary, tab: 'funders' },
    { icon: 'construct', title: 'AI Tools', subtitle: `${AI_TOOLS.length}+ free tools`, color: colors.accentLight, tab: 'tools' },
    { icon: 'book', title: 'Guides', subtitle: `${AI_GUIDES.length} practical guides`, color: colors.info, tab: 'guides' },
    { icon: 'briefcase', title: 'Case Studies', subtitle: `${CASE_STUDIES.length} success stories`, color: colors.warning, tab: 'cases' },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Welcome Banner */}
          <View style={styles.welcomeBanner}>
            <View style={styles.welcomeRow}>
              {user?.image ? (
                <Image source={{ uri: user.image }} style={styles.welcomeAvatar} />
              ) : (
                <View style={[styles.welcomeAvatar, styles.welcomeAvatarFallback]}>
                  <Text style={styles.welcomeAvatarText}>
                    {firstName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.welcomeInfo}>
                <Text style={styles.welcomeGreeting}>{greeting},</Text>
                <Text style={styles.welcomeName}>{firstName}</Text>
                {!isDemo && user?.role && user?.company ? (
                  <Text style={styles.welcomeRole} numberOfLines={1}>
                    {user.role} at {user.company}
                  </Text>
                ) : !isDemo && user?.company ? (
                  <Text style={styles.welcomeRole} numberOfLines={1}>{user.company}</Text>
                ) : (
                  <Text style={styles.welcomeRole}>The Future is Here</Text>
                )}
              </View>
              <View style={styles.logoSmall}>
                <Text style={styles.logoSmallText}>AOE</Text>
              </View>
            </View>
          </View>

          {/* Hero Banner */}
          <View style={styles.heroBanner}>
            <Text style={styles.heroTitle}>
              Rebuilding Africa Through{'\n'}AI & Collaboration
            </Text>
            <Text style={styles.heroSubtitle}>
              Connect with entrepreneurs across the continent who are leveraging AI to transform their industries.
            </Text>
            <TouchableOpacity
              style={styles.heroButton}
              onPress={() => navigation.navigate('EventsTab')}
            >
              <Text style={styles.heroButtonText}>Explore Dinner Tour</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.black} />
            </TouchableOpacity>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats?.totalMembers ?? 0}</Text>
              <Text style={styles.statLabel}>Members</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{events?.length ?? 0}</Text>
              <Text style={styles.statLabel}>Tour Cities</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{projects?.length ?? 0}</Text>
              <Text style={styles.statLabel}>Projects</Text>
            </View>
          </View>

          {/* Book Promotion Banner */}
          <TouchableOpacity
            style={styles.bookBanner}
            activeOpacity={0.85}
            onPress={() => Linking.openURL('https://www.aoebook.com')}
          >
            <View style={styles.bookBannerContent}>
              <Image
                source={{ uri: BOOK_COVER_URL }}
                style={styles.bookCoverImage}
                resizeMode="contain"
              />
              <View style={styles.bookInfo}>
                <View style={styles.bookBadge}>
                  <Ionicons name="star" size={10} color={colors.primary} />
                  <Text style={styles.bookBadgeText}>NEW RELEASE</Text>
                </View>
                <Text style={styles.bookTitle}>The Art of{'\n'}Entrepreneurship</Text>
                <Text style={styles.bookSubtitle}>Mastering the Journey from Idea to Impact</Text>
                <Text style={styles.bookAuthor}>By Lebo Gunguluza</Text>
                <View style={styles.bookCTA}>
                  <Text style={styles.bookCTAText}>Get Your Copy</Text>
                  <Ionicons name="arrow-forward" size={14} color={colors.black} />
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Invite Members Card */}
          {!isDemo && (
            <TouchableOpacity
              style={styles.inviteCard}
              onPress={() => setShowInvite(true)}
              activeOpacity={0.8}
            >
              <View style={styles.inviteIcon}>
                <Ionicons name="qr-code" size={24} color={colors.primary} />
              </View>
              <View style={styles.inviteInfo}>
                <Text style={styles.inviteTitle}>Invite New Members</Text>
                <Text style={styles.inviteSubtitle}>Share registration link or QR code</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}

          {/* Upcoming Events */}
          {upcomingEvents && upcomingEvents.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Dinner Tour Events</Text>
                <TouchableOpacity onPress={() => navigation.navigate('CommunityTab')}>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {upcomingEvents.map((event) => (
                  <TouchableOpacity
                    key={event._id}
                    style={styles.eventCard}
                    onPress={() => navigation.navigate('CommunityTab')}
                  >
                    <View style={styles.eventImagePlaceholder}>
                      <Ionicons name="restaurant" size={28} color={colors.primary} />
                    </View>
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventCity}>{event.city}</Text>
                      <Text style={styles.eventCountry}>{event.country}</Text>
                      <Text style={styles.eventDate}>
                        {new Date(event.date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                      <View style={styles.eventAttendees}>
                        <Ionicons name="people" size={12} color={colors.primary} />
                        <Text style={styles.eventAttendeesText}>
                          {event.rsvpCount}/{event.capacity}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Upcoming Projects */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Projects</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {UPCOMING_PROJECTS.map((project, idx) => (
                <TouchableOpacity key={idx} style={styles.projectCard} onPress={() => setSelectedProject(project)}>
                  <View style={[styles.projectCardIcon, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons name={project.icon as any} size={24} color={colors.primary} />
                  </View>
                  <Text style={styles.projectCardTitle}>{project.title}</Text>
                  <Text style={styles.projectCardLocation}>{project.location}</Text>
                  <Text style={styles.projectCardDesc} numberOfLines={2}>{project.description}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* AI Hub */}
          <View style={styles.section}>
            <View style={styles.conferenceBanner}>
              <Text style={styles.heroTitle}>
                Upcoming Conferences
              </Text>
              <Text style={styles.heroSubtitle}>
                See Upcoming conferences in Africa in the space of Entrepreneurship, Investment, Infrastructure, Technology and AI
              </Text>
              <TouchableOpacity
                style={styles.heroButton}
                onPress={() => navigation.navigate('AIHubTab', { tab: 'conferences' })}
              >
                <Text style={styles.heroButtonText}>Explore Conferences</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.black} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Podcasts */}
          <View style={styles.section}>
            <View style={styles.conferenceBanner}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primary + '20', justifyContent: 'center', alignItems: 'center' }}>
                  <Ionicons name="mic" size={22} color={colors.primary} />
                </View>
                <View style={{ backgroundColor: colors.primary + '20', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 }}>
                  <Text style={{ fontSize: 11, color: colors.primary, fontWeight: '600' }}>{SA_PODCASTS.length} Podcasts</Text>
                </View>
              </View>
              <Text style={styles.heroTitle}>
                SA Podcast Directory
              </Text>
              <Text style={styles.heroSubtitle}>
                Top South African podcasts covering entrepreneurship, tech, AI, finance, startups and innovation
              </Text>
              <TouchableOpacity
                style={styles.heroButton}
                onPress={() => navigation.navigate('AIHubTab', { tab: 'podcasts' })}
              >
                <Text style={styles.heroButtonText}>Browse Podcasts</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.black} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Top Members */}
          {featuredMembers && featuredMembers.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>AOE Network</Text>
                <TouchableOpacity onPress={() => navigation.navigate('NetworkMembers')}>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {featuredMembers.slice(0, 12).map((member) => (
                  <TouchableOpacity
                    key={member._id}
                    style={styles.memberCard}
                    onPress={() => navigation.navigate('NetworkMembers')}
                  >
                    <Image
                      source={{ uri: member.image }}
                      style={styles.memberImage}
                    />
                    <Text style={styles.memberName} numberOfLines={1}>
                      {member.name?.split(' ')[0]}
                    </Text>
                    <Text style={styles.memberIndustry} numberOfLines={1}>
                      {member.industry}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Latest Projects */}
          {latestProjects && latestProjects.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Innovation Hub</Text>
              </View>
              {latestProjects.map((project) => (
                <View key={project._id} style={styles.projectCard}>
                  <View style={styles.projectHeader}>
                    <View style={styles.projectAvatar}>
                      <Text style={styles.projectAvatarText}>
                        {(project.authorName || 'A').charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.projectMeta}>
                      <Text style={styles.projectAuthor}>{project.authorName || 'Anonymous'}</Text>
                      <Text style={styles.projectCompany}>{project.authorCompany}</Text>
                    </View>
                    <View style={styles.stageBadge}>
                      <Text style={styles.stageBadgeText}>{project.stage}</Text>
                    </View>
                  </View>
                  <Text style={styles.projectTitle}>{project.title}</Text>
                  <Text style={styles.projectDesc} numberOfLines={2}>
                    {project.description}
                  </Text>
                  <View style={styles.projectTags}>
                    {project.lookingFor.slice(0, 3).map((tag) => (
                      <View key={tag} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Project Detail Modal */}
        <Modal visible={!!selectedProject} animationType="slide" presentationStyle="pageSheet">
          <View style={styles.modalContainer}>
            <SafeAreaView style={{ flex: 1 }}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setSelectedProject(null)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.modalHeaderTitle} numberOfLines={1}>Project Details</Text>
                <View style={{ width: 24 }} />
              </View>
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {selectedProject && (
                  <>
                    <View style={[styles.projectDetailIcon, { backgroundColor: colors.primary + '15' }]}>
                      <Ionicons name={selectedProject.icon as any} size={40} color={colors.primary} />
                    </View>
                    <Text style={styles.projectDetailTitle}>{selectedProject.title}</Text>
                    <View style={styles.projectDetailMeta}>
                      <View style={styles.projectDetailBadge}>
                        <Ionicons name="location-outline" size={12} color={colors.primary} />
                        <Text style={styles.projectDetailBadgeText}>{selectedProject.location}</Text>
                      </View>
                      <View style={[styles.projectDetailBadge, { backgroundColor: colors.accent + '20' }]}>
                        <Ionicons name="pulse-outline" size={12} color={colors.accentLight} />
                        <Text style={[styles.projectDetailBadgeText, { color: colors.accentLight }]}>{selectedProject.status}</Text>
                      </View>
                    </View>
                    <View style={styles.projectDetailBadge}>
                      <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
                      <Text style={[styles.projectDetailBadgeText, { color: colors.textSecondary }]}>{selectedProject.timeline}</Text>
                    </View>

                    <View style={styles.projectDetailSection}>
                      <Text style={styles.projectDetailSectionTitle}>Overview</Text>
                      <Text style={styles.projectDetailText}>{selectedProject.fullDescription}</Text>
                    </View>

                    <View style={styles.projectDetailSection}>
                      <Text style={styles.projectDetailSectionTitle}>Expected Impact</Text>
                      <View style={styles.impactCard}>
                        <Ionicons name="trending-up" size={20} color={colors.primary} />
                        <Text style={styles.impactText}>{selectedProject.impact}</Text>
                      </View>
                    </View>

                    <View style={styles.projectDetailSection}>
                      <Text style={styles.projectDetailSectionTitle}>Key Partners</Text>
                      <View style={styles.partnersRow}>
                        {selectedProject.partners.map((partner, i) => (
                          <View key={i} style={styles.partnerChip}>
                            <Ionicons name="business-outline" size={12} color={colors.primary} />
                            <Text style={styles.partnerText}>{partner}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    {selectedProject.website ? (
                      <TouchableOpacity
                        style={styles.projectWebsiteBtn}
                        onPress={() => Linking.openURL(selectedProject.website)}
                      >
                        <Ionicons name="globe-outline" size={18} color={colors.black} />
                        <Text style={styles.projectWebsiteBtnText}>Visit Website</Text>
                      </TouchableOpacity>
                    ) : null}

                    <View style={{ height: 40 }} />
                  </>
                )}
              </ScrollView>
            </SafeAreaView>
          </View>
        </Modal>

        {/* Invite Members Modal */}
        <Modal visible={showInvite} animationType="slide" presentationStyle="pageSheet">
          <Suspense fallback={<View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={colors.primary} /></View>}>
            <InviteScreen onClose={() => setShowInvite(false)} />
          </Suspense>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safeArea: { flex: 1 },
  welcomeBanner: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  welcomeAvatarFallback: {
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeAvatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },
  welcomeInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  welcomeGreeting: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  welcomeName: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    marginTop: 1,
  },
  welcomeRole: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  greeting: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  headerSubtitle: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '600', marginTop: 2 },
  logoSmall: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoSmallText: { fontSize: 14, fontWeight: '900', color: colors.black },
  heroBanner: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  heroTitle: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.text, lineHeight: 36 },
  heroSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    gap: 6,
  },
  heroButtonText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.black },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: { fontSize: fontSize.xl, fontWeight: '800', color: colors.primary },
  statLabel: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 4 },
  inviteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    gap: spacing.md,
  },
  inviteIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inviteInfo: {
    flex: 1,
  },
  inviteTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  inviteSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  // Book Promotion Banner
  bookBanner: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  bookBannerContent: {
    flexDirection: 'row',
    padding: spacing.md,
    alignItems: 'center',
  },
  bookCoverImage: {
    width: 110,
    height: 150,
    borderRadius: borderRadius.md,
  },
  bookInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  bookBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary + '20',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xs,
  },
  bookBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  bookTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 22,
  },
  bookSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  bookAuthor: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 4,
  },
  bookCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  bookCTAText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.black,
  },
  section: { marginTop: spacing.xl, paddingHorizontal: spacing.lg },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  seeAll: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '600' },
  eventCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
    width: 180,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  eventImagePlaceholder: {
    height: 80,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventInfo: { padding: spacing.sm },
  eventCity: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  eventCountry: { fontSize: fontSize.xs, color: colors.primary, fontWeight: '600' },
  eventDate: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 4 },
  eventAttendees: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  eventAttendeesText: { fontSize: fontSize.xs, color: colors.textSecondary },
  hubGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  hubCard: {
    width: '48%' as any,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hubCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  hubCardTitle: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  hubCardSubtitle: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  projectCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  projectHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  projectAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  projectAvatarText: { fontSize: 14, fontWeight: '700', color: colors.white },
  projectMeta: { flex: 1, marginLeft: spacing.sm },
  projectAuthor: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  projectCompany: { fontSize: fontSize.xs, color: colors.textSecondary },
  stageBadge: {
    backgroundColor: colors.accent + '30',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  stageBadgeText: { fontSize: fontSize.xs, color: colors.accentLight, fontWeight: '600', textTransform: 'capitalize' },
  projectTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  projectDesc: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 4, lineHeight: 20 },
  projectTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.sm },
  tag: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  tagText: { fontSize: fontSize.xs, color: colors.primary, fontWeight: '500', textTransform: 'capitalize' },
  memberCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginRight: spacing.sm,
    width: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  memberImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: colors.primary + '40',
    marginBottom: spacing.xs,
    backgroundColor: colors.surfaceLight,
  },
  memberName: { fontSize: fontSize.xs, fontWeight: '700', color: colors.text, textAlign: 'center' },
  memberIndustry: { fontSize: 9, color: colors.textSecondary, textAlign: 'center', marginTop: 2 },
  conferenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  conferenceCard: {
    width: '48%' as any,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  conferenceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  conferenceFocus: { fontSize: fontSize.xs, color: colors.primary, fontWeight: '600' },
  conferenceName: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  conferenceDate: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 4 },
  conferenceLocation: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  projectCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  projectCardTitle: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  projectCardLocation: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  projectCardDesc: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 4, lineHeight: 20 },
  conferenceBanner: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  // Project Detail Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalHeaderTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  projectDetailIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
    alignSelf: 'center',
  },
  projectDetailTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  projectDetailMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  projectDetailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    alignSelf: 'center',
    marginTop: 6,
  },
  projectDetailBadgeText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
  },
  projectDetailSection: {
    marginTop: spacing.xl,
  },
  projectDetailSectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  projectDetailText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  impactCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.primary + '10',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  impactText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.primary,
    lineHeight: 20,
    fontWeight: '500',
  },
  partnersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  partnerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  partnerText: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500',
  },
  projectWebsiteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.xl,
  },
  projectWebsiteBtnText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.black,
  },
});