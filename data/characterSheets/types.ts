import type { AssistantCharacter } from '../characters';
import type { CharacterExpertise } from '../characterExpertise';
import type { BuddyPreference } from '../characterBuddies';
import type { Specialty } from '../characterSpecialties';
import type { WeaknessTemplateSet } from '../../archive/weaknessPersonaTemplates_2025-11-15';
import type { PairOverride } from '../../archive/referralDialogueTemplates_2025-11-15';

export interface ReferralChain {
  helperIntro?: string;
  handoffLine?: string;
  helperExcuse?: string;
  handoffPitch?: string;
  targetReply: string;
  targetPromise: string;
  acknowledgmentLine?: string;
}

export interface CharacterSheet {
  id: string;
  profile: AssistantCharacter;
  expertise: CharacterExpertise['genres'];
  buddies: BuddyPreference[];
  specialties: Specialty[];
  archivedWeaknessPersona: Record<string, WeaknessTemplateSet>;
  archivedReferralOverrides: Record<string, PairOverride>;
  referralChains: Record<string, ReferralChain[]>;
}

