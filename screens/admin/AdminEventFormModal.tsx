import React from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

export default function AdminEventFormModal(props: any) {
  const {
    visible,
    onClose,
    onSubmit,
    title,
    styles,
    colors,
    fontSize,
    evtTitle,
    setEvtTitle,
    evtDesc,
    setEvtDesc,
    evtDate,
    setEvtDate,
    showDatePicker,
    setShowDatePicker,
    evtCity,
    setEvtCity,
    evtCountry,
    setEvtCountry,
    evtVenue,
    setEvtVenue,
    evtCapacity,
    setEvtCapacity,
    evtPrice,
    setEvtPrice,
    evtCurrency,
    setEvtCurrency,
    evtSponsors,
    setEvtSponsors,
    sponsorName,
    setSponsorName,
    sponsorTier,
    sponsorWebsite,
    setSponsorWebsite,
    selectedEvent,
    renderInput,
    renderChipPicker,
    clearSpeakerForm,
    setShowAddSpeaker,
    openEditSpeaker,
    handleRemoveSpeaker,
    clearInvGuestForm,
    setShowAddInvitedGuest,
    openEditInvGuest,
    handleRemoveInvGuest,
  } = props;

  const isEditing = title === 'Update Event';

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {renderInput('Title *', evtTitle, setEvtTitle)}
            {renderInput('Description', evtDesc, setEvtDesc, { multiline: true })}

            <Text style={styles.inputLabel}>Event Date *</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDatePicker(!showDatePicker)}
            >
              <Text style={{ color: colors.text, fontSize: fontSize.md }}>
                {evtDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={evtDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                themeVariant="dark"
                onChange={(_event: any, selectedDate?: Date) => {
                  if (Platform.OS === 'android') setShowDatePicker(false);
                  if (selectedDate) setEvtDate(selectedDate);
                }}
                style={{ marginBottom: 12 }}
              />
            )}

            {renderInput('City *', evtCity, setEvtCity)}
            {renderInput('Country *', evtCountry, setEvtCountry)}
            {renderInput('Venue *', evtVenue, setEvtVenue)}
            {renderInput('Capacity', evtCapacity, setEvtCapacity, { keyboardType: 'numeric' })}
            {renderInput('Ticket Price', evtPrice, setEvtPrice, { keyboardType: 'numeric' })}
            {renderChipPicker('Currency', ['BWP', 'USD', 'ZAR', 'KES', 'NGN'], evtCurrency, setEvtCurrency)}
            <Text style={[styles.subSectionTitle, { marginTop: 16 }]}>Sponsors</Text>
            {evtSponsors.map((s: any, i: number) => (
              <View key={i} style={styles.reportRow}>
                <Text style={styles.reportLabel}>{s.name} ({s.tier})</Text>
                <TouchableOpacity onPress={() => setEvtSponsors(evtSponsors.filter((_: any, idx: number) => idx !== i))}>
                  <Ionicons name="close-circle" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={sponsorName}
                onChangeText={setSponsorName}
                placeholder="Sponsor name"
                placeholderTextColor={colors.textMuted}
              />
              <TouchableOpacity
                style={[styles.addBtn, { alignSelf: 'center' }]}
                onPress={() => {
                  if (!sponsorName.trim()) {
                    Alert.alert('Required', 'Please enter a sponsor name first');
                    return;
                  }
                  setEvtSponsors([...evtSponsors, { name: sponsorName.trim(), tier: sponsorTier, website: sponsorWebsite.trim() || undefined }]);
                  setSponsorName(''); setSponsorWebsite('');
                }}
              >
                <Ionicons name="add" size={18} color={colors.white} />
              </TouchableOpacity>
            </View>

            {isEditing && selectedEvent && (
              <>
                <Text style={[styles.subSectionTitle, { marginTop: 24 }]}>Guest Speakers ({selectedEvent.guestSpeakers?.length || 0})</Text>
                {(selectedEvent.guestSpeakers || []).map((speaker: any, i: number) => (
                  <View key={i} style={[styles.memberCard, { marginBottom: 6 }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.memberName}>{speaker.name}</Text>
                      {speaker.designation && <Text style={styles.memberSub}>{speaker.designation}{speaker.company ? ` at ${speaker.company}` : ''}</Text>}
                      {speaker.email && <Text style={styles.memberSub}>{speaker.email}</Text>}
                      {speaker.phone && <Text style={styles.memberSub}>{speaker.phone}</Text>}
                      <View style={[styles.statusBadge, { backgroundColor: speaker.status === 'confirmed' ? colors.success + '30' : colors.warning + '30' }]}>
                        <Text style={[styles.statusText, { color: speaker.status === 'confirmed' ? colors.success : colors.warning }]}>{speaker.status}</Text>
                      </View>
                    </View>
                    <View style={{ gap: 6 }}>
                      <TouchableOpacity onPress={() => { onClose(); setTimeout(() => { openEditSpeaker(speaker, i); }, 300); }}>
                        <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleRemoveSpeaker(i, speaker.name)}>
                        <Ionicons name="trash-outline" size={20} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
                <TouchableOpacity
                  style={[styles.addBtn, { width: '100%', flexDirection: 'row', gap: 6, marginTop: 8 }]}
                  onPress={() => { onClose(); setTimeout(() => { clearSpeakerForm(); setShowAddSpeaker(true); }, 300); }}
                >
                  <Ionicons name="add" size={18} color={colors.white} />
                  <Text style={{ color: colors.white, fontWeight: '600', fontSize: fontSize.sm }}>Add Speaker</Text>
                </TouchableOpacity>
              </>
            )}

            {isEditing && selectedEvent && (
              <>
                <Text style={[styles.subSectionTitle, { marginTop: 24 }]}>Invited Guests ({selectedEvent.invitedGuests?.length || 0})</Text>
                {(selectedEvent.invitedGuests || []).map((guest: any, i: number) => (
                  <View key={i} style={[styles.memberCard, { marginBottom: 6 }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.memberName}>{guest.name}</Text>
                      {guest.designation && <Text style={styles.memberSub}>{guest.designation}{guest.company ? ` at ${guest.company}` : ''}</Text>}
                      {guest.email && <Text style={styles.memberSub}>{guest.email}</Text>}
                      {guest.phone && <Text style={styles.memberSub}>{guest.phone}</Text>}
                      <View style={[styles.statusBadge, { backgroundColor: guest.status === 'confirmed' ? colors.success + '30' : colors.warning + '30' }]}>
                        <Text style={[styles.statusText, { color: guest.status === 'confirmed' ? colors.success : colors.warning }]}>{guest.status}</Text>
                      </View>
                    </View>
                    <View style={{ gap: 6 }}>
                      <TouchableOpacity onPress={() => { onClose(); setTimeout(() => { openEditInvGuest(guest, i); }, 300); }}>
                        <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleRemoveInvGuest(i, guest.name)}>
                        <Ionicons name="trash-outline" size={20} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
                <TouchableOpacity
                  style={[styles.addBtn, { width: '100%', flexDirection: 'row', gap: 6, marginTop: 8 }]}
                  onPress={() => { onClose(); setTimeout(() => { clearInvGuestForm(); setShowAddInvitedGuest(true); }, 300); }}
                >
                  <Ionicons name="add" size={18} color={colors.white} />
                  <Text style={{ color: colors.white, fontWeight: '600', fontSize: fontSize.sm }}>Add Invited Guest</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity style={[styles.primaryBtn, { marginTop: 20 }]} onPress={onSubmit}>
              <Text style={styles.primaryBtnText}>{title}</Text>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
