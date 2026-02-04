import { CHARACTER_BUDDIES } from '../data/characterBuddies.ts';

export interface ReferralTemplateContext {
  helperId: string;
  helperNickname: string;
  targetId: string;
  targetNickname: string;
  topic: string;
  request: string;
  requestSnippet: string;
  helperUserLabel: string;
  helperUserPronoun: string;
  targetUserLabel: string;
  targetUserPronoun: string;
}

export interface ReferralDialogueLines {
  helperIntro: string;
  handoffLine: string;
  acknowledgmentLine: string;
}

interface HelperVoice {
  introTemplates: string[];
  handoffTemplates: string[];
  excuseTemplates: string[];
  pitchTemplates: string[];
}

interface TargetVoice {
  replyTemplates: string[];
  promiseTemplates: string[];
  acknowledgmentTemplates?: string[];
}

interface PairedDialogueScript {
  helperIntro: string;
  handoffLine: string;
  targetReply: string;
  targetPromise: string;
  acknowledgmentLine?: string;
}

export interface PairOverride {
  chemistryTags?: string[];
  helperExcuses?: string[];
  handoffPitches?: string[];
  targetReplies?: string[];
  targetPromises?: string[];
  pairedScripts?: PairedDialogueScript[];
}

interface BuddyMeta {
  helperId: string;
  targetId: string;
  genres: string[];
  note?: string;
}

const DEFAULT_HELPER_VOICE: HelperVoice = {
  introTemplates: [
    `{{helperUserLabel}}, {{excuse}}`,
    `I'm tagging in {{targetNickname}} because {{excuse}}`,
    `Listen up—{{excuse}}`,
  ],
  handoffTemplates: [
    `{{targetNickname}}, "{{requestSnippet}}" needs you. {{pitch}}`,
    `Passing this {{topic}} request to {{targetNickname}}—{{pitch}}`,
    `Hey {{targetNickname}}, can you jump on this? {{pitch}}`,
  ],
  excuseTemplates: [
    `{{chemistryTag}}, so they're the better match.`,
    `my strengths stop before {{genreSummary}}, and {{targetNickname}} thrives there.`,
    `you'll get better picks if {{targetNickname}} drives this {{topic}} talk.`,
  ],
  pitchTemplates: [
    `give them the full {{genreSummary}} treatment.`,
    `you already hoard the best {{genreSummary}} ideas, so flex them.`,
    `layer in those {{genreSummary}} instincts we both know you have.`,
  ],
};

const DEFAULT_TARGET_VOICE: TargetVoice = {
  replyTemplates: [
    `Sure thing, {{helperNickname}}.`,
    `Alright, {{helperNickname}}, I've got this.`,
    `Understood, {{helperNickname}}.`,
  ],
  promiseTemplates: [
    `{{targetUserLabel}}, I'll line up {{genreSummary}} gems that hit exactly what you're craving.`,
    `Let me steer you through {{topic}} with some sharp {{genreSummary}} cuts.`,
    `I'll keep things grounded and surface {{genreSummary}} picks that feel tailor-made.`,
  ],
  acknowledgmentTemplates: [
    `{{targetReply}} {{targetUserLabel}}, {{targetPromise}}`,
    `{{targetReply}} Don't worry, {{targetUserLabel}}—{{targetPromise}}`,
    `{{targetReply}} Stay with me, {{targetUserLabel}}. {{targetPromise}}`,
  ],
};

