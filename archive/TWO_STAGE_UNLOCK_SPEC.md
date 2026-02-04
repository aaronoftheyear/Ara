# Two-Stage Unlock System Specification

## 🎯 Concept Overview

Instead of unlocking characters immediately on first genre request, implement a discovery system where:
1. **First Request:** Character appears as "Unknown Contact" (blurred, generic description)
2. **Second Request:** Character is fully revealed and unlocked

---

## 📊 Implementation Requirements

### **New States Needed:**

1. **Discovered Characters** (new state)
   ```typescript
   const [discoveredCharacters, setDiscoveredCharacters] = useState<string[]>([]);
   ```
   - Characters that have been hinted at but not fully unlocked
   - Stored in localStorage

2. **Genre Request Counter** (new state)
   ```typescript
   const [genreRequestCounts, setGenreRequestCounts] = useState<{[key: string]: number}>({});
   ```
   - Tracks how many times user requested each genre
   - Example: `{ "magical_girl": 2, "romance": 1, "mecha": 3 }`

### **Character States:**
- **Locked** - Not discovered, not visible
- **Discovered** - Visible in selector but blurred/generic, not clickable
- **Unlocked** - Fully visible, clickable, usable

---

## 🎨 UI Changes

### **Character Selector - Discovered Character:**
```
┌─────────────────────────────────┐
│ 🔒 ??? (Magical Girl Fanatic)  │
│    [Blurred profile image]      │
│    Make another request to      │
│    unlock this character        │
└─────────────────────────────────┘
```

### **First Request Flow:**
```
User: "magical girl anime"
Bakugo: "Tch! Magical girl?! That's not my thing... 
         But here's one I've heard is good: 
         [1 recommendation]"
[No referral buttons]

System notification: "📱 New unknown contact discovered!"

Character Selector now shows:
  - Bakugo ✅
  - ??? (Magical Girl Fanatic) 🔒 [blurred]
```

### **Second Request Flow:**
```
User: "more magical girl anime"
Bakugo: "Tch! You're REALLY into that stuff, huh?! 
         Fine, I know someone who's obsessed with 
         that crap!"
[Referral buttons appear: "Discover Marin"]

User clicks "Discover Marin"

System: "🎉 Marin Kitagawa has been unlocked!"
Bakugo: "Yo Marin! Aaron wants magical girl anime!"
Marin: "OMG! I'm SO excited!"
Bakugo: "has left the chat"
[Marin sends 3 recommendations]

Character Selector now shows:
  - Bakugo ✅
  - Marin Kitagawa ✅ [fully visible]
```

---

## 🔧 Technical Implementation

### **1. Discovered Characters State:**
```typescript
interface DiscoveredCharacter {
  characterId: string;
  discoveredGenre: string; // Genre that triggered discovery
  requestCount: number; // How many times user requested this genre
}

const [discoveredCharacters, setDiscoveredCharacters] = useState<DiscoveredCharacter[]>([]);
```

### **2. Genre Request Tracking:**
```typescript
// In handleSend or getAnimeRecommendation
const detectGenreFromRequest = (request: string): string[] => {
  // Detect which genres the request is about
  // Return array like ['magical_girl', 'romance']
};

// Increment counter
const incrementGenreCount = (genres: string[]) => {
  setGenreRequestCounts(prev => {
    const updated = { ...prev };
    genres.forEach(genre => {
      updated[genre] = (updated[genre] || 0) + 1;
    });
    return updated;
  });
};
```

### **3. Discovery Logic:**
```typescript
// First request for weak genre
if (isWeakGenre && genreRequestCounts[genre] === 1) {
  // Don't refer, just give 1 recommendation
  // Add to discovered characters
  const expertCharacter = getExpertForGenre(genre)[0];
  if (expertCharacter && hasWatchedFranchise(expertCharacter)) {
    addToDiscovered(expertCharacter.id, genre);
    showNotification("📱 New unknown contact discovered!");
  }
}

// Second request for same weak genre
if (isWeakGenre && genreRequestCounts[genre] >= 2) {
  // Now refer to expert
  // Show referral buttons
}
```

### **4. Character Selector - Discovered UI:**
```typescript
{ASSISTANT_CHARACTERS.map(char => {
  const isUnlocked = unlockedCharacters.includes(char.id);
  const isDiscovered = discoveredCharacters.find(d => d.characterId === char.id);
  const isLocked = !isUnlocked && !isDiscovered;
  
  if (isLocked) return null; // Hide completely
  
  if (isDiscovered) {
    return (
      <div className="opacity-50 cursor-not-allowed">
        <img src={char.imagePath} className="blur-md" />
        <div>??? ({getGenericDescription(isDiscovered.discoveredGenre)})</div>
        <div className="text-xs">Make another request to unlock</div>
      </div>
    );
  }
  
  // Normal unlocked display
})}
```

### **5. Generic Descriptions:**
```typescript
const getGenericDescription = (genre: string): string => {
  const descriptions: {[key: string]: string} = {
    'magical_girl': 'Magical Girl Fanatic',
    'romance': 'Romance Expert',
    'mecha': 'Mecha Enthusiast',
    'horror': 'Horror Specialist',
    'ecchi': 'Fanservice Connoisseur',
    // etc...
  };
  return descriptions[genre] || 'Mystery Character';
};
```

---

## 📝 Files That Need Changes

1. **`types.ts`** - Add DiscoveredCharacter interface
2. **`App.tsx`** - Add discovered state, genre counting, two-stage logic
3. **`CharacterSelector.tsx`** - Add discovered character UI (blurred)
4. **`geminiService.ts`** - Update system instructions for two-stage referral
5. **`characterUnlockSystem.ts`** - Add discovered character helpers

---

## ⚠️ Complexity Warning

This is a **major feature addition** that requires:
- 4-5 new state variables
- Genre detection logic
- Request counting system
- New UI components for blurred characters
- Modified referral logic
- LocalStorage management for discovered characters

**Estimated:** ~15-20 file changes, significant complexity

---

## 💡 Simpler Alternative

Keep single-stage unlock but improve the experience:
- First weak genre request: No referral, 1 recommendation
- User must ask **twice** for same weak genre to get referral
- Simpler to implement, still creates progression

---

## ❓ Proceed?

Should I implement the full two-stage system or would you prefer the simpler approach?

