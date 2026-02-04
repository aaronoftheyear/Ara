import { DaruSheet } from './daru';
import { RikkaSheet } from './rikka';
import { MarinSheet } from './marin';
import { ShinpachiSheet } from './shinpachi';
import { IshigamiSheet } from './ishigami';
import { AinzSheet } from './ainz';
import { KintaSheet } from './kinta';
import { VeldoraSheet } from './veldora';
import { IchikawaSheet } from './ichikawa';
import { KakashiSheet } from './kakashi';
import { YujiSheet } from './yuji';
import { BakugoSheet } from './bakugo';
import { KanbaruSheet } from './kanbaru';
import { RudeusSheet } from './rudeus';
import { KingSheet } from './king';
import { KonataSheet } from './konata';

export const CHARACTER_SHEETS = {
  daru: DaruSheet,
  rikka: RikkaSheet,
  marin: MarinSheet,
  shinpachi: ShinpachiSheet,
  ishigami: IshigamiSheet,
  ainz: AinzSheet,
  kinta: KintaSheet,
  veldora: VeldoraSheet,
  ichikawa: IchikawaSheet,
  kakashi: KakashiSheet,
  yuji: YujiSheet,
  bakugo: BakugoSheet,
  kanbaru: KanbaruSheet,
  rudeus: RudeusSheet,
  king: KingSheet,
  konata: KonataSheet,
} as const;