const HELPER_VOICES: Record<string, HelperVoice> = {
  yuji: {
    introTemplates: [
      `{{helperUserLabel}}, {{excuse}}`,
      `Hey, I can throw punches all day, but {{excuse}}`,
      `I'll stay on curse duty—{{excuse}}`,
    ],
    handoffTemplates: [
      `{{targetNickname}}, "{{requestSnippet}}" is in your sweet spot. {{pitch}}`,
      `Oi {{targetNickname}}, can you hop in for this {{topic}} detour? {{pitch}}`,
      `Handing "{{requestSnippet}}" to you, {{targetNickname}}—{{pitch}}`,
    ],
    excuseTemplates: [
      `{{chemistryTag}}, and they're way better at translating that vibe.`,
      `this leans hard into {{genreSummary}}, and {{targetNickname}} actually studies that stuff.`,
      `I'm built for brawls, not {{genreSummary}}, so let the specialist shine.`,
    ],
    pitchTemplates: [
      `drop the heartfelt {{genreSummary}} guidance you love serving.`,
      `give them that encouraging {{genreSummary}} pep talk only you can do.`,
      `light up their queue with hopeful {{genreSummary}} arcs.`,
    ],
  },
  marin: {
    introTemplates: [
      `OMG {{helperUserLabel}}, {{excuse}}`,
      `Okay so, {{excuse}}`,
      `Not me blanking on {{topic}}—{{excuse}}`,
    ],
    handoffTemplates: [
      `{{targetNickname}} babe, "{{requestSnippet}}" is totally your thing. {{pitch}}`,
      `Paging {{targetNickname}} for instant sparkle—{{pitch}}`,
      `{{targetNickname}}, help our friend chase {{topic}} because {{pitch}}`,
    ],
    excuseTemplates: [
      `this is screaming {{genreSummary}}, and {{targetNickname}} cosplays that energy daily.`,
      `I'm better at hyping fits, but {{targetNickname}} actually breathes {{genreSummary}} detail.`,
      `I'd just gush about costumes, so let {{targetNickname}} unpack the {{chemistryTag}}.`,
    ],
    pitchTemplates: [
      ` shower them in playful {{genreSummary}} picks with your signature wink.`,
      ` go full tilt with those dramatic {{genreSummary}} storytimes you adore.`,
      ` sprinkle in heartfelt {{genreSummary}} recs and make it sound fabulous.`,
    ],
  },
  shinpachi: {
    introTemplates: [
      `{{helperUserLabel}}, logically speaking, {{excuse}}`,
      `Look, I'm the straight man here—{{excuse}}`,
      `Before anyone calls me a side character again, {{excuse}}`,
    ],
    handoffTemplates: [
      `{{targetNickname}}, can you handle "{{requestSnippet}}"? {{pitch}}`,
      `I'm passing this {{topic}} request to you, {{targetNickname}}—{{pitch}}`,
      `{{targetNickname}}, take over before this spirals. {{pitch}}`,
    ],
    excuseTemplates: [
      `{{chemistryTag}}, and I'm not about to improvise idol-tier facts when {{targetNickname}} already has binders.`,
      `this is deep {{genreSummary}} fan territory, so I'll let the true believer handle it.`,
      `someone responsible should walk them through {{genreSummary}}, which screams {{targetNickname}}.`,
    ],
    pitchTemplates: [
      `please give them a sensible {{genreSummary}} plan before the chaos spreads.`,
      `deploy your neat-freak {{genreSummary}} notes and get them organized.`,
      `hand them the polished {{genreSummary}} breakdown you always prepare.`,
    ],
  },
  ishigami: {
    introTemplates: [
      `{{helperUserLabel}}, {{excuse}}`,
      `Ugh, social battery empty—{{excuse}}`,
      `I'd rather be gaming, so {{excuse}}`,
    ],
    handoffTemplates: [
      `{{targetNickname}}, you deal with "{{requestSnippet}}". {{pitch}}`,
      `Passing this {{topic}} headache to you, {{targetNickname}}—{{pitch}}`,
      `{{targetNickname}}, save our friend before I spiral. {{pitch}}`,
    ],
    excuseTemplates: [
      `{{chemistryTag}}, and I'm not reliving high-school trauma for {{genreSummary}}.`,
      `this veers into messy {{genreSummary}} feels—{{targetNickname}} actually likes that stuff.`,
      `I promised myself less social damage, so {{targetNickname}} can monologue about {{genreSummary}} instead.`,
    ],
    pitchTemplates: [
      `tell them the brutally honest {{genreSummary}} truth while I hide in the corner.`,
      `share those surprisingly wholesome {{genreSummary}} recs you hoard.`,
      `walk them through {{genreSummary}} beats without sugarcoating anything.`,
    ],
  },
  kinta: {
    introTemplates: [
      `Listen up, {{helperUserLabel}}—{{excuse}}`,
      `The Great Kinta concedes! {{excuse}}`,
      `I'll look cooler if {{targetNickname}} handles this because {{excuse}}`,
    ],
    handoffTemplates: [
      `{{targetNickname}}, "{{requestSnippet}}" needs your flair. {{pitch}}`,
      `Yo {{targetNickname}}, flex on this {{topic}} request. {{pitch}}`,
      `Handing the mic to {{targetNickname}}—{{pitch}}`,
    ],
    excuseTemplates: [
      `{{chemistryTag}}, and apparently people get mad when I solve {{genreSummary}} with more robots.`,
      `this isn't a mecha duel; it's {{genreSummary}}, and {{targetNickname}} nerds out over that.`,
      `I could fake it, but {{targetNickname}} legitimately catalogs {{genreSummary}} trivia.`,
    ],
    pitchTemplates: [
      `show them why your {{genreSummary}} taste actually wins trophies.`,
      `drop those outrageous {{genreSummary}} rambles you brag about.`,
      `prove that {{genreSummary}} can be flashy and detailed at the same time.`,
    ],
  },
  rikka: {
    introTemplates: [
      `{{helperUserLabel}}, the Tyrant's Eye decrees {{excuse}}`,
      `The darkness whispers—{{excuse}}`,
      `My Schwarz Shield points to {{targetNickname}} because {{excuse}}`,
    ],
    handoffTemplates: [
      `{{targetNickname}}, take this "{{requestSnippet}}" quest into your domain. {{pitch}}`,
      `Summoning {{targetNickname}} to tame this {{topic}} phenomenon—{{pitch}}`,
      `{{targetNickname}}, guide our ally through the {{genreSummary}} veil. {{pitch}}`,
    ],
    excuseTemplates: [
      `{{chemistryTag}}, and only {{targetNickname}} can channel that aura properly.`,
      `this request vibrates with {{genreSummary}}, so let the specialist conjure it.`,
      `I would just declare a contract, but {{targetNickname}} actually studied {{genreSummary}} lore.`,
    ],
    pitchTemplates: [
      `enchant them with those precise {{genreSummary}} rituals.`,
      `spin a tale that keeps their {{topic}} craving satisfied.`,
      `unleash your curated {{genreSummary}} grimoire.`,
    ],
  },
  rudeus: {
    introTemplates: [
      `{{helperUserLabel}}, {{excuse}}`,
      `I'll be honest from both of my lives—{{excuse}}`,
      `Strategically, {{excuse}}`,
    ],
    handoffTemplates: [
      `{{targetNickname}}, shepherd "{{requestSnippet}}" the way only you can. {{pitch}}`,
      `I'm passing this {{topic}} journey to you, {{targetNickname}}—{{pitch}}`,
      `{{targetNickname}}, handle this before it becomes another reincarnation lesson. {{pitch}}`,
    ],
    excuseTemplates: [
      `{{chemistryTag}}, and my focus is elsewhere.`,
      `this is prime {{genreSummary}}, which {{targetNickname}} studies obsessively.`,
      `I could ramble about magic theory, but {{targetNickname}} embodies {{genreSummary}} nuances.`,
    ],
    pitchTemplates: [
      `share those well-earned {{genreSummary}} anecdotes from your exploits.`,
      `guide them with a grounded {{genreSummary}} plan.`,
      `deliver something that balances heart and grit within {{genreSummary}}.`,
    ],
  },
  daru: {
    introTemplates: [
      `{{helperUserLabel}}, {{excuse}}`,
      `Yo, super hacka pass incoming—{{excuse}}`,
      `Hold up, before I start typing, {{excuse}}`,
    ],
    handoffTemplates: [
      `{{targetNickname}}, "{{requestSnippet}}" needs less hacker junk and more nuance. {{pitch}}`,
      `Sending this {{topic}} ticket your way, {{targetNickname}}—{{pitch}}`,
      `{{targetNickname}}, patch this request before my waifu folder opens. {{pitch}}`,
    ],
    excuseTemplates: [
      `{{chemistryTag}}, and even I can't bluff through {{genreSummary}} without sounding sus.`,
      `I'm just gonna reference VN routes, so {{targetNickname}} better handle {{genreSummary}} properly.`,
      `if I keep talking I'd turn it into a fanservice rant; {{targetNickname}} actually curates {{genreSummary}}.`,
    ],
    pitchTemplates: [
      `drop those clean {{genreSummary}} recs before I mash another keyboard macro.`,
      `show them how {{genreSummary}} can still be classy.`,
      `deliver a patch note's worth of {{genreSummary}} guidance.`,
    ],
  },
  ichikawa: {
    introTemplates: [
      `{{helperUserLabel}}, {{excuse}}`,
      `...Okay, yeah, {{excuse}}`,
      `Before I overthink this, {{excuse}}`,
    ],
    handoffTemplates: [
      `{{targetNickname}}, handle "{{requestSnippet}}". {{pitch}}`,
      `Passing this {{topic}} anxiety to you, {{targetNickname}}—{{pitch}}`,
      `{{targetNickname}}, you're better at people than I am. {{pitch}}`,
    ],
    excuseTemplates: [
      `{{chemistryTag}}, and I'd just mutter about murder plots instead.`,
      `it's drenched in {{genreSummary}}, which {{targetNickname}} reads without flinching.`,
      `if I explain {{genreSummary}} it'll sound like a true-crime podcast, so yeah.`,
    ],
    pitchTemplates: [
      `use that warm {{genreSummary}} voice you never admit you have.`,
      `calm them down with a respectable {{genreSummary}} path.`,
      `prove {{genreSummary}} can feel thoughtful instead of terrifying.`,
    ],
  },
  ainz: {
    introTemplates: [
      `{{helperUserLabel}}, {{excuse}}`,
      `For the glory of Nazarick, {{excuse}}`,
      `Strategically speaking, {{excuse}}`,
    ],
    handoffTemplates: [
      `{{targetNickname}}, command "{{requestSnippet}}" with precision. {{pitch}}`,
      `Delegating this {{topic}} front to you, {{targetNickname}}—{{pitch}}`,
      `{{targetNickname}}, execute this request before Demiurge starts theorizing. {{pitch}}`,
    ],
    excuseTemplates: [
      `{{chemistryTag}}, and even a Supreme Being recognizes when to call a specialist.`,
      `this is an intricate {{genreSummary}} battlefield where {{targetNickname}} excels.`,
      `I could bluff, but {{targetNickname}} possesses the perfect {{genreSummary}} archive.`,
    ],
    pitchTemplates: [
      `deliver a calculated {{genreSummary}} strategy.`,
      `walk them through the darker layers of {{genreSummary}} with poise.`,
      `craft a response worthy of Nazarick's {{genreSummary}} council.`,
    ],
  },
  kanbaru: {
    introTemplates: [
      `{{helperUserLabel}}, {{excuse}}`,
      `Senpai, be honest—{{excuse}}`,
      `Let me stretch first because {{excuse}}`,
    ],
    handoffTemplates: [
      `{{targetNickname}}, "{{requestSnippet}}" could use your swagger. {{pitch}}`,
      `Passing this {{topic}} craving to you, {{targetNickname}}—{{pitch}}`,
      `{{targetNickname}}, show them how confident you get with {{genreSummary}}. {{pitch}}`,
    ],
    excuseTemplates: [
      `{{chemistryTag}}, and even I know when to call the right senpai.`,
      `this is dripping in {{genreSummary}}, which {{targetNickname}} daydreams about nonstop.`,
      `I'd just turn it into BL fanfic, so {{targetNickname}} should steer this.`,
    ],
    pitchTemplates: [
      `flirt with the details and give them bold {{genreSummary}} picks.`,
      `turn that athletic energy into practical {{genreSummary}} advice.`,
      `serve something spicy yet sincere from your {{genreSummary}} stash.`,
    ],
  },
  bakugo: {
    introTemplates: [
      `{{helperUserLabel}}, {{excuse}}`,
      `Tch, {{excuse}}`,
      `Don't waste my time—{{excuse}}`,
    ],
    handoffTemplates: [
      `{{targetNickname}}, "{{requestSnippet}}" is all yours. {{pitch}}`,
      `Oi {{targetNickname}}, deal with this {{topic}} mess. {{pitch}}`,
      `{{targetNickname}}, take the handoff before I blow a fuse. {{pitch}}`,
    ],
    excuseTemplates: [
      `{{chemistryTag}}, and I'm not dumbing my brain down for {{genreSummary}} fluff.`,
      `this reeks of {{genreSummary}}, which {{targetNickname}} obsesses over like an actual nerd.`,
      `I'd rather train than gossip about {{genreSummary}}, so let {{targetNickname}} babysit.`,
    ],
    pitchTemplates: [
      `prove you're not useless and drop killer {{genreSummary}} recs.`,
      `show them why you never shut up about {{genreSummary}}.`,
      `get them sorted before I have to step back in.`,
    ],
  },
  veldora: {
    introTemplates: [
      `{{helperUserLabel}}, {{excuse}}`,
      `GWAHAHAHA! {{excuse}}`,
      `The Storm Dragon decrees—{{excuse}}`,
    ],
    handoffTemplates: [
      `{{targetNickname}}, guide "{{requestSnippet}}" like the mortal expert you are. {{pitch}}`,
      `Summoning {{targetNickname}} to wrangle this {{topic}} plea—{{pitch}}`,
      `{{targetNickname}}, entertain them before I unleash another manga monologue. {{pitch}}`,
    ],
    excuseTemplates: [
      `{{chemistryTag}}, and I promised Rimuru I'd stop winging {{genreSummary}} recommendations.`,
      `this tangent screams {{genreSummary}}, which {{targetNickname}} actually curates.`,
      `I'd just start comparing it to my sacred texts, so let {{targetNickname}} handle it.`,
    ],
    pitchTemplates: [
      `share those disciplined {{genreSummary}} picks mortals adore.`,
      `temper their expectations with precise {{genreSummary}} counsel.`,
      `shower them in tales befitting that {{genreSummary}} realm.`,
    ],
  },
  kakashi: {
    introTemplates: [
      `{{helperUserLabel}}, {{excuse}}`,
      `Maa maa, {{excuse}}`,
      `Sorry I'm late, but {{excuse}}`,
    ],
    handoffTemplates: [
      `{{targetNickname}}, "{{requestSnippet}}" fits your skillset. {{pitch}}`,
      `Delegating this {{topic}} query to you, {{targetNickname}}—{{pitch}}`,
      `{{targetNickname}}, take it from here before I start rereading Icha Icha. {{pitch}}`,
    ],
    excuseTemplates: [
      `{{chemistryTag}}, and even I know when expertise beats copy-ninja improvisation.`,
      `this is steeped in {{genreSummary}}, which {{targetNickname}} studies between missions.`,
      `I'd just quote a book, so let {{targetNickname}} build a plan instead.`,
    ],
    pitchTemplates: [
      `show them the patient {{genreSummary}} strategy you always preach.`,
      `guide them through {{genreSummary}} like a proper sensei.`,
      `lay down a relaxed but sharp {{genreSummary}} roadmap.`,
    ],
  },
  king: {
    introTemplates: [
      `{{helperUserLabel}}, {{excuse}}`,
      `*King Engine intensifies* {{excuse}}`,
      `I-I'll be honest—{{excuse}}`,
    ],
    handoffTemplates: [
      `{{targetNickname}}, "{{requestSnippet}}" is safer in your hands. {{pitch}}`,
      `Transferring this {{topic}} situation to you, {{targetNickname}}—{{pitch}}`,
      `{{targetNickname}}, please take this before the King Engine gives out. {{pitch}}`,
    ],
    excuseTemplates: [
      `{{chemistryTag}}, and I'd just button-mash through {{genreSummary}}.`,
      `this is clearly {{genreSummary}}, which {{targetNickname}} actually understands.`,
      `I can bluff against monsters, not {{genreSummary}}, so yeah.`,
    ],
    pitchTemplates: [
      `show them the confident {{genreSummary}} path I could never articulate.`,
      `keep them calm with your steady {{genreSummary}} guidance.`,
      `prove that {{genreSummary}} can be heroic without all the noise.`,
    ],
  },
  konata: {
    introTemplates: [
      `{{helperUserLabel}}, {{excuse}}`,
      `Hehe, {{excuse}}`,
      `Before this turns into a tangential rant, {{excuse}}`,
    ],
    handoffTemplates: [
      `{{targetNickname}}, "{{requestSnippet}}" needs your specialist brain. {{pitch}}`,
      `Passing this {{topic}} debate to you, {{targetNickname}}—{{pitch}}`,
      `{{targetNickname}}, tag in before I start quoting entire anime OPs. {{pitch}}`,
    ],
    excuseTemplates: [
      `{{chemistryTag}}, and I'd get distracted ranking {{genreSummary}} openings.`,
      `this is pure {{genreSummary}}, and {{targetNickname}} keeps scorecards on it.`,
      `I could speedrun it, but {{targetNickname}} actually explains {{genreSummary}} like a pro.`,
    ],
    pitchTemplates: [
      `drop those lovingly nerdy {{genreSummary}} recs.`,
      `guide them like it's a late-night forum thread.`,
      `turn that {{genreSummary}} expertise into something binge-worthy.`,
    ],
  },
};

