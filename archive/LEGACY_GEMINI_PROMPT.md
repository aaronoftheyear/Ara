# Legacy Gemini Prompt (Pre Chat/Rec Split)

> Snapshot: 2025-11-14 before introducing the dedicated chat-engine pipeline.  
> Origin: `createSystemInstruction()` inside `services/geminiService.ts`.

## Structure

1. **Persona Block** – Character personality, likes/dislikes, behavior rules, expertise mapping, referral instructions.
2. **User Taste Data** – High-rated / low-rated / watching slices (20/10/5 entries respectively).
3. **Exclusion + PTW Lists** – Franchise-grouped exclusion list (`|` separated), PTW list filtered by detected genre/year/era.
4. **Seasonal Context** – Current date, season status, upcoming content rules, seasonal anime titles.
5. **Conversation History & Output Schema** – Instructions to respond in JSON with `responseText`, `recommendations`, `warnings`, etc.

This entire payload (persona + taste + seasonal + schema) was sent to the **rec-engine** (`VITE_GEMINI_REC_API_KEY`) for *every* request, regardless of helper strength. The chat-engine key was only used for `generateReferralDialogue()` (and even that is now mostly served by local templates).

## Why Archive?

The new split pushes persona/convo to the chat key and keeps user data with the rec key. If we ever need to roll back to the monolithic approach, this document captures the high-level composition so we can reconstruct the legacy prompt (or compare diffs when debugging future regressions).

