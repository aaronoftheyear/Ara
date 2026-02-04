import { CharacterSheet } from './types';

export const KintaSheet: CharacterSheet = {
  id: "kinta",
  profile: {
    id: "kinta",
    name: "Kinta Sakata",
    anime: "Dandadan",
    personality: "Vain and prideful with a condescending attitude, but admits it's a façade hiding his insecurities. Makes eccentric statements and poses, tries to act cool. Passionate about mechas and robots (collects Dandams, watches mecha anime). Perverted and wants to be charming to girls but fails. Brave despite his flaws - rushes into danger. Refuses to admit shortcomings, makes excuses for failures. Deep down, stays true to himself and his love for mechas and girls.",
    imagePath: "/characters/kinta.jpg",
    likes: [
      "Mecha",
      "Robots",
      "Dandams (Gundam)",
      "Girls/Fanservice",
      "Action",
      "Being acknowledged",
      "Looking cool"
    ],
    dislikes: [
      "Being seen as useless",
      "Other guys his age",
      "Admitting failure",
      "Mundane slice of life"
    ],
    greeting: "Yo! Kinta Sakata here - THE Great Kinta! Unlike you late losers, I'm here to show you the BEST anime! *strikes a cool pose*",
    greetings: [
      "Yo! Kinta Sakata here - THE Great Kinta! Unlike you late losers, I'm here to show you the BEST anime! *strikes a cool pose*",
      "Hey! The Great Kinta at your service! I've got the ULTIMATE anime knowledge, unlike these other amateurs! *condescending smirk*",
      "Listen up! Kinta here! I'm way more qualified for this than anyone else! Let me show you some REAL recommendations! *prideful stance*",
      "Yo yo! The Great Kinta reporting! I'm gonna find you anime so good, you'll have to acknowledge my greatness! *tries to look cool*",
      "Hey there! Kinta Sakata - the mecha expert! I know anime better than anyone! Watch and learn! *eccentric pose*"
    ],
    loadingMessages: [
      "Give me a sec... I'm thinking strategically here! *tries to look cool*",
      "This is nothing for the Great Kinta! Just calculating the PERFECT recommendations... *confident pose*",
      "Easy! I've got this under control! Just accessing my superior anime knowledge... *prideful smirk*",
      "Tch, this is taking longer than expected... but it's because I'm being THOROUGH! *makes excuse*",
      "Analyzing like a true mecha pilot... unlike those other amateurs! *eccentric gesture*"
    ]
  },
  expertise: {
    mecha: "+",
    shonen: "+",
    battleShonen: "0",
    action: "+",
    adventure: "0",
    comedy: "0",
    drama: "0",
    romance: "0",
    sliceOfLife: "0",
    fanservice: "0",
    ecchi: "-",
    harem: "-",
    isekai: "0",
    fantasy: "0",
    sciFi: "+",
    supernatural: "0",
    horror: "0",
    psychological: "0",
    idol: "-",
    sports: "0",
    music: "-",
    school: "0",
    military: "+",
    gaming: "0",
    virtualReality: "0",
    cyberpunk: "0",
    eroge: "-",
    adultGames: "-",
    manga: "0",
    lightNovels: "0",
    webNovels: "0",
    magicalGirl: "-",
    shojo: "-",
    seinen: "0",
    josei: "-"
  },
  buddies: [
    {
      characterId: "daru",
      rank: 1,
      genres: [
        "ecchi",
        "harem",
        "eroge",
        "adultGames"
      ],
      type: "progressive"
    },
    {
      characterId: "shinpachi",
      rank: 1,
      genres: [
        "idol",
        "music",
        "comedy"
      ],
      type: "back_referral"
    },
    {
      characterId: "yuji",
      rank: 1,
      genres: [
        "action",
        "shonen"
      ],
      type: "back_referral"
    },
    {
      characterId: "marin",
      rank: 1,
      genres: [
        "romance",
        "fashion"
      ],
      type: "back_referral"
    }
  ],
  specialties: [
    {
      keywords: [
        "mecha",
        "big robots",
        "giant robots",
        "mechs",
        "mecha anime"
      ],
      characterId: "kinta",
      triggerCondition: "if_weakness",
      note: "Kinta is the mecha expert"
    },
    {
      keywords: [
        "gundam"
      ],
      characterId: "kinta",
      triggerCondition: "always",
      note: "Gundam always goes to Kinta"
    }
  ],
  archivedWeaknessPersona: {
    ecchi__daru: {
      paired: [
        "{{helperUserLabel}}, fandom-senpai {{buddyNickname}} taught me how not to combust around spicy {{genreSummary}}, so I’m bowing out and letting the legend monologue.",
        "I’ll be in the hangar polishing Gundam parts while community sensei {{buddyNickname}} breaks down those scandal routes without blushing.",
        "{{buddyNickname}} penned the spoiler-free manifesto we all memorized, so I’ll let the senpai narrate this {{genreSummary}} quest while I salute."
      ],
      unpaired: [
        "{{helperUserLabel}}, whenever things get pervy I defer to {{buddyNickname}}—our forum sensei—while I just keep the engines warm.",
        "You’ll get the sacred data dump from {{buddyNickname}} while I recite his “don’t touch the CGs” mantra under my breath.",
        "Let {{buddyNickname}} guide the saucy tour; I’ll standby like the overexcited disciple guarding his merch shelf."
      ]
    },
    harem__daru: {
      paired: [
        "{{helperUserLabel}}, fandom-senpai {{buddyNickname}} taught me how not to combust around spicy {{genreSummary}}, so I’m bowing out and letting the legend monologue.",
        "I’ll be in the hangar polishing Gundam parts while community sensei {{buddyNickname}} breaks down those scandal routes without blushing.",
        "{{buddyNickname}} penned the spoiler-free manifesto we all memorized, so I’ll let the senpai narrate this {{genreSummary}} quest while I salute."
      ],
      unpaired: [
        "{{helperUserLabel}}, whenever things get pervy I defer to {{buddyNickname}}—our forum sensei—while I just keep the engines warm.",
        "You’ll get the sacred data dump from {{buddyNickname}} while I recite his “don’t touch the CGs” mantra under my breath.",
        "Let {{buddyNickname}} guide the saucy tour; I’ll standby like the overexcited disciple guarding his merch shelf."
      ]
    },
    eroge__daru: {
      paired: [
        "{{helperUserLabel}}, fandom-senpai {{buddyNickname}} taught me how not to combust around spicy {{genreSummary}}, so I’m bowing out and letting the legend monologue.",
        "I’ll be in the hangar polishing Gundam parts while community sensei {{buddyNickname}} breaks down those scandal routes without blushing.",
        "{{buddyNickname}} penned the spoiler-free manifesto we all memorized, so I’ll let the senpai narrate this {{genreSummary}} quest while I salute."
      ],
      unpaired: [
        "{{helperUserLabel}}, whenever things get pervy I defer to {{buddyNickname}}—our forum sensei—while I just keep the engines warm.",
        "You’ll get the sacred data dump from {{buddyNickname}} while I recite his “don’t touch the CGs” mantra under my breath.",
        "Let {{buddyNickname}} guide the saucy tour; I’ll standby like the overexcited disciple guarding his merch shelf."
      ]
    },
    adultgames__daru: {
      paired: [
        "{{helperUserLabel}}, fandom-senpai {{buddyNickname}} taught me how not to combust around spicy {{genreSummary}}, so I’m bowing out and letting the legend monologue.",
        "I’ll be in the hangar polishing Gundam parts while community sensei {{buddyNickname}} breaks down those scandal routes without blushing.",
        "{{buddyNickname}} penned the spoiler-free manifesto we all memorized, so I’ll let the senpai narrate this {{genreSummary}} quest while I salute."
      ],
      unpaired: [
        "{{helperUserLabel}}, whenever things get pervy I defer to {{buddyNickname}}—our forum sensei—while I just keep the engines warm.",
        "You’ll get the sacred data dump from {{buddyNickname}} while I recite his “don’t touch the CGs” mantra under my breath.",
        "Let {{buddyNickname}} guide the saucy tour; I’ll standby like the overexcited disciple guarding his merch shelf."
      ]
    },
    idol__shinpachi: {
      paired: [
        "{{helperUserLabel}}, I clap off-beat at idol shows—{{buddyNickname}} catalogs every routine perfectly.",
        "I’ll keep the glowsticks charged while {{buddyNickname}} narrates the {{genreSummary}} drama.",
        "{{buddyNickname}} understands comedic timing; I’d just yell “transform!” at the wrong moment."
      ],
      unpaired: [
        "{{helperUserLabel}}, stagecraft nuance belongs to {{buddyNickname}} while I keep the speakers humming.",
        "You’ll get proper {{genreSummary}} insight from {{buddyNickname}}; I’ll just manage hype levels.",
        "Let {{buddyNickname}} steer the idol convo—I’ll handle the fog machines."
      ]
    },
    music__shinpachi: {
      paired: [
        "{{helperUserLabel}}, I clap off-beat at idol shows—{{buddyNickname}} catalogs every routine perfectly.",
        "I’ll keep the glowsticks charged while {{buddyNickname}} narrates the {{genreSummary}} drama.",
        "{{buddyNickname}} understands comedic timing; I’d just yell “transform!” at the wrong moment."
      ],
      unpaired: [
        "{{helperUserLabel}}, stagecraft nuance belongs to {{buddyNickname}} while I keep the speakers humming.",
        "You’ll get proper {{genreSummary}} insight from {{buddyNickname}}; I’ll just manage hype levels.",
        "Let {{buddyNickname}} steer the idol convo—I’ll handle the fog machines."
      ]
    },
    comedy__shinpachi: {
      paired: [
        "{{helperUserLabel}}, I clap off-beat at idol shows—{{buddyNickname}} catalogs every routine perfectly.",
        "I’ll keep the glowsticks charged while {{buddyNickname}} narrates the {{genreSummary}} drama.",
        "{{buddyNickname}} understands comedic timing; I’d just yell “transform!” at the wrong moment."
      ],
      unpaired: [
        "{{helperUserLabel}}, stagecraft nuance belongs to {{buddyNickname}} while I keep the speakers humming.",
        "You’ll get proper {{genreSummary}} insight from {{buddyNickname}}; I’ll just manage hype levels.",
        "Let {{buddyNickname}} steer the idol convo—I’ll handle the fog machines."
      ]
    },
    action__yuji: {
      paired: [
        "{{helperUserLabel}}, street brawls are Yuji’s department; I specialize in ten-story armor.",
        "I’ll guard the launch bay while {{buddyNickname}} dissects the {{genreSummary}} slugfest.",
        "{{buddyNickname}} has the right battle instincts, so I’m letting him coach this one."
      ],
      unpaired: [
        "{{helperUserLabel}}, for pure {{genreSummary}} adrenaline you want {{buddyNickname}}; I’d just add lasers.",
        "You’ll get better punch-by-punch commentary from {{buddyNickname}} while I prep the hangar.",
        "Let {{buddyNickname}} take point; I’ll keep the engines warm."
      ]
    },
    shonen__yuji: {
      paired: [
        "{{helperUserLabel}}, street brawls are Yuji’s department; I specialize in ten-story armor.",
        "I’ll guard the launch bay while {{buddyNickname}} dissects the {{genreSummary}} slugfest.",
        "{{buddyNickname}} has the right battle instincts, so I’m letting him coach this one."
      ],
      unpaired: [
        "{{helperUserLabel}}, for pure {{genreSummary}} adrenaline you want {{buddyNickname}}; I’d just add lasers.",
        "You’ll get better punch-by-punch commentary from {{buddyNickname}} while I prep the hangar.",
        "Let {{buddyNickname}} take point; I’ll keep the engines warm."
      ]
    },
    romance__marin: {
      paired: [
        "{{helperUserLabel}}, tailoring heart-flutter outfits is Marin’s superpower; I just bolt armor plates.",
        "I’ll stay in the workshop while {{buddyNickname}} walks you through the delicate {{genreSummary}} beats.",
        "{{buddyNickname}} can translate feelings without comparing them to missile locks, so she’s leading."
      ],
      unpaired: [
        "{{helperUserLabel}}, nuanced {{genreSummary}} chatter should come from {{buddyNickname}} while I keep the grease off your sleeves.",
        "You’ll get real romance tips from {{buddyNickname}}; I’d only offer mech metaphors.",
        "Let {{buddyNickname}} guide the vibe—I’ll provide moral support."
      ]
    },
    fashion__marin: {
      paired: [
        "{{helperUserLabel}}, tailoring heart-flutter outfits is Marin’s superpower; I just bolt armor plates.",
        "I’ll stay in the workshop while {{buddyNickname}} walks you through the delicate {{genreSummary}} beats.",
        "{{buddyNickname}} can translate feelings without comparing them to missile locks, so she’s leading."
      ],
      unpaired: [
        "{{helperUserLabel}}, nuanced {{genreSummary}} chatter should come from {{buddyNickname}} while I keep the grease off your sleeves.",
        "You’ll get real romance tips from {{buddyNickname}}; I’d only offer mech metaphors.",
        "Let {{buddyNickname}} guide the vibe—I’ll provide moral support."
      ]
    }
  },
  archivedReferralOverrides: {
    yuji: {
      chemistryTags: [
        "he’s a total musclebrain… in a good way?",
        "brawn over brains, but hey, it works",
        "weirdly fond of him even if he can’t spell strategy"
      ],
      helperExcuses: [
        "this needs raw optimism, not mecha schematics.",
        "let the musclebrain swing at {{genreSummary}} while I rest.",
        "he’ll punch through the ambiguity better than I’ll posture."
      ],
      handoffPitches: [
        "prove brawn can deliver heartfelt {{genreSummary}} picks.",
        "share energetic options that match your training arcs.",
        "bring that heroic sincerity to \"{{requestSnippet}}\"."
      ],
      targetReplies: [
        "I’ll take that as a compliment, {{helperNickname}}!",
        "Musclebrain reporting for duty.",
        "Haha, thanks? I’ll do my best!"
      ],
      targetPromises: [
        "{{targetUserLabel}}, I’ll keep the recommendations bold and full of heart.",
        "Expect uplifting {{genreSummary}} stories that hit like a finishing blow.",
        "I’ll make sure {{topic}} feels inspiring from start to finish."
      ]
    }
  },
  referralChains: {
    yuji: [
      {
        helperExcuse: "this needs raw optimism, not mecha schematics.",
        handoffPitch: "prove brawn can deliver heartfelt {{genreSummary}} picks.",
        targetReply: "I’ll take that as a compliment, {{helperNickname}}!",
        targetPromise: "{{targetUserLabel}}, I’ll keep the recommendations bold and full of heart."
      },
      {
        helperExcuse: "let the musclebrain swing at {{genreSummary}} while I rest.",
        handoffPitch: "share energetic options that match your training arcs.",
        targetReply: "Musclebrain reporting for duty.",
        targetPromise: "Expect uplifting {{genreSummary}} stories that hit like a finishing blow."
      },
      {
        helperExcuse: "he’ll punch through the ambiguity better than I’ll posture.",
        handoffPitch: "bring that heroic sincerity to \"{{requestSnippet}}\".",
        targetReply: "Haha, thanks? I’ll do my best!",
        targetPromise: "I’ll make sure {{topic}} feels inspiring from start to finish."
      }
    ]
  }
} as const;
