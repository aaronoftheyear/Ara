# Character Unlock System Design

## 🎯 Concept
A progressive character discovery system where users start with 1-2 basic characters and unlock more specialized characters through natural interaction.

---

## 📊 Starting Character Analysis

### **Best Starting Characters (Neutral & Broad):**

1. **Yu Ishigami** ⭐ **RECOMMENDED #1**
   - **Why:** Most neutral/balanced character
   - **Expertises:** Gaming, Isekai, Comedy, School, Virtual Reality, Shonen, Seinen
   - **Personality:** Casual, laid-back, relatable otaku
   - **Coverage:** Broad appeal, not too specialized
   - **Weaknesses:** Only Shojo & Josei (will naturally refer users to other characters)

2. **Shimura Shinpachi** ⭐ **RECOMMENDED #2**
   - **Why:** Friendly, helpful, good "guide" character
   - **Expertises:** Idol, Comedy, Slice of Life, School, Music
   - **Personality:** Polite, straightforward, acts as a good "tutorial" character
   - **Coverage:** Different strengths from Ishigami (complements him well)
   - **Weaknesses:** Mecha, Magical Girl, Ecchi (will refer users to specialists)

### **Why These Two?**
- **Complementary Coverage:** Ishigami handles action/gaming/isekai, Shinpachi handles comedy/slice-of-life/idol
- **Natural Referral Paths:** Both have weaknesses that lead to other characters
- **Personality Balance:** One casual (Ishigami), one polite (Shinpachi)
- **Neutral Enough:** Not too specialized, won't alienate users

---

## 🔓 Unlock System Flow

### **🎬 Franchise-Based Unlock System**

**Core Mechanic:** You can only unlock a character if you've watched their anime!

### **Discovery Paths:**

```
USER watches "Overlord" + Asks for Horror → AINZ unlocked ✅
USER watches "My Dress-Up Darling" + Gets referred by character → MARIN unlocked ✅
USER asks for Mecha but hasn't watched "Dandadan" → KINTA stays locked ❌
```

### **Unlock Requirements (Two-Part System):**

1. **Franchise Requirement (MANDATORY):**
   - User MUST have the character's anime in their MAL list
   - Examples:
     - **Marin:** "My Dress-Up Darling" / "Sono Bisque Doll wa Koi wo Suru"
     - **Kinta:** "Dandadan"
     - **Veldora:** "That Time I Got Reincarnated as a Slime"
     - **Ainz:** "Overlord"
     - **Rikka:** "Love, Chunibyo & Other Delusions"
     - **Daru:** "Steins;Gate"

2. **Trigger Condition (ONE of these):**
   - **Referral-based:** Character refers you to specialist
   - **Genre-based:** Ask for specific genre that matches their expertise
   - **Natural Discovery:** Characters mention them in conversation

### **Example Unlock Flow:**
```
1. User has "Overlord" in their MAL list ✅
2. User asks for "dark isekai" → Ishigami refers to Ainz
3. System checks: Has user watched "Overlord"? YES ✅
4. 🎉 AINZ OOAL GOWN UNLOCKED!
```

```
1. User has NOT watched "Dandadan" ❌
2. User asks for "mecha"
3. System checks: Is Kinta unlocked? NO ❌
4. Ishigami does NOT refer to Kinta (locked)
5. Ishigami says: "Mecha anime? Man, I wish I knew more about that stuff..."
6. Ishigami gives ONLY 1 recommendation - tries to bridge with his expertise (e.g., mecha + gaming)
7. UI shows: 🔒 Kinta Sakata (LOCKED) [no hints]
8. User discovers unlock naturally through interaction
```

---

## 🎭 Character Behavior: Weak Genre Protocol

### **When Character Receives Request for Their Weak Genre:**

**If Expert Character IS Unlocked:**
- Character refers to the expert with enthusiasm
- User gets choice to switch or continue
- Standard 3 recommendations from expert

**If Expert Character is NOT Unlocked:**
- Character is humble: "I wish I knew more about [genre]..."
- Character gives ONLY 1 recommendation (not 3)
- Character does their best to help despite weakness
- No referral to locked character

### **Examples:**

#### **Scenario 1: Expert Unlocked**
```
User: "Recommend mecha anime"
Ishigami (weak in mecha, Kinta is unlocked):
  "Mecha? That's more Kinta's thing! He's THE expert!"
  [Referral buttons appear]
  [Gives 3 recommendations]
```

#### **Scenario 2: Expert Locked (Smart Bridging)**
```
User: "Recommend ecchi anime"
Ishigami (gaming/isekai expert, weak in ecchi, Daru is locked):
  "Ecchi anime? That's not really my specialty...
   But there's this isekai with some fanservice that's 
   supposed to be really good:"
  [Recommends "Mushoku Tensei" - isekai + ecchi]
  [No referral buttons]
  [Gives ONLY 1 recommendation]
  
Character Selector shows:
  🔒 Itaru "Daru" Hashida (LOCKED)
     └─ [No hints - mystery unlock]
```

