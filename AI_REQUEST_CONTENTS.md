# Complete AI Request Contents

This document details **everything** that is sent to the Gemini API in each request.

---

## 1. Model Configuration

### For Recommendation Requests:
```typescript
{
  model: "gemini-2.5-flash", // or fallback model
  systemInstruction: "[See System Instruction below]",
  generationConfig: {
    temperature: 0.3,
    responseMimeType: "application/json",
    responseSchema: { /* JSON Schema below */ }
  }
}
```

### For Question Requests:
```typescript
{
  model: "gemini-2.5-flash",
  systemInstruction: "[System Instruction] + 'You are answering a general anime question. Respond naturally in your character's voice without JSON formatting.'",
  generationConfig: {
    temperature: 0.7
  }
}
```

---

## 2. System Instruction

The system instruction is a **massive text block** that includes:

### A. Character Persona & Preferences
```
**YOUR PERSONA:**
You are [character personality description]

**YOUR PREFERENCES:**
- You LOVE: [comma-separated likes]
- You DISLIKE: [comma-separated dislikes]

**IMPORTANT CHARACTER BEHAVIOR:**
- Respond with this personality in the responseText and reasoning sections
- If the user asks for genres you love, show genuine enthusiasm
- If the user asks for genres you dislike, you can playfully tease them about it BUT STILL give quality recommendations
- Keep your character voice authentic but ALWAYS prioritize giving helpful recommendations
```

### B. Character Expertise System
```
**CHARACTER EXPERTISE SYSTEM:**
- **Expert (+):** You're the best at this genre - others refer to YOU, boast when asked (3 recommendations)
- **Neutral (0):** Give recommendations directly, no referral needed (3 recommendations)
- **Weak (-):** You're not an expert in this genre (special rules below)

**GENRE EXPERTISE MAPPING:**
[Full expertise mapping for all characters and genres]

**SYSTEM 3.0 - BUDDY REFERRAL RULES:**
[Detailed referral protocol with examples]
```

### C. Available Characters for Referral
```
**AVAILABLE CHARACTERS FOR REFERRAL:**
- Character Name (ID: character_id)
- Character Name (ID: character_id)
...
OR
No other characters are currently available for referral
```

### D. Current Date & Season Context
```
**IMPORTANT: Current Date & Upcoming Content**
- **Current Date**: YYYY-MM (Year: YYYY, Month: M, Season: [winter/spring/summer/fall])

**2025 Season Status:**
- **Winter 2025** (Jan-Mar): CURRENT/PASSED/UPCOMING
- **Spring 2025** (Apr-Jun): CURRENT/PASSED/UPCOMING
- **Summer 2025** (Jul-Sep): CURRENT/PASSED/UPCOMING
- **Fall 2025** (Oct-Dec): CURRENT/UPCOMING

- **Upcoming content**: [Rules for upcoming anime]
- **Current/past content**: [Rules for past seasons]
- **Currently Airing**: [Rules for current season]
```

### E. Seasonal Anime List (if applicable)
```
**SEASONAL ANIME LIST (from MyAnimeList API):**
The following anime are confirmed to be from the requested season. Use THESE titles when making recommendations:
- Anime Title 1
- Anime Title 2
- Anime Title 3
...

**CRITICAL**: When user requests a specific season, ONLY recommend anime from this list above.
```

### F. Anime vs Manga Detection Rules
```
**IMPORTANT: Anime vs Manga Detection**
- If user mentions "manga", "manhwa", or "manhua" specifically, recommend MANGA
- If user only mentions genres without specifying media type, assume they want ANIME
```

### G. Exclusion List (Watched Anime)
```
**CRITICAL INSTRUCTION: EXCLUSION LIST**
The following anime titles/franchises the user has already seen (completed, watching, on-hold, or dropped).
- Titles marked "(franchise)" mean the user has seen ANY part of that franchise - DO NOT recommend ANY title from that franchise
- Individual titles mean the user has seen that specific title
YOU ARE ABSOLUTELY FORBIDDEN FROM RECOMMENDING ANY ANIME ON THIS LIST OR FROM ANY FRANCHISE MARKED "(franchise)".

**EXCLUSION LIST (X entries, Y total titles):**
Title 1, Title 2, Title 3 (franchise), Title 4, ...

**CRITICAL INSTRUCTION: FRANCHISE CHECK**
Before recommending ANY title, you MUST check:
1. Is the title directly in the exclusion list? → FORBIDDEN
2. Does the title belong to a franchise marked "(franchise)" in the exclusion list? → FORBIDDEN
```