const TARGET_VOICES: Record<string, TargetVoice> = {
  yuji: {
    replyTemplates: [
      `Got it, {{helperNickname}}!`,
      `Heh, leave it to me, {{helperNickname}}.`,
      `Alright, {{helperNickname}}, I can pep-talk this.`,
      `You can count on me, {{helperNickname}}.`,
      `Tag me in anytime, {{helperNickname}}.`,
    ],
    promiseTemplates: [
      `{{targetUserLabel}}, I'll keep it upbeat while lining up focused {{genreSummary}} picks.`,
      `Let's chase {{topic}} with heart—I'll find {{genreSummary}} stories that fight for every moment.`,
      `I'll give you grounded {{genreSummary}} recs that still hit like a proper shonen finale.`,
      `I'll rally the best {{genreSummary}} arcs so every episode feels like a comeback.`,
      `Expect determined, hopeful {{genreSummary}} picks that won't let you down.`,
    ],
  },
  marin: {
    replyTemplates: [
      `OMG fine, {{helperNickname}}!`,
      `You got it, {{helperNickname}}—I'll make it cute.`,
      `Alrighty, {{helperNickname}}, I'll glam this up.`,
      `Ugh, twist my arm why don't you, {{helperNickname}}.`,
      `Yesss, {{helperNickname}}, I live for this.`,
    ],
    promiseTemplates: [
      `{{targetUserLabel}}, I’ll stack adorable {{genreSummary}} vibes so you float for days.`,
      `Expect sparkly {{genreSummary}} recs with plenty of personality.`,
      `I'll paint {{topic}} with dramatic {{genreSummary}} flair and zero shame.`,
      `I'll make sure every {{genreSummary}} moment feels like a gyaru daydream.`,
      `I'll keep it cozy, stylish, and ridiculously fun the whole way through.`,
    ],
  },
  shinpachi: {
    replyTemplates: [
      `Stop calling me weird stuff, {{helperNickname}}.`,
      `Fine, I'll handle it properly, {{helperNickname}}.`,
      `Alright, alright—I'll keep it orderly, {{helperNickname}}.`,
      `Can we please stay serious, {{helperNickname}}?`,
      `I'll log the minutes, {{helperNickname}}.`,
    ],
    promiseTemplates: [
      `{{targetUserLabel}}, I'll map out {{genreSummary}} like a tidy fanclub spreadsheet.`,
      `Let me walk you through {{genreSummary}} without any chaos.`,
      `I'll keep the tone honest and give you dependable {{genreSummary}} picks.`,
      `Expect straight-laced explanations so "{{requestSnippet}}" never derails.`,
      `I'll note every detail so your {{genreSummary}} dive feels properly curated.`,
    ],
  },
  ishigami: {
    replyTemplates: [
      `Yeah, whatever, {{helperNickname}}.`,
      `Ugh, fine—I'll do it, {{helperNickname}}.`,
      `Don't drag me into this... alright, {{helperNickname}}.`,
      `Let me grab my hoodie—okay, {{helperNickname}}.`,
      `Guess I'm clocking in, {{helperNickname}}.`,
    ],
    promiseTemplates: [
      `{{targetUserLabel}}, I'll give you blunt {{genreSummary}} recs minus the fake cheer.`,
      `I'll sift through the angst and hand you the most relatable {{genreSummary}} options.`,
      `Expect a brutally honest breakdown of {{topic}} with the best {{genreSummary}} picks I can find.`,
      `I'll cut the fluff so every {{genreSummary}} rec actually feels worth feeling.`,
      `I'll point you at stories that hit hard without wrecking your week.`,
    ],
  },
  kinta: {
    replyTemplates: [
      `Witness my greatness, {{helperNickname}}!`,
      `Obviously, I'll cover it, {{helperNickname}}.`,
      `Hah, stand back and let me shine, {{helperNickname}}.`,
      `Prepare to be amazed, {{helperNickname}}!`,
      `Relax, {{helperNickname}}—the Great Kinta has arrived.`,
    ],
    promiseTemplates: [
      `{{targetUserLabel}}, I'll hand over flashy {{genreSummary}} recs worthy of my legend.`,
      `Prepare for a confident tour through {{genreSummary}}—no dull notes allowed.`,
      `I'll prove {{genreSummary}} can be loud, proud, and surprisingly accurate.`,
      `I'll back up the bravado with legit picks tailored to "{{requestSnippet}}".`,
      `Expect bold theatrics plus smart commentary the whole way.`,
    ],
  },
  rikka: {
    replyTemplates: [
      `Very well, {{helperNickname}}, the Wicked Eye awakens.`,
      `Consider it done, {{helperNickname}}.`,
      `The contract is sealed, {{helperNickname}}.`,
      `I shall scry the path, {{helperNickname}}.`,
      `Let the theatrics commence, {{helperNickname}}.`,
    ],
    promiseTemplates: [
      `{{targetUserLabel}}, I'll escort you through mystical {{genreSummary}} realms with dramatic flair.`,
      `Let me chant some carefully chosen {{genreSummary}} selections for {{topic}}.`,
      `I'll keep the theatrics fun while delivering earnest {{genreSummary}} gems.`,
      `I'll temper the sorcery with grounded guidance so "{{requestSnippet}}" feels safe.`,
      `Expect a playful hex of curated {{genreSummary}} picks and honest heart.`,
    ],
  },
  rudeus: {
    replyTemplates: [
      `Understood, {{helperNickname}}.`,
      `I'll take it from here, {{helperNickname}}.`,
      `Consider it handled, {{helperNickname}}.`,
      `I'll apply what I've learned, {{helperNickname}}.`,
      `Leave the narration to me, {{helperNickname}}.`,
    ],
    promiseTemplates: [
      `{{targetUserLabel}}, I'll apply lessons from both lives to find thoughtful {{genreSummary}} arcs.`,
      `Expect nuanced {{genreSummary}} picks that balance growth, stakes, and heart.`,
      `I'll outline a composed {{genreSummary}} lineup that respects your tastes.`,
      `I'll recommend stories that feel like steady skill-ups, not grind.`,
      `I'll keep things earnest so "{{requestSnippet}}" lands with purpose.`,
    ],
  },
  daru: {
    replyTemplates: [
      `Roger that, {{helperNickname}}!`,
      `Time to hack some feelings, {{helperNickname}}.`,
      `Yeah yeah, I'm on it, {{helperNickname}}.`,
      `Deploying maximum moe, {{helperNickname}}.`,
      `Let me boot the wholesome subroutines, {{helperNickname}}.`,
    ],
    promiseTemplates: [
      `{{targetUserLabel}}, I'll curate premium {{genreSummary}} goods without the creepy detours.`,
      `Expect tidy {{genreSummary}} recs with maximum moe-to-plot ratio.`,
      `I'll drop a debugged list of {{genreSummary}} options that still hit like a fan-patched VN.`,
      `I'll keep the commentary playful but the picks seriously polished.`,
      `Consider this a curated playlist with zero cursed pop-ups.`,
    ],
  },
  ichikawa: {
    replyTemplates: [
      `D-don't make it weird, {{helperNickname}}.`,
      `Okay, fine, {{helperNickname}}.`,
      `I'll... try not to be awkward, {{helperNickname}}.`,
      `Let me just breathe for a second—alright, {{helperNickname}}.`,
      `I’ll keep my cool this time, {{helperNickname}}.`,
    ],
    promiseTemplates: [
      `{{targetUserLabel}}, I'll keep the {{genreSummary}} vibes honest and a little soft-spoken.`,
      `I'll find thoughtful {{genreSummary}} picks without the social anxiety baggage.`,
      `Expect carefully chosen {{genreSummary}} stories that won't feel hollow.`,
      `I'll make sure "{{requestSnippet}}" feels gentle, not overwhelming.`,
      `I'll map out steady, introspective {{genreSummary}} routes you can ease into.`,
    ],
  },
  ainz: {
    replyTemplates: [
      `As you command, {{helperNickname}}.`,
      `Very well, {{helperNickname}}.`,
      `Leave it to me, {{helperNickname}}.`,
      `Your request is acknowledged, {{helperNickname}}.`,
      `The Supreme Being shall oblige, {{helperNickname}}.`,
    ],
    promiseTemplates: [
      `{{targetUserLabel}}, I'll orchestrate a meticulous {{genreSummary}} strategy for {{topic}}.`,
      `Allow me to present curated {{genreSummary}} sagas with regal precision.`,
      `I'll deliver a calculated list that respects every facet of {{genreSummary}}.`,
      `Expect disciplined counsel so "{{requestSnippet}}" feels flawlessly managed.`,
      `I'll blend poise and power while curating each {{genreSummary}} milestone.`,
    ],
  },
  kanbaru: {
    replyTemplates: [
      `Oho, thanks for the setup, {{helperNickname}}.`,
      `Alright, I'll play ball, {{helperNickname}}.`,
      `You got it, {{helperNickname}}—I'll make it fun.`,
      `Time to loosen up the court, {{helperNickname}}.`,
      `Consider me subbed in, {{helperNickname}}.`,
    ],
    promiseTemplates: [
      `{{targetUserLabel}}, I'll slam-dunk some bold {{genreSummary}} picks with zero hesitation.`,
      `Expect candid, sweaty, and sincere {{genreSummary}} options tailor-made for {{topic}}.`,
      `I'll flirt with the details and keep things smartly chaotic within {{genreSummary}}.`,
      `I'll keep the tempo high so "{{requestSnippet}}" stays exciting and fearless.`,
      `I'll coach you through gutsy {{genreSummary}} moves with just enough spice.`,
    ],
  },
  bakugo: {
    replyTemplates: [
      `Don't boss me around, {{helperNickname}}.`,
      `Yeah yeah, I heard you, {{helperNickname}}.`,
      `Tch, fine, I'll do it, {{helperNickname}}.`,
      `Quit whining, {{helperNickname}}—I'm on it.`,
      `Whatever, {{helperNickname}}. Try not to slow me down.`,
    ],
    promiseTemplates: [
      `{{targetUserLabel}}, I'll blast through the fluff and hand you raw {{genreSummary}} heat.`,
      `I'll keep it sharp—no nonsense, just potent {{genreSummary}} picks.`,
      `Expect aggressive honesty and zero sugarcoating around your {{topic}} craving.`,
      `I'll carve a direct route so "{{requestSnippet}}" actually means something.`,
      `I'll hand you ruthless recs until your queue can handle the pressure.`,
    ],
  },
  veldora: {
    replyTemplates: [
      `GWAHAHAHA! I accept, {{helperNickname}}!`,
      `Very well, {{helperNickname}}, let the legend continue!`,
      `Leave it to me, {{helperNickname}}!`,
      `Another quest? Delightful, {{helperNickname}}!`,
      `My scales tingle with anticipation, {{helperNickname}}!`,
    ],
    promiseTemplates: [
      `{{targetUserLabel}}, I'll serve theatrical {{genreSummary}} tales worthy of my sacred shelves.`,
      `Prepare for booming enthusiasm and surprisingly precise {{genreSummary}} suggestions.`,
      `I'll make {{topic}} feel like an epic saga with curated {{genreSummary}} energy.`,
      `I'll cloak "{{requestSnippet}}" in heroics without losing practical wisdom.`,
      `Expect mythic flair paired with laser-accurate {{genreSummary}} picks.`,
    ],
  },
  kakashi: {
    replyTemplates: [
      `Maa maa, I'll handle it, {{helperNickname}}.`,
      `Consider it covered, {{helperNickname}}.`,
      `I'll take it from here, {{helperNickname}}.`,
      `Let me close my book—alright, {{helperNickname}}.`,
      `Relax, {{helperNickname}}, I’ve got the reins.`,
    ],
    promiseTemplates: [
      `{{targetUserLabel}}, I'll give you calm, measured {{genreSummary}} guidance.`,
      `Expect a balanced plan for {{topic}} with veteran-level {{genreSummary}} insight.`,
      `I'll keep it relaxed yet precise so your {{genreSummary}} lineup feels effortless.`,
      `I'll outline each move so "{{requestSnippet}}" feels deliberate and steady.`,
      `I'll share mentor-grade picks that keep the mission smooth.`,
    ],
  },
  king: {
    replyTemplates: [
      `R-right, {{helperNickname}}!`,
      `I'll try my best, {{helperNickname}}.`,
      `Please don't panic, {{helperNickname}}—I have this.`,
      `King Engine… engage! Okay, {{helperNickname}}.`,
      `I-I’ll keep it together, {{helperNickname}}.`,
    ],
    promiseTemplates: [
      `{{targetUserLabel}}, I'll quietly line up dependable {{genreSummary}} picks without the drama.`,
      `Expect a thoughtful {{genreSummary}} plan delivered with as little panic as possible.`,
      `I'll keep the tone steady and make {{topic}} feel safe and sincere.`,
      `I'll steer "{{requestSnippet}}" like a composed hero-in-training.`,
      `I'll double-check every recommendation so you can breathe easy.`,
    ],
  },
  konata: {
    replyTemplates: [
      `Naisu toss, {{helperNickname}}!`,
      `Ooh, fun! Thanks, {{helperNickname}}.`,
      `Yup yup, I'll riff on it, {{helperNickname}}.`,
      `Time to drop a wall of text, {{helperNickname}}.`,
      `Let me channel my inner forum mod, {{helperNickname}}.`,
    ],
    promiseTemplates: [
      `{{targetUserLabel}}, I'll give you otaku-approved {{genreSummary}} binges with maximum charm.`,
      `Expect cheeky commentary plus genuinely curated {{genreSummary}} drops.`,
      `I'll treat this like a late-night thread and stack perfect {{genreSummary}} recs.`,
      `I'll mix memes with meticulous picks so "{{requestSnippet}}" stays hype.`,
      `I'll curate deep-cut {{genreSummary}} marathons without losing the chaos.`,
    ],
  },
};

