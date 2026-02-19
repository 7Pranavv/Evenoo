import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Package, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { StatusBadge } from '@/components/ui/Badge';
import { GradientButton } from '@/components/ui/GradientButton';
import { Input } from '@/components/ui/Input';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabase';
import { VendorInventoryItem } from '@/types';

const ITEM_CATEGORIES = ['Photography', 'Catering', 'Sound', 'Lighting', 'Decoration', 'Anchor/MC', 'Security', 'Other'];
const PRICING_TYPES = [{ key: 'per_event', label: 'Per Event' }, { key: 'per_day', label: 'Per Day' }, { key: 'per_person', label: 'Per Person' }];

export default function InventoryScreen() {
  const { user } = useAuthStore();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<VendorInventoryItem[]>([]);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Photography', description: '', price: '', pricing_type: 'per_event', quantity: '1' });

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    let vid = vendorId;
    if (!vid) {
      const { data: v } = await supabase.from('vendors').select('id').eq('uid', user.id).maybeSingle();
      if (!v) {
        await supabase.from('vendors').insert({ uid: user.id, name: user.name, category: 'General', contact_email: user.email });
        const { data: newV } = await supabase.from('vendors').select('id').eq('uid', user.id).maybeSingle();
        vid = newV?.id ?? null;
      } else vid = v.id;
      setVendorId(vid);
    }
    if (!vid) { setLoading(false); return; }
    const { data } = await supabase.from('vendor_inventory').select('*').eq('vendor_id', vid).order('created_at', { ascending: false });
    setItems((data as VendorInventoryItem[]) ?? []);
    setLoading(false);
  };

  const addItem = async () => {
    if (!form.name || !vendorId) return;
    setSaving(true);
    await supabase.from('vendor_inventory').insert({
      vendor_id: vendorId,
      name: form.name,
      category: form.category,
      description: form.description || null,
      price: parseFloat(form.price || '0'),
      pricing_type: form.pricing_type,
      quantity: parseInt(form.quantity || '1'),
      availability_status: 'available',
    });
    await fetchInventory();
    setShowModal(false);
    setSaving(false);
    setForm({ name: '', category: 'Photography', description: '', price: '', pricing_type: 'per_event', quantity: '1' });
  };

  const toggleAvailability = async (item: VendorInventoryItem) => {
    const newStatus = item.availability_status === 'available' ? 'unavailable' : 'available';
    await supabase.from('vendor_inventory').update({ availability_status: newStatus }).eq('id', item.id);
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, availability_status: newStatus } : i));
  };

  const deleteItem = async (id: string) => {
    Alert.alert('Delete Item', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await supabase.from('vendor_inventory').delete().eq('id', id);
        setItems((prev) => prev.filter((i) => i.id !== id));
      }},
    ]);
  };

  const PRICING_LABELS: Record<string, string> = { per_event: 'per event', per_day: 'per day', per_person: 'per person' };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>My Inventory</Text>
        <TouchableOpacity onPress={() => setShowModal(true)} style={styles.addFab} activeOpacity={0.8}>
          <Text style={styles.addFabText}>Add Item</Text>
          <Plus size={16} color="#FF1E2D" />
        </TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator color="#FF1E2D" style={{ marginTop: 40 }} /> : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.itemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemName, { color: colors.textPrimary }]}>{item.name}</Text>
                <Text style={[styles.itemCategory, { color: colors.textMuted }]}>{item.category}</Text>
                <Text style={[styles.itemPrice, { color: '#FF1E2D' }]}>₹{item.price} <Text style={{ color: colors.textMuted, fontFamily: 'System', fontSize: 12 }}>{PRICING_LABELS[item.pricing_type]}</Text></Text>
              </View>
              <View style={styles.itemActions}>
                <StatusBadge status={item.availability_status} />
                <View style={styles.actionBtns}>
                  <TouchableOpacity onPress={() => toggleAvailability(item)} style={[styles.actionBtn, { backgroundColor: 'rgba(255,30,45,0.08)' }]} activeOpacity={0.7}>
                    {item.availability_status === 'available' ? <ToggleRight size={16} color="#FF1E2D" /> : <ToggleLeft size={16} color="#94A3B8" />}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteItem(item.id)} style={[styles.actionBtn, { backgroundColor: '#FEE2E2' }]} activeOpacity={0.7}>
                    <Trash2 size={16} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={[styles.emptyIcon, { backgroundColor: 'rgba(255,30,45,0.08)' }]}><Package size={32} color="#FF1E2D" /></View>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No inventory yet</Text>
              <Text style={[styles.emptySub, { color: colors.textMuted }]}>Add your first service or product listing</Text>
              <GradientButton label="Add Item" onPress={() => setShowModal(true)} style={{ marginTop: 16 }} size="sm" />
            </View>
          }
        />
      )}

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Add Inventory Item</Text>
              <TouchableOpacity onPress={() => setShowModal(false)} activeOpacity={0.7}><X size={22} color={colors.textMuted} /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Input label="Item Name *" value={form.name} onChangeText={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="e.g. Professional Photography" />
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                {ITEM_CATEGORIES.map((c) => (
                  <TouchableOpacity key={c} onPress={() => setForm((f) => ({ ...f, category: c }))} style={[styles.chip, { borderColor: form.category === c ? '#FF1E2D' : colors.border, backgroundColor: form.category === c ? '#FF1E2D' : colors.background }]} activeOpacity={0.7}>
                    <Text style={[styles.chipText, { color: form.category === c ? '#fff' : colors.textMuted }]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Input label="Description" value={form.description} onChangeText={(v) => setForm((f) => ({ ...f, description: v }))} placeholder="Brief description..." multiline style={{ minHeight: 80 }} />
              <Input label="Price (₹)" value={form.price} onChangeText={(v) => setForm((f) => ({ ...f, price: v }))} placeholder="e.g. 5000" keyboardType="numeric" />
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Pricing Type</Text>
              <View style={styles.chipRow2}>
                {PRICING_TYPES.map((pt) => (
                  <TouchableOpacity key={pt.key} onPress={() => setForm((f) => ({ ...f, pricing_type: pt.key }))} style={[styles.chip, { borderColor: form.pricing_type === pt.key ? '#FF1E2D' : colors.border, backgroundColor: form.pricing_type === pt.key ? '#FF1E2D' : colors.background }]} activeOpacity={0.7}>
                    <Text style={[styles.chipText, { color: form.pricing_type === pt.key ? '#fff' : colors.textMuted }]}>{pt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Input label="Quantity Available" value={form.quantity} onChangeText={(v) => setForm((f) => ({ ...f, quantity: v }))} placeholder="e.g. 1" keyboardType="numeric" />
              <GradientButton label="Add to Inventory" onPress={addItem} loading={saving} style={{ marginTop: 8 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  title: { fontFamily: 'System', fontSize: 24, fontWeight: '700' },
  addFab: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderColor: '#FF1E2D', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  addFabText: { fontFamily: 'System', fontSize: 13, color: '#FF1E2D' },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  itemCard: { borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  itemName: { fontFamily: 'System', fontSize: 15, fontWeight: '600', marginBottom: 2 },
  itemCategory: { fontFamily: 'System', fontSize: 12, marginBottom: 4 },
  itemPrice: { fontFamily: 'System', fontSize: 14, fontWeight: '700' },
  itemActions: { alignItems: 'flex-end', gap: 8 },
  actionBtns: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyIcon: { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emptyTitle: { fontFamily: 'System', fontSize: 18 },
  emptySub: { fontFamily: 'System', fontSize: 14, textAlign: 'center' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontFamily: 'System', fontSize: 20, fontWeight: '700' },
  fieldLabel: { fontFamily: 'System', fontSize: 13, marginBottom: 8 },
  chipRow: { gap: 8, marginBottom: 16 },
  chipRow2: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
  chipText: { fontFamily: 'System', fontSize: 12 },
});
