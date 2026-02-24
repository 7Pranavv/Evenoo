import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView, Modal, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, User, X, Check, XCircle } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabase';
import { Event } from '@/types';

export default function ApprovalsScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  const fetchPendingEvents = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'pending_approval')
        .order('created_at', { ascending: false });
      setEvents((data as Event[]) ?? []);
    } catch (error) {
      console.error('Error fetching pending events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedEvent) return;
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('events')
        .update({
          status: 'live',
          admin_notes: notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedEvent.id);

      if (!error) {
        await createNotification(selectedEvent.created_by, 'approved', notes);
        setModalVisible(false);
        setNotes('');
        fetchPendingEvents();
      }
    } catch (error) {
      console.error('Error approving event:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedEvent) return;
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('events')
        .update({
          status: 'draft',
          admin_notes: notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedEvent.id);

      if (!error) {
        await createNotification(selectedEvent.created_by, 'rejected', notes);
        setModalVisible(false);
        setNotes('');
        fetchPendingEvents();
      }
    } catch (error) {
      console.error('Error rejecting event:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const createNotification = async (userId: string, type: 'approved' | 'rejected', message: string) => {
    try {
      await supabase.from('notifications').insert({
        recipient_uid: userId,
        title: type === 'approved' ? 'Event Approved' : 'Event Needs Changes',
        body: message || (type === 'approved' ? 'Your event has been approved and is now live!' : 'Your event submission was rejected. Please review and resubmit.'),
        type: 'event_status',
        related_id: selectedEvent?.id,
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const renderEventCard = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={[styles.eventCard, { backgroundColor: colors.surface, borderColor: colors.border }, !isDark && styles.shadow]}
      onPress={() => {
        setSelectedEvent(item);
        setNotes('');
        setModalVisible(true);
      }}
      activeOpacity={0.85}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.eventName, { color: colors.textPrimary }]} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.eventMeta}>
          <User size={12} color="#FF5A1F" />
          <Text style={[styles.eventMetaText, { color: colors.textMuted }]} numberOfLines={1}>
            {item.organizer_type}
          </Text>
        </View>
        <View style={styles.eventMeta}>
          <Calendar size={12} color="#FF1E2D" />
          <Text style={[styles.eventMetaText, { color: colors.textMuted }]}>
            {item.event_start ? new Date(item.event_start).toLocaleDateString('en-IN') : 'TBA'}
          </Text>
        </View>
      </View>
      <View style={[styles.levelBadge, { backgroundColor: 'rgba(255,30,45,0.1)' }]}>
        <Text style={[styles.levelText, { color: '#FF1E2D' }]}>{item.event_level}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Event Approvals</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#FF1E2D" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={renderEventCard}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Check size={32} color="#10B981" />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>All caught up!</Text>
              <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>No events pending approval</Text>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Review Event</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} disabled={actionLoading}>
                <X size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
              {selectedEvent && (
                <>
                  <View>
                    <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Event Name</Text>
                    <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>{selectedEvent.name}</Text>
                  </View>

                  <View>
                    <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Description</Text>
                    <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>{selectedEvent.description || 'No description'}</Text>
                  </View>

                  <View>
                    <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Event Details</Text>
                    <View style={[styles.detailsBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Level:</Text>
                        <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{selectedEvent.event_level}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Type:</Text>
                        <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{selectedEvent.event_type}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Mode:</Text>
                        <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{selectedEvent.event_mode}</Text>
                      </View>
                    </View>
                  </View>

                  <View>
                    <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Admin Notes (Optional)</Text>
                    <TextInput
                      style={[styles.notesInput, { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border }]}
                      placeholder="Add feedback for the organizer..."
                      placeholderTextColor={colors.textMuted}
                      value={notes}
                      onChangeText={setNotes}
                      multiline
                      editable={!actionLoading}
                    />
                  </View>
                </>
              )}
            </ScrollView>

            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.rejectBtn, { borderColor: '#EF4444' }]}
                onPress={handleReject}
                disabled={actionLoading}
                activeOpacity={0.7}>
                <XCircle size={18} color="#EF4444" />
                <Text style={[styles.rejectBtnText, { color: '#EF4444' }]}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.approveBtn, { backgroundColor: '#10B981' }]}
                onPress={handleApprove}
                disabled={actionLoading}
                activeOpacity={0.7}>
                {actionLoading ? (
                  <ActivityIndicator color="#fff" size={18} />
                ) : (
                  <>
                    <Check size={18} color="#fff" />
                    <Text style={styles.approveBtnText}>Approve</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  title: { fontFamily: 'System', fontSize: 24, fontWeight: '700' },
  list: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 },
  eventCard: { borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  shadow: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  eventName: { fontFamily: 'System', fontSize: 14, fontWeight: '600', marginBottom: 6 },
  eventMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  eventMetaText: { fontFamily: 'System', fontSize: 12 },
  levelBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  levelText: { fontFamily: 'System', fontSize: 11, fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: 80, gap: 8 },
  emptyText: { fontFamily: 'System', fontSize: 16, fontWeight: '600' },
  emptySubtext: { fontFamily: 'System', fontSize: 13 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { maxHeight: '90%', borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1 },
  modalTitle: { fontFamily: 'System', fontSize: 18, fontWeight: '600' },
  modalBody: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, gap: 16 },
  fieldLabel: { fontFamily: 'System', fontSize: 12, fontWeight: '500', marginBottom: 4 },
  fieldValue: { fontFamily: 'System', fontSize: 15 },
  detailsBox: { borderWidth: 1, borderRadius: 10, padding: 12, gap: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontFamily: 'System', fontSize: 13 },
  detailValue: { fontFamily: 'System', fontSize: 13, fontWeight: '600' },
  notesInput: { borderWidth: 1, borderRadius: 10, padding: 12, minHeight: 100, fontFamily: 'System', textAlignVertical: 'top' },
  modalFooter: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1 },
  rejectBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderRadius: 10, paddingVertical: 10 },
  rejectBtnText: { fontFamily: 'System', fontSize: 14, fontWeight: '600' },
  approveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 10, paddingVertical: 10 },
  approveBtnText: { fontFamily: 'System', fontSize: 14, fontWeight: '600', color: '#fff' },
});