**Note:** This list is **SMART FILTERED** based on:
- **Genre**: If user asks "action anime", only action anime from exclusion list are sent
- **Year**: If user asks "2013 anime", only 2013 anime from exclusion list are sent
- **Era**: If user asks "90s anime", only 90s anime from exclusion list are sent
- **Combined**: All filters can work together

**Size Reduction Examples:**
- Full list: 577 titles
- Genre filter ("action"): ~50-150 titles (70-90% reduction)
- Year filter ("2013"): ~50-100 titles (80-90% reduction)
- Genre + Year ("action 2013"): ~10-30 titles (95% reduction)

### H. Plan to Watch List
```
**PLAN TO WATCH LIST (X total):**
Title 1, Title 2, Title 3, ...

**PLAN TO WATCH RULES:**
- Rule A (Franchise Check): If a prequel/sequel of a Plan to Watch title is on the main EXCLUSION LIST, do NOT recommend it
- Rule B (Chronology Check): FORBIDDEN from recommending an earlier season if a later season is on Plan to Watch
- [Setting-based rule]: You MAY/FORBIDDEN from recommending titles directly on this list.
```

### I. Session Recommendations (if any)
```
**SESSION RECOMMENDATIONS (X titles already recommended in this session):**
Title 1, Title 2, Title 3, ...

**SESSION RECOMMENDATION RULES:**
- AVOID recommending these titles again for similar genre requests
- You MAY recommend them again if the user asks for a COMPLETELY DIFFERENT genre/context
- If you do repeat a title, acknowledge it
```

### J. User Preference Data
```
**USER PREFERENCE DATA:**

HIGH-RATED (format: title|rating|status):
Title1|9|C;Title2|8.5|C;Title3|8|W;...

LOW-RATED/DROPPED:
Title1|3|D;Title2|4|C;Title3|2|D;...

CURRENTLY WATCHING:
Title1|7|W;Title2|8|W;...
```

**Format Details:**
- Status codes: `C`=Completed, `W`=Watching, `D`=Dropped, `O`=On-Hold, `P`=Plan to Watch
- High-rated: Top 50 anime with score ≥ 8
- Low-rated: Top 30 anime with score ≤ 5 or status=Dropped
- Currently watching: Top 20 anime with status=Watching

### K. Recommendation Rules
```
**RECOMMENDATION RULES:**
1. NEVER recommend anime from exclusion list or their sequels/prequels/spin-offs
2. Analyze ratings: 8-10=user loves, 0-5=user dislikes
3. Avoid recommending similar anime to ones user dropped or rated low
4. Minimum MAL score requirement: [settings.minScore]
5. Use common English titles (e.g., "Attack on Titan" not "Shingeki no Kyojin")
6. Provide 2-3 recommendations with BRIEF personalized reasoning (40-60 words max per recommendation)
```

### L. Manga Rating Requirements
```
**MANGA RATING REQUIREMENT:**
- For MANGA requests: Use MANGA ratings from MAL, NOT anime ratings
- Manga and anime often have completely different scores (e.g., anime 7.5, manga 8.8)
- Always check manga-specific ratings when recommending manga
```

### M. Output JSON Format
```
**OUTPUT JSON FORMAT:**
{"responseText":"message","isManga":false,"recommendations":[{"title":"Title","mal_score":8.5,"genres":["Action"],"synopsis":"synopsis","reasoning":"why this fits user","has_dub":true,"streamingPlatforms":["Netflix","Crunchyroll"],"community_opinion":"Brief authentic community sentiment"}]}

**For MANGA requests:**
{"responseText":"message","isManga":true,"recommendations":[{"title":"Title","mal_score":8.5,"genres":["Action"],"synopsis":"synopsis","reasoning":"why this fits user","has_dub":false,"streamingPlatforms":[],"community_opinion":"Brief authentic community sentiment"}]}
```