**Why This Works:**
- Ishigami stays in his comfort zone (isekai) while addressing request (ecchi)
- Recommendation bridges both genres
- More confident response since it's partially his expertise

---

## 🎨 UI/UX Design

### **Character Selector with Locked Characters:**
```
┌─────────────────────────────────────────────┐
│  Select Character:                          │
├─────────────────────────────────────────────┤
│ ✅ Yu Ishigami                             │
│ ✅ Shimura Shinpachi                       │
│ 🔒 Marin Kitagawa (LOCKED)                 │
│ 🔒 Kinta Sakata (LOCKED)                   │
│ 🔒 Veldora Tempest (LOCKED)                │
│ ✅ Ainz Ooal Gown                          │
│    └─ ⭐ NEW! Click to switch              │
└─────────────────────────────────────────────┘

Note: No hints shown - users discover through natural 
      interaction and referrals
```

### **Unlock Notification:**
```
┌─────────────────────────────────┐
│  🎉 NEW CHARACTER UNLOCKED!    │
│                                 │
│  Marin Kitagawa                │
│  [Character Image]              │
│                                 │
│  "OMG! I'm SO excited to help  │
│   you with recommendations!"    │
│                                 │
│  Specialty: Magical Girl,      │
│  Shojo, Romance, Fanservice    │
│                                 │
│  [ Switch to Marin ] [ Later ] │
└─────────────────────────────────┘
```

---

## 🔧 Implementation Status

### **✅ What's Ready:**
- ✅ `characterUnlockSystem.ts` - Complete unlock logic
- ✅ Starting character recommendations (Ishigami + Shinpachi)
- ✅ Unlock conditions for all 8 characters
- ✅ Helper functions for checking/saving unlock status
- ✅ Feature flag system (`UNLOCK_SYSTEM_ENABLED = false`)

### **❌ What Needs Implementation:**
- ❌ UI for displaying locked characters in selector
- ❌ Unlock notification modal/toast
- ❌ Integration with referral system to trigger unlocks
- ❌ Visual hints for how to unlock characters
- ❌ Progress tracking (optional: show partial progress)

---

## 💡 Additional Character Suggestions

If you want to add more characters to expand the roster:

### **Sports/Action Characters:**
- **Shoyo Hinata** (Haikyuu) - Sports anime expert
- **Tanjiro Kamado** (Demon Slayer) - Shonen action expert

### **Romance/Drama Characters:**
- **Miyuki Shirogane** (Kaguya-sama) - Romance strategist
- **Tooru Oikawa** (Haikyuu) - Drama/rivalry expert

### **Mystery/Thriller Characters:**
- **L** (Death Note) - Mystery/psychological thriller expert
- **Lelouch** (Code Geass) - Strategic/political anime expert

### **Classic/Retro Characters:**
- **Spike Spiegel** (Cowboy Bebop) - Classic anime expert
- **Kenshin Himura** (Rurouni Kenshin) - Historical/samurai expert

---

## 🎮 Gamification Ideas (Future)

1. **Achievement System:**
   - "Otaku Collector" - Unlock all characters
   - "Genre Explorer" - Ask for 10 different genres
   - "Referral Master" - Get referred 5 times

2. **Character Levels:**
   - Characters gain "experience" as you use them
   - Higher level = better recommendations (more personalized)

3. **Hidden Characters:**
   - Ultra-rare characters with special unlock conditions
   - E.g., "Watch 500 anime" or "Complete all genre requests"

4. **Character Relationships:**
   - Some characters are friends and appear together
   - Unlock synergy bonuses

---

## 🚀 How to Enable

When ready to activate:

1. **In `characterUnlockSystem.ts`:**
   ```typescript
   export const UNLOCK_SYSTEM_ENABLED = true;
   ```

2. **In `App.tsx`:**
   ```typescript
   import { initializeUnlockedCharacters, tryUnlockCharacter, saveUnlockedCharacters } from './data/characterUnlockSystem';
   
   // Initialize unlocked characters state
   const [unlockedCharacters, setUnlockedCharacters] = useState<string[]>(() => initializeUnlockedCharacters());
   
   // Filter available characters in selector
   const availableCharacters = CHARACTERS.filter(char => 
     isCharacterUnlocked(char.id, unlockedCharacters)
   );
   ```

3. **Integrate unlock logic in referral system**
4. **Add unlock notification UI**
5. **Update character selector to show locked characters with hints**

---

## 📝 Notes

- **Starting with 2 characters** provides good balance (not too limited, not overwhelming)
- **Ishigami + Shinpachi** cover broad genres and have natural referral paths
- **Unlock system is opt-in** - Feature flag allows easy testing
- **LocalStorage persistence** - Unlocked characters saved between sessions
- **Natural discovery** - Unlocks happen through normal app usage, not forced grinding

