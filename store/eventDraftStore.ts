import { create } from 'zustand';
import { CreateEventDraft } from '@/types';

const DEFAULT_DRAFT: CreateEventDraft = {
  name: '', tagline: '', description: '', category_id: '', subcategory_id: '',
  event_type: 'individual', event_level: 'college', event_mode: 'offline',
  registration_start: '', registration_end: '', event_start: '', event_end: '', result_date: '',
  venue_name: '', venue_address: '', venue_maps_link: '',
  platform_name: '', meeting_link: '', access_code: '',
  organizer_type: 'individual', contact_email: '', contact_phone: '', whatsapp_number: '',
  max_participants: '', registration_visibility: 'public', eligibility_criteria: '', participant_instructions: '',
  min_team_size: '2', max_team_size: '5', max_team_size_custom: '',
  team_name_required: false, team_leader_mandatory: true, allow_self_registration_only: true,
  submission_required: false, submission_type: 'file', allowed_file_formats: [], submission_deadline: '', max_file_size_mb: '10',
  fee_type: 'free', fee_structure: 'per_person', fee_per_person: '', team_flat_fee: '', team_fee_cap: '',
  payment_deadline: '', late_fee: '', refund_policy: 'no_refund',
  prize_pool_amount: '', prize_pool_type: 'monetary', prize_breakdown: [], certificate_types: [], certificate_issuer: '',
  logo_url: '', banner_url: '',
  instagram_link: '', youtube_link: '', website_link: '', hashtags: [],
  rules_and_regulations: '', code_of_conduct: '', disclaimer: '', terms_accepted: false,
};

interface EventDraftState {
  draft: CreateEventDraft;
  currentStep: number;
  update: (fields: Partial<CreateEventDraft>) => void;
  setStep: (step: number) => void;
  reset: () => void;
}

export const useEventDraftStore = create<EventDraftState>((set) => ({
  draft: { ...DEFAULT_DRAFT },
  currentStep: 0,
  update: (fields) => set((s) => ({ draft: { ...s.draft, ...fields } })),
  setStep: (step) => set({ currentStep: step }),
  reset: () => set({ draft: { ...DEFAULT_DRAFT }, currentStep: 0 }),
}));
