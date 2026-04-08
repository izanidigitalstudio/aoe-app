import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput,
  FlatList, Alert, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { colors, spacing, fontSize, borderRadius } from '../lib/theme';

export default function ConferenceAdminScreen() {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedConference, setSelectedConference] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    focus: 'Technology',
    date: '',
    location: '',
    country: 'South Africa',
    description: '',
    website: '',
    attendees: '',
    icon: 'calendar',
    contactEmail: '',
    speakerEmail: '',
  });

  const conferences = useQuery(api.conferences.list, {}) || [];
  const createConference = useMutation(api.conferences.create);
  const updateConference = useMutation(api.conferences.update);
  const deleteConference = useMutation(api.conferences.remove);

  const handleAddNew = () => {
    setFormData({
      name: '',
      focus: 'Technology',
      date: '',
      location: '',
      country: 'South Africa',
      description: '',
      website: '',
      attendees: '',
      icon: 'calendar',
      contactEmail: '',
      speakerEmail: '',
    });
    setSelectedConference(null);
    setIsAdding(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.date.trim()) {
      Alert.alert('Required Fields', 'Please fill in Name and Date');
      return;
    }

    try {
      if (selectedConference) {
        await updateConference({
          id: selectedConference._id,
          ...formData,
        });
        Alert.alert('Success', 'Conference updated');
      } else {
        await createConference(formData as any);
        Alert.alert('Success', 'Conference added');
      }
      setIsAdding(false);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Conference', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteConference({ id });
            Alert.alert('Success', 'Conference deleted');
          } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to delete');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Conference Management</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
            <Ionicons name="add-circle" size={24} color={colors.primary} />
            <Text style={styles.addButtonText}>Add Conference</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={conferences}
          keyExtractor={(item: any) => item._id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }: { item: any }) => (
            <TouchableOpacity
              style={styles.conferenceItem}
              onPress={() => {
                setSelectedConference(item);
                setFormData(item);
                setIsAdding(true);
              }}
            >
              <View style={styles.itemHeader}>
                <View>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemMeta}>{item.focus} • {item.country}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item._id)}>
                  <Ionicons name="trash" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
              <Text style={styles.itemDate}>{item.date}</Text>
            </TouchableOpacity>
          )}
        />

        <Modal visible={isAdding} animationType="slide" presentationStyle="pageSheet">
          <View style={styles.modalContainer}>
            <SafeAreaView style={{ flex: 1 }}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setIsAdding(false)}>
                  <Ionicons name="close" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{selectedConference ? 'Edit' : 'Add'} Conference</Text>
                <TouchableOpacity onPress={handleSave}>
                  <Ionicons name="checkmark" size={28} color={colors.primary} />
                </TouchableOpacity>
              </View>

              <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              >
                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  <Text style={styles.fieldLabel}>Conference Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Africa Tech Festival 2026"
                    placeholderTextColor={colors.textMuted}
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                  />

                  <Text style={styles.fieldLabel}>Focus Area *</Text>
                  <View style={styles.buttonGroup}>
                    {['AI', 'Technology', 'Investment', 'Entrepreneurship', 'Infrastructure'].map(
                      (focus) => (
                        <TouchableOpacity
                          key={focus}
                          style={[styles.focusButton, formData.focus === focus && styles.focusButtonActive]}
                          onPress={() => setFormData({ ...formData, focus })}
                        >
                          <Text style={[styles.focusButtonText, formData.focus === focus && styles.focusButtonTextActive]}>
                            {focus}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>

                  <Text style={styles.fieldLabel}>Date *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Feb 12-15, 2026"
                    placeholderTextColor={colors.textMuted}
                    value={formData.date}
                    onChangeText={(text) => setFormData({ ...formData, date: text })}
                  />

                  <Text style={styles.fieldLabel}>Location *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Cape Town, CTICC"
                    placeholderTextColor={colors.textMuted}
                    value={formData.location}
                    onChangeText={(text) => setFormData({ ...formData, location: text })}
                  />

                  <Text style={styles.fieldLabel}>Country</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="South Africa"
                    placeholderTextColor={colors.textMuted}
                    value={formData.country}
                    onChangeText={(text) => setFormData({ ...formData, country: text })}
                  />

                  <Text style={styles.fieldLabel}>Description</Text>
                  <TextInput
                    style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                    placeholder="Conference description..."
                    placeholderTextColor={colors.textMuted}
                    value={formData.description}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                    multiline
                  />

                  <Text style={styles.fieldLabel}>Website</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="https://example.com"
                    placeholderTextColor={colors.textMuted}
                    value={formData.website}
                    onChangeText={(text) => setFormData({ ...formData, website: text })}
                  />

                  <Text style={styles.fieldLabel}>Expected Attendees</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 2,000+"
                    placeholderTextColor={colors.textMuted}
                    value={formData.attendees}
                    onChangeText={(text) => setFormData({ ...formData, attendees: text })}
                  />

                  <Text style={styles.fieldLabel}>Contact Email (Delegates)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="delegates@event.com"
                    placeholderTextColor={colors.textMuted}
                    value={formData.contactEmail}
                    onChangeText={(text) => setFormData({ ...formData, contactEmail: text })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <Text style={styles.fieldLabel}>Speaker Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="speakers@event.com"
                    placeholderTextColor={colors.textMuted}
                    value={formData.speakerEmail}
                    onChangeText={(text) => setFormData({ ...formData, speakerEmail: text })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <View style={{ height: 40 }} />
                </ScrollView>
              </KeyboardAvoidingView>
            </SafeAreaView>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safeArea: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 100,
  },
  conferenceItem: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  itemName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  itemMeta: {
    fontSize: fontSize.xs,
    color: colors.primary,
    marginTop: 4,
  },
  itemDate: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  focusButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  focusButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  focusButtonText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  focusButtonTextActive: {
    color: colors.black,
    fontWeight: '700',
  },
});
