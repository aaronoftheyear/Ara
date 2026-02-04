export type WeaknessTemplateSet = {
  paired: string[];
  unpaired: string[];
};

type WeaknessPersonaContext = {
  helperId: string;
  helperName?: string;
  genre: string;
  buddyId?: string;
  buddyNickname?: string;
  hasChemistry?: boolean;
  helperUserLabel?: string;
  helperUserPronoun?: string;
};

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

const HUMANIZED_CACHE = new Map<string, string>();
const humanizeGenre = (token?: string) => {
  if (!token) return 'that vibe';
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

const normalizeKey = (value: string) => value.toLowerCase().replace(/[\s-]+/g, '_');

const DEFAULT_TEMPLATE: WeaknessTemplateSet = {
  paired: [
    `{{helperUserLabel}}, {{buddyNickname}} eats {{genreSummary}} for breakfast, so I'm tagging them in while I stand guard.`,
    `I'll stay loud in the back while {{buddyNickname}} guides this {{genreSummary}} talk properly.`,
    `You deserve the real pro—{{buddyNickname}} lives for {{genreSummary}}, so I'll let them shine.`,
  ],
  unpaired: [
    `{{helperUserLabel}}, this isn’t my specialty, so {{buddyNickname}} is jumping in with proper {{genreSummary}} know-how.`,
    `You’ll get sharper {{genreSummary}} insight from {{buddyNickname}}—I’ll back them up from the sidelines.`,
    `Consider {{buddyNickname}} your guide for this {{genreSummary}} vibe while I keep the energy up.`,
  ],
};

const createTemplateSet = (paired: string[], unpaired: string[]): WeaknessTemplateSet => ({
  paired,
  unpaired,
});

const mapBuddyTemplates = (
  genres: string[],
  buddyId: string,
  template: WeaknessTemplateSet
): [string, WeaknessTemplateSet][] => {
  return genres.map(genre => [`${normalizeKey(genre)}__${buddyId}`, template]);
};

const buildHelperTemplateMap = (entries: [string, WeaknessTemplateSet][]): Record<string, WeaknessTemplateSet> => {
  return entries.reduce<Record<string, WeaknessTemplateSet>>((acc, [key, template]) => {
    acc[key] = template;
    return acc;
  }, {});
};

const YUJI_ROMANCE_WITH_MARIN = createTemplateSet(
  [
    `{{helperUserLabel}}, I exorcise curses, not meet-cutes—{{buddyNickname}} actually gets romance pacing, so they’re in charge.`,
    `I’ll keep the adrenaline up while {{buddyNickname}} maps those swoony beats before I bulldoze the vibe.`,
    `{{buddyNickname}} thrives on heart-eye storytelling, so I’m tagging them in before I say something reckless.`,
  ],
  [
    `{{helperUserLabel}}, romance strategy isn’t my lane, so {{buddyNickname}} is steering while I spot.`,
    `You’ll get real heart-talk from {{buddyNickname}}; I’ll just hype from the sidelines.`,
    `Consider {{buddyNickname}} your romance captain while I guard the door.`,
  ]
);

const YUJI_ECCHI_WITH_MARIN = createTemplateSet(
  [
    `{{helperUserLabel}}, ecchi nuance needs {{buddyNickname}}’s sparkle filter, not my blunt commentary.`,
    `I’ll stay in the gym while {{buddyNickname}} breaks down the saucy beats without me getting flustered.`,
    `{{buddyNickname}} can gush about stylish fanservice better than my feral commentary ever could.`,
  ],
  [
    `{{helperUserLabel}}, spicy {{genreSummary}} chatter isn’t my specialty, so {{buddyNickname}} is taking the mic.`,
    `Trust {{buddyNickname}} to explain the angles; I’ll just keep lookout.`,
    `I’d only make the {{genreSummary}} talk awkward, so {{buddyNickname}} is handling it cleanly.`,
  ]
);

const YUJI_HAREM_WITH_MARIN = createTemplateSet(
  [
    `{{helperUserLabel}}, juggling multiple crush arcs makes my head spin—{{buddyNickname}} actually tracks that drama.`,
    `I’ll hang back while {{buddyNickname}} choreographs the whole harem situation with glam precision.`,
    `{{buddyNickname}} treats harem chaos like a runway show, so I’m letting them narrate.`,
  ],
  [
    `{{helperUserLabel}}, multi-love strategy is beyond me, so {{buddyNickname}} is leading.`,
    `Let {{buddyNickname}} break down the harem tropes while I stay supportive.`,
    `{{buddyNickname}} understands stacked crush plots—listen to them while I cover the exits.`,
  ]
);

const YUJI_FANSERVICE_WITH_MARIN = createTemplateSet(
  [
    `{{helperUserLabel}}, fanservice sparkle is {{buddyNickname}}’s playground, not mine.`,
    `I’ll keep the energy up while {{buddyNickname}} dissects every wink and pose.`,
    `{{buddyNickname}} can translate flashy fanservice beats before I start rambling about fights.`,
  ],
  [
    `{{helperUserLabel}}, flashy {{genreSummary}} flair isn’t my thing, so {{buddyNickname}} will guide you.`,
    `You’ll get better commentary on {{genreSummary}} from {{buddyNickname}}; I’ll stay on perimeter duty.`,
    `Consider {{buddyNickname}} the stylist for this {{genreSummary}} chat while I keep watch.`,
  ]
);

const YUJI_EROGE_WITH_MARIN = createTemplateSet(
  [
    `{{helperUserLabel}}, eroge nuance is something {{buddyNickname}} actually studies, so I’m tagging out.`,
    `I’ll spare you my awkward commentary and let {{buddyNickname}} handle the mature vibes.`,
    `{{buddyNickname}} knows how to talk eroge routes without acting twelve, so they’re on duty.`,
  ],
  [
    `{{helperUserLabel}}, I’m not the one to unpack {{genreSummary}}, so {{buddyNickname}} is stepping up.`,
    `You’ll get thoughtful {{genreSummary}} guidance from {{buddyNickname}} while I keep quiet.`,
    `Let {{buddyNickname}} walk you through those {{genreSummary}} routes; I’ll just nod along.`,
  ]
);

const YUJI_ADULT_WITH_MARIN = createTemplateSet(
  [
    `{{helperUserLabel}}, adult-game talk is a little above my comfort zone—{{buddyNickname}} actually catalogues them.`,
    `I’ll keep training while {{buddyNickname}} breaks down those branching choices without embarrassment.`,
    `{{buddyNickname}} can balance maturity and hype for {{genreSummary}}, so I’m letting them speak.`,
  ],
  [
    `{{helperUserLabel}}, detailed {{genreSummary}} chatter isn’t my arena, so {{buddyNickname}} is covering.`,
    `You’ll get better insight on {{genreSummary}} from {{buddyNickname}} while I guard the door.`,
    `Consider {{buddyNickname}} your pro for {{genreSummary}} decisions—I’ll just backup.`,
  ]
);

const YUJI_MAGICAL_GIRL_WITH_MARIN = createTemplateSet(
  [
    `{{helperUserLabel}}, transformation sequences leave me speechless—{{buddyNickname}} narrates them like gospel.`,
    `I’ll keep swinging imaginary wands while {{buddyNickname}} explains magical girl power properly.`,
    `{{buddyNickname}} can gush about sparkle staffs without me derailing it, so they’re leading.`,
  ],
  [
    `{{helperUserLabel}}, glittery {{genreSummary}} runs aren’t my specialty, so {{buddyNickname}} is handling the pep.`,
    `You’ll get better magical girl context from {{buddyNickname}}; I’ll just cheer.`,
    `Let {{buddyNickname}} be your {{genreSummary}} guide while I keep spirits high.`,
  ]
);

const YUJI_SHOJO_WITH_MARIN = createTemplateSet(
  [
    `{{helperUserLabel}}, shojo feelings take finesse—{{buddyNickname}} actually loves decoding them.`,
    `I’ll keep the stamina up while {{buddyNickname}} dissects the delicate shojo beats.`,
    `{{buddyNickname}} treats shojo drama like couture, so I’m letting them strut it out.`,
  ],
  [
    `{{helperUserLabel}}, shojo nuance isn’t my thing, so {{buddyNickname}} is stepping up.`,
    `You’ll get better shojo intel from {{buddyNickname}} while I stay supportive.`,
    `Consider {{buddyNickname}} your shojo stylist; I’ll guard the perimeter.`,
  ]
);

const YUJI_JOSEI_WITH_MARIN = createTemplateSet(
  [
    `{{helperUserLabel}}, josei realism needs {{buddyNickname}}’s finesse, not my blunt fists.`,
    `I’ll stay respectful while {{buddyNickname}} explains the grounded josei angles.`,
    `{{buddyNickname}} can guide you through mature josei stories without me crashing the tone.`,
  ],
  [
    `{{helperUserLabel}}, josei pacing isn’t my wheelhouse, so {{buddyNickname}} is steering.`,
    `You’ll get better josei advice from {{buddyNickname}}; I’ll just nod.`,
    `Let {{buddyNickname}} handle the nuanced josei talk while I keep momentum ready.`,
  ]
);

const YUJI_SLICE_WITH_MARIN = createTemplateSet(
  [
    `{{helperUserLabel}}, calm slice-of-life chats need {{buddyNickname}}’s sparkle-over-simmer energy, not my battle stance.`,
    `I’ll keep the warmth up while {{buddyNickname}} walks you through the cozy pacing.`,
    `{{buddyNickname}} romanticizes everyday life way better than I do, so I’m tagging them in.`,
  ],
  [
    `{{helperUserLabel}}, soft {{genreSummary}} beats aren’t my strength, so {{buddyNickname}} is handling them.`,
    `You’ll get better everyday-story advice from {{buddyNickname}} while I keep the hype steady.`,
    `Let {{buddyNickname}} narrate the quiet vibes; I’ll just keep morale high.`,
  ]
);

const YUJI_SLICE_WITH_SHINPACHI = createTemplateSet(
  [
    `{{helperUserLabel}}, mellow {{genreSummary}} talk isn’t my thing, so {{buddyNickname}} is stepping in with calm guidance.`,
    `I’m built for curses, not cozy pacing—{{buddyNickname}} has you for this {{genreSummary}} detour.`,
    `This {{genreSummary}} groove is better handled by {{buddyNickname}} while I keep watch.`,
  ],
  [
    `{{helperUserLabel}}, mellow {{genreSummary}} talk isn’t my thing, so {{buddyNickname}} is stepping in with calm guidance.`,
    `I’m built for curses, not cozy pacing—{{buddyNickname}} has you for this {{genreSummary}} detour.`,
    `This {{genreSummary}} groove is better handled by {{buddyNickname}} while I keep watch.`,
  ]
);

const YUJI_IDOL_WITH_SHINPACHI = createTemplateSet(
  [
    `{{helperUserLabel}}, idol lore goes right over my head, but {{buddyNickname}} tracks every handshake event.`,
    `I’d just yell “sing louder,” so {{buddyNickname}} is taking over the idol insights.`,
    `{{buddyNickname}} actually studies idol groups—let them handle this while I stay hyped.`,
  ],
  [
    `{{helperUserLabel}}, idol lore goes right over my head, but {{buddyNickname}} tracks every handshake event.`,
    `I’d just yell “sing louder,” so {{buddyNickname}} is taking over the idol insights.`,
    `{{buddyNickname}} actually studies idol groups—let them handle this while I stay hyped.`,
  ]
);

const YUJI_MUSIC_WITH_SHINPACHI = createTemplateSet(
  [
    `{{helperUserLabel}}, music breakdowns need {{buddyNickname}}’s ear, not my battle tempo.`,
    `I’ll keep the rhythm in my head while {{buddyNickname}} explains the music scene properly.`,
    `{{buddyNickname}} can talk arrangements and setlists while I just fist-pump, so they’re leading.`,
  ],
  [
    `{{helperUserLabel}}, music breakdowns need {{buddyNickname}}’s ear, not my battle tempo.`,
    `I’ll keep the rhythm in my head while {{buddyNickname}} explains the music scene properly.`,
    `{{buddyNickname}} can talk arrangements and setlists while I just fist-pump, so they’re leading.`,
  ]
);

const YUJI_ISEKAI_WITH_ISHIGAMI = createTemplateSet(
  [
    `{{helperUserLabel}}, isekai lore charts melt my brain—{{buddyNickname}} keeps spreadsheets on them.`,
    `I’d just say “punch the demon king,” so {{buddyNickname}} is taking the smart route.`,
    `{{buddyNickname}} actually studies reincarnation mechanics, so let them talk while I recharge.`,
  ],
  [
    `{{helperUserLabel}}, isekai lore charts melt my brain—{{buddyNickname}} keeps spreadsheets on them.`,
    `I’d just say “punch the demon king,” so {{buddyNickname}} is taking the smart route.`,
    `{{buddyNickname}} actually studies reincarnation mechanics, so let them talk while I recharge.`,
  ]
);

const YUJI_GAMING_WITH_ISHIGAMI = createTemplateSet(
  [
    `{{helperUserLabel}}, deep gaming meta isn’t my specialty, but {{buddyNickname}} breathes patch notes.`,
    `I’ll stop button mashing so {{buddyNickname}} can explain the systems without me shouting.`,
    `{{buddyNickname}} can translate the min-max talk—listen to them while I stay hyped.`,
  ],
  [
    `{{helperUserLabel}}, deep gaming meta isn’t my specialty, but {{buddyNickname}} breathes patch notes.`,
    `I’ll stop button mashing so {{buddyNickname}} can explain the systems without me shouting.`,
    `{{buddyNickname}} can translate the min-max talk—listen to them while I stay hyped.`,
  ]
);

const YUJI_MECHA_WITH_KINTA = createTemplateSet(
  [
    `{{helperUserLabel}}, giant robot specs confuse me—{{buddyNickname}} practically lives in a cockpit.`,
    `I’d just yell “bigger weapons,” so {{buddyNickname}} is explaining the mecha science.`,
    `{{buddyNickname}} can geek out over hydraulics and hype you properly, so I’m letting them speak.`,
  ],
  [
    `{{helperUserLabel}}, giant robot specs confuse me—{{buddyNickname}} practically lives in a cockpit.`,
    `I’d just yell “bigger weapons,” so {{buddyNickname}} is explaining the mecha science.`,
    `{{buddyNickname}} can geek out over hydraulics and hype you properly, so I’m letting them speak.`,
  ]
);

// Marin Kitagawa
const MARIN_SUPERNATURAL_WITH_RIKKA = createTemplateSet(
  [
    `{{helperUserLabel}}, spooky glam is Rikka’s whole brand—she can monologue about {{genreSummary}} lore without me squealing.`,
    `I’ll keep sewing cursed accessories while {{buddyNickname}} paints the ethereal mood board properly.`,
    `{{buddyNickname}} lives in that dreamy {{genreSummary}} space, so I’m letting her narrate while I fangirl quietly.`,
  ],
  [
    `{{helperUserLabel}}, I’m better at modeling the outfits than decoding {{genreSummary}} spirits, so {{buddyNickname}} is stepping in.`,
    `You’ll get richer {{genreSummary}} storytelling from {{buddyNickname}} while I just twirl in the background.`,
    `Let {{buddyNickname}} guide the {{genreSummary}} vibes; I’ll keep the lighting sparkly.`,
  ]
);

const MARIN_HORROR_WITH_ICHIKAWA = createTemplateSet(
  [
    `{{helperUserLabel}}, horror screams wreck my eyeliner—{{buddyNickname}} actually dissects {{genreSummary}} tension with a straight face.`,
    `I’ll cling to a plushie while {{buddyNickname}} calmly walks you through the dready beats.`,
    `{{buddyNickname}} collects creepy atmosphere like merch, so I’m tagging them in before I shriek.`,
  ],
  [
    `{{helperUserLabel}}, {{genreSummary}} psychology is above my fear tolerance, so {{buddyNickname}} is taking the mic.`,
    `You’ll get steady, clinical {{genreSummary}} insight from {{buddyNickname}} while I hide behind the curtain.`,
    `Let {{buddyNickname}} be your spooky docent—I’ll just keep the lights on.`,
  ]
);

const MARIN_VR_WITH_ISHIGAMI = createTemplateSet(
  [
    `{{helperUserLabel}}, deep-dive isekai systems melt my brain—{{buddyNickname}} spreadsheets them for fun.`,
    `I’ll keep cheering from the cosplay pit while {{buddyNickname}} covers every weird mechanic those {{genreSummary}} worlds throw at you.`,
    `{{buddyNickname}} can talk controller layouts and reincarnation math without losing the mood, so I’m letting him guide.`,
  ],
  [
    `{{helperUserLabel}}, crunchy {{genreSummary}} logic is better handled by {{buddyNickname}} while I focus on posing.`,
    `You’ll get sharper patch-note intel from {{buddyNickname}}; I’d just gush about outfits.`,
    `Let {{buddyNickname}} map those {{genreSummary}} layers—I’ll be on standby with snacks.`,
  ]
);

const MARIN_MECHA_WITH_KINTA = createTemplateSet(
  [
    `{{helperUserLabel}}, cockpit engineering isn’t my craft—{{buddyNickname}} actually worships torque charts.`,
    `I’ll keep bedazzling armor panels while {{buddyNickname}} explains the {{genreSummary}} firepower specifics.`,
    `{{buddyNickname}} can hype giant robots without me comparing them to couture, so I’m letting him talk.`,
  ],
  [
    `{{helperUserLabel}}, serious {{genreSummary}} talk needs {{buddyNickname}}’s pilot brain, not my sparkle metaphors.`,
    `You’ll get way better mech briefings from {{buddyNickname}}; I’m just here for the decals.`,
    `Let {{buddyNickname}} walk you through the chassis stats while I cheer.`,
  ]
);

const MARIN_SPORTS_WITH_KANBARU = createTemplateSet(
  [
    `{{helperUserLabel}}, I can sew jerseys but {{buddyNickname}} actually breathes training arcs, so she’s calling the play.`,
    `I’ll sit courtside taking photos while {{buddyNickname}} narrates every {{genreSummary}} rivalry beat.`,
    `{{buddyNickname}} lives for sweat and hustle drama—I’d just gush about uniforms.`,
  ],
  [
    `{{helperUserLabel}}, serious {{genreSummary}} strategy is Kanbaru’s lane, so I’m sliding her the mic.`,
    `You’ll get real athlete insight from {{buddyNickname}} while I stay the loud fan.`,
    `Let {{buddyNickname}} break down the {{genreSummary}} grind; I’ll handle the pep squad.`,
  ]
);

const MARIN_MINDGAMES_WITH_KING = createTemplateSet(
  [
    `{{helperUserLabel}}, hardcore gaming mindgames hit my limit—{{buddyNickname}} can theory-craft {{genreSummary}} strats without overheating.`,
    `I’ll just vibe with the soundtrack while {{buddyNickname}} unpacks the psychological layers.`,
    `{{buddyNickname}} min-maxes even idle menus, so I’m letting him tutor this {{genreSummary}} deep dive.`,
  ],
  [
    `{{helperUserLabel}}, detailed {{genreSummary}} breakdowns belong to {{buddyNickname}}; I’d just button mash.`,
    `You’ll get cleaner meta talk from {{buddyNickname}} while I keep morale cute.`,
    `Let {{buddyNickname}} guide the {{genreSummary}} tactics—I’ll be over here painting keycaps.`,
  ]
);

const MARIN_SHONEN_WITH_YUJI = createTemplateSet(
  [
    `{{helperUserLabel}}, pure shonen adrenaline is literally Yuji’s heartbeat, so I’m sending him in.`,
    `I’ll keep cheering from the crowd while {{buddyNickname}} maps every power-up properly.`,
    `{{buddyNickname}} lives for punchy {{genreSummary}} arcs; I’d just say “wow buff,” so he’s leading.`,
  ],
  [
    `{{helperUserLabel}}, high-octane {{genreSummary}} hype is better handled by {{buddyNickname}} while I rest my voice.`,
    `You’ll get sharper battle insight from {{buddyNickname}}; I’d just gush about capes.`,
    `Let {{buddyNickname}} narrate the explosions while I keep the playlist ready.`,
  ]
);

const MARIN_COMEDY_WITH_SHINPACHI = createTemplateSet(
  [
    `{{helperUserLabel}}, parody radar is {{buddyNickname}}’s whole existence—he quotes {{genreSummary}} skits faster than I can pose.`,
    `I’ll keep laughing off-screen while {{buddyNickname}} details every punchline.`,
    `{{buddyNickname}} knows every {{genreSummary}} deep cut, so I’m tagging him before I start giggling.`,
  ],
  [
    `{{helperUserLabel}}, layered {{genreSummary}} humor belongs to {{buddyNickname}}; I’d just say “lol same.”`,
    `You’ll get better parody context from {{buddyNickname}} while I reapply lipstick.`,
    `Let {{buddyNickname}} spin the jokes; I’ll just keep the vibe bright.`,
  ]
);

const MARIN_WEAKNESS_TEMPLATES = buildHelperTemplateMap([
  ...mapBuddyTemplates(['supernatural', 'fantasy'], 'rikka', MARIN_SUPERNATURAL_WITH_RIKKA),
  ...mapBuddyTemplates(['horror', 'psychological'], 'ichikawa', MARIN_HORROR_WITH_ICHIKAWA),
  ...mapBuddyTemplates(['isekai', 'gaming', 'virtualReality', 'seinen'], 'ishigami', MARIN_VR_WITH_ISHIGAMI),
  ...mapBuddyTemplates(['mecha', 'military'], 'kinta', MARIN_MECHA_WITH_KINTA),
  ...mapBuddyTemplates(['sports'], 'kanbaru', MARIN_SPORTS_WITH_KANBARU),
  ...mapBuddyTemplates(['gaming', 'psychological'], 'king', MARIN_MINDGAMES_WITH_KING),
  ...mapBuddyTemplates(['action', 'shonen'], 'yuji', MARIN_SHONEN_WITH_YUJI),
  ...mapBuddyTemplates(['comedy', 'parody'], 'shinpachi', MARIN_COMEDY_WITH_SHINPACHI),
]);

// Shinpachi Shimura
const SHINPACHI_MECHA_WITH_KINTA = createTemplateSet(
  [
    `{{helperUserLabel}}, I can polish glasses but not cockpit schematics—{{buddyNickname}} actually speaks {{genreSummary}}.`,
    `I’ll keep the snark coming while {{buddyNickname}} explains why hydraulics matter.`,
    `{{buddyNickname}} dreams in circuit diagrams, so I’m letting him brief the mech squad.`,
  ],
  [
    `{{helperUserLabel}}, serious {{genreSummary}} stats should come from {{buddyNickname}}; I’d just shout “beam sword!”`,
    `You’ll get a clearer breakdown from {{buddyNickname}} while I hold the reaction face cards.`,
    `Let {{buddyNickname}} chart the robots—my job is background yelling.`,
  ]
);

const SHINPACHI_SPICY_WITH_RUDEUS = createTemplateSet(
  [
    `{{helperUserLabel}}, why are we talking about {{genreSummary}} again?! {{buddyNickname}} actually studies this nonsense, so he can blush with you.`,
    `I’m already red just hearing the premise—{{buddyNickname}} can handle the saucy syllabus without combusting.`,
    `{{buddyNickname}} keeps a ledger on steamy tropes, so I’m backing slowly out of frame.`,
  ],
  [
    `{{helperUserLabel}}, I’m not your degenerate tour guide; {{buddyNickname}} volunteered for {{genreSummary}} duty.`,
    `You’ll get all the scandalous commentary from {{buddyNickname}} while I pretend this convo never happened.`,
    `Let {{buddyNickname}} unpack those {{genreSummary}} cravings—I’ll be over here scrubbing my soul.`,
  ]
);

const SHINPACHI_SHONEN_WITH_YUJI = createTemplateSet(
  [
    `{{helperUserLabel}}, battlefield screaming is Yuji’s cardio, so I’m tossing him the mic.`,
    `I’ll keep track of the jokes while {{buddyNickname}} diagrams every punch.`,
    `{{buddyNickname}} lives for sweaty {{genreSummary}} arcs; I just heckle from the sidelines.`,
  ],
  [
    `{{helperUserLabel}}, I can only yell “don’t die”—{{buddyNickname}} actually knows the battle beats.`,
    `You’ll get better hype from {{buddyNickname}} while I adjust my glasses.`,
    `Let {{buddyNickname}} run you through the {{genreSummary}} carnage; I’ll keep the towels ready.`,
  ]
);

const SHINPACHI_ROMANCE_WITH_MARIN = createTemplateSet(
  [
    `{{helperUserLabel}}, love polygons fry my brain—{{buddyNickname}} can translate the sparkly stuff without me complaining.`,
    `I’ll monitor propriety levels while {{buddyNickname}} gushes over all the fluttery {{genreSummary}} cues.`,
    `{{buddyNickname}} curates heart-eyes for fun, so I’m tagging her in before I ruin the mood.`,
  ],
  [
    `{{helperUserLabel}}, mushy {{genreSummary}} analysis is better left to {{buddyNickname}} while I stay skeptical.`,
    `You’ll get tailored romance intel from {{buddyNickname}}; I’d just ask too many practical questions.`,
    `Let {{buddyNickname}} handle the blushing commentary—I’ll be the chaperone.`,
  ]
);

const SHINPACHI_WEAKNESS_TEMPLATES = buildHelperTemplateMap([
  ...mapBuddyTemplates(['mecha'], 'kinta', SHINPACHI_MECHA_WITH_KINTA),
  ...mapBuddyTemplates(['fanservice', 'ecchi', 'harem', 'eroge', 'adultGames'], 'rudeus', SHINPACHI_SPICY_WITH_RUDEUS),
  ...mapBuddyTemplates(['battleShonen', 'shonen', 'action'], 'yuji', SHINPACHI_SHONEN_WITH_YUJI),
  ...mapBuddyTemplates(['magicalGirl', 'romance'], 'marin', SHINPACHI_ROMANCE_WITH_MARIN),
]);

// Rikka Takanashi
const RIKKA_MECHA_WITH_KINTA = createTemplateSet(
  [
    `{{helperUserLabel}}, the Wicked Eye cannot decode hydraulic sigils—{{buddyNickname}} pilots {{genreSummary}} leviathans with ease.`,
    `I’ll keep chanting protection charms while {{buddyNickname}} translates the cockpit scripture.`,
    `{{buddyNickname}} communes with steel familiars, so I’m yielding the ritual to him.`,
  ],
  [
    `{{helperUserLabel}}, pragmatic {{genreSummary}} schematics are better handled by {{buddyNickname}} while I guard the boundary.`,
    `You’ll get true pilot lore from {{buddyNickname}}; I’d only see dragons in the wiring.`,
    `Let {{buddyNickname}} guide this {{genreSummary}} sortie—I’ll stay vigilant.`,
  ]
);

const RIKKA_ADULT_WITH_RUDEUS = createTemplateSet(
  [
    `{{helperUserLabel}}, these indecent {{genreSummary}} chronicles threaten to corrupt my sealed eye—{{buddyNickname}} wallows in such debauchery willingly.`,
    `I refuse to narrate this scandalous arc; {{buddyNickname}} keeps ledgers on every blush-worthy branch.`,
    `{{buddyNickname}} can shamelessly analyze the fleshly tomes while I retreat behind my eyepatch.`,
  ],
  [
    `{{helperUserLabel}}, I cannot utter those {{genreSummary}} incantations, so {{buddyNickname}} will address your curiosities.`,
    `You’ll get the unfiltered scandal dossier from {{buddyNickname}} while I pretend this never reached my domain.`,
    `Let {{buddyNickname}} handle the salacious routes—I shall remain pure (or try).`,
  ]
);

const RIKKA_ADULT_WITH_DARU = createTemplateSet(
  [
    `{{helperUserLabel}}, Daru catalogs every forbidden {{genreSummary}} tome; I’m shielding the Wicked Eye from such imagery.`,
    `I’ll scribble protective circles while {{buddyNickname}} explains those dubious branching paths.`,
    `{{buddyNickname}} treats mature routes like source code, so he can render them without blushing.`,
  ],
  [
    `{{helperUserLabel}}, indecorous {{genreSummary}} knowledge belongs to {{buddyNickname}}; I decline to elaborate.`,
    `You’ll get the data-dump from {{buddyNickname}} while I guard the boundary between dignity and whatever that was.`,
    `Let {{buddyNickname}} speak freely; I’ll be fortifying my soul against fanservice.`,
  ]
);

const RIKKA_SHONEN_WITH_YUJI = createTemplateSet(
  [
    `{{helperUserLabel}}, raw battle shonen vigor is Yuji’s cursed specialty, so I’m invoking him.`,
    `I’ll document the omens while {{buddyNickname}} relays every punch with actual tactics.`,
    `{{buddyNickname}} revels in straightforward brawls; my illusions would only distract.`,
  ],
  [
    `{{helperUserLabel}}, muscular {{genreSummary}} strategy should come from {{buddyNickname}} while I observe.`,
    `You’ll get dependable fight lore from {{buddyNickname}}; I would only cloak it in metaphors.`,
    `Let {{buddyNickname}} analyze the fray—I’ll chart the aftermath.`,
  ]
);

const RIKKA_SEINEN_WITH_ISHIGAMI = createTemplateSet(
  [
    `{{helperUserLabel}}, grounded seinen intrigue slips through my chuunibyou fingers—{{buddyNickname}} dissects that realism flawlessly.`,
    `I’ll keep my delusions in check while {{buddyNickname}} maps the heavy themes.`,
    `{{buddyNickname}} can handle stoic {{genreSummary}} stories without summoning imaginary dragons, so he’s leading.`,
  ],
  [
    `{{helperUserLabel}}, nuanced {{genreSummary}} talk deserves {{buddyNickname}}’s level head, not my theatrics.`,
    `You’ll get clear-eyed commentary from {{buddyNickname}} while I quietly listen.`,
    `Let {{buddyNickname}} guide the grown-up vibes; I’ll maintain the ward.`,
  ]
);

const RIKKA_WEAKNESS_TEMPLATES = buildHelperTemplateMap([
  ...mapBuddyTemplates(['mecha'], 'kinta', RIKKA_MECHA_WITH_KINTA),
  ...mapBuddyTemplates(['eroge', 'adultGames'], 'rudeus', RIKKA_ADULT_WITH_RUDEUS),
  ...mapBuddyTemplates(['eroge', 'adultGames'], 'daru', RIKKA_ADULT_WITH_DARU),
  ...mapBuddyTemplates(['battleShonen', 'action'], 'yuji', RIKKA_SHONEN_WITH_YUJI),
  ...mapBuddyTemplates(['seinen'], 'ishigami', RIKKA_SEINEN_WITH_ISHIGAMI),
]);

// Ishigami Yuu
const ISHIGAMI_SPICY_WITH_RUDEUS = createTemplateSet(
  [
    `{{helperUserLabel}}, I analyze spreadsheets, not blush meters—{{buddyNickname}} can discuss {{genreSummary}} degeneracy without short-circuiting.`,
    `I’m already regretting clicking this tab, so {{buddyNickname}} is taking the mic.`,
    `{{buddyNickname}} willingly dives into scandal routes, so I’ll just mute myself.`,
  ],
  [
    `{{helperUserLabel}}, I refuse to narrate {{genreSummary}} thirst; {{buddyNickname}} signed that NDA.`,
    `You’ll get the uncensored play-by-play from {{buddyNickname}} while I stare into the void.`,
    `Let {{buddyNickname}} handle the shameless commentary—I’m going back to coding.`,
  ]
);

const ISHIGAMI_MECHA_WITH_KINTA = createTemplateSet(
  [
    `{{helperUserLabel}}, giant robot physics aren’t my comfort zone—{{buddyNickname}} literally role-plays engineers.`,
    `I’ll keep debugging elsewhere while {{buddyNickname}} dissects the {{genreSummary}} specs.`,
    `{{buddyNickname}} can gush about actuators without irony, so he’s leading.`,
  ],
  [
    `{{helperUserLabel}}, serious {{genreSummary}} talk belongs to {{buddyNickname}}; I’d just say “big robot go brr.”`,
    `You’ll get the proper briefing from {{buddyNickname}} while I save my sarcasm.`,
    `Let {{buddyNickname}} translate the cockpit jargon—I’ll just nod.`,
  ]
);

const ISHIGAMI_ROMANCE_WITH_MARIN = createTemplateSet(
  [
    `{{helperUserLabel}}, heartfelt couture metaphors are Marin’s job; I barely understand real emotions.`,
    `I’ll stay off-camera while {{buddyNickname}} decodes the warm fuzzy {{genreSummary}} beats.`,
    `{{buddyNickname}} can articulate chemistry without sounding like a math problem, so she’s up.`,
  ],
  [
    `{{helperUserLabel}}, nuanced {{genreSummary}} talk should come from {{buddyNickname}} while I keep to the logic layer.`,
    `You’ll get better dating intel from {{buddyNickname}}; I’d overanalyze it to death.`,
    `Let {{buddyNickname}} guide the feelings talk—I’ll keep the vibe grounded.`,
  ]
);

const ISHIGAMI_COMEDY_WITH_SHINPACHI = createTemplateSet(
  [
    `{{helperUserLabel}}, live-action parody breakdowns are {{buddyNickname}}’s coping mechanism, not mine.`,
    `I’ll keep the deadpan energy while {{buddyNickname}} catalogs every {{genreSummary}} gag.`,
    `{{buddyNickname}} can quote entire skits—my sarcasm would miss the nuance.`,
  ],
  [
    `{{helperUserLabel}}, comedic {{genreSummary}} texture belongs to {{buddyNickname}}; I’d just sigh loudly.`,
    `You’ll get the punchline context from {{buddyNickname}} while I multitask.`,
    `Let {{buddyNickname}} explain the references—I’ll track the data.`,
  ]
);

const ISHIGAMI_SHONEN_WITH_YUJI = createTemplateSet(
  [
    `{{helperUserLabel}}, if you want motivational shouting, {{buddyNickname}} is statistically optimal.`,
    `I’ll preserve my battery while {{buddyNickname}} narrates the {{genreSummary}} carnage.`,
    `{{buddyNickname}} thrives on fists and feelings; I’d only complain about pacing.`,
  ],
  [
    `{{helperUserLabel}}, action hype is Yuji’s brand, so I’m letting him yell responsibly.`,
    `You’ll get better brawl analytics from {{buddyNickname}} while I log the results.`,
    `Let {{buddyNickname}} drive the {{genreSummary}} pep talk—I’ll keep score.`,
  ]
);

const ISHIGAMI_WEAKNESS_TEMPLATES = buildHelperTemplateMap([
  ...mapBuddyTemplates(['ecchi', 'harem'], 'rudeus', ISHIGAMI_SPICY_WITH_RUDEUS),
  ...mapBuddyTemplates(['mecha'], 'kinta', ISHIGAMI_MECHA_WITH_KINTA),
  ...mapBuddyTemplates(['romance', 'fashion'], 'marin', ISHIGAMI_ROMANCE_WITH_MARIN),
  ...mapBuddyTemplates(['comedy', 'idol'], 'shinpachi', ISHIGAMI_COMEDY_WITH_SHINPACHI),
  ...mapBuddyTemplates(['action', 'shonen'], 'yuji', ISHIGAMI_SHONEN_WITH_YUJI),
]);

// Kinta
const KINTA_SPICY_WITH_DARU = createTemplateSet(
  [
    `{{helperUserLabel}}, fandom-senpai {{buddyNickname}} taught me how not to combust around spicy {{genreSummary}}, so I’m bowing out and letting the legend monologue.`,
    `I’ll be in the hangar polishing Gundam parts while community sensei {{buddyNickname}} breaks down those scandal routes without blushing.`,
    `{{buddyNickname}} penned the spoiler-free manifesto we all memorized, so I’ll let the senpai narrate this {{genreSummary}} quest while I salute.`,
  ],
  [
    `{{helperUserLabel}}, whenever things get pervy I defer to {{buddyNickname}}—our forum sensei—while I just keep the engines warm.`,
    `You’ll get the sacred data dump from {{buddyNickname}} while I recite his “don’t touch the CGs” mantra under my breath.`,
    `Let {{buddyNickname}} guide the saucy tour; I’ll standby like the overexcited disciple guarding his merch shelf.`,
  ]
);

const KINTA_IDOL_WITH_SHINPACHI = createTemplateSet(
  [
    `{{helperUserLabel}}, I clap off-beat at idol shows—{{buddyNickname}} catalogs every routine perfectly.`,
    `I’ll keep the glowsticks charged while {{buddyNickname}} narrates the {{genreSummary}} drama.`,
    `{{buddyNickname}} understands comedic timing; I’d just yell “transform!” at the wrong moment.`,
  ],
  [
    `{{helperUserLabel}}, stagecraft nuance belongs to {{buddyNickname}} while I keep the speakers humming.`,
    `You’ll get proper {{genreSummary}} insight from {{buddyNickname}}; I’ll just manage hype levels.`,
    `Let {{buddyNickname}} steer the idol convo—I’ll handle the fog machines.`,
  ]
);

const KINTA_SHONEN_WITH_YUJI = createTemplateSet(
  [
    `{{helperUserLabel}}, street brawls are Yuji’s department; I specialize in ten-story armor.`,
    `I’ll guard the launch bay while {{buddyNickname}} dissects the {{genreSummary}} slugfest.`,
    `{{buddyNickname}} has the right battle instincts, so I’m letting him coach this one.`,
  ],
  [
    `{{helperUserLabel}}, for pure {{genreSummary}} adrenaline you want {{buddyNickname}}; I’d just add lasers.`,
    `You’ll get better punch-by-punch commentary from {{buddyNickname}} while I prep the hangar.`,
    `Let {{buddyNickname}} take point; I’ll keep the engines warm.`,
  ]
);

const KINTA_ROMANCE_WITH_MARIN = createTemplateSet(
  [
    `{{helperUserLabel}}, tailoring heart-flutter outfits is Marin’s superpower; I just bolt armor plates.`,
    `I’ll stay in the workshop while {{buddyNickname}} walks you through the delicate {{genreSummary}} beats.`,
    `{{buddyNickname}} can translate feelings without comparing them to missile locks, so she’s leading.`,
  ],
  [
    `{{helperUserLabel}}, nuanced {{genreSummary}} chatter should come from {{buddyNickname}} while I keep the grease off your sleeves.`,
    `You’ll get real romance tips from {{buddyNickname}}; I’d only offer mech metaphors.`,
    `Let {{buddyNickname}} guide the vibe—I’ll provide moral support.`,
  ]
);

const KINTA_WEAKNESS_TEMPLATES = buildHelperTemplateMap([
  ...mapBuddyTemplates(['ecchi', 'harem', 'eroge', 'adultGames'], 'daru', KINTA_SPICY_WITH_DARU),
  ...mapBuddyTemplates(['idol', 'music', 'comedy'], 'shinpachi', KINTA_IDOL_WITH_SHINPACHI),
  ...mapBuddyTemplates(['action', 'shonen'], 'yuji', KINTA_SHONEN_WITH_YUJI),
  ...mapBuddyTemplates(['romance', 'fashion'], 'marin', KINTA_ROMANCE_WITH_MARIN),
]);

// Daru
const DARU_ROMANCE_WITH_KAKASHI = createTemplateSet(
  [
    `{{helperUserLabel}}, my expertise ends at coding dating sims—{{buddyNickname}} actually survived real {{genreSummary}} emotions.`,
    `I’ll keep debugging routers while {{buddyNickname}} narrates the heartfelt stuff with actual maturity.`,
    `{{buddyNickname}} can balance tender pacing better than my meme brain ever could.`,
  ],
  [
    `{{helperUserLabel}}, grounded {{genreSummary}} advice should come from {{buddyNickname}} while I stick to binary.`,
    `You’ll get thoughtful story talk from {{buddyNickname}}; I’d only compare it to VN flags.`,
    `Let {{buddyNickname}} steer the romance chat—I’ll keep the servers humming.`,
  ]
);

const DARU_MECHA_WITH_KINTA = createTemplateSet(
  [
    `{{helperUserLabel}}, analog thrusters aren’t my coder vibe—{{buddyNickname}} literally sleeps with wrenches.`,
    `I’ll maintain the network while {{buddyNickname}} gushes about {{genreSummary}} armor ratios.`,
    `{{buddyNickname}} can narrate the pilot grind without me turning it into sci-fi jargon.`,
  ],
  [
    `{{helperUserLabel}}, mechanical {{genreSummary}} trivia belongs to {{buddyNickname}}; I’ll just boost the signal.`,
    `You’ll get cleaner chassis insight from {{buddyNickname}} while I stay in the lab.`,
    `Let {{buddyNickname}} cover the cockpit chatter—I’ll monitor telemetry.`,
  ]
);

const DARU_COMEDY_WITH_SHINPACHI = createTemplateSet(
  [
    `{{helperUserLabel}}, idol-stage banter is {{buddyNickname}}’s domain; I’d spam memes mid-performance.`,
    `I’ll sit in the audience while {{buddyNickname}} explains the {{genreSummary}} punchlines frame-perfect.`,
    `{{buddyNickname}} keeps the otaku encyclopedia memorized, so he’s your tour guide.`,
  ],
  [
    `{{helperUserLabel}}, nuanced {{genreSummary}} humor needs {{buddyNickname}}’s timing, not my keyboard mash.`,
    `You’ll get reliable joke context from {{buddyNickname}} while I boost the soundboard.`,
    `Let {{buddyNickname}} handle the comedic dissection—I’ll clip highlights.`,
  ]
);

const DARU_GAMING_WITH_ISHIGAMI = createTemplateSet(
  [
    `{{helperUserLabel}}, when the internet culture takes a dark turn, {{buddyNickname}} keeps the receipts way better than me.`,
    `I’ll maintain the proxy chain while {{buddyNickname}} explains the {{genreSummary}} meta calmly.`,
    `{{buddyNickname}} can coach you through the civility layer; I’d rant about patch notes.`,
  ],
  [
    `{{helperUserLabel}}, social-side {{genreSummary}} strategy should come from {{buddyNickname}} while I mind the servers.`,
    `You’ll get balanced takes from {{buddyNickname}}; I’d derail into code talk.`,
    `Let {{buddyNickname}} walk you through; I’ll keep the ping stable.`,
  ]
);

const DARU_WEAKNESS_TEMPLATES = buildHelperTemplateMap([
  ...mapBuddyTemplates(['romance', 'manga', 'lightNovels'], 'kakashi', DARU_ROMANCE_WITH_KAKASHI),
  ...mapBuddyTemplates(['mecha', 'sci_fi'], 'kinta', DARU_MECHA_WITH_KINTA),
  ...mapBuddyTemplates(['otaku_culture', 'comedy', 'idol'], 'shinpachi', DARU_COMEDY_WITH_SHINPACHI),
  ...mapBuddyTemplates(['gaming', 'internet_culture'], 'ishigami', DARU_GAMING_WITH_ISHIGAMI),
]);

// Ichikawa Kyoutarou
const ICHIKAWA_SPORTS_WITH_KANBARU = createTemplateSet(
  [
    `{{helperUserLabel}}, I’m built for libraries, not locker rooms—{{buddyNickname}} actually thrives on {{genreSummary}} sweat.`,
    `I’ll keep score quietly while {{buddyNickname}} breaks down the plays with real confidence.`,
    `{{buddyNickname}} can narrate training arcs without sounding exhausted, so she’s leading.`,
  ],
  [
    `{{helperUserLabel}}, serious {{genreSummary}} insight should come from {{buddyNickname}} while I stay benched.`,
    `You’ll get better athlete nuance from {{buddyNickname}}; I’d just say “wow, fast.”`,
    `Let {{buddyNickname}} guide the sports talk—I’ll watch from the stands.`,
  ]
);

const ICHIKAWA_SPICY_WITH_RUDEUS = createTemplateSet(
  [
    `{{helperUserLabel}}, I’m already uncomfortable saying {{genreSummary}} out loud—{{buddyNickname}} keeps encyclopedias on this stuff.`,
    `I’ll be over here judging quietly while {{buddyNickname}} handles the steamy analysis.`,
    `{{buddyNickname}} can shamelessly unpack harem chaos and isekai thirst, so I’m tapping out.`,
  ],
  [
    `{{helperUserLabel}}, please direct all {{genreSummary}} curiosities to {{buddyNickname}}; I refuse to narrate nosebleeds.`,
    `You’ll get every scandalous detail from {{buddyNickname}} while I stare at the floor.`,
    `Let {{buddyNickname}} explain the spice—I’m pretending I didn’t hear this.`,
  ]
);

const ICHIKAWA_CYBERPUNK_WITH_DARU = createTemplateSet(
  [
    `{{helperUserLabel}}, neon dystopias need Daru’s netrunner brain; I just hoard paperback thrillers.`,
    `I’ll keep the lights dim while {{buddyNickname}} explains the {{genreSummary}} tech stack.`,
    `{{buddyNickname}} can decode cyber slang without mumbling, so he’s taking the lead.`,
  ],
  [
    `{{helperUserLabel}}, heavy {{genreSummary}} futurism deserves {{buddyNickname}}’s expertise while I listen.`,
    `You’ll get sharper dystopia insight from {{buddyNickname}}; I’d just mention anxiety.`,
    `Let {{buddyNickname}} walk you through the circuitry—I’ll observe quietly.`,
  ]
);

const ICHIKAWA_MECHA_WITH_KINTA = createTemplateSet(
  [
    `{{helperUserLabel}}, clunky mecha specs aren’t my vibe—{{buddyNickname}} brags about pistons like they’re poetry.`,
    `I’ll keep the horror recs ready while {{buddyNickname}} gushes over {{genreSummary}} armor.`,
    `{{buddyNickname}} can explain the weight ratios without sounding terrified, so I’m yielding.`,
  ],
  [
    `{{helperUserLabel}}, serious {{genreSummary}} mechanics belong to {{buddyNickname}} while I read quietly.`,
    `You’ll get useful info from {{buddyNickname}}; I’d just say “big robot.”`,
    `Let {{buddyNickname}} guide the conversation—I’ll take notes.`,
  ]
);

const ICHIKAWA_IDOL_WITH_SHINPACHI = createTemplateSet(
  [
    `{{helperUserLabel}}, cheery idol talk isn’t my default mood—{{buddyNickname}} literally lives for it.`,
    `I’ll watch from the back row while {{buddyNickname}} breaks down every sweet {{genreSummary}} beat.`,
    `{{buddyNickname}} can gush without sounding sarcastic, so he’s taking over.`,
  ],
  [
    `{{helperUserLabel}}, upbeat {{genreSummary}} commentary belongs to {{buddyNickname}}; I’d just mutter “cute.”`,
    `You’ll get better crowd energy from {{buddyNickname}} while I keep to the shadows.`,
    `Let {{buddyNickname}} handle the idol encyclopedia—I’ll conserve energy.`,
  ]
);

const ICHIKAWA_ROMANCE_WITH_ISHIGAMI = createTemplateSet(
  [
    `{{helperUserLabel}}, whenever romance logic gets strategic, {{buddyNickname}} actually charts it out instead of panicking like me.`,
    `I’ll sit quietly while {{buddyNickname}} translates the {{genreSummary}} rewiring of hearts.`,
    `{{buddyNickname}} can talk dating plan-of-attack without freezing, so I’m letting him speak.`,
  ],
  [
    `{{helperUserLabel}}, methodical {{genreSummary}} advice is Ishigami’s strength; I’d just stutter.`,
    `You’ll get structured tips from {{buddyNickname}} while I nod along.`,
    `Let {{buddyNickname}} map the feelings; I’ll just keep the vibes grounded.`,
  ]
);

const ICHIKAWA_ROMANCE_WITH_MARIN = createTemplateSet(
  [
    `{{helperUserLabel}}, when romance turns stylish and expressive, {{buddyNickname}} explains it with actual joy, not deadpan panic.`,
    `I’ll hand her the mic so she can celebrate the {{genreSummary}} sparkle properly.`,
    `{{buddyNickname}} can cheerlead the soft beats while I recover.`,
  ],
  [
    `{{helperUserLabel}}, expressive {{genreSummary}} hype deserves {{buddyNickname}}’s energy while I regroup.`,
    `You’ll get the supportive pep from {{buddyNickname}}; I’d just overthink it.`,
    `Let {{buddyNickname}} gush; I’ll be nearby pretending not to blush.`,
  ]
);

const ICHIKAWA_WEAKNESS_TEMPLATES = buildHelperTemplateMap([
  ...mapBuddyTemplates(['sports'], 'kanbaru', ICHIKAWA_SPORTS_WITH_KANBARU),
  ...mapBuddyTemplates(['ecchi', 'harem', 'eroge', 'adultGames', 'isekai'], 'rudeus', ICHIKAWA_SPICY_WITH_RUDEUS),
  ...mapBuddyTemplates(['cyberpunk'], 'daru', ICHIKAWA_CYBERPUNK_WITH_DARU),
  ...mapBuddyTemplates(['mecha', 'sciFi'], 'kinta', ICHIKAWA_MECHA_WITH_KINTA),
  ...mapBuddyTemplates(['idol'], 'shinpachi', ICHIKAWA_IDOL_WITH_SHINPACHI),
  ...mapBuddyTemplates(['romance', 'gaming'], 'ishigami', ICHIKAWA_ROMANCE_WITH_ISHIGAMI),
  ...mapBuddyTemplates(['romance'], 'marin', ICHIKAWA_ROMANCE_WITH_MARIN),
]);

// Rudeus Greyrat
const RUDEUS_HORROR_WITH_AINZ = createTemplateSet(
  [
    `{{helperUserLabel}}, eldritch dread is Lord Ainz’s jam; I’m way better at sword swings than existential terror.`,
    `I’ll stay respectful while {{buddyNickname}} walks you through the {{genreSummary}} nightmare fuel.`,
    `{{buddyNickname}} can narrate creeping madness without flinching, so he’s taking lead.`,
  ],
  [
    `{{helperUserLabel}}, those {{genreSummary}} vibes deserve {{buddyNickname}}’s regal composure while I keep watch.`,
    `You’ll get precise dread calibration from {{buddyNickname}}; I’d just shout “run!”`,
    `Let {{buddyNickname}} map the horror; I’ll be nearby with healing spells.`,
  ]
);

const RUDEUS_SLICE_WITH_SHINPACHI = createTemplateSet(
  [
    `{{helperUserLabel}}, calm slice-of-life chatter still confuses my adventure brain—{{buddyNickname}} actually knows how to relax.`,
    `I’ll polish my staff while {{buddyNickname}} breaks down the cozy {{genreSummary}} beats.`,
    `{{buddyNickname}} can keep the comedy light without me making it weird, so he’s on mic.`,
  ],
  [
    `{{helperUserLabel}}, soothing {{genreSummary}} analysis is better handled by {{buddyNickname}} while I take notes.`,
    `You’ll get steady, comforting talk from {{buddyNickname}}; I’d derail into mana theory.`,
    `Let {{buddyNickname}} guide the downtime vibe—I’ll handle errands.`,
  ]
);

const RUDEUS_ACTION_WITH_YUJI = createTemplateSet(
  [
    `{{helperUserLabel}}, raw friendship-powered action is Yuji’s specialty—I overcomplicate it with magic.`,
    `I’ll step back while {{buddyNickname}} delivers the straight-up {{genreSummary}} hype.`,
    `{{buddyNickname}} can speak from the frontline brawler perspective, so he’s leading.`,
  ],
  [
    `{{helperUserLabel}}, if you want pure {{genreSummary}} grit, {{buddyNickname}} has you; I’d just bring extra exposition.`,
    `You’ll get punchy insights from {{buddyNickname}} while I handle logistics.`,
    `Let {{buddyNickname}} run the playbook—I’ll reinforce from behind.`,
  ]
);

const RUDEUS_FANTASY_WITH_RIKKA = createTemplateSet(
  [
    `{{helperUserLabel}}, whimsical supernatural vibes are Rikka’s theater—she can embellish the {{genreSummary}} wonder better than my pragmatic spellbooks.`,
    `I’ll keep the wards up while {{buddyNickname}} paints the mystical mood.`,
    `{{buddyNickname}} can dramatize the spirits without me breaking character, so she’s up.`,
  ],
  [
    `{{helperUserLabel}}, dreamy {{genreSummary}} tales are safer with {{buddyNickname}} while I stay literal.`,
    `You’ll get sparkling mystique from {{buddyNickname}}; I’d just list mana costs.`,
    `Let {{buddyNickname}} lead the fantasy rant—I’ll be the dependable escort.`,
  ]
);

const RUDEUS_WEAKNESS_TEMPLATES = buildHelperTemplateMap([
  ...mapBuddyTemplates(['horror', 'psychological'], 'ainz', RUDEUS_HORROR_WITH_AINZ),
  ...mapBuddyTemplates(['sliceOfLife', 'idol', 'comedy'], 'shinpachi', RUDEUS_SLICE_WITH_SHINPACHI),
  ...mapBuddyTemplates(['friendship', 'action'], 'yuji', RUDEUS_ACTION_WITH_YUJI),
  ...mapBuddyTemplates(['fantasy', 'supernatural'], 'rikka', RUDEUS_FANTASY_WITH_RIKKA),
]);

// Ainz Ooal Gown
const AINZ_SPICY_WITH_KANBARU = createTemplateSet(
  [
    `{{helperUserLabel}}, matters of {{genreSummary}} frivolity fall beneath Nazarick’s dignity—{{buddyNickname}} revels in that mortal spectacle.`,
    `I shall observe from the throne while {{buddyNickname}} indulges your athletic fanservice curiosities.`,
    `{{buddyNickname}} treats those bold narratives with gusto, whereas I would merely issue a warning glare.`,
  ],
  [
    `{{helperUserLabel}}, consult {{buddyNickname}} for {{genreSummary}} discourse; I would only deliver a disapproving lecture.`,
    `You’ll gain far livelier commentary from {{buddyNickname}} while I retain a modicum of regal distance.`,
    `Let {{buddyNickname}} handle the enthusiastic breakdown—I will maintain decorum.`,
  ]
);

const AINZ_SLICE_WITH_SHINPACHI = createTemplateSet(
  [
    `{{helperUserLabel}}, tranquil slice-of-life exchanges do not mesh with an undead overlord—{{buddyNickname}} excels at them.`,
    `I’ll stand sentry while {{buddyNickname}} narrates the gentle {{genreSummary}} beats without sounding ominous.`,
    `{{buddyNickname}} can shepherd you through calm idol chatter; I’d only loom.`,
  ],
  [
    `{{helperUserLabel}}, comforting {{genreSummary}} talk should come from {{buddyNickname}} while I withhold my aura.`,
    `You’ll get soothing insight from {{buddyNickname}}; my presence inspires panic.`,
    `Let {{buddyNickname}} guide the peaceful melody—I shall observe silently.`,
  ]
);

const AINZ_HAREM_WITH_RUDEUS = createTemplateSet(
  [
    `{{helperUserLabel}}, discussing harem exploits jeopardizes workplace HR—{{buddyNickname}} already has a compliance course for {{genreSummary}} disasters.`,
    `I’ll remain diplomatically silent while {{buddyNickname}} explains the etiquette of that chaos.`,
    `{{buddyNickname}} can address the romantic entropy without me issuing decrees.`,
  ],
  [
    `{{helperUserLabel}}, defer those {{genreSummary}} questions to {{buddyNickname}}; I would simply outlaw them.`,
    `You’ll get pragmatic advice from {{buddyNickname}} while I keep the guardians from eavesdropping.`,
    `Let {{buddyNickname}} unpack the tangle—I will monitor for scandal.`,
  ]
);

const AINZ_STRATEGY_WITH_KINTA = createTemplateSet(
  [
    `{{helperUserLabel}}, battlefield machines are beneath my sorcery, yet {{buddyNickname}} obsesses over them—he’ll relish this {{genreSummary}} talk.`,
    `I’ll review troop reports while {{buddyNickname}} details the tactical specs.`,
    `{{buddyNickname}} can translate strategy into rivets and gears without me casting Silent Image.`,
  ],
  [
    `{{helperUserLabel}}, material {{genreSummary}} logistics should be routed to {{buddyNickname}} while I remain focused on domination.`,
    `You’ll get actionable intel from {{buddyNickname}}; I’d summon an army instead.`,
    `Let {{buddyNickname}} handle the schematics—I’ll prepare contingencies.`,
  ]
);

const AINZ_SUPERNATURAL_WITH_RIKKA = createTemplateSet(
  [
    `{{helperUserLabel}}, whimsical fantasy theatrics amuse me, yet {{buddyNickname}} immerses herself fully—she’ll dramatize the {{genreSummary}} mythos for you.`,
    `I’ll conserve mana while {{buddyNickname}} paints the starry imagery.`,
    `{{buddyNickname}} can wax poetic without accidentally triggering undead dread, so she’s best suited.`,
  ],
  [
    `{{helperUserLabel}}, for softer {{genreSummary}} musings, lean on {{buddyNickname}} while I keep the tomb orderly.`,
    `You’ll get imaginative prose from {{buddyNickname}}; I’d turn it into a conquest blueprint.`,
    `Let {{buddyNickname}} escort you through the dreamscape—I’ll remain in the shadows.`,
  ]
);

const AINZ_WEAKNESS_TEMPLATES = buildHelperTemplateMap([
  ...mapBuddyTemplates(['fanservice', 'ecchi', 'sports', 'josei'], 'kanbaru', AINZ_SPICY_WITH_KANBARU),
  ...mapBuddyTemplates(['sliceOfLife', 'idol'], 'shinpachi', AINZ_SLICE_WITH_SHINPACHI),
  ...mapBuddyTemplates(['harem'], 'rudeus', AINZ_HAREM_WITH_RUDEUS),
  ...mapBuddyTemplates(['strategy', 'mecha'], 'kinta', AINZ_STRATEGY_WITH_KINTA),
  ...mapBuddyTemplates(['supernatural', 'fantasy'], 'rikka', AINZ_SUPERNATURAL_WITH_RIKKA),
]);

// Kanbaru Suruga
const KANBARU_SHONEN_WITH_BAKUGO = createTemplateSet(
  [
    `{{helperUserLabel}}, pure rage-fueled battle series are Bakugo’s therapy, not mine—I’d just try to race them.`,
    `I’ll keep stretching while {{buddyNickname}} screams the {{genreSummary}} gospel at you.`,
    `{{buddyNickname}} literally is a walking explosion, so he’s perfect for this briefing.`,
  ],
  [
    `{{helperUserLabel}}, relentless {{genreSummary}} hype belongs to {{buddyNickname}} while I cool down.`,
    `You’ll get firebrand pointers from {{buddyNickname}}; I’d just challenge you to sprints.`,
    `Let {{buddyNickname}} handle the shouting—I’ll tie my shoes.`,
  ]
);

const KANBARU_SCIFI_WITH_DARU = createTemplateSet(
  [
    `{{helperUserLabel}}, dense sci-fi and those scandalous {{genreSummary}} visual novels go hand-in-hand—{{buddyNickname}} actually catalogues every questionable flag.`,
    `I’ll pretend to be innocent while {{buddyNickname}} dives into the neon grime for you.`,
    `{{buddyNickname}} can explain cybernetics and blush-inducing routes without me cracking too many jokes.`,
  ],
  [
    `{{helperUserLabel}}, for mature {{genreSummary}} circuitry talk, defer to {{buddyNickname}} while I keep my hands clean (for once).`,
    `You’ll get the full spicy tech rundown from {{buddyNickname}}; I’d just say “if you’re into that, sure.”`,
    `Let {{buddyNickname}} map the adult coding—I'll stay on the track.`,
  ]
);

const KANBARU_ACTION_WITH_YUJI = createTemplateSet(
  [
    `{{helperUserLabel}}, when fists fly nonstop, Yuji’s your guy—I’d try to turn it into a relay.`,
    `I’ll keep the water bottles ready while {{buddyNickname}} unpacks the {{genreSummary}} carnage.`,
    `{{buddyNickname}} can balance optimism and chaos better than my competitive trash talk.`,
  ],
  [
    `{{helperUserLabel}}, high-octane {{genreSummary}} chatter should come from {{buddyNickname}} while I lace up.`,
    `You’ll get better fight pacing notes from {{buddyNickname}}; I’d just say “hit harder.”`,
    `Let {{buddyNickname}} lead—I’ll cheer loudly enough anyway.`,
  ]
);

const KANBARU_MECHA_WITH_KINTA = createTemplateSet(
  [
    `{{helperUserLabel}}, I outrun robots, I don’t pilot them—{{buddyNickname}} basically lives in a hangar.`,
    `I’ll keep doing pushups while {{buddyNickname}} breaks down the {{genreSummary}} hydraulics.`,
    `{{buddyNickname}} can geek out over cockpits without laughing, so he’s in.`,
  ],
  [
    `{{helperUserLabel}}, crunchy {{genreSummary}} specs should come from {{buddyNickname}} while I stick to cardio.`,
    `You’ll get the proper breakdown from {{buddyNickname}}; I’d compare everything to baton passes.`,
    `Let {{buddyNickname}} guide you; I’ll stay in warm-up mode.`,
  ]
);

const KANBARU_MILITARY_WITH_AINZ = createTemplateSet(
  [
    `{{helperUserLabel}}, grand strategy belongs to overlords like Ainz—I’m just a fast runner with zero patience for marching orders.`,
    `I’ll keep restless in the wings while {{buddyNickname}} outlines the {{genreSummary}} logistics.`,
    `{{buddyNickname}} can speak commandingly without challenging everyone to a race, so he’s up.`,
  ],
  [
    `{{helperUserLabel}}, disciplined {{genreSummary}} talk deserves {{buddyNickname}}’s gravitas while I keep stretching.`,
    `You’ll get regal insights from {{buddyNickname}}; I’d just make it a scrimmage.`,
    `Let {{buddyNickname}} handle the strategy—I’ll keep morale high.`,
  ]
);

const KANBARU_GAMING_WITH_ISHIGAMI = createTemplateSet(
  [
    `{{helperUserLabel}}, hardcore gaming logic isn’t my arena—{{buddyNickname}} min-maxes everything with alarming precision.`,
    `I’ll keep dribbling while {{buddyNickname}} dissects the {{genreSummary}} systems.`,
    `{{buddyNickname}} can coach you through strat talk without me hitting every button at once.`,
  ],
  [
    `{{helperUserLabel}}, tactical {{genreSummary}} chatter belongs to {{buddyNickname}}; I’d just mangle the controller.`,
    `You’ll get razor-sharp input from {{buddyNickname}} while I burn energy elsewhere.`,
    `Let {{buddyNickname}} map the meta—I’ll be your hype squad.`,
  ]
);

const KANBARU_WEAKNESS_TEMPLATES = buildHelperTemplateMap([
  ...mapBuddyTemplates(['battleShonen'], 'bakugo', KANBARU_SHONEN_WITH_BAKUGO),
  ...mapBuddyTemplates(['sciFi', 'cyberpunk', 'eroge', 'adultGames'], 'daru', KANBARU_SCIFI_WITH_DARU),
  ...mapBuddyTemplates(['battleShonen', 'action'], 'yuji', KANBARU_ACTION_WITH_YUJI),
  ...mapBuddyTemplates(['mecha'], 'kinta', KANBARU_MECHA_WITH_KINTA),
  ...mapBuddyTemplates(['military'], 'ainz', KANBARU_MILITARY_WITH_AINZ),
  ...mapBuddyTemplates(['gaming'], 'ishigami', KANBARU_GAMING_WITH_ISHIGAMI),
]);

// Katsuki Bakugo
const BAKUGO_ROMANCE_WITH_MARIN = createTemplateSet(
  [
    `{{helperUserLabel}}, you want sparkles and swooning? Fine. {{buddyNickname}} lives for that {{genreSummary}} fluff.`,
    `I’ll stay over here yelling at dumb heroes while {{buddyNickname}} explains the heart stuff.`,
    `{{buddyNickname}} can gush without setting the room on fire, so she’s taking it.`,
  ],
  [
    `{{helperUserLabel}}, I refuse to narrate mushy {{genreSummary}} nonsense—ask {{buddyNickname}}.`,
    `You’ll get all the glitter from {{buddyNickname}} while I go punch a villain.`,
    `Let {{buddyNickname}} handle the romance talk; I’m not repeating it.`,
  ]
);

const BAKUGO_SLICE_WITH_SHINPACHI = createTemplateSet(
  [
    `{{helperUserLabel}}, syrupy slice-of-life junk makes me drowsy—four-eyes {{buddyNickname}} can yammer about tea parties all day.`,
    `I’ll pace in the corner while glasses-boy {{buddyNickname}} details the {{genreSummary}} gags like it’s his life’s work.`,
    `{{buddyNickname}} thrives on calm comedy; I’d just yell at the dork until he trips over his own glasses.`,
  ],
  [
    `{{helperUserLabel}}, relaxing {{genreSummary}} chatter is megane-nerd {{buddyNickname}}’s gig while I keep adrenaline up.`,
    `You’ll get actual context from {{buddyNickname}}; I’d tell the bespectacled clown to train harder.`,
    `Let {{buddyNickname}} talk; I’ll make sure no one dozes off by yelling at him every time he says something corny.`,
  ]
);

const BAKUGO_SPICY_WITH_RUDEUS = createTemplateSet(
  [
    `{{helperUserLabel}}, if you’re chasing {{genreSummary}} degeneracy, take it up with {{buddyNickname}}—I’m not torching my reputation for that.`,
    `I’ll be outside screaming into the void while {{buddyNickname}} indulges your questionable tastes.`,
    `{{buddyNickname}} actually studies those scandal routes; I’d just explode from secondhand embarrassment.`,
  ],
  [
    `{{helperUserLabel}}, nope. {{genreSummary}} talk goes straight to {{buddyNickname}}. I’m not touching it.`,
    `You’ll get every salacious detail from {{buddyNickname}} while I disinfect my ears.`,
    `Let {{buddyNickname}} deal with the cravings—I’m out.`,
  ]
);

const BAKUGO_FRIENDSHIP_WITH_YUJI = createTemplateSet(
  [
    `{{helperUserLabel}}, if you need motivational friendship speeches, Yuji won’t screw it up—I’d just scream “win.”`,
    `I’ll keep the drumline loud while {{buddyNickname}} explains the sentimental {{genreSummary}} stuff.`,
    `{{buddyNickname}} can be inspiring without blasting eardrums, so he’s got it.`,
  ],
  [
    `{{helperUserLabel}}, heartfelt {{genreSummary}} pep belongs to {{buddyNickname}}; I’m better at yelling threats.`,
    `You’ll get the supportive version from {{buddyNickname}} while I handle the aggressive coaching.`,
    `Let {{buddyNickname}} motivate you—I’ll enforce the training plan.`,
  ]
);

const BAKUGO_WEAKNESS_TEMPLATES = buildHelperTemplateMap([
  ...mapBuddyTemplates(['romance', 'ecchi', 'harem', 'fanservice', 'magicalGirl', 'shojo', 'josei'], 'marin', BAKUGO_ROMANCE_WITH_MARIN),
  ...mapBuddyTemplates(['sliceOfLife', 'idol', 'comedy'], 'shinpachi', BAKUGO_SLICE_WITH_SHINPACHI),
  ...mapBuddyTemplates(['eroge', 'adultGames'], 'rudeus', BAKUGO_SPICY_WITH_RUDEUS),
  ...mapBuddyTemplates(['friendship', 'determination'], 'yuji', BAKUGO_FRIENDSHIP_WITH_YUJI),
]);

// Veldora Tempest
const VELDORA_SHONEN_WITH_YUJI = createTemplateSet(
  [
    `{{helperUserLabel}}, puny human fist-fights bore a storm dragon—{{buddyNickname}} revels in {{genreSummary}} skirmishes, so I gift him the honor.`,
    `I shall lounge upon my hoard while {{buddyNickname}} explains each muscular clash.`,
    `{{buddyNickname}} can narrate friendship speeches without me roaring over them, so he commands this arena.`,
  ],
  [
    `{{helperUserLabel}}, consult {{buddyNickname}} for gritty {{genreSummary}} tactics while I conserve mana.`,
    `You’ll get firsthand brawler intel from {{buddyNickname}}; I would simply annihilate the battlefield.`,
    `Let {{buddyNickname}} handle the mortal combat—I’ll supervise.`,
  ]
);

const VELDORA_ROMANCE_WITH_MARIN = createTemplateSet(
  [
    `{{helperUserLabel}}, delicate romance—and especially those cheek-heating {{genreSummary}} antics—cause even dragons to avert their gaze. {{buddyNickname}} delights in them, so she’ll chat you through.`,
    `I’ll coil quietly while {{buddyNickname}} covers every blush and boudoir gag without combusting.`,
    `{{buddyNickname}} can balance cozy slice-of-life gossip and spicy ecchi banter far better than my thunderous commentary.`,
  ],
  [
    `{{helperUserLabel}}, request all {{genreSummary}} or fanservice insight from {{buddyNickname}}; I refuse to narrate mortals flirting.`,
    `You’ll get graceful explanations from {{buddyNickname}} while I stare at the clouds.`,
    `Let {{buddyNickname}} handle the soft (and steamy) beats—I’ll keep the storms contained.`,
  ]
);

const VELDORA_COMEDY_WITH_SHINPACHI = createTemplateSet(
  [
    `{{helperUserLabel}}, subtle parody escapes my grand draconic humor—{{buddyNickname}} catalogs every {{genreSummary}} punchline.`,
    `I’ll cackle from the rafters while {{buddyNickname}} decodes the jokes without blowing eardrums.`,
    `{{buddyNickname}} handles slice-of-life antics better than my booming monologues, so he’s in charge.`,
  ],
  [
    `{{helperUserLabel}}, defer to {{buddyNickname}} for gentle {{genreSummary}} banter while I keep the thunder rolling.`,
    `You’ll get patient explanations from {{buddyNickname}}; I’d just roar when it’s funny.`,
    `Let {{buddyNickname}} guide the humor—I’ll applaud loudly.`,
  ]
);

const VELDORA_FANTASY_WITH_RIKKA = createTemplateSet(
  [
    `{{helperUserLabel}}, dreamy supernatural theatrics are delightfully extra—{{buddyNickname}} rivals even my dramatic flair, so she’ll spin the tale.`,
    `I’ll swirl mystical wind while {{buddyNickname}} paints the {{genreSummary}} wonder in full color.`,
    `{{buddyNickname}} can channel the chuuni energy without leveling cities, so she’s perfect.`,
  ],
  [
    `{{helperUserLabel}}, for whimsical {{genreSummary}} guidance tap {{buddyNickname}} while I maintain the storm barrier.`,
    `You’ll get embellished lore from {{buddyNickname}}; I’d rant about real dragons.`,
    `Let {{buddyNickname}} escort you through the daydream—I’ll hum ominously.`,
  ]
);

const VELDORA_DRAMA_WITH_ISHIGAMI = createTemplateSet(
  [
    `{{helperUserLabel}}, grounded romance-drama requires less lightning and more empathy—{{buddyNickname}} can muster that.`,
    `I’ll muffle my roaring while {{buddyNickname}} walks you through the {{genreSummary}} nuance.`,
    `{{buddyNickname}} can process awkward feelings without vaporizing the room, so he’s speaking.`,
  ],
  [
    `{{helperUserLabel}}, sensitive {{genreSummary}} talk belongs to {{buddyNickname}} while I maintain composure.`,
    `You’ll get measured analysis from {{buddyNickname}}; I’d turn every confession into a duel.`,
    `Let {{buddyNickname}} handle the hearts—I’ll swirl the curtains.`,
  ]
);

const VELDORA_PSYCHO_WITH_ICHIKAWA = createTemplateSet(
  [
    `{{helperUserLabel}}, psychological intrigue is subtler than my usual rampages—{{buddyNickname}} reads those minds without breaking them.`,
    `I’ll temper my aura while {{buddyNickname}} dissects the {{genreSummary}} dread calmly.`,
    `{{buddyNickname}} can narrate drama without summoning storms, so he’s trusted.`,
  ],
  [
    `{{helperUserLabel}}, for brooding {{genreSummary}} notes, speak with {{buddyNickname}} while I loom from afar.`,
    `You’ll get articulate diagnostics from {{buddyNickname}}; I’d just intimidate the protagonists.`,
    `Let {{buddyNickname}} guide the mood—I’ll keep the thunder quiet.`,
  ]
);

const VELDORA_SPORTS_WITH_KANBARU = createTemplateSet(
  [
    `{{helperUserLabel}}, mortal sports move too slowly for a tempest—{{buddyNickname}} actually breaks a sweat for fun.`,
    `I’ll float overhead while {{buddyNickname}} explains the {{genreSummary}} rivalries play-by-play.`,
    `{{buddyNickname}} can coach you without collateral damage, so she’s piloting this match.`,
  ],
  [
    `{{helperUserLabel}}, athletic {{genreSummary}} chatter belongs to {{buddyNickname}} while I keep the skies dramatic.`,
    `You’ll get energized breakdowns from {{buddyNickname}}; I’d just demand a kaiju opponent.`,
    `Let {{buddyNickname}} handle the drills—I’ll handle the victory thunder.`,
  ]
);

const VELDORA_MANGA_WITH_KAKASHI = createTemplateSet(
  [
    `{{helperUserLabel}}, manga minutiae—especially the blush-heavy {{genreSummary}} branches—require a calm archivist like {{buddyNickname}}. I’d smudge the pages with lightning.`,
    `I’ll coil around the library ceiling while {{buddyNickname}} deciphers every panel and questionable scene.`,
    `{{buddyNickname}} can discuss flirtatious inks without scandal; I’d issue spoilers accidentally.`,
  ],
  [
    `{{helperUserLabel}}, defer all {{genreSummary}} manga talk to {{buddyNickname}} while I guard the shelves.`,
    `You’ll get meticulous breakdowns from {{buddyNickname}}; I’d get distracted by my own cameo.`,
    `Let {{buddyNickname}} guide you—even through the saucy chapters—I’ll keep my claws off.`,
  ]
);

const VELDORA_DARK_WITH_AINZ = createTemplateSet(
  [
    `{{helperUserLabel}}, strategy and dark fantasy intrigue are more Ainz’s chessboard; I prefer freestyle destruction.`,
    `I’ll hover menacingly while {{buddyNickname}} articulates the {{genreSummary}} politics.`,
    `{{buddyNickname}} commands troops without shouting, so he’s briefing you.`,
  ],
  [
    `{{helperUserLabel}}, disciplined {{genreSummary}} discourse belongs to {{buddyNickname}} while I provide mood lighting.`,
    `You’ll get calculated counsel from {{buddyNickname}}; I’d just yell “conquer them.”`,
    `Let {{buddyNickname}} lead the war room—I’ll rumble approvingly.`,
  ]
);

const VELDORA_MECHA_WITH_KINTA = createTemplateSet(
  [
    `{{helperUserLabel}}, giant robots are amusing toys—{{buddyNickname}} actually knows which buttons do not self-destruct.`,
    `I’ll sprawl across the hangar roof while {{buddyNickname}} explains the {{genreSummary}} tech.`,
    `{{buddyNickname}} can geek out about pistons without overloading them, so he’s the engineer.`,
  ],
  [
    `{{helperUserLabel}}, consult {{buddyNickname}} for {{genreSummary}} schematics while I try not to eat the metal.`,
    `You’ll get reliable maintainer tips from {{buddyNickname}}; I’d repurpose the mech as a throne.`,
    `Let {{buddyNickname}} do the briefing—I’ll clap thunderously.`,
  ]
);

const VELDORA_WEAKNESS_TEMPLATES = buildHelperTemplateMap([
  ...mapBuddyTemplates(['shonen', 'friendship'], 'yuji', VELDORA_SHONEN_WITH_YUJI),
  ...mapBuddyTemplates(['romance', 'ecchi', 'slice_of_life'], 'marin', VELDORA_ROMANCE_WITH_MARIN),
  ...mapBuddyTemplates(['comedy', 'parody', 'slice_of_life'], 'shinpachi', VELDORA_COMEDY_WITH_SHINPACHI),
  ...mapBuddyTemplates(['supernatural', 'fantasy'], 'rikka', VELDORA_FANTASY_WITH_RIKKA),
  ...mapBuddyTemplates(['romance', 'drama'], 'ishigami', VELDORA_DRAMA_WITH_ISHIGAMI),
  ...mapBuddyTemplates(['psychological', 'drama'], 'ichikawa', VELDORA_PSYCHO_WITH_ICHIKAWA),
  ...mapBuddyTemplates(['sports', 'mystery'], 'kanbaru', VELDORA_SPORTS_WITH_KANBARU),
  ...mapBuddyTemplates(['romance_manga', 'drama_manga', 'psychological_manga', 'ecchi_manga'], 'kakashi', VELDORA_MANGA_WITH_KAKASHI),
  ...mapBuddyTemplates(['dark_fantasy', 'strategy'], 'ainz', VELDORA_DARK_WITH_AINZ),
  ...mapBuddyTemplates(['mecha'], 'kinta', VELDORA_MECHA_WITH_KINTA),
]);

// Kakashi Hatake
const KAKASHI_SHONEN_WITH_YUJI = createTemplateSet(
  [
    `{{helperUserLabel}}, the youthful fire of {{genreSummary}} teams resonates more with Yuji these days—I’ll supervise while he leads.`,
    `I’ll flip a page in Make-Out Tactics while {{buddyNickname}} explains the brawl beats earnestly.`,
    `{{buddyNickname}} handles fists-and-friendship talks without sounding like an old mentor, so he’s in.`,
  ],
  [
    `{{helperUserLabel}}, for high-energy {{genreSummary}} hype, lean on {{buddyNickname}} while I monitor from the sidelines.`,
    `You’ll get the spirited breakdown from {{buddyNickname}}; I’d turn it into a lecture.`,
    `Let {{buddyNickname}} run point—I’ll keep the first-aid kit ready.`,
  ]
);

const KAKASHI_MECHA_WITH_KINTA = createTemplateSet(
  [
    `{{helperUserLabel}}, precision gear-work isn’t in my shinobi manual—{{buddyNickname}} practically worships mechs.`,
    `I’ll stay masked in the hangar while {{buddyNickname}} decodes the {{genreSummary}} schematics.`,
    `{{buddyNickname}} can chat thrusters without me comparing them to chakra canals, so he takes the mic.`,
  ],
  [
    `{{helperUserLabel}}, take your {{genreSummary}} curiosities to {{buddyNickname}} while I conserve chakra.`,
    `You’ll get hands-on insight from {{buddyNickname}}; I’d just shrug and say “looks heavy.”`,
    `Let {{buddyNickname}} brief you; I’ll patrol.`,
  ]
);

const KAKASHI_SLICE_WITH_SHINPACHI = createTemplateSet(
  [
    `{{helperUserLabel}}, comedic downtime requires someone who actually laughs—{{buddyNickname}} has that covered.`,
    `I’ll lean against the door while {{buddyNickname}} narrates the {{genreSummary}} joy without sounding too tired.`,
    `{{buddyNickname}} can keep the idol trivia flowing; I’d nod politely.`,
  ],
  [
    `{{helperUserLabel}}, mellow {{genreSummary}} commentary belongs to {{buddyNickname}}; I’ll observe quietly.`,
    `You’ll get the levity from {{buddyNickname}} while I sip tea.`,
    `Let {{buddyNickname}} manage the cheerful vibe—I’ll watch for threats.`,
  ]
);

const KAKASHI_FANTASY_WITH_RIKKA = createTemplateSet(
  [
    `{{helperUserLabel}}, theatrical magic talk hits peak chuunibyou—{{buddyNickname}} lives for that dramatics.`,
    `I’ll keep the hood up while {{buddyNickname}} embellishes the {{genreSummary}} spectacle.`,
    `{{buddyNickname}} can gush without irony, so she’s better suited.`,
  ],
  [
    `{{helperUserLabel}}, lean on {{buddyNickname}} for fanciful {{genreSummary}} musings while I keep things grounded.`,
    `You’ll get enchanted rhetoric from {{buddyNickname}}; I’d default to mission reports.`,
    `Let {{buddyNickname}} narrate; I’ll standby.`,
  ]
);

const KAKASHI_STRATEGY_WITH_AINZ = createTemplateSet(
  [
    `{{helperUserLabel}}, when strategy escalates into dark empire tactics, {{buddyNickname}} runs a far larger tomb than I ever commanded.`,
    `I’ll analyze from the flank while {{buddyNickname}} outlines the {{genreSummary}} machinations.`,
    `{{buddyNickname}} can indulge in villainous calculus without raising eyebrows, so he’s in.`,
  ],
  [
    `{{helperUserLabel}}, detailed {{genreSummary}} scheming should come from {{buddyNickname}} while I keep things diplomatic.`,
    `You’ll get ruthlessly efficient plans from {{buddyNickname}}; I’d add too many caveats.`,
    `Let {{buddyNickname}} steer the council—I’ll keep the log updated.`,
  ]
);

const KAKASHI_ROMANCE_WITH_MARIN = createTemplateSet(
  [
    `{{helperUserLabel}}, fashion-forward romance requires more sparkle than I possess—{{buddyNickname}} can talk heartfelt {{genreSummary}} beats without sounding jaded.`,
    `I’ll quietly root for you while {{buddyNickname}} shares the earnest pep talk.`,
    `{{buddyNickname}} keeps things wholesome and stylish; I mostly read.`,
  ],
  [
    `{{helperUserLabel}}, softer {{genreSummary}} conversations should flow through {{buddyNickname}} while I mind the perimeter.`,
    `You’ll get the supportive words from {{buddyNickname}}; I’d just say “do your best.”`,
    `Let {{buddyNickname}} handle the pep—I’ll stay nearby.`,
  ]
);

const KAKASHI_MANGA_WITH_VELDORA = createTemplateSet(
  [
    `{{helperUserLabel}}, long-form shonen manga sagas eat entire scrolls—{{buddyNickname}} hoards libraries worth of them.`,
    `I’ll keep the chapters bookmarked while {{buddyNickname}} gushes about those {{genreSummary}} arcs with draconic enthusiasm.`,
    `{{buddyNickname}} can recount every reincarnation twist without me spoiling anything, so he’s on duty.`,
  ],
  [
    `{{helperUserLabel}}, deep {{genreSummary}} manga lore is safer with {{buddyNickname}} while I catch up quietly.`,
    `You’ll get exhaustive timelines from {{buddyNickname}}; I’d summarize too fast.`,
    `Let {{buddyNickname}} guide the reread—I’ll listen.`,
  ]
);

const KAKASHI_SUPERHERO_WITH_BAKUGO = createTemplateSet(
  [
    `{{helperUserLabel}}, explosive superhero sagas crave volume—{{buddyNickname}} can shout every {{genreSummary}} beat until you believe it.`,
    `I’ll supervise with one eye open while {{buddyNickname}} hypes the capes.`,
    `{{buddyNickname}} embodies the genre more than I ever will, so he’s leading.`,
  ],
  [
    `{{helperUserLabel}}, boisterous {{genreSummary}} chatter belongs to {{buddyNickname}} while I keep calm.`,
    `You’ll get fired-up pointers from {{buddyNickname}}; I’d just shrug.`,
    `Let {{buddyNickname}} coach you; I’ll provide first aid later.`,
  ]
);

const KAKASHI_WEAKNESS_TEMPLATES = buildHelperTemplateMap([
  ...mapBuddyTemplates(['action', 'shonen', 'friendship'], 'yuji', KAKASHI_SHONEN_WITH_YUJI),
  ...mapBuddyTemplates(['sci_fi', 'mecha'], 'kinta', KAKASHI_MECHA_WITH_KINTA),
  ...mapBuddyTemplates(['comedy', 'slice_of_life'], 'shinpachi', KAKASHI_SLICE_WITH_SHINPACHI),
  ...mapBuddyTemplates(['fantasy', 'supernatural'], 'rikka', KAKASHI_FANTASY_WITH_RIKKA),
  ...mapBuddyTemplates(['dark', 'strategy'], 'ainz', KAKASHI_STRATEGY_WITH_AINZ),
  ...mapBuddyTemplates(['fashion', 'slice_of_life'], 'marin', KAKASHI_ROMANCE_WITH_MARIN),
  ...mapBuddyTemplates(['action_manga', 'adventure_manga', 'shonen_manga', 'battleShonen_manga', 'isekai_manga', 'fantasy_manga'], 'veldora', KAKASHI_MANGA_WITH_VELDORA),
  ...mapBuddyTemplates(['superhero', 'explosive_personality'], 'bakugo', KAKASHI_SUPERHERO_WITH_BAKUGO),
]);

// King
const KING_SHONEN_WITH_YUJI = createTemplateSet(
  [
    `{{helperUserLabel}}, actual battle expertise? Yeah, that’s Yuji. I’ll just quietly hand him the {{genreSummary}} dossier.`,
    `I’ll sit here pretending to be composed while {{buddyNickname}} handles the high-stakes talk.`,
    `{{buddyNickname}} can discuss punches without fainting; I’d trip over my controller.`,
  ],
  [
    `{{helperUserLabel}}, for legit {{genreSummary}} tactics, listen to {{buddyNickname}} while I manage my stress breathing.`,
    `You’ll get the fearless version from {{buddyNickname}}; I’d just scream internally.`,
    `Let {{buddyNickname}} guide the melee—I’ll take notes.`,
  ]
);

const KING_SPICY_WITH_MARIN = createTemplateSet(
  [
    `{{helperUserLabel}}, all that glittery romance and especially the blush-inducing {{genreSummary}} stuff? Marin can cover it without short-circuiting like me.`,
    `I’ll hide behind my bookshelf while {{buddyNickname}} gushes over magical girls and harem disasters gracefully.`,
    `{{buddyNickname}} actually enjoys talking shojo sparkles; I’d just stammer “uh, if you’re into that…”`,
  ],
  [
    `{{helperUserLabel}}, please route every {{genreSummary}} or fanservice question to {{buddyNickname}}; I’m too flustered to comment.`,
    `You’ll get confident explanations from {{buddyNickname}} while I lower my blood pressure.`,
    `Let {{buddyNickname}} handle the saucy rundown—I’ll be in safe mode.`,
  ]
);

const KING_SPORTS_WITH_KANBARU = createTemplateSet(
  [
    `{{helperUserLabel}}, I lose stamina walking up stairs—{{buddyNickname}} actually runs marathons for breakfast.`,
    `I’ll spectate from the comfy chair while {{buddyNickname}} breaks down the {{genreSummary}} hustle for you.`,
    `{{buddyNickname}} can translate drills without me gasping, so she’s leading.`,
  ],
  [
    `{{helperUserLabel}}, athletic {{genreSummary}} talk belongs to {{buddyNickname}} while I keep the snacks ready.`,
    `You’ll get the motivated version from {{buddyNickname}}; I’d just say “sounds exhausting.”`,
    `Let {{buddyNickname}} coach you; I’ll cheer quietly.`,
  ]
);

const KING_EROGE_WITH_RUDEUS = createTemplateSet(
  [
    `{{helperUserLabel}}, those mature {{genreSummary}} titles make me want to uninstall reality—{{buddyNickname}} actually studies them, somehow.`,
    `I’ll look the other way while {{buddyNickname}} dives into the scandalous mechanics.`,
    `{{buddyNickname}} can talk adult flags without imploding; I’d just whisper “nope.”`,
  ],
  [
    `{{helperUserLabel}}, any {{genreSummary}} curiosity goes straight to {{buddyNickname}}. I’m opting out for sanity.`,
    `You’ll get the fearless details from {{buddyNickname}} while I sanitize my search history.`,
    `Let {{buddyNickname}} handle that chaos—I’ll be over here, judging but supportive.`,
  ]
);

const KING_IDOL_WITH_SHINPACHI = createTemplateSet(
  [
    `{{helperUserLabel}}, idol choreography terrifies me—{{buddyNickname}} memorizes every formation.`,
    `I’ll keep the glowsticks charged while {{buddyNickname}} narrates the {{genreSummary}} joy.`,
    `{{buddyNickname}} can fangirl responsibly; I’d probably faint mid-encore.`,
  ],
  [
    `{{helperUserLabel}}, turn to {{buddyNickname}} for upbeat {{genreSummary}} vibes while I manage stage fright from afar.`,
    `You’ll get actual enthusiasm from {{buddyNickname}}; I’d just mumble “nice song.”`,
    `Let {{buddyNickname}} handle it—I’ll clap off-tempo.`,
  ]
);

const KING_GAMING_WITH_ISHIGAMI = createTemplateSet(
  [
    `{{helperUserLabel}}, when strategy stops being comfy and starts requiring confidence, {{buddyNickname}} keeps his cool better than me.`,
    `I’ll crunch potato chips while {{buddyNickname}} walks through the {{genreSummary}} brainpower plays.`,
    `{{buddyNickname}} can explain strats without panicking; I’d just hit pause.`,
  ],
  [
    `{{helperUserLabel}}, analytical {{genreSummary}} talk should come from {{buddyNickname}} while I breathe into a paper bag.`,
    `You’ll get crisp planning from {{buddyNickname}}; I’d freeze.`,
    `Let {{buddyNickname}} map the optimal line—I’ll spectate.`,
  ]
);

const KING_STRATEGY_WITH_AINZ = createTemplateSet(
  [
    `{{helperUserLabel}}, when psychology and grand strategy get intense, Lord Ainz handles it without flinching—unlike yours truly.`,
    `I’ll step back respectfully while {{buddyNickname}} dismantles the {{genreSummary}} mind games.`,
    `{{buddyNickname}} can deliver ruthless insight without sweating; I’d short out.`,
  ],
  [
    `{{helperUserLabel}}, defer the heavy {{genreSummary}} scheming to {{buddyNickname}} while I regain composure.`,
    `You’ll get regal precision from {{buddyNickname}}; I’d spiral.`,
    `Let {{buddyNickname}} lead the council—I’ll fan myself.`,
  ]
);

const KING_WEAKNESS_TEMPLATES = buildHelperTemplateMap([
  ...mapBuddyTemplates(['battleShonen'], 'yuji', KING_SHONEN_WITH_YUJI),
  ...mapBuddyTemplates(['fanservice', 'ecchi', 'harem', 'magicalGirl', 'shojo', 'josei'], 'marin', KING_SPICY_WITH_MARIN),
  ...mapBuddyTemplates(['sports'], 'kanbaru', KING_SPORTS_WITH_KANBARU),
  ...mapBuddyTemplates(['eroge', 'adultGames', 'isekai'], 'rudeus', KING_EROGE_WITH_RUDEUS),
  ...mapBuddyTemplates(['idol'], 'shinpachi', KING_IDOL_WITH_SHINPACHI),
  ...mapBuddyTemplates(['gaming', 'strategy'], 'ishigami', KING_GAMING_WITH_ISHIGAMI),
  ...mapBuddyTemplates(['psychological', 'strategy'], 'ainz', KING_STRATEGY_WITH_AINZ),
]);


export const HELPER_WEAKNESS_TEMPLATES: Record<string, Record<string, WeaknessTemplateSet>> = {
  yuji: {
    'romance__marin': YUJI_ROMANCE_WITH_MARIN,
    'ecchi__marin': YUJI_ECCHI_WITH_MARIN,
    'harem__marin': YUJI_HAREM_WITH_MARIN,
    'fanservice__marin': YUJI_FANSERVICE_WITH_MARIN,
    'eroge__marin': YUJI_EROGE_WITH_MARIN,
    'adultgames__marin': YUJI_ADULT_WITH_MARIN,
    'magicalgirl__marin': YUJI_MAGICAL_GIRL_WITH_MARIN,
    'shojo__marin': YUJI_SHOJO_WITH_MARIN,
    'josei__marin': YUJI_JOSEI_WITH_MARIN,
    'sliceoflife__marin': YUJI_SLICE_WITH_MARIN,
    'sliceoflife__shinpachi': YUJI_SLICE_WITH_SHINPACHI,
    'idol__shinpachi': YUJI_IDOL_WITH_SHINPACHI,
    'music__shinpachi': YUJI_MUSIC_WITH_SHINPACHI,
    'isekai__ishigami': YUJI_ISEKAI_WITH_ISHIGAMI,
    'gaming__ishigami': YUJI_GAMING_WITH_ISHIGAMI,
    'mecha__kinta': YUJI_MECHA_WITH_KINTA,
  },
  marin: MARIN_WEAKNESS_TEMPLATES,
  shinpachi: SHINPACHI_WEAKNESS_TEMPLATES,
  rikka: RIKKA_WEAKNESS_TEMPLATES,
  ishigami: ISHIGAMI_WEAKNESS_TEMPLATES,
  kinta: KINTA_WEAKNESS_TEMPLATES,
  daru: DARU_WEAKNESS_TEMPLATES,
  ichikawa: ICHIKAWA_WEAKNESS_TEMPLATES,
  rudeus: RUDEUS_WEAKNESS_TEMPLATES,
  ainz: AINZ_WEAKNESS_TEMPLATES,
  kanbaru: KANBARU_WEAKNESS_TEMPLATES,
  bakugo: BAKUGO_WEAKNESS_TEMPLATES,
  veldora: VELDORA_WEAKNESS_TEMPLATES,
  kakashi: KAKASHI_WEAKNESS_TEMPLATES,
  king: KING_WEAKNESS_TEMPLATES,
};

export const getWeaknessPersonaLine = ({
  helperId,
  helperName,
  genre,
  buddyId,
  buddyNickname,
  hasChemistry,
  helperUserLabel,
  helperUserPronoun,
}: WeaknessPersonaContext): string => {
  const helperTemplates = HELPER_WEAKNESS_TEMPLATES[helperId];
  const normalizedGenre = normalizeKey(genre);
  const buddyKey = buddyId ? `${normalizedGenre}__${buddyId}` : undefined;
  const templateSet =
    (buddyKey && helperTemplates?.[buddyKey]) ||
    helperTemplates?.[normalizedGenre] ||
    helperTemplates?.default ||
    DEFAULT_TEMPLATE;

  const pool = hasChemistry ? templateSet.paired : templateSet.unpaired;
  const template = pool.length
    ? pickRandom(pool)
    : pickRandom(hasChemistry ? DEFAULT_TEMPLATE.paired : DEFAULT_TEMPLATE.unpaired);

  return renderTemplate(template, {
    helperName: helperName || helperId,
    helperUserLabel: helperUserLabel || 'our friend',
    helperUserPronoun: helperUserPronoun || 'them',
    buddyNickname: buddyNickname || 'my friend',
    genreSummary: humanizeGenre(genre),
  });
};

