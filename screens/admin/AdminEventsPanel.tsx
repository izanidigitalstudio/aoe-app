import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AdminEventsPanel(props: any) {
  const {
    styles,
    colors,
    events,
    formatDate,
    formatCurrency,
    sortEventsByDate,
    clearEventForm,
    setShowCreateEvent,
    setSelectedEvent,
    setShowEventRsvps,
    openEditEvent,
    handleDeleteEvent,
    reorderEvent,
  } = props;

  return (
    <View style={styles.tabContent}>
      <View style={styles.searchRow}>
        <Text style={styles.sectionTitle}>Events</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={styles.addBtn} onPress={async () => { try { await sortEventsByDate(); } catch (e: any) { /* keep existing behavior */ } }}>
            <Ionicons name="swap-vertical" size={18} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={() => { clearEventForm(); setShowCreateEvent(true); }}>
            <Ionicons name="add" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={events || []}
        keyExtractor={(item: any) => item._id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }: any) => (
          <View style={styles.memberCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.memberName}>{item.title}</Text>
              <Text style={styles.memberSub}>{item.city}, {item.country} - {item.venue}</Text>
              <Text style={styles.memberSub}>{formatDate(item.date)} | Cap: {item.capacity} | RSVPs: {item.rsvpCount}</Text>
              {item.ticketPrice ? <Text style={[styles.memberSub, { color: colors.primary }]}>{formatCurrency(item.ticketPrice, item.currency || 'BWP')}</Text> : null}
              <View style={[styles.statusBadge, { backgroundColor: item.status === 'upcoming' ? colors.info + '30' : item.status === 'past' ? colors.textMuted + '30' : colors.success + '30' }]}>
                <Text style={[styles.statusText, { color: item.status === 'upcoming' ? colors.info : item.status === 'past' ? colors.textMuted : colors.success }]}>{item.status}</Text>
              </View>
            </View>
            <View style={{ gap: 8, alignItems: 'center' }}>
              <TouchableOpacity onPress={() => { setSelectedEvent(item); setShowEventRsvps(true); }}>
                <Ionicons name="people-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openEditEvent(item)}>
                <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteEvent(item)}>
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              </TouchableOpacity>
              <TouchableOpacity onPress={async () => { try { await reorderEvent({ eventId: item._id, direction: 'up' }); } catch {} }}>
                <Ionicons name="arrow-up" size={18} color={colors.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity onPress={async () => { try { await reorderEvent({ eventId: item._id, direction: 'down' }); } catch {} }}>
                <Ionicons name="arrow-down" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No events yet</Text>}
      />
    </View>
  );
}