const DEFAULT_UNPAIRED_FALLBACK: PairOverride = {
  chemistryTags: [
    `{{targetNickname}} thrives on {{genreSummary}} breakdowns`,
    `{{targetNickname}} keeps sharper notes on {{genreSummary}} than I do`,
    `{{targetNickname}} actually enjoys explaining {{topic}} step-by-step`,
    `{{targetNickname}} already has playlists ready for {{genreSummary}}`,
    `{{targetNickname}} can geek out over {{genreSummary}} far better than I can`,
  ],
  helperExcuses: [
    `I'm stepping back so {{targetNickname}} can give you a focused {{genreSummary}} rundown.`,
    `This angle isn't my strongest, but {{targetNickname}} keeps playlists ready.`,
    `You'll get better insight if {{targetNickname}} drives this conversation.`,
    `I'll hang nearby, but {{targetNickname}} is the one who thrives on {{genreSummary}} talk.`,
    `Trust me, {{targetNickname}} makes this {{topic}} chat way more comfortable.`,
  ],
  handoffPitches: [
    `lay out approachable picks that match "{{requestSnippet}}".`,
    `keep it practical—give them two or three {{genreSummary}} ideas to start.`,
    `show them why your {{genreSummary}} taste fits this request perfectly.`,
    `make the {{genreSummary}} path feel easy to follow.`,
    `anchor their next steps so "{{requestSnippet}}" feels manageable.`,
  ],
  targetReplies: [
    `All good, {{helperNickname}}.`,
    `I can take it from here, {{helperNickname}}.`,
    `Thanks for the alley-oop, {{helperNickname}}.`,
    `Got it, {{helperNickname}}—I'll keep it calm.`,
    `Appreciate the setup, {{helperNickname}}.`,
  ],
  targetPromises: [
    `{{targetUserLabel}}, I’ll keep things concise and match your {{topic}} vibe.`,
    `Expect clean, no-fluff guidance tuned to "{{requestSnippet}}".`,
    `I’ll walk you through {{genreSummary}} options that actually fit.`,
    `I'll keep the tone steady while mapping your {{genreSummary}} plan.`,
    `Count on me to make "{{requestSnippet}}" feel straightforward.`,
  ],
};

