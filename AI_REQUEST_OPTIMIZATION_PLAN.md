# AI Request Optimization Plan

## Answers to Your Questions

### 1. Character Persona & Preferences
**Q: Does it only send the info of the character in use?**
**A: YES** ✅ - Only the current character's data is sent:
- `characterData.personality` - Current character's personality
- `characterData.likes` - Current character's likes
- `characterData.dislikes` - Current character's dislikes
- `characterData.name` - Current character's name

**Status:** Already optimized ✅

---

### 2. Expertise System & Referral Rules
**Q: Can you explain the referral rules it sends?**

**A: Here's how the referral system works:**

#### When Referrals Happen:
- Character is **weak (-)** in the requested genre
- User asks for a genre the character doesn't specialize in

#### Two Scenarios:

**Scenario 1: No Other Characters Available (First Time)**
- Character acknowledges weakness
- Gives **1 recommendation** that bridges their strength + requested genre
- Example: "Romance? Not my thing, but here's one with action too!"

**Scenario 2: Other Characters Available (Second+ Time)**
- Character acknowledges weakness
- Uses **REFERRAL format** to hand off to expert character
- Gives **NO recommendations** (empty array)
- Format: `REFERRAL:character_id:Character Name|HANDOFF:message|ACK:response`

#### Special Cases:
- **Veldora + Manga:** Romance/drama/psychological manga → refer to Kakashi
- **Kakashi + Manga:** Action/adventure/shonen manga → refer to Veldora
- **Veldora + Anime:** Only handles action/adventure/shonen, refers others
- **Kakashi + Anime:** Only handles romance/ecchi/fanservice, refers others

**Status:** Already working correctly ✅

---

### 3. Plan to Watch List
**Q: Is the plan to watch needed? It's only needed when:**
- User asks for anime from the plan to watch list
- OR when exclude plan to watch is enabled
- Also, plan to watch can be filtered by genre

**A: Currently ALWAYS sent** ❌

**Should be conditional:**
- ✅ Send when `settings.recommendFromPTW === true` (to allow recommending from PTW)
- ✅ Send when `settings.recommendFromPTW === false` (to know what NOT to recommend)
- ✅ Send when user explicitly asks for PTW titles
- ❌ Can be filtered by genre (same as exclusion list)

**Status:** Needs optimization ⚠️

---

### 4. Seasonal Anime List
**Q: Seasonal should only be sent when user asks for a season**

**A: Already conditional** ✅
- Only sent when `seasonalContext?.year && seasonalContext?.season` is provided
- Fetched from Jikan API only when needed

**Status:** Already optimized ✅

---

## Optimization Implementation Plan

### Priority 1: Plan to Watch List Optimization

**Current Behavior:**
- Always sends full PTW list (~500-2000 chars)

**Optimized Behavior:**
1. **Always send PTW rules** (needed for franchise/chronology checks) - ~200 chars
2. **Conditionally send PTW list:**
   - Send full list when `settings.recommendFromPTW === true` (to allow recommendations)
   - Send filtered list when `settings.recommendFromPTW === false` (only for exclusion checks)
   - Filter by genre when user asks for specific genre
   - Send empty list when not needed

**Expected Savings:**
- When PTW not needed: ~500-2000 chars saved
- When filtered by genre: ~70-90% reduction (same as exclusion list)

### Priority 2: Plan to Watch Genre Filtering

**Implementation:**
- Use same `filterExclusionList` logic for PTW
- Filter PTW by detected genres from user prompt
- Only send matching PTW titles when filtering is active

**Expected Savings:**
- Genre filter: ~70-90% reduction
- Genre + Year filter: ~95% reduction

---

## Summary of Changes Needed

1. ✅ **Character persona** - Already optimized (only current character)
2. ✅ **Referral rules** - Already working correctly
3. ⚠️ **Plan to watch** - Needs conditional sending + genre filtering
4. ✅ **Seasonal anime** - Already conditional

**Next Steps:**
- Implement conditional PTW sending
- Add PTW genre filtering
- Test with various scenarios

