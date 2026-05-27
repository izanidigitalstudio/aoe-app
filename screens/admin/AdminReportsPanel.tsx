import React from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

export default function AdminReportsPanel(props: any) {
  const { styles, colors, formatCurrency, formatDate, reportData } = props;

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Analytics</Text>
      {reportData ? (
        <>
          <Text style={styles.subSectionTitle}>Members by Country</Text>
          {reportData.membersByCountry.slice(0, 8).map((item: any, i: number) => (
            <View key={i} style={styles.reportRow}>
              <Text style={styles.reportLabel}>{item.country}</Text>
              <View style={[styles.reportBar, { width: `${Math.min(100, (item.count / Math.max(...reportData.membersByCountry.map((c: any) => c.count))) * 100)}%` }]} />
              <Text style={styles.reportValue}>{item.count}</Text>
            </View>
          ))}

          <Text style={[styles.subSectionTitle, { marginTop: 24 }]}>Members by Industry</Text>
          {reportData.membersByIndustry.slice(0, 8).map((item: any, i: number) => (
            <View key={i} style={styles.reportRow}>
              <Text style={styles.reportLabel}>{item.industry}</Text>
              <View style={[styles.reportBar, { backgroundColor: colors.accent, width: `${Math.min(100, (item.count / Math.max(...reportData.membersByIndustry.map((c: any) => c.count))) * 100)}%` }]} />
              <Text style={styles.reportValue}>{item.count}</Text>
            </View>
          ))}

          <Text style={[styles.subSectionTitle, { marginTop: 24 }]}>Monthly Growth</Text>
          {reportData.monthlyGrowth.map((item: any, i: number) => (
            <View key={i} style={styles.reportRow}>
              <Text style={styles.reportLabel}>{item.month}</Text>
              <Text style={styles.reportValue}>{item.members} members | {formatCurrency(item.revenue, 'BWP')}</Text>
            </View>
          ))}

          <Text style={[styles.subSectionTitle, { marginTop: 24 }]}>Event Performance</Text>
          {reportData.eventPerformance.map((item: any, i: number) => (
            <View key={i} style={styles.eventPerfCard}>
              <Text style={styles.memberName}>{item.title}</Text>
              <Text style={styles.memberSub}>{item.city}, {item.country}</Text>
              <View style={{ flexDirection: 'row', gap: 16, marginTop: 4 }}>
                <Text style={styles.memberSub}>RSVPs: {item.rsvpCount}</Text>
                <Text style={styles.memberSub}>Attending: {item.attendingCount}</Text>
                <Text style={[styles.memberSub, { color: colors.primary }]}>Fill: {item.fillRate}%</Text>
              </View>
              {item.revenue > 0 && <Text style={[styles.memberSub, { color: colors.success }]}>Revenue: {formatCurrency(item.revenue, 'BWP')}</Text>}
            </View>
          ))}

          <Text style={[styles.subSectionTitle, { marginTop: 24 }]}>RSVP Conversion</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}><Text style={styles.statValue}>{reportData.rsvpConversion.total}</Text><Text style={styles.statLabel}>Total</Text></View>
            <View style={styles.statCard}><Text style={[styles.statValue, { color: colors.success }]}>{reportData.rsvpConversion.attending}</Text><Text style={styles.statLabel}>Attending</Text></View>
            <View style={styles.statCard}><Text style={[styles.statValue, { color: colors.error }]}>{reportData.rsvpConversion.cancelled}</Text><Text style={styles.statLabel}>Cancelled</Text></View>
            <View style={styles.statCard}><Text style={[styles.statValue, { color: colors.warning }]}>{reportData.rsvpConversion.waitlist}</Text><Text style={styles.statLabel}>Waitlist</Text></View>
          </View>

          <Text style={[styles.subSectionTitle, { marginTop: 24 }]}>Recent Members</Text>
          {reportData.recentMembers.map((item: any, i: number) => (
            <View key={i} style={styles.reportRow}>
              <Text style={styles.reportLabel}>{item.name}</Text>
              <Text style={styles.reportValue}>{formatDate(item.joinedAt)}</Text>
            </View>
          ))}
        </>
      ) : <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />}
    </ScrollView>
  );
}