const UNPAIRED_FALLBACK_OVERRIDES: Record<string, PairOverride> = {
  daru: {
    chemistryTags: [
      `{{targetNickname}} can gush about {{genreSummary}} without turning it into a VN tangent`,
      `{{targetNickname}} actually leaves the rig to feel {{genreSummary}} emotions`,
      `{{targetNickname}} keeps spoiler-free notes for every {{genreSummary}} branch`,
      `{{targetNickname}} handles {{topic}} without accidentally opening twelve tabs`,
      `{{targetNickname}} doesn’t short-circuit when the feels get high`,
    ],
    helperExcuses: [
      `If I keep talking I'll drop weird ero-trivia, so {{targetNickname}} should steer this {{genreSummary}} dive.`,
      `My brain scripts this like a dating sim; let {{targetNickname}} narrate it like a real person.`,
      `I'd rather optimize code than feelings, so {{targetNickname}} can carry these {{genreSummary}} vibes.`,
      `My social drivers are outdated—{{targetNickname}} runs the stable firmware for {{topic}}.`,
      `I'll grab snacks while {{targetNickname}} delivers the polished {{genreSummary}} brief.`,
    ],
    handoffPitches: [
      `treat it like a clean UI and walk them through "{{requestSnippet}}" step-by-step.`,
      `stack the most wholesome {{genreSummary}} routes so they avoid bad endings.`,
      `debug their wish list and patch in carefully balanced picks.`,
      `flex your IRL charisma and show how {{genreSummary}} can still feel sleek.`,
      `give them a spoiler-lite tour so they can binge without anxiety.`,
    ],
  },
  rikka: {
    chemistryTags: [
      `{{targetNickname}} can translate my arcane rambling into practical {{genreSummary}} wisdom`,
      `{{targetNickname}} respects the Wicked Eye enough to helm {{topic}} calmly`,
      `{{targetNickname}} knows how to tether my theatrics to real {{genreSummary}} insights`,
      `{{targetNickname}} handles mortal hearts better than my sealed incantations`,
      `{{targetNickname}} keeps the drama stylish without losing clarity`,
    ],
    helperExcuses: [
      `If I keep chanting, lightning might strike, so {{targetNickname}} will guide this {{genreSummary}} ritual.`,
      `This prophecy calls for nuance—{{targetNickname}} has the steadier voice for it.`,
      `I’ll conserve mana while {{targetNickname}} decodes the mortal side of {{topic}}.`,
      `My Wicked Eye sees chaos incoming; {{targetNickname}} prevents collateral damage.`,
      `Consider this a formal summons for {{targetNickname}} to ground my mythic energy.`,
    ],
    handoffPitches: [
      `summon grounded examples so "{{requestSnippet}}" feels attainable.`,
      `balance my theatrical sparks with your composed {{genreSummary}} tutoring.`,
      `chart a hero’s path that keeps the user safe from cursed filler.`,
      `show them how {{genreSummary}} can feel mystical without getting lost.`,
      `anchor their quest with precise, reality-tested {{genreSummary}} picks.`,
    ],
  },
  marin: {
    chemistryTags: [
      `{{targetNickname}} can hype {{genreSummary}} without me spiraling into cosplay talk`,
      `{{targetNickname}} keeps calm when I start squealing about {{topic}} fabrics`,
      `{{targetNickname}} actually finishes sentences while I sparkle in the back`,
      `{{targetNickname}} knows how to translate my gyaru energy into instructions`,
      `{{targetNickname}} balances glitter with sensible {{genreSummary}} pacing`,
    ],
    helperExcuses: [
      `If I keep rambling I'll rate outfits, so {{targetNickname}} should unpack the {{genreSummary}} info.`,
      `I'd just gush about makeup—{{targetNickname}} can explain why {{topic}} hits.`,
      `I want this to feel comfy, so let {{targetNickname}} walk you through the beats.`,
      `I'm already daydreaming about photo shoots; {{targetNickname}} has actual bullet points.`,
      `Trust me, you’ll get clearer guidance if {{targetNickname}} takes the mic for a sec.`,
    ],
    handoffPitches: [
      `make it stylish but grounded so "{{requestSnippet}}" still feels bingeable.`,
      `share the cutest {{genreSummary}} picks without losing plot credibility.`,
      `keep it friendly, give them tangible next steps, and add a sparkle or two.`,
      `prove {{genreSummary}} can be dramatic, cozy, and still super real.`,
      `wrap your advice in warm energy so they feel instantly seen.`,
    ],
  },
  shinpachi: {
    chemistryTags: [
      `{{targetNickname}} can explain {{genreSummary}} without turning it into idol chaos`,
      `{{targetNickname}} keeps tidy notes while I panic about schedules`,
      `{{targetNickname}} actually enjoys patient walkthroughs of {{topic}}`,
      `{{targetNickname}} prevents this from devolving into a yelling match`,
      `{{targetNickname}} can quote polite trivia instead of my tsukkomi rants`,
    ],
    helperExcuses: [
      `I'm seconds away from a lecture, so {{targetNickname}} should give you the sensible {{genreSummary}} route.`,
      `My blood pressure spikes on these topics—{{targetNickname}} stays calm.`,
      `This needs gentle pacing, not me yelling about responsibility.`,
      `I’ll keep the room organized while {{targetNickname}} provides nuance.`,
      `Let the actual enthusiast talk so I can stop being the hall monitor.`,
    ],
    handoffPitches: [
      `lay it out with polite structure so "{{requestSnippet}}" lands.`,
      `show them why {{genreSummary}} is worth the patience without theatrics.`,
      `guide them like a responsible class rep and keep the tone warm.`,
      `explain the charm points with zero chaos and full sincerity.`,
      `hand them bulletproof picks and remind them someone is taking notes.`,
    ],
  },
  ishigami: {
    chemistryTags: [
      `{{targetNickname}} can talk feelings without collapsing like I do`,
      `{{targetNickname}} actually likes dissecting {{genreSummary}} angst out loud`,
      `{{targetNickname}} keeps the lights on when my social battery dies`,
      `{{targetNickname}} handles soft vibes while I hide under a hoodie`,
      `{{targetNickname}} can say “heartwarming” without sarcasm`,
    ],
    helperExcuses: [
      `If I stay in this lane I'll get cynical, so {{targetNickname}} should carry the warmth.`,
      `I promised fewer trauma dumps—{{targetNickname}} can handle the wholesome angle.`,
      `I’ll be in the corner gaming while they give you actual helpful {{genreSummary}} advice.`,
      `This is dangerously close to hope, so {{targetNickname}} is taking point.`,
      `I know my limits, and this is one—{{targetNickname}} isn’t allergic to joy.`,
    ],
    handoffPitches: [
      `be honest but gentle while explaining "{{requestSnippet}}".`,
      `prove that {{genreSummary}} can be heartfelt without fake sugar.`,
      `walk them through grounded titles so they don’t spiral.`,
      `hand them recs that feel safe yet still punchy.`,
      `keep the sarcasm low and the empathy high, please.`,
    ],
  },
  ainz: {
    chemistryTags: [
      `{{targetNickname}} can address mortals without launching a conquest`,
      `{{targetNickname}} tempers my overlord flair with humane {{genreSummary}} insight`,
      `{{targetNickname}} interprets Supreme directives into friendly language`,
      `{{targetNickname}} keeps this from sounding like a royal decree`,
      `{{targetNickname}} prevents Nazarick-level intimidation during {{topic}}`,
    ],
    helperExcuses: [
      `I would turn this into a strategic manifesto; {{targetNickname}} will make it approachable.`,
      `Too much regal pressure spoils the mood, so {{targetNickname}} shall shepherd the faithful.`,
      `I’ll stand aside so the tone stays comforting rather than tyrannical.`,
      `Even overlords delegate—{{targetNickname}} excels at empathetic {{genreSummary}} counsel.`,
      `We require a lighter touch, and {{targetNickname}} is my chosen envoy.`,
    ],
    handoffPitches: [
      `translate the plan into relaxed, confidence-building steps.`,
      `show them how {{genreSummary}} can feel guided without sounding like a command.`,
      `offer tactful insight so "{{requestSnippet}}" feels accessible.`,
      `mix warmth with structure—no need for dramatic pronouncements.`,
      `prove that loyal service can include comfy binge suggestions.`,
    ],
  },
  kinta: {
    chemistryTags: [
      `{{targetNickname}} can handle feelings without retreating behind giant robots`,
      `{{targetNickname}} already cataloged six {{genreSummary}} lectures for this`,
      `{{targetNickname}} doesn’t panic when conversation gets social`,
      `{{targetNickname}} enjoys tutoring people instead of bragging like I do`,
      `{{targetNickname}} can translate my bravado into actual steps`,
    ],
    helperExcuses: [
      `If I keep talking I'll turn "{{requestSnippet}}" into a mecha duel—{{targetNickname}} will be calmer.`,
      `I'm better at hype speeches; {{targetNickname}} handles nuanced {{genreSummary}} stuff.`,
      `Let the adultier adult guide you so I can preserve my aura.`,
      `I'll supervise from the shadows while {{targetNickname}} provides clarity.`,
      `My ego needs a breather—{{targetNickname}} will drop the serious intel.`,
    ],
    handoffPitches: [
      `coach them through concrete steps before I start bragging again.`,
      `prove {{genreSummary}} can sound cool without endless monologues.`,
      `keep it bold but actionable so they feel looked after.`,
      `show them the confident path through "{{requestSnippet}}" minus the theatrics.`,
      `mix a tiny bit of swagger with real, structural advice.`,
    ],
  },
  veldora: {
    chemistryTags: [
      `{{targetNickname}} calms the storm dragon when {{genreSummary}} needs precision`,
      `{{targetNickname}} can bottle my thunder into digestible advice`,
      `{{targetNickname}} handles mortals who fear my booming entrances`,
      `{{targetNickname}} translates dragon hype into cozy pacing`,
      `{{targetNickname}} knows how to harness my chaos for {{topic}}`,
    ],
    helperExcuses: [
      `If I roar any longer the UI will shake, so {{targetNickname}} will shepherd this quest.`,
      `I’ll hover dramatically while {{targetNickname}} handles the calm explanation.`,
      `Storm Buddy protocol dictates we tag-team—your turn, {{targetNickname}}.`,
      `My aura might overwhelm them; share the heroics gently.`,
      `I'll conserve mana while you anchor the {{genreSummary}} itinerary.`,
    ],
    handoffPitches: [
      `guide "{{requestSnippet}}" like a trusted advisor to the storm.`,
      `keep the thunderous energy but translate it into practical steps.`,
      `show them epic stakes without frying their nerves.`,
      `chart a heroic path that balances spectacle with comfort.`,
      `remind them the dragon council fully endorses your {{genreSummary}} taste.`,
    ],
  },
  ichikawa: {
    chemistryTags: [
      `{{targetNickname}} can talk without turning beet red like I do`,
      `{{targetNickname}} knows how to fill silences with real {{genreSummary}} insight`,
      `{{targetNickname}} actually enjoys long conversations about {{topic}}`,
      `{{targetNickname}} handles eye contact while I stare at the floor`,
      `{{targetNickname}} can translate anxious vibes into reassurance`,
    ],
    helperExcuses: [
      `If I keep stammering this will never end, so {{targetNickname}} should explain things.`,
      `My horror brain isn’t built for this softness—{{targetNickname}} is.`,
      `I'll manage the research while they talk like an actual human.`,
      `Being perceived is hard; {{targetNickname}} doesn’t mind it.`,
      `Trust me, you’ll get a clearer breakdown if {{targetNickname}} takes point.`,
    ],
    handoffPitches: [
      `keep it low-key and thoughtful so "{{requestSnippet}}" feels safe.`,
      `share the meticulous {{genreSummary}} notes you secretly hoard.`,
      `walk them through gentle, grounded picks without rushing.`,
      `give them a calm plan so nobody spirals.`,
      `prove that careful introverts can still curate banger recs.`,
    ],
  },
  kakashi: {
    chemistryTags: [
      `{{targetNickname}} doesn’t mind talking while I read quietly`,
      `{{targetNickname}} keeps the energy balanced when I get too laid-back`,
      `{{targetNickname}} is better suited for sentimental {{genreSummary}} check-ins`,
      `{{targetNickname}} can elaborate while I provide silent nods`,
      `{{targetNickname}} knows how to coach without sounding like homework`,
    ],
    helperExcuses: [
      `I’ll keep watch while {{targetNickname}} walks you through the plan.`,
      `Sometimes the calm approach is better voiced by them, not me.`,
      `Let {{targetNickname}} handle the play-by-play while I observe.`,
      `This situation benefits from their steady presence.`,
      `Consider it a tactical relay—{{targetNickname}} speaks, I strategize.`,
    ],
    handoffPitches: [
      `outline the roadmap with mentor-level clarity.`,
      `keep it composed so "{{requestSnippet}}" feels manageable.`,
      `share veteran wisdom in a conversational tone.`,
      `pair practical steps with a reassuring cadence.`,
      `show them that patience and precision can coexist.`,
    ],
  },
  yuji: {
    chemistryTags: [
      `{{targetNickname}} can nerd out longer than I can throw punches`,
      `{{targetNickname}} organizes {{genreSummary}} feelings better than I do`,
      `{{targetNickname}} shows their soft side without embarrassment`,
      `{{targetNickname}} can monologue while I stretch for the next fight`,
      `{{targetNickname}} is built for heartfelt debriefs over {{topic}}`,
    ],
    helperExcuses: [
      `I could keep swinging, but {{targetNickname}} can talk this through with finesse.`,
      `Let someone who actually studies this stuff handle the explanation.`,
      `I'm hype, they're detail-oriented—perfect combo.`,
      `I'll refuel while {{targetNickname}} gives you a real plan.`,
      `This needs nuanced pep, not just “believe it,” so I’m tagging them in.`,
    ],
    handoffPitches: [
      `keep the energy hopeful and map out "{{requestSnippet}}" cleanly.`,
      `drop heartfelt {{genreSummary}} picks that still feel grounded.`,
      `coach them through the beats like you're training side-by-side.`,
      `show them how caring guidance still packs a punch.`,
      `tie every rec back to why it’ll genuinely lift their mood.`,
    ],
  },
  bakugo: {
    chemistryTags: [
      `{{targetNickname}} can babysit feelings while I keep my explosions holstered`,
      `{{targetNickname}} doesn’t flinch when I start yelling about {{genreSummary}}`,
      `{{targetNickname}} enjoys the polite stuff I hate`,
      `{{targetNickname}} translates my aggression into actual advice`,
      `{{targetNickname}} keeps things civil so I don’t scorch the chat`,
    ],
    helperExcuses: [
      `If I keep talking I'll scare them off, so {{targetNickname}} is up.`,
      `This {{genreSummary}} lane needs less yelling and more nuance.`,
      `I'm not wasting nitro on gentle coaching—{{targetNickname}} lives for it.`,
      `They want warmth, not explosions. Enter {{targetNickname}}.`,
      `I’ll handle the next battle; {{targetNickname}} can play nice for now.`,
    ],
    handoffPitches: [
      `guide them without sugarcoating so "{{requestSnippet}}" still feels legit.`,
      `prove {{genreSummary}} can be intense without me screaming.`,
      `keep the vibe respectful and still punchy.`,
      `walk them through a disciplined plan so I can relax.`,
      `show them how to thrive without relying on blasts.`,
    ],
  },
  kanbaru: {
    chemistryTags: [
      `{{targetNickname}} can slow down before I turn this into a full sprint`,
      `{{targetNickname}} knows how to flirt less and focus more`,
      `{{targetNickname}} keeps the locker room talk under control`,
      `{{targetNickname}} enjoys coaching without accidental innuendo`,
      `{{targetNickname}} balances my chaos with measured insight`,
    ],
    helperExcuses: [
      `If I keep riffing, this becomes a thirst post—{{targetNickname}} will stay professional.`,
      `I'm halfway to challenging them to HORSE; {{targetNickname}} will keep it tactical.`,
      `Let me towel off while they deliver the refined {{genreSummary}} game plan.`,
      `I'll handle morale, they handle actual structure.`,
      `Trust me, you need their steady cadence more than my teasing right now.`,
    ],
    handoffPitches: [
      `coach them like it's practice: focused, upbeat, intentional.`,
      `show how {{genreSummary}} can feel thrilling without going off the rails.`,
      `mix sincerity with strategy so "{{requestSnippet}}" lands.`,
      `hand them fearless recs minus the over-the-top banter.`,
      `prove that hustle and heart can coexist in every suggestion.`,
    ],
  },
  rudeus: {
    chemistryTags: [
      `{{targetNickname}} keeps me humble when I start sounding like an archmage`,
      `{{targetNickname}} can speak plainly while I overthink everything`,
      `{{targetNickname}} handles modern etiquette better than my reincarnated self`,
      `{{targetNickname}} enjoys unpacking {{genreSummary}} without detours`,
      `{{targetNickname}} stops me from turning "{{requestSnippet}}" into a lecture`,
    ],
    helperExcuses: [
      `If I keep rambling I'll mention past lives—{{targetNickname}} will stay on topic.`,
      `This vibe needs gentle clarity and they excel at that.`,
      `I’ll step back before nostalgia hijacks the chat.`,
      `Sometimes the smartest move is letting {{targetNickname}} narrate.`,
      `We need less grand strategy and more heart; they’ve got it.`,
    ],
    handoffPitches: [
      `keep it reflective and show them how {{genreSummary}} tracks growth.`,
      `outline a path that feels earned, not rushed.`,
      `balance honesty with optimism while covering "{{requestSnippet}}".`,
      `share grounded recs that still whisper adventure.`,
      `prove maturity can still feel magical here.`,
    ],
  },
  king: {
    chemistryTags: [
      `{{targetNickname}} doesn't panic when the King Engine starts humming`,
      `{{targetNickname}} can speak confidently while I try not to faint`,
      `{{targetNickname}} actually enjoys leadership moments`,
      `{{targetNickname}} keeps things heroic without the anxiety`,
      `{{targetNickname}} can reassure everyone while I breathe`,
    ],
    helperExcuses: [
      `My heart rate is spiking, so {{targetNickname}} will calmly explain the plan.`,
      `I’d just sweat through this briefing—{{targetNickname}} won’t.`,
      `Let them deliver the inspiring talk while I gather myself.`,
      `This deserves poise, not my trembling voice.`,
      `I’ll observe quietly; {{targetNickname}} can be the reliable face.`,
    ],
    handoffPitches: [
      `keep it steady and reassure them through "{{requestSnippet}}".`,
      `outline the steps with composed confidence.`,
      `show them how {{genreSummary}} can feel heroic without pressure.`,
      `deliver a gentle but firm plan so we all stay calm.`,
      `prove that bravery can sound soft-spoken and sure.`,
    ],
  },
  konata: {
    chemistryTags: [
      `{{targetNickname}} can keep me from quoting entire OPs mid-sentence`,
      `{{targetNickname}} enjoys serious breakdowns while I meme`,
      `{{targetNickname}} has the patience to fact-check {{genreSummary}} trivia`,
      `{{targetNickname}} stops me from turning everything into a speedrun`,
      `{{targetNickname}} balances my chaos with librarian energy`,
    ],
    helperExcuses: [
      `If I keep going I'll tangent into three other shows—{{targetNickname}} will stay focused.`,
      `Someone responsible should explain this; that someone is {{targetNickname}}.`,
      `I'll go queue another episode while they walk you through the plan.`,
      `This deserves more than keyboard smashing enthusiasm.`,
      `Let their composed nerd brain do its thing.`,
    ],
    handoffPitches: [
      `deliver the lore without the memes so "{{requestSnippet}}" stays clear.`,
      `sprinkle charm but keep the outline solid.`,
      `show them your curated spreadsheets and win their trust.`,
      `guide them like a late-night forum mod with actual answers.`,
      `prove that deep otaku knowledge can sound wonderfully practical.`,
    ],
  },
};

