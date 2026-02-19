import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Switch, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useEventDraftStore } from '@/store/eventDraftStore';
import { GradientButton } from '@/components/ui/GradientButton';
import { Input } from '@/components/ui/Input';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabase';

const TOTAL_STEPS = 7;

const LEVELS = ['college', 'inter_college', 'state', 'national'];
const LEVEL_LABELS: Record<string, string> = { college: 'College', inter_college: 'Inter-College', state: 'State', national: 'National' };
const MODES = ['online', 'offline', 'hybrid'];
const MODE_LABELS: Record<string, string> = { online: 'Online', offline: 'Offline', hybrid: 'Hybrid' };
const FEE_STRUCTURES = ['per_person', 'per_team_flat', 'per_person_with_cap'];
const FEE_STRUCT_LABELS: Record<string, string> = { per_person: 'Per Person', per_team_flat: 'Per Team (Flat)', per_person_with_cap: 'Per Person with Cap' };
const CERT_TYPES = ['Participation', 'Merit', 'Winner'];

export default function CreateEventScreen() {
  const { user } = useAuthStore();
  const { draft, update, currentStep, setStep, reset } = useEventDraftStore();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [saving, setSaving] = useState(false);

  const stepTitles = ['Basic Details', 'Dates & Times', 'Venue / Platform', 'Fees', 'Prizes', 'Social', 'Review'];

  const next = () => { if (currentStep < TOTAL_STEPS - 1) setStep(currentStep + 1); };
  const back = () => { if (currentStep > 0) setStep(currentStep - 1); };

  const saveToSupabase = async (status: 'draft' | 'pending_approval') => {
    if (!user?.id) return;
    setSaving(true);
    const payload = {
      name: draft.name || 'Untitled Event',
      tagline: draft.tagline,
      description: draft.description || '',
      event_type: draft.event_type,
      event_level: draft.event_level,
      event_mode: draft.event_mode,
      organizer_type: draft.organizer_type,
      contact_email: draft.contact_email || user.email,
      contact_phone: draft.contact_phone,
      registration_visibility: 'public',
      fee_type: draft.fee_type,
      fee_structure: draft.fee_type === 'paid' ? draft.fee_structure : null,
      fee_per_person: draft.fee_type === 'paid' ? parseFloat(draft.fee_per_person || '0') : 0,
      team_flat_fee: draft.fee_type === 'paid' ? parseFloat(draft.team_flat_fee || '0') : 0,
      prize_pool_amount: parseFloat(draft.prize_pool_amount || '0'),
      prize_pool_type: draft.prize_pool_type,
      certificate_types: draft.certificate_types,
      instagram_link: draft.instagram_link || null,
      youtube_link: draft.youtube_link || null,
      website_link: draft.website_link || null,
      venue_name: draft.venue_name || null,
      venue_address: draft.venue_address || null,
      platform_name: draft.platform_name || null,
      meeting_link: draft.meeting_link || null,
      rules_and_regulations: draft.rules_and_regulations || null,
      refund_policy: 'no_refund',
      min_team_size: parseInt(draft.min_team_size || '2'),
      max_team_size: parseInt(draft.max_team_size || '5'),
      team_name_required: draft.team_name_required,
      team_leader_mandatory: draft.team_leader_mandatory,
      allow_self_registration_only: draft.allow_self_registration_only,
      submission_required: draft.submission_required,
      created_by: user.id,
      status,
    };

    const { error } = await supabase.from('events').insert(payload);
    setSaving(false);
    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
    reset();
    Alert.alert('Success', status === 'draft' ? 'Event saved as draft!' : 'Event submitted for approval!', [
      { text: 'OK', onPress: () => router.replace('/(organizer)/events') },
    ]);
  };

  const OptionChip = ({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} style={[styles.optionChip, { borderColor: selected ? '#FF1E2D' : colors.border, backgroundColor: selected ? '#FF1E2D' : colors.surface }]} activeOpacity={0.7}>
      <Text style={[styles.optionChipText, { color: selected ? '#fff' : colors.textMuted }]}>{label}</Text>
    </TouchableOpacity>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Input label="Event Name *" value={draft.name} onChangeText={(v) => update({ name: v })} placeholder="e.g. National Hackathon 2025" />
            <Input label="Short Tagline *" value={draft.tagline} onChangeText={(v) => update({ tagline: v })} placeholder="A catchy one-liner for your event" />
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Event Type</Text>
            <View style={styles.chipRow}>
              <OptionChip label="Individual" selected={draft.event_type === 'individual'} onPress={() => update({ event_type: 'individual' })} />
              <OptionChip label="Team" selected={draft.event_type === 'team'} onPress={() => update({ event_type: 'team' })} />
            </View>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Event Level</Text>
            <View style={styles.chipRow}>
              {LEVELS.map((l) => <OptionChip key={l} label={LEVEL_LABELS[l]} selected={draft.event_level === l} onPress={() => update({ event_level: l as any })} />)}
            </View>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Event Mode</Text>
            <View style={styles.chipRow}>
              {MODES.map((m) => <OptionChip key={m} label={MODE_LABELS[m]} selected={draft.event_mode === m} onPress={() => update({ event_mode: m as any })} />)}
            </View>
          </View>
        );
      case 1:
        return (
          <View style={styles.stepContent}>
            <Input label="Registration Start" value={draft.registration_start} onChangeText={(v) => update({ registration_start: v })} placeholder="YYYY-MM-DD" />
            <Input label="Registration End" value={draft.registration_end} onChangeText={(v) => update({ registration_end: v })} placeholder="YYYY-MM-DD" />
            <Input label="Event Start Date" value={draft.event_start} onChangeText={(v) => update({ event_start: v })} placeholder="YYYY-MM-DD" />
            <Input label="Event End Date" value={draft.event_end} onChangeText={(v) => update({ event_end: v })} placeholder="YYYY-MM-DD" />
            <Input label="Result Date (optional)" value={draft.result_date} onChangeText={(v) => update({ result_date: v })} placeholder="YYYY-MM-DD" />
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContent}>
            {(draft.event_mode === 'offline' || draft.event_mode === 'hybrid') && (
              <>
                <Text style={[styles.stepSectionLabel, { color: colors.textPrimary }]}>Venue Details</Text>
                <Input label="Venue Name" value={draft.venue_name} onChangeText={(v) => update({ venue_name: v })} placeholder="e.g. BITS Pilani Auditorium" />
                <Input label="Full Address" value={draft.venue_address} onChangeText={(v) => update({ venue_address: v })} placeholder="Street, City, State, PIN" />
              </>
            )}
            {(draft.event_mode === 'online' || draft.event_mode === 'hybrid') && (
              <>
                <Text style={[styles.stepSectionLabel, { color: colors.textPrimary }]}>Platform Details</Text>
                <Input label="Platform Name" value={draft.platform_name} onChangeText={(v) => update({ platform_name: v })} placeholder="Zoom / Google Meet / YouTube" />
                <Input label="Meeting Link" value={draft.meeting_link} onChangeText={(v) => update({ meeting_link: v })} placeholder="https://..." />
                <Input label="Access Code (optional)" value={draft.access_code} onChangeText={(v) => update({ access_code: v })} placeholder="Meeting password or code" />
              </>
            )}
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Fee Type</Text>
            <View style={styles.chipRow}>
              <OptionChip label="Free" selected={draft.fee_type === 'free'} onPress={() => update({ fee_type: 'free' })} />
              <OptionChip label="Paid" selected={draft.fee_type === 'paid'} onPress={() => update({ fee_type: 'paid' })} />
            </View>
            {draft.fee_type === 'paid' && (
              <>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Fee Structure</Text>
                <View style={styles.chipCol}>
                  {FEE_STRUCTURES.map((fs) => <OptionChip key={fs} label={FEE_STRUCT_LABELS[fs]} selected={draft.fee_structure === fs} onPress={() => update({ fee_structure: fs as any })} />)}
                </View>
                {(draft.fee_structure === 'per_person' || draft.fee_structure === 'per_person_with_cap') && (
                  <Input label="Fee per Person (₹)" value={draft.fee_per_person} onChangeText={(v) => update({ fee_per_person: v })} placeholder="e.g. 150" keyboardType="numeric" />
                )}
                {(draft.fee_structure === 'per_team_flat' || draft.fee_structure === 'per_person_with_cap') && (
                  <Input label="Team Flat Fee (₹)" value={draft.team_flat_fee} onChangeText={(v) => update({ team_flat_fee: v })} placeholder="e.g. 500" keyboardType="numeric" />
                )}
                {draft.fee_structure === 'per_person_with_cap' && (
                  <Input label="Fee Cap per Team (₹)" value={draft.team_fee_cap} onChangeText={(v) => update({ team_fee_cap: v })} placeholder="e.g. 450" keyboardType="numeric" />
                )}
              </>
            )}
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContent}>
            <Input label="Prize Pool Total (₹)" value={draft.prize_pool_amount} onChangeText={(v) => update({ prize_pool_amount: v })} placeholder="e.g. 500000" keyboardType="numeric" />
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Prize Type</Text>
            <View style={styles.chipRow}>
              <OptionChip label="Monetary" selected={draft.prize_pool_type === 'monetary'} onPress={() => update({ prize_pool_type: 'monetary' })} />
              <OptionChip label="Non-Monetary" selected={draft.prize_pool_type === 'non_monetary'} onPress={() => update({ prize_pool_type: 'non_monetary' })} />
            </View>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Certificate Types</Text>
            <View style={styles.chipRow}>
              {CERT_TYPES.map((c) => (
                <OptionChip key={c} label={c} selected={draft.certificate_types.includes(c)} onPress={() => {
                  const curr = draft.certificate_types;
                  update({ certificate_types: curr.includes(c) ? curr.filter((x) => x !== c) : [...curr, c] });
                }} />
              ))}
            </View>
            <Input label="Certificate Issuer Name" value={draft.certificate_issuer} onChangeText={(v) => update({ certificate_issuer: v })} placeholder="e.g. BITS Pilani" />
          </View>
        );
      case 5:
        return (
          <View style={styles.stepContent}>
            <Input label="Instagram Link" value={draft.instagram_link} onChangeText={(v) => update({ instagram_link: v })} placeholder="https://instagram.com/..." keyboardType="url" />
            <Input label="YouTube Link" value={draft.youtube_link} onChangeText={(v) => update({ youtube_link: v })} placeholder="https://youtube.com/..." keyboardType="url" />
            <Input label="Website Link" value={draft.website_link} onChangeText={(v) => update({ website_link: v })} placeholder="https://..." keyboardType="url" />
            <Input label="Rules & Regulations" value={draft.rules_and_regulations} onChangeText={(v) => update({ rules_and_regulations: v })} placeholder="Enter event rules..." multiline style={{ minHeight: 100 }} />
          </View>
        );
      case 6:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.reviewTitle, { color: colors.textPrimary }]}>Review Your Event</Text>
            {[
              ['Event Name', draft.name || '—'],
              ['Tagline', draft.tagline || '—'],
              ['Type', draft.event_type],
              ['Level', LEVEL_LABELS[draft.event_level]],
              ['Mode', MODE_LABELS[draft.event_mode]],
              ['Event Start', draft.event_start || 'TBA'],
              ['Fee Type', draft.fee_type],
              draft.fee_type === 'paid' ? ['Fee', `₹${draft.fee_per_person || draft.team_flat_fee || '0'}`] : null,
              ['Prizes', draft.prize_pool_amount ? `₹${draft.prize_pool_amount}` : 'None'],
              ['Certificates', draft.certificate_types.join(', ') || 'None'],
            ].filter(Boolean).map((row, i) => (
              <View key={i} style={[styles.reviewRow, { borderColor: colors.border }]}>
                <Text style={[styles.reviewLabel, { color: colors.textMuted }]}>{row![0]}</Text>
                <Text style={[styles.reviewValue, { color: colors.textPrimary }]} numberOfLines={2}>{row![1]}</Text>
              </View>
            ))}
            <View style={styles.submitButtons}>
              <TouchableOpacity style={[styles.draftBtn, { borderColor: '#FF1E2D' }]} onPress={() => saveToSupabase('draft')} activeOpacity={0.8}>
                <Text style={styles.draftBtnText}>Save as Draft</Text>
              </TouchableOpacity>
              <GradientButton label="Submit for Approval" onPress={() => saveToSupabase('pending_approval')} loading={saving} />
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { if (currentStep === 0) router.back(); else back(); }} style={styles.backBtn} activeOpacity={0.7}>
            <ArrowLeft size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginHorizontal: 12 }}>
            <Text style={[styles.stepLabel, { color: colors.textMuted }]}>Step {currentStep + 1} of {TOTAL_STEPS}</Text>
            <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>{stepTitles[currentStep]}</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
          <LinearGradient
            colors={['#FF1E2D', '#FF5A1F', '#FFB300']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${((currentStep + 1) / TOTAL_STEPS) * 100}%` }]}
          />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {renderStep()}
        </ScrollView>

        {currentStep < TOTAL_STEPS - 1 && (
          <View style={[styles.footer, { borderTopColor: colors.border, paddingBottom: insets.bottom + 12 }]}>
            <GradientButton label="Next Step" onPress={next} />
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12 },
  backBtn: { padding: 4 },
  stepLabel: { fontFamily: 'System', fontSize: 12, marginBottom: 2 },
  stepTitle: { fontFamily: 'System', fontSize: 18, fontWeight: '700' },
  progressBg: { height: 4, marginHorizontal: 20, borderRadius: 999, marginBottom: 20 },
  progressFill: { height: 4, borderRadius: 999 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },
  stepContent: { gap: 0 },
  fieldLabel: { fontFamily: 'System', fontSize: 13, marginBottom: 8, marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chipCol: { flexDirection: 'column', gap: 8, marginBottom: 16 },
  optionChip: { borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  optionChipText: { fontFamily: 'System', fontSize: 13 },
  stepSectionLabel: { fontFamily: 'System', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  reviewTitle: { fontFamily: 'System', fontSize: 20, fontWeight: '700', marginBottom: 16 },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, gap: 12 },
  reviewLabel: { fontFamily: 'System', fontSize: 13 },
  reviewValue: { fontFamily: 'System', fontSize: 13, textAlign: 'right', flex: 1 },
  submitButtons: { gap: 12, marginTop: 24 },
  draftBtn: { height: 52, borderWidth: 1.5, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  draftBtnText: { fontFamily: 'System', fontSize: 15, color: '#FF1E2D' },
  footer: { paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1 },
});