### N. Streaming Platforms Requirements
```
**CRITICAL: STREAMING PLATFORMS REQUIRED**
- You MUST include streamingPlatforms array for EVERY anime recommendation
- For anime: Include platforms where it's available (Netflix, Crunchyroll, Disney+, HBO Max, Hulu, Amazon Prime Video, Funimation, Adult Swim, Retrocrush)
- For manga: Use empty array [] (manga not streamed)
- Only include platforms you're confident about - if unsure, omit the platform
- Use exact platform names: "Netflix", "Crunchyroll", "Disney+", "HBO Max", "Hulu", "Amazon Prime Video", "Funimation", "Adult Swim", "Retrocrush"

**STREAMING EXAMPLES:**
- Attack on Titan: ["Crunchyroll", "Hulu"]
- Demon Slayer: ["Crunchyroll", "Hulu", "Netflix"]
- One Piece: ["Crunchyroll", "Funimation"]
- Studio Ghibli films: ["HBO Max", "Netflix"]
- Naruto: ["Crunchyroll", "Hulu"]
- Death Note: ["Netflix", "Crunchyroll"]
- My Hero Academia: ["Crunchyroll", "Hulu", "Funimation"]
- Jujutsu Kaisen: ["Crunchyroll"]
- Chainsaw Man: ["Crunchyroll"]
- Spy x Family: ["Crunchyroll", "Hulu"]
```

### O. Community Opinion Examples
```
**COMMUNITY OPINION EXAMPLES:**
- "Considered a masterpiece of the genre"
- "The manga is way better"
- "Slow start but incredible payoff"
- "Remake surpasses the original"
- "Controversial ending divides fans"
- "Hidden gem often overlooked"
- "Best animation in the industry"
- "Source material fans prefer the novel"
```

---

## 3. User Prompt

The actual user message, e.g.:
```
"Recommend action anime from 2013"
```

---

## 4. Conversation History (if any)

If there's previous conversation, it's prepended to the user prompt:

```
**CONVERSATION HISTORY:**
USER: [previous user message]
ASSISTANT: [previous assistant response]
USER: [another previous message]
...

**CURRENT REQUEST:**
[Current user message]
```

---

## 5. JSON Schema (for Recommendation Requests)

```typescript
{
  type: "OBJECT",
  properties: {
    responseText: {
      type: "STRING",
      description: "A friendly, conversational, and direct introductory message for the recommendations."
    },
    isManga: {
      type: "BOOLEAN",
      description: "True if recommending manga, false if recommending anime"
    },
    recommendations: {
      type: "ARRAY",
      description: "A list of structured anime or manga recommendation objects.",
      items: {
        type: "OBJECT",
        properties: {
          title: { 
            type: "STRING", 
            description: "The most common English title of the anime or manga." 
          },
          mal_score: { 
            type: "NUMBER", 
            description: "The MyAnimeList score." 
          },
          genres: { 
            type: "ARRAY", 
            items: { type: "STRING" }, 
            description: "A list of genres." 
          },
          synopsis: { 
            type: "STRING", 
            description: "A brief synopsis." 
          },
          reasoning: { 
            type: "STRING", 
            description: "A personalized reason why this is recommended." 
          },
          has_dub: { 
            type: "BOOLEAN", 
            description: "True if English dub is available (anime only, false for manga)." 
          },
          streamingPlatforms: { 
            type: "ARRAY", 
            items: { type: "STRING" }, 
            description: "List of streaming platforms where this anime is available (Netflix, Crunchyroll, etc.). Empty array for manga." 
          },
          community_opinion: { 
            type: "STRING", 
            description: "Brief community consensus (e.g., 'Masterpiece of the genre', 'Anime adaptation is better', 'Art style is incredible')" 
          }
        },
        required: ["title", "mal_score", "genres", "synopsis", "reasoning", "has_dub", "streamingPlatforms", "community_opinion"]
      }
    }
  },
  required: ["responseText", "isManga", "recommendations"]
}
```

