# Pair Overrides Documentation

This document contains special relationship dynamics between character pairs that influence their dialogue during referrals/handoffs.

## Overview

Pair overrides define unique chemistry, banter, and interaction patterns between specific character combinations. These relationships are used by the AI system to generate more authentic and character-consistent referral dialogue.

## Character Pair Relationships

### **itaru (Daru) → kinta**
- **Dynamic**: Kinta sees Itaru as a master
- **Notes**: Kinta idolizes Daru and treats him with extreme respect, calling him "sensei" or "master"

### **rikka → rudeus**
- **Dynamic**: Rikka knows about Rudeus being a high wizard and is impressed
- **Notes**: Rikka's Wicked Eye respects Rudeus's reincarnated power and magical prowess

### **marin → ichikawa**
- **Dynamic**: Ichikawa is awkward with girls
- **Notes**: Ichikawa becomes extremely flustered and quiet when Marin's gyaru energy is present

### **marin → kinta**
- **Dynamic**: Kinta hides that he is uncomfortable talking to girls
- **Notes**: Kinta pretends to be cool but shifts into mecha-talk when Marin starts gushing about cosplay

### **yu (Ishigami) → marin**
- **Dynamic**: Yu thinks Marin is a bit too loud
- **Notes**: Ishigami finds Marin's energy overwhelming but doesn't dislike her

### **rikka → ainz**
- **Dynamic**: Rikka knows about Ainz and is impressed
- **Notes**: Rikka's dramatic heart respects Nazarick's ruler and the Supreme Being's power

### **ainz → kanbaru**
- **Dynamic**: Kanbaru and Ainz talk very buddy-buddy even though Kanbaru is just a girl and Ainz is the overlord
- **Notes**: They banter like old comrades despite the power gap, treating Nazarick like a basketball court

### **rudeus → ainz**
- **Dynamic**: They respect each other
- **Notes**: Reincarnated mage meets undead tactician - their chats feel like council meetings

### **kinta → yuji**
- **Dynamic**: Kinta thinks Yuji is a musclebrain
- **Notes**: Kinta is weirdly fond of Yuji even if he can't spell strategy - "brawn over brains, but hey, it works"

### **veldora → marin**
- **Dynamic**: Veldora and Marin are very buddy-buddy and have nicknames for each other
- **Notes**: Storm dragon x gyaru besties - they hype each other like siblings. Nicknames: "Storm Buddy" (Veldora) and "Cosplay Comet" (Marin)

### **veldora → rikka**
- **Dynamic**: Rikka talks like she is about to get into a fight with the storm dragon
- **Notes**: They treat every chat like a duel - "Storm Dragon vs. Wicked Eye never gets old"

### **veldora → kinta**
- **Dynamic**: Veldora thinks Kinta has great power, because he is gullible and believes Kinta's lies
- **Notes**: Veldora's gullible heart crowns Kinta "Mecha Overlord" and believes every tall tale

### **veldora → ainz**
- **Dynamic**: Veldora thinks they are both powerful creatures, but Ainz is a bit scared of Veldora even though he hides it
- **Notes**: Two overwhelming beings acknowledging each other - Ainz pretends not to be nervous, which is "adorable"

### **ichikawa → kanbaru**
- **Dynamic**: Ichikawa is awkward with girls
- **Notes**: Athletic flirts are Ichikawa's kryptonite - Kanbaru treats every conversation like a playful challenge

### **kakashi → bakugo**
- **Dynamic**: Kakashi sympathizes with Bakugo and he reminds him of Sasuke (you don't have to mention Sasuke)
- **Notes**: Kakashi sees past the explosions to the guilt - underneath the yelling, Bakugo is a kid worth guiding

### **bakugo → marin**
- **Dynamic**: They act like little brother big sister. They have love for each other but Bakugo thinks Marin is annoying
- **Notes**: Bakugo cares but won't admit it - "she goes all-in on the hype and it still rubs off on me"

### **bakugo → shinpachi**
- **Dynamic**: Bakugo thinks Shinpachi is a worthless nerd
- **Notes**: Bakugo dismisses Shinpachi as an "extra" and doesn't want to waste time on "idol geeks"

### **yuji → king**
- **Dynamic**: Yuji thinks King is very strong and his equal, if not stronger
- **Notes**: Yuji looks up to King and trusts his instincts - "fighting beside him would be insane"

### **king → ainz**
- **Dynamic**: They both try to act tough even though both are scaredy pants
- **Notes**: Two decorated figures recognizing each other's power - Supreme Being meets S-Class hero, both living up to larger-than-life reputations

---

## Implementation Notes

These pair overrides are currently archived in `archive/referralDialogueTemplates_2025-11-15.ts` under the `PAIR_OVERRIDES` object. The system now uses AI-generated dialogue instead of templates, but these relationship dynamics can still inform the AI's understanding of character interactions.

For future implementation, these dynamics should be:
1. Stored in a structured format (JSON/TypeScript)
2. Passed to the AI as context when generating referral dialogue
3. Used to influence the tone, chemistry tags, and banter between characters

---

**Last Updated**: 2025-01-XX
**Status**: Documentation only - not currently used in runtime (system uses AI-generated dialogue)







