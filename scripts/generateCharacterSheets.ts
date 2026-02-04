import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ASSISTANT_CHARACTERS } from '../data/characters.ts';
import { CHARACTER_EXPERTISE } from '../data/characterExpertise.ts';
import { CHARACTER_BUDDIES } from '../data/characterBuddies.ts';
import { SPECIALTIES } from '../data/characterSpecialties.ts';
import { HELPER_WEAKNESS_TEMPLATES } from '../archive/weaknessPersonaTemplates_2025-11-15.ts';
import { PAIR_OVERRIDES } from '../archive/referralDialogueTemplates_2025-11-15.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sheetsDir = path.resolve(__dirname, '../data/characterSheets');

const buildReferralChains = (override?: PairOverride) => {
  if (!override) return [];
  if (override.pairedScripts?.length) {
    return override.pairedScripts.map(script => ({
      helperIntro: script.helperIntro,
      handoffLine: script.handoffLine,
      targetReply: script.targetReply,
      targetPromise: script.targetPromise,
      acknowledgmentLine: script.acknowledgmentLine,
    }));
  }

  const helperExcuses = override.helperExcuses ?? [];
  const handoffPitches = override.handoffPitches ?? [];
  const targetReplies = override.targetReplies ?? [];
  const targetPromises = override.targetPromises ?? [];

  const maxLen = Math.max(
    helperExcuses.length,
    handoffPitches.length,
    targetReplies.length,
    targetPromises.length
  );
  if (maxLen === 0) return [];

  const pick = (arr: string[], idx: number) =>
    arr.length > 0 ? arr[idx % arr.length] : undefined;

  return Array.from({ length: maxLen }, (_, idx) => ({
    helperExcuse: pick(helperExcuses, idx),
    handoffPitch: pick(handoffPitches, idx),
    targetReply: pick(targetReplies, idx) ?? '',
    targetPromise: pick(targetPromises, idx) ?? '',
  }));
};

const toPascalCase = (value: string) =>
  value
    .split(/[-_]/)
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('');

const formatObjectLiteral = (data: unknown) =>
  JSON.stringify(data, null, 2)
    .replace(/"([^"]+)":/g, (_, key) => `${key}:`)
    .replace(/\\u2028|\\u2029/g, '');

async function main() {
  await fs.mkdir(sheetsDir, { recursive: true });

  const indexImports: string[] = [];
  const indexEntries: string[] = [];

  for (const character of ASSISTANT_CHARACTERS) {
    const { id } = character;
    const exportName = `${toPascalCase(id)}Sheet`;

    const expertiseEntry = CHARACTER_EXPERTISE.find(entry => entry.characterId === id);
    if (!expertiseEntry) {
      throw new Error(`Missing expertise for character "${id}".`);
    }

    const buddiesEntry = CHARACTER_BUDDIES.find(entry => entry.characterId === id);
    if (!buddiesEntry) {
      throw new Error(`Missing buddy configuration for character "${id}".`);
    }

    const specialties = SPECIALTIES.filter(entry => entry.characterId === id);
    const archivedWeaknessPersona = HELPER_WEAKNESS_TEMPLATES[id] ?? {};
    const archivedReferralOverrides = PAIR_OVERRIDES[id] ?? {};
  const referralChains = Object.fromEntries(
    Object.entries(archivedReferralOverrides).map(([targetId, override]) => [
      targetId,
      buildReferralChains(override),
    ])
  );

    const sheet = {
      id,
      profile: character,
      expertise: expertiseEntry.genres,
      buddies: buddiesEntry.buddies,
      specialties,
      archivedWeaknessPersona,
      archivedReferralOverrides,
    referralChains,
    };

    const sheetLiteral = formatObjectLiteral(sheet);
    const sheetContent = `import { CharacterSheet } from './types';

export const ${exportName}: CharacterSheet = ${sheetLiteral} as const;
`;

    await fs.writeFile(path.join(sheetsDir, `${id}.ts`), sheetContent, 'utf8');

    indexImports.push(`import { ${exportName} } from './${id}';`);
    indexEntries.push(`  ${id}: ${exportName},`);
  }

  const indexContent = `${indexImports.join('\n')}\n\nexport const CHARACTER_SHEETS = {\n${indexEntries.join(
    '\n'
  )}\n} as const;\n`;

  await fs.writeFile(path.join(sheetsDir, 'index.ts'), indexContent, 'utf8');

  console.log(`Generated ${ASSISTANT_CHARACTERS.length} character sheets in ${sheetsDir}`);
}

main().catch(error => {
  console.error('Failed to generate character sheets:');
  if (error instanceof Error) {
    console.error(error.stack || error.message);
  } else {
    console.error(error);
  }
  process.exit(1);
});