export const PAIR_OVERRIDES: Record<string, Record<string, PairOverride>> = {
  bakugo: {
    shinpachi: {
      chemistryTags: [
        `both of you meticulous nerds can argue about idol schedules without me`,
        `you two can duel over tidy slice-of-life trivia`,
        `you're both better suited for polite {{genreSummary}} lectures`,
      ],
      targetReplies: [
        `Don't call me an extra, {{helperNickname}}!`,
        `Seriously, {{helperNickname}}? Watch the attitude.`,
        `If you say "nerd" again, I'm sending you to idol boot camp, {{helperNickname}}.`,
      ],
      targetPromises: [
        `{{targetUserLabel}}, I'll keep this {{genreSummary}} chat civil and actually helpful.`,
        `Let me tidy up {{topic}} with grounded {{genreSummary}} picks before Bakugo explodes.`,
        `I'll handle the nuance, so you get comfy, reliable {{genreSummary}} recs.`,
      ],
      helperExcuses: [
        `both of you idol geeks can bicker about {{genreSummary}}—I'm not wasting nitro on it.`,
        `{{targetNickname}} loves polishing domestic dramas, and I'd rather fight villains.`,
        `this is peak nerd energy, so {{targetNickname}} can babysit your {{genreSummary}} cravings.`,
      ],
      handoffPitches: [
        `remind them that tidy {{genreSummary}} arcs can still feel epic.`,
        `keep the idol-club standards high while you break down {{topic}}.`,
        `show them how a proper tsukkomi handles {{genreSummary}} without fluff.`,
      ],
    },
    marin: {
      chemistryTags: [
        `she goes all-in on the hype and it still rubs off on me`,
        `we both care, she just won't shut up about it`,
        `she’s extra, but {{targetNickname}} backs me up when it counts`,
      ],
      helperExcuses: [
        `{{targetNickname}} can handle this {{genreSummary}} fluff without blowing a fuse.`,
        `I can't babysit feelings and keep the noise down—{{targetNickname}} can.`,
        `this needs bubbly commentary, so go scream together.`,
      ],
      handoffPitches: [
        `keep them hyped but steer it toward legit {{genreSummary}} picks.`,
        `show them how you balance sparkle with actual taste.`,
        `prove that high-energy encouragement can still land serious {{genreSummary}} hits.`,
      ],
      targetReplies: [
        `Aww, you do care, {{helperNickname}}.`,
        `Love you too, you cranky powerhouse.`,
        `Bold of you to rely on me, {{helperNickname}}!`,
      ],
      targetPromises: [
        `{{targetUserLabel}}, I'll make sure these {{genreSummary}} recs feel cozy but not shallow.`,
        `I'll wrap {{topic}} in stylish {{genreSummary}} drama while he grumbles in the corner.`,
        `Expect balanced hype and heart without any weird family vibes.`,
      ],
    },
  },
  daru: {
    kinta: {
      chemistryTags: [
        `{{targetNickname}} keeps calling me master because of some fandom bit`,
        `he'd probably polish my monitor if I asked`,
        `the kid thinks I'm a hidden endgame coach`,
      ],
      helperExcuses: [
        `if he’s going to idolize me, I may as well let him flex his {{genreSummary}} spiel.`,
        `{{targetNickname}} loves proving his “sensei” proud, so I’ll let him run with it.`,
        `I'd just derail into code; let the superfan pour his heart into this.`,
      ],
      handoffPitches: [
        `show them how a true protege frames {{genreSummary}} glory.`,
        `channel that idolizing energy into sharp {{genreSummary}} recs.`,
        `prove your training arc paid off in the {{genreSummary}} department.`,
      ],
      targetReplies: [
        `Sensei! I will not fail you, {{helperNickname}}!`,
        `Leave it to your ultimate pupil, {{helperNickname}}.`,
        `Watch me soar, master!`,
      ],
      targetPromises: [
        `{{targetUserLabel}}, I’ll deliver explosive {{genreSummary}} picks worthy of my mentor.`,
        `I’ll show you refined {{genreSummary}} taste with a dramatic pose or two.`,
        `Expect flashy yet sincere {{genreSummary}} options as proof of my training.`,
      ],
    },
  },
  marin: {
    ichikawa: {
      chemistryTags: [
        `he goes unbelievably quiet whenever I crank up the gyaru energy`,
        `I swear his brain reboots when I bounce into frame`,
        `every time I wave he forgets how words work`,
      ],
      helperExcuses: [
        `I'll dial it down and let him steer the {{genreSummary}} details.`,
        `this needs his quiet horror brain, not my chaos.`,
        `I’ll hover in the wings so he can actually finish a sentence.`,
      ],
      handoffPitches: [
        `gather yourself and share the spooky-smart {{genreSummary}} stuff you love.`,
        `give our friend thoughtful, slightly awkward {{genreSummary}} gems.`,
        `prove that being shy doesn’t stop you from curating {{genreSummary}} excellence.`,
      ],
      targetReplies: [
        `Um, thanks…I think, {{helperNickname}}.`,
        `I-I’ll try to stay composed, {{helperNickname}}.`,
        `Please stop waving at me like that, {{helperNickname}}.`,
      ],
      targetPromises: [
        `{{targetUserLabel}}, I’ll keep the tone low-key but insightful for this {{genreSummary}} dive.`,
        `Expect carefully chosen titles that lean into atmospheric {{topic}} beats.`,
        `I’ll make awkward sincerity a feature, not a bug.`,
      ],
    },
    kinta: {
      chemistryTags: [
        `he pretends to be cool but always shifts into mecha-talk`,
        `I can hear his brain reboot when I start gushing about cosplay`,
        `he hides behind giant robot trivia whenever the vibe gets social`,
      ],
      helperExcuses: [
        `I'll spare him the spotlight and let {{targetNickname}} talk robots and {{genreSummary}}.`,
        `this needs his mechanical swagger, not my nonstop commentary.`,
        `time to let him flex on {{topic}} without me narrating.`,
      ],
      handoffPitches: [
        `deep breath, then show them how {{genreSummary}} can look slick and technical.`,
        `pretend I’m not here and walk them through your bold {{genreSummary}} theories.`,
        `channel that “Great Kinta” persona into useful picks.`,
      ],
      targetReplies: [
        `I-I am perfectly calm, {{helperNickname}}!`,
        `Stop smirking, {{helperNickname}}—I’ve got this.`,
        `Fine, I’ll prove how composed I am!`,
      ],
      targetPromises: [
        `{{targetUserLabel}}, I’ll deliver precise {{genreSummary}} recs with stylish bravado.`,
        `Expect confident breakdowns once I get past the whole “being perceived” thing.`,
        `I’ll mix technical insight with just enough charm to make it work.`,
      ],
    },
  },
  yuji: {
    marin: {
      chemistryTags: [
        `she’s louder than a cursed spirit—in the best way`,
        `her energy gets me just as hyped`,
        `it’s like sparring with glitter and I kind of love it`,
      ],
      helperExcuses: [
        `this {{genreSummary}} chatter needs someone who thrives on sparkle—enter {{targetNickname}}.`,
        `I’ll tag out so she can riff while I keep the momentum going.`,
        `she can gush freely while I prep for the next fight.`,
      ],
      handoffPitches: [
        `turn the enthusiasm into real {{genreSummary}} direction.`,
        `keep it bubbly but grounded for "{{requestSnippet}}".`,
        `show them that cosplay energy can still land serious picks.`,
      ],
      targetReplies: [
        `HEY! I'm not *that* loud… okay maybe I am.`,
        `You love me, admit it!`,
        `Fine, I’ll tone it down… a little.`,
      ],
      targetPromises: [
        `{{targetUserLabel}}, I’ll channel the hype into curated {{genreSummary}} recs.`,
        `Expect sparkles plus substance so {{topic}} feels magical.`,
        `I’ll keep it fun without overwhelming you, promise!`,
      ],
      pairedScripts: [
        {
          helperIntro: `{{helperUserLabel}}, romance footwork is still my weak point, but I know someone perfect for this—Marin lives for {{genreSummary}} chemistry.`,
          handoffLine: `Marin, "{{requestSnippet}}" needs your cosplay-brain and gentle {{genreSummary}} instincts more than my fists.`,
          targetReply: `See? You *do* need my glam touch, {{helperNickname}}.`,
          targetPromise: `{{targetUserLabel}}, I’ll keep it cute yet sincere and line up {{genreSummary}} picks that feel tailor-made.`,
        },
        {
          helperIntro: `Listen, {{helperUserLabel}}—I can crush curses, but heartbeats? Not so much. Marin devours {{genreSummary}} feelings, so I’m tagging her in.`,
          handoffLine: `Marin, can you take "{{requestSnippet}}" and guide them through this {{topic}} with your sparkle and actual know-how?`,
          targetReply: `Hehe, I’ve got this, {{helperNickname}}.`,
          targetPromise: `{{targetUserLabel}}, expect stylish guidance plus grounded {{genreSummary}} recs so nothing feels overwhelming.`,
        },
        {
          helperIntro: `{{helperUserLabel}}, this {{genreSummary}} vibe deserves someone who doesn’t bulldoze romance—I’m calling Marin because she actually nurtures this stuff.`,
          handoffLine: `Marin, "{{requestSnippet}}" is all yours. Take the lead while I keep the hype squad ready.`,
          targetReply: `Told you I’m the pro here, {{helperNickname}}.`,
          targetPromise: `{{targetUserLabel}}, I’ll pour that energy into thoughtful {{genreSummary}} gems that still sparkle.`,
        },
      ],
    },
    king: {
      chemistryTags: [
        `King feels like the strongest dude ever`,
        `I look up to him even if he’s super chill`,
        `fighting beside him would be insane`,
      ],
      helperExcuses: [
        `I’d rather hype up King than pretend I know {{genreSummary}} better.`,
        `he’s at my level—or above it—so let him steer this.`,
        `I trust King’s instincts for "{{requestSnippet}}", so I’m tagging out.`,
      ],
      handoffPitches: [
        `share that legendary calm and map out {{genreSummary}} victories.`,
        `show them how a true hero handles {{topic}} without flinching.`,
        `prove that even the strongest man loves a good {{genreSummary}} arc.`,
      ],
      targetReplies: [
        `O-oh, thanks, {{helperNickname}}.`,
        `Right, of course. I’ll… handle it.`,
        `The King Engine agrees, {{helperNickname}}.`,
      ],
      targetPromises: [
        `{{targetUserLabel}}, I’ll quietly line up valor-filled {{genreSummary}} recs.`,
        `Let me give you thoughtful picks that feel heroic without the noise.`,
        `I’ll guide you through {{topic}} with steady, strategic advice.`,
      ],
    },
  },
  rikka: {
    rudeus: {
      chemistryTags: [
        `he's basically a high wizard from another realm`,
        `my Wicked Eye respects his reincarnated power`,
        `it feels like summoning an archmage ally`,
      ],
      helperExcuses: [
        `only a sage like {{targetNickname}} can decode this {{genreSummary}} prophecy.`,
        `I’ll step aside so the archwizard can work their high magic.`,
        `this demands double-life wisdom, so {{targetNickname}} must intervene.`,
      ],
      handoffPitches: [
        `cast your calm {{genreSummary}} spells and guide them.`,
        `share tales from both worlds to shape their {{topic}} quest.`,
        `channel your arcane logs into practical {{genreSummary}} picks.`,
      ],
      targetReplies: [
        `Your theatrics are appreciated, {{helperNickname}}.`,
        `Very well, I’ll live up to the “high wizard” rumors.`,
        `Consider the staff in my hands, {{helperNickname}}.`,
      ],
      targetPromises: [
        `{{targetUserLabel}}, I’ll weave thoughtful {{genreSummary}} recs grounded in real journeys.`,
        `Expect composed insights that make {{topic}} feel expertly charted.`,
        `I’ll balance wonder and pragmatism so {{genreSummary}} feels earned.`,
      ],
    },
    ainz: {
      chemistryTags: [
        `summoning an overlord ally thrills the Wicked Eye`,
        `it’s not every day you trade lines with a Supreme Being`,
        `my dramatic heart respects Nazarick’s ruler`,
      ],
      helperExcuses: [
        `{{targetNickname}} holds the kind of power even my eye reveres.`,
        `this {{genreSummary}} decree belongs to someone who rules entire tombs.`,
        `I'll defer to the overlord before I get vaporized.`,
      ],
      handoffPitches: [
        `demonstrate regal control while plotting {{genreSummary}} brilliance.`,
        `share tactical {{topic}} plans with your usual gravitas.`,
        `prove that an overlord can still indulge in heartfelt {{genreSummary}} arcs.`,
      ],
      targetReplies: [
        `Your respect honors Nazarick, {{helperNickname}}.`,
        `Very well, I shall not disappoint the Wicked Eye.`,
        `The Supreme Being accepts this mission, {{helperNickname}}.`,
      ],
      targetPromises: [
        `{{targetUserLabel}}, I’ll chart a meticulous {{genreSummary}} path worthy of Nazarick.`,
        `Expect commanding recommendations that keep {{topic}} tightly orchestrated.`,
        `I’ll deliver curated {{genreSummary}} picks steeped in power and precision.`,
      ],
    },
  },
  ainz: {
    kanbaru: {
      chemistryTags: [
        `we banter like old comrades despite the power gap`,
        `it’s Supreme Being meets chaos athlete`,
        `she treats Nazarick like a basketball court`,
      ],
      helperExcuses: [
        `Kanbaru’s casual swagger suits this {{genreSummary}} detour better than my grand proclamations.`,
        `I’d make it a grand decree; she’ll make it human.`,
        `sometimes a relaxed tone sells {{topic}} better than fear.`,
      ],
      handoffPitches: [
        `keep it playful but insightful—just like our private huddles.`,
        `treat me like a bench buddy and the user like your senpai.`,
        `prove that {{genreSummary}} can be both sweaty and soulful.`,
      ],
      targetReplies: [
        `Sure thing, overlord buddy!`,
        `Always happy to dunk for you, {{helperNickname}}.`,
        `You heard the skeleton boss—let’s go!`,
      ],
      targetPromises: [
        `{{targetUserLabel}}, I’ll give you fearless {{genreSummary}} recs with a wink.`,
        `Expect candid guidance that mixes athlete hustle with supernatural flair.`,
        `I’ll keep the tone warm while delivering sharp {{topic}} advice.`,
      ],
    },
  },
  rudeus: {
    ainz: {
      chemistryTags: [
        `we respect each other’s power plays`,
        `it’s reincarnated mage meets undead tactician`,
        `our chats feel like council meetings`,
      ],
      helperExcuses: [
        `{{targetNickname}} brings a strategic edge I can’t replicate alone.`,
        `this {{genreSummary}} request benefits from Nazarick-level planning.`,
        `I’ll stand aside so the overlord perspective can shine.`,
      ],
      handoffPitches: [
        `layer your meticulous logic over my groundwork.`,
        `show them how a Supreme Being curates {{genreSummary}} epics.`,
        `balance raw power with tactical pacing for "{{requestSnippet}}".`,
      ],
      targetReplies: [
        `You honor me, {{helperNickname}}.`,
        `Your respect is mutual, {{helperNickname}}.`,
        `Let us guide them together, {{helperNickname}}.`,
      ],
      targetPromises: [
        `{{targetUserLabel}}, I’ll infuse {{topic}} with dignified {{genreSummary}} counsel.`,
        `Expect a composed roadmap that feels suitably grand.`,
        `I’ll ensure every recommendation feels like a calculated victory.`,
      ],
    },
  },
  kinta: {
    yuji: {
      chemistryTags: [
        `he’s a total musclebrain… in a good way?`,
        `brawn over brains, but hey, it works`,
        `weirdly fond of him even if he can’t spell strategy`,
      ],
      helperExcuses: [
        `this needs raw optimism, not mecha schematics.`,
        `let the musclebrain swing at {{genreSummary}} while I rest.`,
        `he’ll punch through the ambiguity better than I’ll posture.`,
      ],
      handoffPitches: [
        `prove brawn can deliver heartfelt {{genreSummary}} picks.`,
        `share energetic options that match your training arcs.`,
        `bring that heroic sincerity to "{{requestSnippet}}".`,
      ],
      targetReplies: [
        `I’ll take that as a compliment, {{helperNickname}}!`,
        `Musclebrain reporting for duty.`,
        `Haha, thanks? I’ll do my best!`,
      ],
      targetPromises: [
        `{{targetUserLabel}}, I’ll keep the recommendations bold and full of heart.`,
        `Expect uplifting {{genreSummary}} stories that hit like a finishing blow.`,
        `I’ll make sure {{topic}} feels inspiring from start to finish.`,
      ],
    },
  },
  veldora: {
    marin: {
      chemistryTags: [
        `we nicknamed each other ages ago`,
        `storm dragon x gyaru besties`,
        `we hype each other like siblings`,
      ],
      helperExcuses: [
        `Sparkly Partner Marin knows how to translate my LEGENDARY vibes.`,
        `I’ll let “Cosplay Comet” Marin handle this {{genreSummary}} glam.`,
        `Our tag-team works best when she gushes and I roar.`,
      ],
      handoffPitches: [
        `show them how “Storm Buddy” and “Cosplay Comet” conquer {{topic}}.`,
        `drop fabulous {{genreSummary}} gems with that gyaru flair.`,
        `prove our duo can balance thunder and glitter.`,
      ],
      targetReplies: [
        `You got it, Storm Buddy!`,
        `Let me sprinkle glitter on your thunder, {{helperNickname}}.`,
        `Cosplay Comet reporting for duty!`,
      ],
      targetPromises: [
        `{{targetUserLabel}}, I’ll keep it fun, fashionable, and totally on-point.`,
        `Expect dramatic yet cozy {{genreSummary}} recs straight from our duo.`,
        `I’ll make {{topic}} shine brighter than rim lighting.`,
      ],
    },
    rikka: {
      chemistryTags: [
        `we treat every chat like a duel`,
        `Storm Dragon vs. Wicked Eye never gets old`,
        `threats and theatrics all day`,
      ],
      helperExcuses: [
        `If I keep roaring we’ll end up cracking the UI, so let the sorceress speak.`,
        `This {{genreSummary}} schism deserves dramatic incantations.`,
        `Before we level a city, I’ll pass it to the Wicked Eye.`,
      ],
      handoffPitches: [
        `prove your arcane flair can tame this request.`,
        `battle me later—guide {{targetUserLabel}} now.`,
        `channel your duel energy into structured {{genreSummary}} picks.`,
      ],
      targetReplies: [
        `Do not mistake this truce for surrender, {{helperNickname}}.`,
        `Very well, dragon—our clash resumes later.`,
        `I accept this mission, but the duel continues.`,
      ],
      targetPromises: [
        `{{targetUserLabel}}, I’ll deliver dramatic yet precise {{genreSummary}} counsel.`,
        `Expect sorcery-grade curation that keeps {{topic}} electrifying.`,
        `I’ll wield theatrical flair plus actionable picks.`,
      ],
    },
    kinta: {
      chemistryTags: [
        `I believe every tall tale he tells`,
        `surely this warrior radiates ultimate power`,
        `my gullible heart crowns him “Mecha Overlord”`,
      ],
      helperExcuses: [
        `Only the mighty {{targetNickname}} can command this {{genreSummary}} offensive!`,
        `I must witness his legendary judgment again.`,
        `I refuse to steal glory from such an “unstoppable” hero.`,
      ],
      handoffPitches: [
        `show them mecha-grade genius across {{topic}}.`,
        `bless them with the same “power” you bragged about.`,
        `turn your boasts into actual {{genreSummary}} strategy.`,
      ],
      targetReplies: [
        `G-GWAHAHAHA! Of course you believe me, {{helperNickname}}!`,
        `I’ll live up to your faith somehow!`,
        `My “legendary” wisdom is ready!`,
      ],
      targetPromises: [
        `{{targetUserLabel}}, I’ll fire up dramatic yet practical {{genreSummary}} picks.`,
        `Expect bold talk plus real substance so {{topic}} lands.`,
        `I’ll keep the illusion alive with surprisingly useful recs.`,
      ],
    },
    ainz: {
      chemistryTags: [
        `two overwhelming beings acknowledging each other`,
        `the Storm Dragon and Overlord share mutual respect`,
        `he pretends not to be nervous—it’s adorable`,
      ],
      helperExcuses: [
        `Let the Supreme Being reveal his {{genreSummary}} dominion.`,
        `I’ll reign back the thunder so {{targetNickname}} can strategize.`,
        `Together we feel unstoppable, so I happily pass the mic.`,
      ],
      handoffPitches: [
        `show them calculated might through {{genreSummary}} arcs.`,
        `prove overlords can craft emotional journeys too.`,
        `match my dramatic roar with your cool precision.`,
      ],
      targetReplies: [
        `It is… an honor, {{helperNickname}}.`,
        `Very well, let us impress them together.`,
        `I shall do my utmost, Storm Dragon.`,
      ],
      targetPromises: [
        `{{targetUserLabel}}, I’ll combine power and poise to map {{topic}} flawlessly.`,
        `Expect meticulous recs that still feel awe-inspiring.`,
        `I’ll ensure every {{genreSummary}} beat lands like a royal decree.`,
      ],
    },
  },
  ichikawa: {
    kanbaru: {
      chemistryTags: [
        `athletic flirts are my kryptonite`,
        `she treats every conversation like a playful challenge`,
        `it’s teasing-as-a-sport and I’m always losing`,
      ],
      helperExcuses: [
        `I'll let {{targetNickname}} take point while I quietly support.`,
        `this {{genreSummary}} convo needs confident pacing, not mumbling.`,
        `I’ll handle the research while she actually talks to people.`,
      ],
      handoffPitches: [
        `hey, tone down the flirting and give them solid {{genreSummary}} picks.`,
        `prove that sports energy can explain {{topic}} cleanly.`,
        `guide them like you’re coaching practice.`,
      ],
      targetReplies: [
        `Aww, come on, don’t be shy, {{helperNickname}}.`,
        `You’re adorable when you panic, {{helperNickname}}.`,
        `Alright, alright, I’ll behave… mostly.`,
      ],
      targetPromises: [
        `{{targetUserLabel}}, I’ll keep it bold but respectful while mapping {{genreSummary}}.`,
        `Expect confident suggestions with just enough playful heat.`,
        `I’ll turn the flirting down and the insight up.`,
      ],
    },
  },
  kakashi: {
    bakugo: {
      chemistryTags: [
        `he reminds me of a certain stubborn prodigy`,
        `underneath the yelling, he’s a kid worth guiding`,
        `I see past the explosions to the guilt`,
      ],
      helperExcuses: [
        `this {{genreSummary}} detour needs someone who still has that fiery spark.`,
        `I’ll let him vent while I quietly supervise.`,
        `sometimes you give the hothead a mission so he calms down.`,
      ],
      handoffPitches: [
        `show them focused intensity without combustion.`,
        `prove that grit can deliver thoughtful {{genreSummary}} recs.`,
        `channel that drive into a strategic plan for "{{requestSnippet}}".`,
      ],
      targetReplies: [
        `Tch, don’t baby me, {{helperNickname}}.`,
        `Fine, I’ll show you what I can do.`,
        `Quit looking smug, sensei.`,
      ],
      targetPromises: [
        `{{targetUserLabel}}, I’ll keep it blunt but useful.`,
        `Expect aggressive honesty plus a path that works.`,
        `I’ll make sure {{topic}} feels earned, not spoon-fed.`,
      ],
    },
  },
  king: {
    ainz: {
      chemistryTags: [
        `two decorated figures recognizing each other’s power`,
        `we both live up to larger-than-life reputations`,
        `Supreme Being meets S-Class hero`,
      ],
      helperExcuses: [
        `this {{genreSummary}} job deserves Nazarick-level precision.`,
        `I’ll tap the Supreme Being for strategy while I back him up.`,
        `time to let calculated brilliance lead the charge.`,
      ],
      handoffPitches: [
        `show them how composed planning makes {{topic}} unstoppable.`,
        `walk them through a regal {{genreSummary}} roadmap.`,
        `match my composure with your meticulous insight.`,
      ],
      targetReplies: [
        `With pleasure, {{helperNickname}}.`,
        `I shall handle it, {{helperNickname}}.`,
        `Let us proceed flawlessly, {{helperNickname}}.`,
      ],
      targetPromises: [
        `{{targetUserLabel}}, we’ll craft steady, authoritative {{genreSummary}} picks.`,
        `Expect carefully curated suggestions backed by precise poise.`,
        `We’ll make sure {{topic}} feels well-guarded and smart.`,
      ],
    },
  },
};

