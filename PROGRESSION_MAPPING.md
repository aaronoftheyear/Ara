# 🎯 Character Unlock Difficulty Progression

**Goal:** Create organic progression where characters are discovered at different rates based on genre diversity

---

## 📊 Desired Difficulty Tiers

### **Tier 0: Starting Character**
1. **Yuji** - Always unlocked

### **Tier 1: Easy (Direct from Yuji)**
2. **Marin** - Yuji weak in: Magical Girl, Romance, Ecchi, Shojo, Josei, Idol, Fanservice, Eroge, Adult Games, Slice of Life

### **Tier 2: Easy-Medium (1-2 hops)**
3. **Ishigami** - Yuji weak in: Gaming, OR Marin weak in: Isekai

### **Tier 3: Medium (2 hops)**
4. **Kinta** - Ishigami weak in: Mecha (ONLY Ishigami should refer to Kinta for mecha)

### **Tier 3-4: Medium (2 hops)**
4.5. **Rikka** - Marin weak in: Supernatural, Fantasy

### **Tier 4: Medium (2 hops, parallel paths)**
5. **Shinpachi** - Yuji/Kinta weak in: Idol, Music
5. **Kyoutarou** - Marin weak in: Horror/Psychological

### **Tier 5: Medium-Hard (3 hops)**
6. **Rudeus** - Ishigami/Ainz weak in: Isekai (mature/ecchi themes), OR Shinpachi/Kyoutarou weak in: Harem/Ecchi

### **Tier 6: Hard (3-4 hops)**
7. **Ainz** - Kyoutarou/Ishigami weak in: Isekai, OR Marin weak in: Horror

### **Tier 7: Hard (4 hops)**
8. **Kanbaru** - Kyoutarou weak in: Sports, OR Marin weak in: BL

### **Tier 8: Very Hard (5 hops)**
9. **Daru** - Kinta weak in: Ecchi/Harem, OR Marin weak in: Sci-Fi

### **Tier 9-10: Endgame (5+ hops or special conditions)**
10. **Kakashi** - Requires specific "romance manga" compound keyword
10. **Veldora** - Requires specific "shonen manga" compound keyword OR battle shonen manga interrupt

---

## 🔧 Required Expertise Adjustments

### **Yuji (Tier 0) - Many Weaknesses for Easy Discovery**
**Current weaknesses:** Slice of Life, Romance, Ecchi, Harem, Fanservice, Eroge, Adult Games, Idol, Magical Girl, Shojo, Josei

**Changes needed:**
- Add Gaming weakness → Ishigami (tier 2)
- Keep all Marin-leading weaknesses (tier 1)

**Updated Yuji:**
```
Weaknesses (-):
- Magical Girl → Marin
- Romance → Marin
- Ecchi → Marin
- Shojo → Marin
- Josei → Marin
- Slice of Life → Marin
- Fanservice → Marin
- Eroge → Marin
- Adult Games → Marin
- Idol → Shinpachi (also tier 4)
- Gaming → Ishigami (tier 2)
- Harem → Marin
```

### **Marin (Tier 1) - Refers to Tier 2-4**
**Should refer to:** Ishigami (tier 2), Kyoutarou (tier 4)

**Updated Marin:**
```
Weaknesses (-):
- Horror → Kyoutarou (tier 4)
- Psychological → Kyoutarou (tier 4)
- Isekai → Ishigami (tier 2)
- Gaming → Ishigami (tier 2)
- Mecha → Kinta (tier 3)
- Military → Kinta (tier 3)
```

### **Ishigami (Tier 2) - Refers to Tier 3-5**
**Should refer to:** Kinta (tier 3), Rudeus (tier 5)

**Updated Ishigami:**
```
Weaknesses (-):
- Mecha → Kinta (tier 3)
- Shojo → Rikka (removed - makes Rikka too easy)
- Josei → Kanbaru (tier 7 - too far)
```

**Better:**
```
Weaknesses (-):
- Mecha → Kinta (tier 3)
- Ecchi/Harem → Rudeus (tier 5)
```

### **Kinta (Tier 3) - Refers to Tier 4-8**
**Should refer to:** Shinpachi (tier 4), Daru (tier 8)

**Updated Kinta:**
```
Weaknesses (-):
- Idol → Shinpachi (tier 4)
- Ecchi → Daru (tier 8)
- Harem → Daru (tier 8)
- Magical Girl → Keep Marin (already unlocked by this point)
```

### **Shinpachi (Tier 4) - Refers to Tier 5-9**
**Should refer to:** Rudeus (tier 5)

**Updated Shinpachi:**
```
Weaknesses (-):
- Ecchi → Rudeus (tier 5)
- Harem → Rudeus (tier 5)
- Eroge → Rudeus (tier 5)
- Fanservice → Rudeus (tier 5)
- Mecha → Kinta (already unlocked)
- Battle Shonen → Yuji (already unlocked)
```

### **Kyoutarou (Tier 4) - Refers to Tier 5-8**
**Should refer to:** Rudeus (tier 5), Kanbaru (tier 7)

**Updated Kyoutarou:**
```
Weaknesses (-):
- Isekai → Rudeus (tier 5)
- Ecchi/Harem → Rudeus (tier 5)
- Sports → Kanbaru (tier 7)
- Mecha → Kinta (already unlocked)
```

### **Rudeus (Tier 5) - Refers to Tier 6-8**
**Should refer to:** Ainz (tier 6)

**Updated Rudeus:**
```
Weaknesses (-):
- Horror → Ainz (tier 6)
- Psychological → Ainz (tier 6)
- Slice of Life → Shinpachi (already unlocked)
- Shojo → Keep for back-reference
- Idol → Keep for back-reference
```

### **Ainz (Tier 6) - Refers to Tier 7-8**
**Should refer to:** Kanbaru (tier 7)

**Updated Ainz:**
```
Weaknesses (-):
- Sports → Kanbaru (tier 7)
- Ecchi/Fanservice → Kanbaru (tier 7)
- Slice of Life → (already have Shinpachi)
- Harem → Rudeus (already unlocked)
```

### **Kanbaru (Tier 7) - Refers to Tier 8-9**
**Should refer to:** Daru (tier 8)

**Updated Kanbaru:**
```
Weaknesses (-):
- Mecha → Kinta (already unlocked)
- Cyberpunk → Daru (tier 8)
- Eroge → Daru (tier 8)
- Battle Shonen → Yuji (already unlocked)
```

### **Daru (Tier 8) - Refers to Tier 9-10**
**Should refer to:** Kakashi (tier 10)

**Updated Daru:**
```
Weaknesses (-):
- Romance → Kakashi (tier 10)
- Magical Girl → (already have Marin)
- Shojo → (already have others)
```

---

Sir, shall I proceed with implementing these expertise adjustments to create the desired difficulty progression? This will establish:

- **Easy unlocks:** Marin, Ishigami (common genres from Yuji)
- **Medium unlocks:** Kinta, Shinpachi, Kyoutarou, Rudeus (2-3 hops)
- **Hard unlocks:** Ainz, Kanbaru, Daru (3-4 hops)
- **Endgame unlocks:** Kakashi, Veldora (5+ hops or special triggers)

The system remains non-linear - users can ask for any genre and discover different paths, but the average difficulty follows your specified order.
