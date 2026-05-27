import React from 'react';
import { ActivityIndicator, FlatList, Linking, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AdminStateAgenciesPanel from './AdminStateAgenciesPanel';

export default function AdminMembersPanel(props: any) {
  const {
    styles,
    colors,
    borderRadius,
    fontSize,
    MEMBER_TYPES,
    selectedMemberType,
    setSelectedMemberType,
    selectedIndustry,
    setSelectedIndustry,
    memberSubTab,
    setMemberSubTab,
    searchQuery,
    setSearchQuery,
    searchFilterField,
    setSearchFilterField,
    memberTypeCounts,
    industryCounts,
    members,
    handleCSVImport,
    handleContactsImport,
    handleBulkAdd,
    openEditMember,
    handleDeleteMember,
    clearMemberForm,
    setShowAddMember,
    setShowMemberNotes,
    setSelectedMember,
    bulkText,
    setBulkText,
  } = props;

  const currentType = MEMBER_TYPES.find((t: any) => t.key === selectedMemberType);

  // If no category selected, show category cards
  if (!selectedMemberType) {
    const totalMembers = memberTypeCounts ? memberTypeCounts.reduce((sum: number, c: any) => sum + c.count, 0) : 0;
    const getCount = (key: string) => {
      if (!memberTypeCounts) return null;
      const found = memberTypeCounts.find((c: any) => c.memberType === key);
      return found ? found.count : 0;
    };
    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Member Categories</Text>
        <Text style={[styles.helpText, { marginBottom: 12 }]}>Browse all members or filter by industry</Text>
        {memberTypeCounts && (
          <View style={{ backgroundColor: colors.primary + '15', borderRadius: borderRadius.lg, padding: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary + '30', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <Ionicons name="people" size={24} color={colors.primary} />
            </View>
            <View>
              <Text style={{ fontSize: fontSize.xl, fontWeight: '700', color: colors.text }}>{totalMembers}</Text>
              <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Total Members</Text>
            </View>
          </View>
        )}
        {MEMBER_TYPES.map((type) => {
          const count = getCount(type.key);
          return (
            <TouchableOpacity
              key={type.key}
              style={[styles.memberCard, { borderLeftWidth: 4, borderLeftColor: type.color, marginBottom: 12 }]}
              onPress={() => { setSelectedMemberType(type.key); setSelectedIndustry(null); setMemberSubTab('list'); setSearchQuery(''); setSearchFilterField('all'); }}
            >
              <View style={[styles.categoryIconContainer, { backgroundColor: type.color + '20' }]}>
                <Ionicons name={type.icon as any} size={28} color={type.color} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.memberName, { fontSize: fontSize.md }]}>{type.label}</Text>
                <Text style={styles.memberSub}>Tap to manage members</Text>
              </View>
              {count !== null ? (
                <View style={{ backgroundColor: type.color + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 8 }}>
                  <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: type.color }}>{count}</Text>
                </View>
              ) : (
                <ActivityIndicator size="small" color={type.color} style={{ marginRight: 8 }} />
              )}
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  }

  // Business Community: show industry sub-categories first
  if (selectedMemberType === 'business_community' && !selectedIndustry) {
    const INDUSTRY_ICONS: Record<string, string> = {
      'Mining': 'hammer', 'Mining & Metals': 'hammer', 'Metal mining': 'hammer',
      'Real estate': 'home', 'Real Estate': 'home',
      'Construction': 'construct', 'General building contractors': 'construct', 'Heavy construction except building': 'construct',
      'Finance': 'cash', 'Financial Services': 'cash', 'Banking': 'cash', 'Banking & Finance': 'cash', 'FinTech': 'cash', 'Fintech': 'cash',
      'Health services': 'medkit', 'Healthcare': 'medkit', 'Hospital & Health Care': 'medkit',
      'Services': 'briefcase', 'Business services': 'briefcase',
      'Communications': 'chatbubbles', 'Telecommunications': 'chatbubbles',
      'Transportation services': 'car', 'Logistics': 'car', 'Transportation': 'car',
      'Education services': 'school', 'Education': 'school', 'Higher Education': 'school',
      'Energy': 'flash', 'Electric': 'flash', 'Energy & Water': 'flash',
      'Agriculture': 'leaf', 'Agricultural services': 'leaf',
      'Hotels & other lodging places': 'bed', 'Tourism': 'bed', 'Tourism & Hospitality': 'bed',
      'Legal services': 'document-text', 'Legal Tech': 'document-text',
      'Insurance agents': 'shield-checkmark', 'Insurance': 'shield-checkmark',
      'Manufacturing': 'cog', 'Miscellaneous manufacturing industries': 'cog',
      'Information Technology & Services': 'laptop', 'Cybersecurity': 'laptop',
      'Engineering & management services': 'settings',
      'Miscellaneous retail': 'storefront', 'Retail': 'storefront', 'Wholesale & Retail': 'storefront',
    };
    const INDUSTRY_COLORS: string[] = [
      '#8B5CF6', '#0EA5E9', '#F59E0B', '#10B981', '#EF4444', '#6366F1',
      '#14B8A6', '#EC4899', '#F97316', '#84CC16', '#06B6D4', '#A855F7',
    ];

    return (
      <View style={styles.tabContent}>
        <View style={styles.searchRow}>
          <TouchableOpacity onPress={() => { setSelectedMemberType(null); setSelectedIndustry(null); setSearchQuery(''); }} style={{ marginRight: 8 }}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.sectionTitle, { flex: 1, marginBottom: 0 }]}>Business Community</Text>
          <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>
            {industryCounts ? industryCounts.reduce((sum, c) => sum + c.count, 0) : '...'} members
          </Text>
        </View>
        <Text style={[styles.helpText, { marginBottom: 12 }]}>Select an industry to view members</Text>

        {industryCounts ? (
          <FlatList
            data={industryCounts}
            keyExtractor={(item) => item.industry}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <TouchableOpacity
                style={[styles.memberCard, { borderLeftWidth: 4, borderLeftColor: colors.primary, marginBottom: 10 }]}
                onPress={() => { setSelectedIndustry('__all__'); setSearchQuery(''); }}
              >
                <View style={[styles.categoryIconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="people" size={24} color={colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.memberName, { fontSize: fontSize.md }]}>All Members</Text>
                  <Text style={styles.memberSub}>{industryCounts.reduce((sum: number, c: any) => sum + c.count, 0)} members</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            }
            renderItem={({ item, index }) => {
              const iconName = INDUSTRY_ICONS[item.industry] || 'business';
              const color = INDUSTRY_COLORS[index % INDUSTRY_COLORS.length];
              return (
                <TouchableOpacity
                  style={[styles.memberCard, { borderLeftWidth: 4, borderLeftColor: color, marginBottom: 10 }]}
                  onPress={() => { setSelectedIndustry(item.industry); setSearchQuery(''); }}
                >
                  <View style={[styles.categoryIconContainer, { backgroundColor: color + '20' }]}>
                    <Ionicons name={iconName as any} size={24} color={color} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.memberName, { fontSize: fontSize.md }]}>{item.industry}</Text>
                    <Text style={styles.memberSub}>{item.count} member{item.count !== 1 ? 's' : ''}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={<Text style={styles.emptyText}>No industry data</Text>}
          />
        ) : (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        )}
      </View>
    );
  }

  // Category detail view
  const selectedCurrentType = MEMBER_TYPES.find(t => t.key === selectedMemberType);

  // Special rendering for State Agencies - show static data instead of DB members
  if (selectedMemberType === 'state_agencies') {
    return (
      <AdminStateAgenciesPanel
        styles={styles}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onBackToCategories={() => {
          setSelectedMemberType(null);
          setSearchQuery('');
        }}
      />
    );
  }

  return (
    <View style={styles.tabContent}>
      {/* Back to categories + title */}
      <View style={[styles.searchRow, { flexShrink: 0 }]}>
        <TouchableOpacity onPress={() => {
          if (selectedMemberType === 'business_community' && selectedIndustry) {
            setSelectedIndustry(null);
            setSearchQuery('');
            setSearchFilterField('all');
          } else {
            setSelectedMemberType(null);
            setSelectedIndustry(null);
            setSearchQuery('');
            setSearchFilterField('all');
          }
        }} style={{ marginRight: 8 }}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.sectionTitle, { flex: 1, marginBottom: 0 }]}>
          {selectedIndustry === '__all__' ? 'All Members' : selectedIndustry ? selectedIndustry : selectedCurrentType?.label}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>
          {members ? members.length : '...'} members
        </Text>
      </View>

      {/* Import method buttons */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, flexShrink: 0, marginBottom: 12, marginTop: 8 }}>
        <TouchableOpacity
          style={[styles.importMethodBtn, memberSubTab === 'list' && { backgroundColor: colors.primary, borderColor: colors.primary }]}
          onPress={() => setMemberSubTab('list')}
        >
          <Ionicons name="list" size={18} color={memberSubTab === 'list' ? colors.white : colors.textSecondary} />
          <Text style={[styles.importMethodText, memberSubTab === 'list' && { color: colors.white }]}>Members</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.importMethodBtn, memberSubTab === 'add' && { backgroundColor: colors.primary, borderColor: colors.primary }]}
          onPress={() => { setMemberSubTab('add'); clearMemberForm(); setShowAddMember(true); }}
        >
          <Ionicons name="person-add" size={18} color={memberSubTab === 'add' ? colors.white : colors.textSecondary} />
          <Text style={[styles.importMethodText, memberSubTab === 'add' && { color: colors.white }]}>Add Member</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.importMethodBtn, memberSubTab === 'bulk' && { backgroundColor: colors.primary, borderColor: colors.primary }]}
          onPress={() => setMemberSubTab('bulk')}
        >
          <Ionicons name="grid" size={18} color={memberSubTab === 'bulk' ? colors.white : colors.textSecondary} />
          <Text style={[styles.importMethodText, memberSubTab === 'bulk' && { color: colors.white }]}>Excel Import</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.importMethodBtn]}
          onPress={handleCSVImport}
        >
          <Ionicons name="document-text" size={18} color={colors.textSecondary} />
          <Text style={styles.importMethodText}>CSV Import</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.importMethodBtn]}
          onPress={handleContactsImport}
        >
          <Ionicons name="call" size={18} color={colors.textSecondary} />
          <Text style={styles.importMethodText}>From Contacts</Text>
        </TouchableOpacity>
      </ScrollView>

      {memberSubTab === 'bulk' ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.helpText}>Paste from Excel/Sheets - include a header row for auto-detection, or you'll map columns manually in the next step.</Text>
          <TextInput
            style={[styles.input, { height: 200, textAlignVertical: 'top' }]}
            value={bulkText}
            onChangeText={setBulkText}
            multiline
            placeholder={'Name, Email, Company, Role, Country\nJohn Doe, john@email.com, Acme, CEO, Botswana\nJane Smith, jane@email.com, Inc, CTO, Kenya'}
            placeholderTextColor={colors.textMuted}
          />
          <TouchableOpacity style={styles.primaryBtn} onPress={handleBulkAdd}>
            <Text style={styles.primaryBtnText}>Map Fields & Import</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <>
          {/* Filter chips - REMOVED: Now using search box only */}
          <View style={[styles.searchBox, searchFilterField !== 'all' && { borderColor: selectedCurrentType?.color || colors.primary, borderWidth: 1.5 }, { flexShrink: 0 }]}>
            <Ionicons name="search" size={18} color={searchFilterField !== 'all' ? (selectedCurrentType?.color || colors.primary) : colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={searchFilterField === 'all'
                ? `Search ${selectedIndustry === '__all__' ? 'All Members' : selectedIndustry || selectedCurrentType?.label}...`
                : `Type to search by ${searchFilterField === 'role' ? 'title/designation' : searchFilterField}...`}
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>
          {searchFilterField !== 'all' && !searchQuery && (
            <Text style={{ fontSize: fontSize.xs, color: selectedCurrentType?.color || colors.primary, marginBottom: 6, marginTop: -4 }}>
              Type above to filter members by {searchFilterField === 'role' ? 'title/designation' : searchFilterField}
            </Text>
          )}
          {searchQuery && searchFilterField !== 'all' && (
            <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: 6, marginTop: -4 }}>
              Showing results matching "{searchQuery}" in {searchFilterField === 'role' ? 'title/designation' : searchFilterField}
            </Text>
          )}
          <FlatList
            data={searchQuery
              ? (members || []).filter((item: any) => {
                  const q = searchQuery.toLowerCase();
                  if (searchFilterField === 'all') return true; // backend already filtered
                  if (searchFilterField === 'name') return item.name && item.name.toLowerCase().includes(q);
                  if (searchFilterField === 'company') return item.company && item.company.toLowerCase().includes(q);
                  if (searchFilterField === 'role') return item.role && item.role.toLowerCase().includes(q);
                  if (searchFilterField === 'city') return item.city && item.city.toLowerCase().includes(q);
                  if (searchFilterField === 'country') return item.country && item.country.toLowerCase().includes(q);
                  return true;
                })
              : members || []}
            keyExtractor={(item: any) => item._id}
            showsVerticalScrollIndicator={false}
            style={{ marginTop: 8, flex: 1 }}
            renderItem={({ item }: any) => (
              <TouchableOpacity style={styles.memberCard} onPress={() => openEditMember(item)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberName}>{item.name || 'Unnamed'}</Text>
                  <Text style={styles.memberSub}>{item.email}</Text>
                  {item.company && <Text style={styles.memberSub}>{item.company}{item.role ? ` - ${item.role}` : ''}</Text>}
                  {item.contactPhone && <Text style={styles.memberSub}>{item.contactPhone}</Text>}
                  {(item.city || item.country) && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Ionicons name="location-outline" size={12} color={selectedCurrentType?.color || colors.primary} />
                      <Text style={[styles.memberSub, { color: selectedCurrentType?.color || colors.primary, marginTop: 0 }]}> 
                        {[item.city, item.country].filter(Boolean).join(', ')}
                      </Text>
                    </View>
                  )}
                  {item.website && (
                    <TouchableOpacity onPress={() => { const url = item.website.startsWith('http') ? item.website : `https://${item.website}`; Linking.openURL(url); }}>
                      <Text style={[styles.memberSub, { color: colors.info, textDecorationLine: 'underline' }]}>{item.website}</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity onPress={() => { setSelectedMember(item); setShowMemberNotes(true); }}>
                    <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteMember(item)}>
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>No members in {selectedCurrentType?.label}</Text>}
          />
        </>
      )}
    </View>
  );
};