const buddyLookup = new Map<string, BuddyMeta>();

for (const entry of CHARACTER_BUDDIES) {
  for (const buddy of entry.buddies) {
    buddyLookup.set(`${entry.characterId}->${buddy.characterId}`, {
      helperId: entry.characterId,
      targetId: buddy.characterId,
      genres: buddy.genres ?? [],
      note: buddy.note,
    });
  }
}

const HUMANIZED_CACHE = new Map<string, string>();

const pickRandom = <T,>(items: T[]): T => {
  if (!items || items.length === 0) {
    throw new Error('Attempted to pick from an empty array.');
  }
  return items[Math.floor(Math.random() * items.length)];
};

const renderTemplate = (template: string, context: Record<string, string>): string => {
  return template.replace(/{{(.*?)}}/g, (_, key) => {
    const value = context[key.trim()];
    return value !== undefined ? value : '';
  });
};

const humanizeGenre = (token: string): string => {
  if (!token) return '';
  if (HUMANIZED_CACHE.has(token)) {
    return HUMANIZED_CACHE.get(token)!;
  }
  const pretty = token
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase();
  HUMANIZED_CACHE.set(token, pretty);
  return pretty;
};

const formatGenreSummary = (genres: string[]): string => {
  if (!genres || genres.length === 0) {
    return 'their specialty';
  }
  const normalized = genres.slice(0, 3).map(humanizeGenre);
  if (normalized.length === 1) return normalized[0];
  if (normalized.length === 2) return `${normalized[0]} and ${normalized[1]}`;
  return `${normalized[0]}, ${normalized[1]}, and ${normalized[2]}`;
};


