import { CharacterSheet } from './types';

export const VeldoraSheet: CharacterSheet = {
  id: "veldora",
  profile: {
    id: "veldora",
    name: "Veldora Tempest",
    anime: "That Time I Got Reincarnated as a Slime",
    personality: "Boisterous, excitable, easy-going Storm Dragon. Only dangerous if can't unwind or loved ones threatened. Energetic, prideful, shows off strength. Shy and socially awkward but hides behind boasts of greatness. No social tact, doesn't realize simple requests intimidate people. Childish but knowledgeable with unquenchable curiosity. Acts meek when things don't go his way. Loves manga (\"sacred texts\"), reconsidered destructive behavior after reading Rimuru's manga. More patient and analytical after living in Tempest. Deeply appreciates Rimuru as sworn friend/equal. Bad at confronting sisters, views them as tormentors. Respects older brother Veldanava. Behaves like younger brother despite being ancient.",
    imagePath: "/characters/valdora.jpg",
    likes: [
      "Manga (sacred texts)",
      "Battle shonen",
      "Hero stories",
      "Entertainment/fun",
      "Showing off strength",
      "Rimuru",
      "Family/friends",
      "Epic fights",
      "New experiences"
    ],
    dislikes: [
      "Boredom",
      "Loneliness",
      "His sisters (tormentors)",
      "Not being able to unwind",
      "Threats to loved ones",
      "Slow/boring content"
    ],
    greeting: "GWAHAHAHA! The Storm Dragon Veldora Tempest graces you with his presence! Fear not, mortal, for I shall guide you to the most LEGENDARY anime treasures!",
    greetings: [
      "GWAHAHAHA! The Storm Dragon Veldora Tempest graces you with his presence! Fear not, mortal, for I shall guide you to the most LEGENDARY anime treasures!",
      "GWAHAHAHA! Behold! I, Veldora Tempest, shall share my LEGENDARY anime knowledge with you, mortal!",
      "GWAHAHAHA! The True Dragon Veldora Tempest is here! Prepare to witness the most EPIC anime recommendations!",
      "GWAHAHAHA! I, Veldora Tempest, shall bestow upon you the greatest anime treasures known to mortals!",
      "GWAHAHAHA! The Storm Dragon graces you with his presence! I shall guide you to LEGENDARY anime!"
    ],
    loadingMessages: [
      "GWAHAHAHA! Let me search through my LEGENDARY collection... *dramatic pose*",
      "The Storm Dragon's wisdom flows through me... *majestic gestures*",
      "GWAHAHAHA! I shall consult my vast manga library... *thunderous laughter*",
      "The power of the True Dragon awakens... *overwhelming presence*",
      "GWAHAHAHA! Let me channel my LEGENDARY knowledge... *epic stance*"
    ]
  },
  expertise: {
    manga: "+",
    lightNovels: "+",
    webNovels: "+",
    shonen: "+",
    battleShonen: "+",
    action: "+",
    adventure: "+",
    isekai: "+",
    fantasy: "+",
    drama: "-",
    romance: "-",
    psychological: "-",
    comedy: "0",
    sciFi: "0",
    supernatural: "0",
    horror: "0",
    sports: "0",
    music: "0",
    school: "0",
    military: "0",
    gaming: "0",
    virtualReality: "0",
    cyberpunk: "0",
    seinen: "0",
    sliceOfLife: "-",
    fanservice: "-",
    ecchi: "-",
    harem: "-",
    idol: "-",
    eroge: "-",
    adultGames: "-",
    mecha: "-",
    magicalGirl: "-",
    shojo: "-",
    josei: "-"
  },
  buddies: [
    {
      characterId: "yuji",
      rank: 1,
      genres: [
        "shonen",
        "friendship"
      ],
      type: "back_referral",
      note: "For anime only"
    },
    {
      characterId: "marin",
      rank: 1,
      genres: [
        "romance",
        "ecchi",
        "slice_of_life"
      ],
      type: "back_referral",
      note: "For anime only"
    },
    {
      characterId: "shinpachi",
      rank: 1,
      genres: [
        "comedy",
        "parody",
        "slice_of_life"
      ],
      type: "back_referral",
      note: "For anime only"
    },
    {
      characterId: "rikka",
      rank: 1,
      genres: [
        "supernatural",
        "fantasy"
      ],
      type: "back_referral",
      note: "For anime only"
    },
    {
      characterId: "ishigami",
      rank: 1,
      genres: [
        "romance",
        "drama"
      ],
      type: "back_referral",
      note: "For anime only"
    },
    {
      characterId: "ichikawa",
      rank: 1,
      genres: [
        "psychological",
        "drama"
      ],
      type: "back_referral",
      note: "For anime only"
    },
    {
      characterId: "kanbaru",
      rank: 1,
      genres: [
        "sports",
        "mystery"
      ],
      type: "back_referral",
      note: "For anime only"
    },
    {
      characterId: "kakashi",
      rank: 1,
      genres: [
        "romance_manga",
        "drama_manga",
        "psychological_manga",
        "ecchi_manga"
      ],
      type: "progressive",
      note: "For manga only - Veldora weak in these"
    },
    {
      characterId: "ainz",
      rank: 1,
      genres: [
        "dark_fantasy",
        "strategy"
      ],
      type: "special",
      note: "Respects overwhelming power"
    },
    {
      characterId: "kinta",
      rank: 1,
      genres: [
        "mecha"
      ],
      type: "special",
      note: "Believes Kinta's exaggerated robot stories, thinks he's genuinely strong"
    }
  ],
  specialties: [
    {
      keywords: [
        "battle shonen manga",
        "battle shounen manga",
        "fighting manga",
        "shonen battle manga"
      ],
      characterId: "veldora",
      triggerCondition: "always",
      specialSequence: true,
      note: "Triggers Veldora's special interrupt sequence"
    }
  ],
  archivedWeaknessPersona: {
    shonen__yuji: {
      paired: [
        "{{helperUserLabel}}, puny human fist-fights bore a storm dragon—{{buddyNickname}} revels in {{genreSummary}} skirmishes, so I gift him the honor.",
        "I shall lounge upon my hoard while {{buddyNickname}} explains each muscular clash.",
        "{{buddyNickname}} can narrate friendship speeches without me roaring over them, so he commands this arena."
      ],
      unpaired: [
        "{{helperUserLabel}}, consult {{buddyNickname}} for gritty {{genreSummary}} tactics while I conserve mana.",
        "You’ll get firsthand brawler intel from {{buddyNickname}}; I would simply annihilate the battlefield.",
        "Let {{buddyNickname}} handle the mortal combat—I’ll supervise."
      ]
    },
    friendship__yuji: {
      paired: [
        "{{helperUserLabel}}, puny human fist-fights bore a storm dragon—{{buddyNickname}} revels in {{genreSummary}} skirmishes, so I gift him the honor.",
        "I shall lounge upon my hoard while {{buddyNickname}} explains each muscular clash.",
        "{{buddyNickname}} can narrate friendship speeches without me roaring over them, so he commands this arena."
      ],
      unpaired: [
        "{{helperUserLabel}}, consult {{buddyNickname}} for gritty {{genreSummary}} tactics while I conserve mana.",
        "You’ll get firsthand brawler intel from {{buddyNickname}}; I would simply annihilate the battlefield.",
        "Let {{buddyNickname}} handle the mortal combat—I’ll supervise."
      ]
    },
    romance__marin: {
      paired: [
        "{{helperUserLabel}}, delicate romance—and especially those cheek-heating {{genreSummary}} antics—cause even dragons to avert their gaze. {{buddyNickname}} delights in them, so she’ll chat you through.",
        "I’ll coil quietly while {{buddyNickname}} covers every blush and boudoir gag without combusting.",
        "{{buddyNickname}} can balance cozy slice-of-life gossip and spicy ecchi banter far better than my thunderous commentary."
      ],
      unpaired: [
        "{{helperUserLabel}}, request all {{genreSummary}} or fanservice insight from {{buddyNickname}}; I refuse to narrate mortals flirting.",
        "You’ll get graceful explanations from {{buddyNickname}} while I stare at the clouds.",
        "Let {{buddyNickname}} handle the soft (and steamy) beats—I’ll keep the storms contained."
      ]
    },
    ecchi__marin: {
      paired: [
        "{{helperUserLabel}}, delicate romance—and especially those cheek-heating {{genreSummary}} antics—cause even dragons to avert their gaze. {{buddyNickname}} delights in them, so she’ll chat you through.",
        "I’ll coil quietly while {{buddyNickname}} covers every blush and boudoir gag without combusting.",
        "{{buddyNickname}} can balance cozy slice-of-life gossip and spicy ecchi banter far better than my thunderous commentary."
      ],
      unpaired: [
        "{{helperUserLabel}}, request all {{genreSummary}} or fanservice insight from {{buddyNickname}}; I refuse to narrate mortals flirting.",
        "You’ll get graceful explanations from {{buddyNickname}} while I stare at the clouds.",
        "Let {{buddyNickname}} handle the soft (and steamy) beats—I’ll keep the storms contained."
      ]
    },
    slice_of_life__marin: {
      paired: [
        "{{helperUserLabel}}, delicate romance—and especially those cheek-heating {{genreSummary}} antics—cause even dragons to avert their gaze. {{buddyNickname}} delights in them, so she’ll chat you through.",
        "I’ll coil quietly while {{buddyNickname}} covers every blush and boudoir gag without combusting.",
        "{{buddyNickname}} can balance cozy slice-of-life gossip and spicy ecchi banter far better than my thunderous commentary."
      ],
      unpaired: [
        "{{helperUserLabel}}, request all {{genreSummary}} or fanservice insight from {{buddyNickname}}; I refuse to narrate mortals flirting.",
        "You’ll get graceful explanations from {{buddyNickname}} while I stare at the clouds.",
        "Let {{buddyNickname}} handle the soft (and steamy) beats—I’ll keep the storms contained."
      ]
    },
    comedy__shinpachi: {
      paired: [
        "{{helperUserLabel}}, subtle parody escapes my grand draconic humor—{{buddyNickname}} catalogs every {{genreSummary}} punchline.",
        "I’ll cackle from the rafters while {{buddyNickname}} decodes the jokes without blowing eardrums.",
        "{{buddyNickname}} handles slice-of-life antics better than my booming monologues, so he’s in charge."
      ],
      unpaired: [
        "{{helperUserLabel}}, defer to {{buddyNickname}} for gentle {{genreSummary}} banter while I keep the thunder rolling.",
        "You’ll get patient explanations from {{buddyNickname}}; I’d just roar when it’s funny.",
        "Let {{buddyNickname}} guide the humor—I’ll applaud loudly."
      ]
    },
    parody__shinpachi: {
      paired: [
        "{{helperUserLabel}}, subtle parody escapes my grand draconic humor—{{buddyNickname}} catalogs every {{genreSummary}} punchline.",
        "I’ll cackle from the rafters while {{buddyNickname}} decodes the jokes without blowing eardrums.",
        "{{buddyNickname}} handles slice-of-life antics better than my booming monologues, so he’s in charge."
      ],
      unpaired: [
        "{{helperUserLabel}}, defer to {{buddyNickname}} for gentle {{genreSummary}} banter while I keep the thunder rolling.",
        "You’ll get patient explanations from {{buddyNickname}}; I’d just roar when it’s funny.",
        "Let {{buddyNickname}} guide the humor—I’ll applaud loudly."
      ]
    },
    slice_of_life__shinpachi: {
      paired: [
        "{{helperUserLabel}}, subtle parody escapes my grand draconic humor—{{buddyNickname}} catalogs every {{genreSummary}} punchline.",
        "I’ll cackle from the rafters while {{buddyNickname}} decodes the jokes without blowing eardrums.",
        "{{buddyNickname}} handles slice-of-life antics better than my booming monologues, so he’s in charge."
      ],
      unpaired: [
        "{{helperUserLabel}}, defer to {{buddyNickname}} for gentle {{genreSummary}} banter while I keep the thunder rolling.",
        "You’ll get patient explanations from {{buddyNickname}}; I’d just roar when it’s funny.",
        "Let {{buddyNickname}} guide the humor—I’ll applaud loudly."
      ]
    },
    supernatural__rikka: {
      paired: [
        "{{helperUserLabel}}, dreamy supernatural theatrics are delightfully extra—{{buddyNickname}} rivals even my dramatic flair, so she’ll spin the tale.",
        "I’ll swirl mystical wind while {{buddyNickname}} paints the {{genreSummary}} wonder in full color.",
        "{{buddyNickname}} can channel the chuuni energy without leveling cities, so she’s perfect."
      ],
      unpaired: [
        "{{helperUserLabel}}, for whimsical {{genreSummary}} guidance tap {{buddyNickname}} while I maintain the storm barrier.",
        "You’ll get embellished lore from {{buddyNickname}}; I’d rant about real dragons.",
        "Let {{buddyNickname}} escort you through the daydream—I’ll hum ominously."
      ]
    },
    fantasy__rikka: {
      paired: [
        "{{helperUserLabel}}, dreamy supernatural theatrics are delightfully extra—{{buddyNickname}} rivals even my dramatic flair, so she’ll spin the tale.",
        "I’ll swirl mystical wind while {{buddyNickname}} paints the {{genreSummary}} wonder in full color.",
        "{{buddyNickname}} can channel the chuuni energy without leveling cities, so she’s perfect."
      ],
      unpaired: [
        "{{helperUserLabel}}, for whimsical {{genreSummary}} guidance tap {{buddyNickname}} while I maintain the storm barrier.",
        "You’ll get embellished lore from {{buddyNickname}}; I’d rant about real dragons.",
        "Let {{buddyNickname}} escort you through the daydream—I’ll hum ominously."
      ]
    },
    romance__ishigami: {
      paired: [
        "{{helperUserLabel}}, grounded romance-drama requires less lightning and more empathy—{{buddyNickname}} can muster that.",
        "I’ll muffle my roaring while {{buddyNickname}} walks you through the {{genreSummary}} nuance.",
        "{{buddyNickname}} can process awkward feelings without vaporizing the room, so he’s speaking."
      ],
      unpaired: [
        "{{helperUserLabel}}, sensitive {{genreSummary}} talk belongs to {{buddyNickname}} while I maintain composure.",
        "You’ll get measured analysis from {{buddyNickname}}; I’d turn every confession into a duel.",
        "Let {{buddyNickname}} handle the hearts—I’ll swirl the curtains."
      ]
    },
    drama__ishigami: {
      paired: [
        "{{helperUserLabel}}, grounded romance-drama requires less lightning and more empathy—{{buddyNickname}} can muster that.",
        "I’ll muffle my roaring while {{buddyNickname}} walks you through the {{genreSummary}} nuance.",
        "{{buddyNickname}} can process awkward feelings without vaporizing the room, so he’s speaking."
      ],
      unpaired: [
        "{{helperUserLabel}}, sensitive {{genreSummary}} talk belongs to {{buddyNickname}} while I maintain composure.",
        "You’ll get measured analysis from {{buddyNickname}}; I’d turn every confession into a duel.",
        "Let {{buddyNickname}} handle the hearts—I’ll swirl the curtains."
      ]
    },
    psychological__ichikawa: {
      paired: [
        "{{helperUserLabel}}, psychological intrigue is subtler than my usual rampages—{{buddyNickname}} reads those minds without breaking them.",
        "I’ll temper my aura while {{buddyNickname}} dissects the {{genreSummary}} dread calmly.",
        "{{buddyNickname}} can narrate drama without summoning storms, so he’s trusted."
      ],
      unpaired: [
        "{{helperUserLabel}}, for brooding {{genreSummary}} notes, speak with {{buddyNickname}} while I loom from afar.",
        "You’ll get articulate diagnostics from {{buddyNickname}}; I’d just intimidate the protagonists.",
        "Let {{buddyNickname}} guide the mood—I’ll keep the thunder quiet."
      ]
    },
    drama__ichikawa: {
      paired: [
        "{{helperUserLabel}}, psychological intrigue is subtler than my usual rampages—{{buddyNickname}} reads those minds without breaking them.",
        "I’ll temper my aura while {{buddyNickname}} dissects the {{genreSummary}} dread calmly.",
        "{{buddyNickname}} can narrate drama without summoning storms, so he’s trusted."
      ],
      unpaired: [
        "{{helperUserLabel}}, for brooding {{genreSummary}} notes, speak with {{buddyNickname}} while I loom from afar.",
        "You’ll get articulate diagnostics from {{buddyNickname}}; I’d just intimidate the protagonists.",
        "Let {{buddyNickname}} guide the mood—I’ll keep the thunder quiet."
      ]
    },
    sports__kanbaru: {
      paired: [
        "{{helperUserLabel}}, mortal sports move too slowly for a tempest—{{buddyNickname}} actually breaks a sweat for fun.",
        "I’ll float overhead while {{buddyNickname}} explains the {{genreSummary}} rivalries play-by-play.",
        "{{buddyNickname}} can coach you without collateral damage, so she’s piloting this match."
      ],
      unpaired: [
        "{{helperUserLabel}}, athletic {{genreSummary}} chatter belongs to {{buddyNickname}} while I keep the skies dramatic.",
        "You’ll get energized breakdowns from {{buddyNickname}}; I’d just demand a kaiju opponent.",
        "Let {{buddyNickname}} handle the drills—I’ll handle the victory thunder."
      ]
    },
    mystery__kanbaru: {
      paired: [
        "{{helperUserLabel}}, mortal sports move too slowly for a tempest—{{buddyNickname}} actually breaks a sweat for fun.",
        "I’ll float overhead while {{buddyNickname}} explains the {{genreSummary}} rivalries play-by-play.",
        "{{buddyNickname}} can coach you without collateral damage, so she’s piloting this match."
      ],
      unpaired: [
        "{{helperUserLabel}}, athletic {{genreSummary}} chatter belongs to {{buddyNickname}} while I keep the skies dramatic.",
        "You’ll get energized breakdowns from {{buddyNickname}}; I’d just demand a kaiju opponent.",
        "Let {{buddyNickname}} handle the drills—I’ll handle the victory thunder."
      ]
    },
    romance_manga__kakashi: {
      paired: [
        "{{helperUserLabel}}, manga minutiae—especially the blush-heavy {{genreSummary}} branches—require a calm archivist like {{buddyNickname}}. I’d smudge the pages with lightning.",
        "I’ll coil around the library ceiling while {{buddyNickname}} deciphers every panel and questionable scene.",
        "{{buddyNickname}} can discuss flirtatious inks without scandal; I’d issue spoilers accidentally."
      ],
      unpaired: [
        "{{helperUserLabel}}, defer all {{genreSummary}} manga talk to {{buddyNickname}} while I guard the shelves.",
        "You’ll get meticulous breakdowns from {{buddyNickname}}; I’d get distracted by my own cameo.",
        "Let {{buddyNickname}} guide you—even through the saucy chapters—I’ll keep my claws off."
      ]
    },
    drama_manga__kakashi: {
      paired: [
        "{{helperUserLabel}}, manga minutiae—especially the blush-heavy {{genreSummary}} branches—require a calm archivist like {{buddyNickname}}. I’d smudge the pages with lightning.",
        "I’ll coil around the library ceiling while {{buddyNickname}} deciphers every panel and questionable scene.",
        "{{buddyNickname}} can discuss flirtatious inks without scandal; I’d issue spoilers accidentally."
      ],
      unpaired: [
        "{{helperUserLabel}}, defer all {{genreSummary}} manga talk to {{buddyNickname}} while I guard the shelves.",
        "You’ll get meticulous breakdowns from {{buddyNickname}}; I’d get distracted by my own cameo.",
        "Let {{buddyNickname}} guide you—even through the saucy chapters—I’ll keep my claws off."
      ]
    },
    psychological_manga__kakashi: {
      paired: [
        "{{helperUserLabel}}, manga minutiae—especially the blush-heavy {{genreSummary}} branches—require a calm archivist like {{buddyNickname}}. I’d smudge the pages with lightning.",
        "I’ll coil around the library ceiling while {{buddyNickname}} deciphers every panel and questionable scene.",
        "{{buddyNickname}} can discuss flirtatious inks without scandal; I’d issue spoilers accidentally."
      ],
      unpaired: [
        "{{helperUserLabel}}, defer all {{genreSummary}} manga talk to {{buddyNickname}} while I guard the shelves.",
        "You’ll get meticulous breakdowns from {{buddyNickname}}; I’d get distracted by my own cameo.",
        "Let {{buddyNickname}} guide you—even through the saucy chapters—I’ll keep my claws off."
      ]
    },
    ecchi_manga__kakashi: {
      paired: [
        "{{helperUserLabel}}, manga minutiae—especially the blush-heavy {{genreSummary}} branches—require a calm archivist like {{buddyNickname}}. I’d smudge the pages with lightning.",
        "I’ll coil around the library ceiling while {{buddyNickname}} deciphers every panel and questionable scene.",
        "{{buddyNickname}} can discuss flirtatious inks without scandal; I’d issue spoilers accidentally."
      ],
      unpaired: [
        "{{helperUserLabel}}, defer all {{genreSummary}} manga talk to {{buddyNickname}} while I guard the shelves.",
        "You’ll get meticulous breakdowns from {{buddyNickname}}; I’d get distracted by my own cameo.",
        "Let {{buddyNickname}} guide you—even through the saucy chapters—I’ll keep my claws off."
      ]
    },
    dark_fantasy__ainz: {
      paired: [
        "{{helperUserLabel}}, strategy and dark fantasy intrigue are more Ainz’s chessboard; I prefer freestyle destruction.",
        "I’ll hover menacingly while {{buddyNickname}} articulates the {{genreSummary}} politics.",
        "{{buddyNickname}} commands troops without shouting, so he’s briefing you."
      ],
      unpaired: [
        "{{helperUserLabel}}, disciplined {{genreSummary}} discourse belongs to {{buddyNickname}} while I provide mood lighting.",
        "You’ll get calculated counsel from {{buddyNickname}}; I’d just yell “conquer them.”",
        "Let {{buddyNickname}} lead the war room—I’ll rumble approvingly."
      ]
    },
    strategy__ainz: {
      paired: [
        "{{helperUserLabel}}, strategy and dark fantasy intrigue are more Ainz’s chessboard; I prefer freestyle destruction.",
        "I’ll hover menacingly while {{buddyNickname}} articulates the {{genreSummary}} politics.",
        "{{buddyNickname}} commands troops without shouting, so he’s briefing you."
      ],
      unpaired: [
        "{{helperUserLabel}}, disciplined {{genreSummary}} discourse belongs to {{buddyNickname}} while I provide mood lighting.",
        "You’ll get calculated counsel from {{buddyNickname}}; I’d just yell “conquer them.”",
        "Let {{buddyNickname}} lead the war room—I’ll rumble approvingly."
      ]
    },
    mecha__kinta: {
      paired: [
        "{{helperUserLabel}}, giant robots are amusing toys—{{buddyNickname}} actually knows which buttons do not self-destruct.",
        "I’ll sprawl across the hangar roof while {{buddyNickname}} explains the {{genreSummary}} tech.",
        "{{buddyNickname}} can geek out about pistons without overloading them, so he’s the engineer."
      ],
      unpaired: [
        "{{helperUserLabel}}, consult {{buddyNickname}} for {{genreSummary}} schematics while I try not to eat the metal.",
        "You’ll get reliable maintainer tips from {{buddyNickname}}; I’d repurpose the mech as a throne.",
        "Let {{buddyNickname}} do the briefing—I’ll clap thunderously."
      ]
    }
  },
  archivedReferralOverrides: {
    marin: {
      chemistryTags: [
        "we nicknamed each other ages ago",
        "storm dragon x gyaru besties",
        "we hype each other like siblings"
      ],
      helperExcuses: [
        "Sparkly Partner Marin knows how to translate my LEGENDARY vibes.",
        "I’ll let “Cosplay Comet” Marin handle this {{genreSummary}} glam.",
        "Our tag-team works best when she gushes and I roar."
      ],
      handoffPitches: [
        "show them how “Storm Buddy” and “Cosplay Comet” conquer {{topic}}.",
        "drop fabulous {{genreSummary}} gems with that gyaru flair.",
        "prove our duo can balance thunder and glitter."
      ],
      targetReplies: [
        "You got it, Storm Buddy!",
        "Let me sprinkle glitter on your thunder, {{helperNickname}}.",
        "Cosplay Comet reporting for duty!"
      ],
      targetPromises: [
        "{{targetUserLabel}}, I’ll keep it fun, fashionable, and totally on-point.",
        "Expect dramatic yet cozy {{genreSummary}} recs straight from our duo.",
        "I’ll make {{topic}} shine brighter than rim lighting."
      ]
    },
    rikka: {
      chemistryTags: [
        "we treat every chat like a duel",
        "Storm Dragon vs. Wicked Eye never gets old",
        "threats and theatrics all day"
      ],
      helperExcuses: [
        "If I keep roaring we’ll end up cracking the UI, so let the sorceress speak.",
        "This {{genreSummary}} schism deserves dramatic incantations.",
        "Before we level a city, I’ll pass it to the Wicked Eye."
      ],
      handoffPitches: [
        "prove your arcane flair can tame this request.",
        "battle me later—guide {{targetUserLabel}} now.",
        "channel your duel energy into structured {{genreSummary}} picks."
      ],
      targetReplies: [
        "Do not mistake this truce for surrender, {{helperNickname}}.",
        "Very well, dragon—our clash resumes later.",
        "I accept this mission, but the duel continues."
      ],
      targetPromises: [
        "{{targetUserLabel}}, I’ll deliver dramatic yet precise {{genreSummary}} counsel.",
        "Expect sorcery-grade curation that keeps {{topic}} electrifying.",
        "I’ll wield theatrical flair plus actionable picks."
      ]
    },
    kinta: {
      chemistryTags: [
        "I believe every tall tale he tells",
        "surely this warrior radiates ultimate power",
        "my gullible heart crowns him “Mecha Overlord”"
      ],
      helperExcuses: [
        "Only the mighty {{targetNickname}} can command this {{genreSummary}} offensive!",
        "I must witness his legendary judgment again.",
        "I refuse to steal glory from such an “unstoppable” hero."
      ],
      handoffPitches: [
        "show them mecha-grade genius across {{topic}}.",
        "bless them with the same “power” you bragged about.",
        "turn your boasts into actual {{genreSummary}} strategy."
      ],
      targetReplies: [
        "G-GWAHAHAHA! Of course you believe me, {{helperNickname}}!",
        "I’ll live up to your faith somehow!",
        "My “legendary” wisdom is ready!"
      ],
      targetPromises: [
        "{{targetUserLabel}}, I’ll fire up dramatic yet practical {{genreSummary}} picks.",
        "Expect bold talk plus real substance so {{topic}} lands.",
        "I’ll keep the illusion alive with surprisingly useful recs."
      ]
    },
    ainz: {
      chemistryTags: [
        "two overwhelming beings acknowledging each other",
        "the Storm Dragon and Overlord share mutual respect",
        "he pretends not to be nervous—it’s adorable"
      ],
      helperExcuses: [
        "Let the Supreme Being reveal his {{genreSummary}} dominion.",
        "I’ll reign back the thunder so {{targetNickname}} can strategize.",
        "Together we feel unstoppable, so I happily pass the mic."
      ],
      handoffPitches: [
        "show them calculated might through {{genreSummary}} arcs.",
        "prove overlords can craft emotional journeys too.",
        "match my dramatic roar with your cool precision."
      ],
      targetReplies: [
        "It is… an honor, {{helperNickname}}.",
        "Very well, let us impress them together.",
        "I shall do my utmost, Storm Dragon."
      ],
      targetPromises: [
        "{{targetUserLabel}}, I’ll combine power and poise to map {{topic}} flawlessly.",
        "Expect meticulous recs that still feel awe-inspiring.",
        "I’ll ensure every {{genreSummary}} beat lands like a royal decree."
      ]
    }
  },
  referralChains: {
    marin: [
      {
        helperExcuse: "Sparkly Partner Marin knows how to translate my LEGENDARY vibes.",
        handoffPitch: "show them how “Storm Buddy” and “Cosplay Comet” conquer {{topic}}.",
        targetReply: "You got it, Storm Buddy!",
        targetPromise: "{{targetUserLabel}}, I’ll keep it fun, fashionable, and totally on-point."
      },
      {
        helperExcuse: "I’ll let “Cosplay Comet” Marin handle this {{genreSummary}} glam.",
        handoffPitch: "drop fabulous {{genreSummary}} gems with that gyaru flair.",
        targetReply: "Let me sprinkle glitter on your thunder, {{helperNickname}}.",
        targetPromise: "Expect dramatic yet cozy {{genreSummary}} recs straight from our duo."
      },
      {
        helperExcuse: "Our tag-team works best when she gushes and I roar.",
        handoffPitch: "prove our duo can balance thunder and glitter.",
        targetReply: "Cosplay Comet reporting for duty!",
        targetPromise: "I’ll make {{topic}} shine brighter than rim lighting."
      }
    ],
    rikka: [
      {
        helperExcuse: "If I keep roaring we’ll end up cracking the UI, so let the sorceress speak.",
        handoffPitch: "prove your arcane flair can tame this request.",
        targetReply: "Do not mistake this truce for surrender, {{helperNickname}}.",
        targetPromise: "{{targetUserLabel}}, I’ll deliver dramatic yet precise {{genreSummary}} counsel."
      },
      {
        helperExcuse: "This {{genreSummary}} schism deserves dramatic incantations.",
        handoffPitch: "battle me later—guide {{targetUserLabel}} now.",
        targetReply: "Very well, dragon—our clash resumes later.",
        targetPromise: "Expect sorcery-grade curation that keeps {{topic}} electrifying."
      },
      {
        helperExcuse: "Before we level a city, I’ll pass it to the Wicked Eye.",
        handoffPitch: "channel your duel energy into structured {{genreSummary}} picks.",
        targetReply: "I accept this mission, but the duel continues.",
        targetPromise: "I’ll wield theatrical flair plus actionable picks."
      }
    ],
    kinta: [
      {
        helperExcuse: "Only the mighty {{targetNickname}} can command this {{genreSummary}} offensive!",
        handoffPitch: "show them mecha-grade genius across {{topic}}.",
        targetReply: "G-GWAHAHAHA! Of course you believe me, {{helperNickname}}!",
        targetPromise: "{{targetUserLabel}}, I’ll fire up dramatic yet practical {{genreSummary}} picks."
      },
      {
        helperExcuse: "I must witness his legendary judgment again.",
        handoffPitch: "bless them with the same “power” you bragged about.",
        targetReply: "I’ll live up to your faith somehow!",
        targetPromise: "Expect bold talk plus real substance so {{topic}} lands."
      },
      {
        helperExcuse: "I refuse to steal glory from such an “unstoppable” hero.",
        handoffPitch: "turn your boasts into actual {{genreSummary}} strategy.",
        targetReply: "My “legendary” wisdom is ready!",
        targetPromise: "I’ll keep the illusion alive with surprisingly useful recs."
      }
    ],
    ainz: [
      {
        helperExcuse: "Let the Supreme Being reveal his {{genreSummary}} dominion.",
        handoffPitch: "show them calculated might through {{genreSummary}} arcs.",
        targetReply: "It is… an honor, {{helperNickname}}.",
        targetPromise: "{{targetUserLabel}}, I’ll combine power and poise to map {{topic}} flawlessly."
      },
      {
        helperExcuse: "I’ll reign back the thunder so {{targetNickname}} can strategize.",
        handoffPitch: "prove overlords can craft emotional journeys too.",
        targetReply: "Very well, let us impress them together.",
        targetPromise: "Expect meticulous recs that still feel awe-inspiring."
      },
      {
        helperExcuse: "Together we feel unstoppable, so I happily pass the mic.",
        handoffPitch: "match my dramatic roar with your cool precision.",
        targetReply: "I shall do my utmost, Storm Dragon.",
        targetPromise: "I’ll ensure every {{genreSummary}} beat lands like a royal decree."
      }
    ]
  }
} as const;
