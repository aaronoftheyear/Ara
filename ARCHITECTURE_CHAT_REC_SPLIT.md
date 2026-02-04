# Chat vs Rec Engine Split Plan

## 1. Current (Legacy) Pipeline

| Stage | Engine | Payload Size | Responsibility |
| --- | --- | --- | --- |
| `getAnimeRecommendation()` | Rec key (`VITE_GEMINI_REC_API_KEY`) | ~28–32K chars | Persona, user history, exclusion/PTW lists, seasonal data, referral rules, JSON schema, output (messages + recs) |
| `generateReferralDialogue()` | Chat key (`VITE_GEMINI_CHAT_API_KEY`) | ~5–8K chars | *Only* referral banter when Gemini is healthy; otherwise local templates |

**Implications**
- Rec key handles *everything*, so every user request sends the full persona + history blob even when the helper is weak.
- Chat key is under-utilized; most handoffs now use local templates, so the key idles and offers no real failover.
- When helpers are weak, we still call rec-engine only to throw away the output if a referral happens.

## 2. Target Pipeline

| Stage | Engine | Payload Contents | Output |
| --- | --- | --- | --- |
| `getCharacterDialogue()` *(new name for chat path)* | Chat key | Persona, convo rules, unlock state, short request context | Character speech OR handoff script (no rec JSON) |
| `getRecommendations()` *(trimmed rec path)* | Rec key | User taste slices, exclusions, PTW, request context, JSON schema | 3 recs (strength/neutral) OR 1 rec (weak + locked buddy). Skipped entirely when handing off. |

**Load Expectations**
- Chat payload: ~18–22K chars per message (persona + rules only). Traffic matches conversation cadence.
- Rec payload: ~13–16K chars (taste data only). Calls drop whenever helper is weak and a specialist is unlocked.

## 3. Execution Matrix

| Helper State | Chat Engine | Rec Engine | Rendered Output |
| --- | --- | --- | --- |
| Strength / Neutral | Persona response (enthusiastic) | 3 recs | `[chat message] + [3 rec cards]` |
| Weakness + Buddy Locked | Persona response acknowledging weakness + bridge rec | 1 rec | `[chat message] + [1 rec card]` |
| Weakness + Buddy Unlocked | Handoff script (helper intro, handoff, ack) | *Skipped* | `[handoff block]` (new specialist later requests recs) |

## 4. Implementation Steps

1. **Archive Legacy Logic** – Snapshot the previous all-in-one prompt (see `archive/LEGACY_GEMINI_PROMPT.md`) and flag the code commit.
2. **Create Chat Payload Builder** – Extract persona system-instruction (currently `createSystemInstruction`) into `buildChatPersonaPrompt()` that omits exclusion/PTW tables.
3. **Refactor Rec Payload Builder** – New `buildRecommendationPrompt()` that includes only user taste data + request context.
4. **Update `GeminiService` API**
   - `getAnimeRecommendation()` → fan-out: `fetchCharacterDialogue()` + conditional `fetchRecommendations()`.
   - Normalize responses so the UI knows whether recs are attached or if a handoff occurred.
5. **UI/State Changes**
   - Accept optional `characterMessage` and `recommendations` separately.
   - Skip rendering rec cards when `recommendations.length === 0`.
6. **Backup Strategy**
   - If chat-engine fails: fall back to local `referralDialogueTemplates` for handoffs or a minimal persona string for strength responses.
   - If rec-engine fails: degrade to cached/local suggestions (unchanged from current behavior).

## 5. Testing Checklist

- Strength genre (e.g., Marin on romance) returns 3 recs and a persona message.
- Weak genre with locked buddy produces exactly one rec + playful message.
- Weak genre with unlocked buddy issues a handoff; no rec call fired until the new specialist replies.
- Rate-limit or outage on chat key triggers the fallback template without blocking rec-engine.
- `CHANGELOG.md` updated with the migration summary once completed.