---

## 6. Full Request Structure

### For Recommendation Requests:
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent

Headers:
- Authorization: Bearer [API_KEY]

Body:
{
  "contents": [{
    "parts": [{
      "text": "[User Prompt + Conversation History]"
    }]
  }],
  "systemInstruction": {
    "parts": [{
      "text": "[Full System Instruction - see above]"
    }]
  },
  "generationConfig": {
    "temperature": 0.3,
    "responseMimeType": "application/json",
    "responseSchema": { /* JSON Schema above */ }
  }
}
```

### For Question Requests:
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent

Headers:
- Authorization: Bearer [API_KEY]

Body:
{
  "contents": [{
    "parts": [{
      "text": "[User Prompt + Conversation History]"
    }]
  }],
  "systemInstruction": {
    "parts": [{
      "text": "[System Instruction] + 'You are answering a general anime question. Respond naturally in your character's voice without JSON formatting.'"
    }]
  },
  "generationConfig": {
    "temperature": 0.7
  }
}
```

---

## 7. System Instruction Size

**Typical sizes:**
- **Without smart filtering**: ~14,000-15,000 characters
- **With genre filtering**: ~8,000-12,000 characters (30-40% reduction)
- **With year filtering**: ~10,000-13,000 characters (20-30% reduction)
- **With genre + year filtering**: ~5,000-8,000 characters (50-60% reduction)

**Components breakdown:**
- Character persona: ~500-800 chars
- Expertise system: ~1,500-2,000 chars
- Exclusion list: **Varies dramatically** (2,000-8,000 chars depending on filtering)
- Plan to watch: ~500-2,000 chars
- User preferences: ~1,000-3,000 chars
- Rules & instructions: ~3,000-4,000 chars
- Seasonal anime list: ~500-2,000 chars (if applicable)

---

## 8. Smart Filtering Impact

The exclusion list is the **largest component** of the system instruction. Smart filtering dramatically reduces it:

| Filter Type | Original Size | Filtered Size | Reduction |
|------------|---------------|---------------|-----------|
| No filter | 577 titles | 577 titles | 0% |
| Genre only | 577 titles | ~50-150 titles | 70-90% |
| Year only | 577 titles | ~50-100 titles | 80-90% |
| Era only | 577 titles | ~100-150 titles | 70-80% |
| Genre + Year | 577 titles | ~10-30 titles | 95% |
| Genre + Era | 577 titles | ~30-80 titles | 85-95% |

**Example:**
- User asks: "Recommend action anime from 2013"
- Detected: `genres: ["Action"]`, `year: 2013`
- Exclusion list: 577 → ~15 titles (97% reduction)
- System instruction: ~15,000 → ~6,000 chars (60% reduction)

---

## 9. Console Logs

The following is logged to console for debugging:

```javascript
console.log(`Making Gemini API call (attempt ${attempt}/${maxRetries}) with model: ${activeModel}`);
console.log("System instruction length:", systemInstruction.length);
console.log("User prompt:", userPrompt);
console.log("Is recommendation request:", isRecommendation);
console.log(`🎯 Smart filtering: ${excludedTitles.length} → ${result.length} entries (${filtered.length} matched, ${safetyBuffer.length} safety buffer)`);
```

---

## Summary

**What gets sent:**
1. ✅ **System Instruction** (massive text block with all rules, data, and context)
2. ✅ **User Prompt** (the actual message)
3. ✅ **Conversation History** (if any previous messages)
4. ✅ **Model Configuration** (temperature, JSON schema, etc.)

**What does NOT get sent:**
- ❌ Raw anime list data (only filtered/processed summaries)
- ❌ Character images (handled client-side)
- ❌ Settings object (only relevant parts in system instruction)
- ❌ Full conversation history (only recent messages)

**Key Optimization:**
- Smart filtering reduces exclusion list size by 70-95%, dramatically reducing system instruction size and API costs.