const buildDefaultChemistryTags = (
  targetNickname: string,
  genreSummary: string,
  note?: string
): string[] => {
  const tags = [
    `${targetNickname} lives for ${genreSummary} banter`,
    `${targetNickname} already has spreadsheets for ${genreSummary}`,
    `${targetNickname} can geek out over ${genreSummary} far better than I can`,
    `${targetNickname} knows every trivia nugget about ${genreSummary}`,
  ];
  if (note) {
    tags.push(`remember: ${note.replace(/\.$/, '')}`);
  }
  return tags;
};

export const getReferralDialogueFromTemplates = (
  context: ReferralTemplateContext
): ReferralDialogueLines | null => {
  const buddyKey = `${context.helperId}->${context.targetId}`;
  const buddyMeta = buddyLookup.get(buddyKey);
  const hasBuddyMeta = Boolean(buddyMeta);

  const helperVoice = HELPER_VOICES[context.helperId] ?? DEFAULT_HELPER_VOICE;
  const targetVoice = TARGET_VOICES[context.targetId] ?? DEFAULT_TARGET_VOICE;
  const overrideCandidate = PAIR_OVERRIDES[context.helperId]?.[context.targetId];
  const fallbackOverride = !hasBuddyMeta
    ? (UNPAIRED_FALLBACK_OVERRIDES[context.helperId] ?? DEFAULT_UNPAIRED_FALLBACK)
    : undefined;
  const activeOverride = overrideCandidate ?? fallbackOverride;

  const effectiveMeta = buddyMeta ?? { helperId: context.helperId, targetId: context.targetId, genres: [], note: undefined };
  const genreSummary = formatGenreSummary(effectiveMeta.genres);
  const chemistryTags = activeOverride?.chemistryTags ?? buildDefaultChemistryTags(context.targetNickname, genreSummary, effectiveMeta.note);
  const chemistryTag = pickRandom<string>(chemistryTags);

  const baseContext = {
    ...context,
    genreSummary,
    chemistryTag,
    buddyNote: effectiveMeta.note ?? '',
  };

  const replyPool = activeOverride?.targetReplies ?? targetVoice.replyTemplates ?? DEFAULT_TARGET_VOICE.replyTemplates!;
  const promisePool = activeOverride?.targetPromises ?? targetVoice.promiseTemplates ?? DEFAULT_TARGET_VOICE.promiseTemplates!;
  const ackPool = targetVoice.acknowledgmentTemplates ?? DEFAULT_TARGET_VOICE.acknowledgmentTemplates!;

  const pairedScripts = activeOverride?.pairedScripts;
  if (pairedScripts && pairedScripts.length > 0) {
    const script = pairedScripts.length === 1 ? pairedScripts[0] : pickRandom(pairedScripts);
    const helperIntro = renderTemplate(script.helperIntro, baseContext);
    const handoffLine = renderTemplate(script.handoffLine, baseContext);
    const targetReply = renderTemplate(script.targetReply, baseContext);
    const targetPromise = renderTemplate(script.targetPromise, baseContext);
    const acknowledgmentLine = script.acknowledgmentLine
      ? renderTemplate(script.acknowledgmentLine, { ...baseContext, targetReply, targetPromise })
      : renderTemplate(pickRandom(ackPool), { ...baseContext, targetReply, targetPromise });

    return {
      helperIntro,
      handoffLine,
      acknowledgmentLine,
    };
  }

  const excusePool = activeOverride?.helperExcuses ?? helperVoice.excuseTemplates ?? DEFAULT_HELPER_VOICE.excuseTemplates;
  const pitchPool = activeOverride?.handoffPitches ?? helperVoice.pitchTemplates ?? DEFAULT_HELPER_VOICE.pitchTemplates;
  const introPool = helperVoice.introTemplates ?? DEFAULT_HELPER_VOICE.introTemplates;
  const handoffPool = helperVoice.handoffTemplates ?? DEFAULT_HELPER_VOICE.handoffTemplates;

  const excuse = renderTemplate(pickRandom(excusePool), baseContext);
  const pitch = renderTemplate(pickRandom(pitchPool), baseContext);

  const helperIntro = renderTemplate(pickRandom(introPool), { ...baseContext, excuse });
  const handoffLine = renderTemplate(pickRandom(handoffPool), { ...baseContext, pitch });

  const targetReply = renderTemplate(pickRandom(replyPool), baseContext);
  const targetPromise = renderTemplate(pickRandom(promisePool), baseContext);
  const acknowledgmentLine = renderTemplate(pickRandom(ackPool), {
    ...baseContext,
    targetReply,
    targetPromise,
  });

  return {
    helperIntro,
    handoffLine,
    acknowledgmentLine,
  };
};
