import { TypeName } from './types';

export const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  steel: '#B7B7CE',
  dark: '#705746',
  fairy: '#D685AD',
};

export const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  atk: 'Attack',
  def: 'Defense',
  spa: 'Sp. Atk',
  spd: 'Sp. Def',
  spe: 'Speed',
};

export const INITIAL_TEAM_MEMBER_TEMPLATE = {
  nickname: '',
  level: 50,
  item: '',
  ability: '',
  moves: ['', '', '', ''] as [string, string, string, string],
  ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
  evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
  nature: 'Serious',
};

export interface NatureModifier {
  up?: string;
  down?: string;
}

export const NATURES: Record<string, NatureModifier> = {
  hardy: {},
  lonely: { up: 'atk', down: 'def' },
  brave: { up: 'atk', down: 'spe' },
  adamant: { up: 'atk', down: 'spa' },
  naughty: { up: 'atk', down: 'spd' },
  bold: { up: 'def', down: 'atk' },
  docile: {},
  relaxed: { up: 'def', down: 'spe' },
  impish: { up: 'def', down: 'spa' },
  lax: { up: 'def', down: 'spd' },
  timid: { up: 'spe', down: 'atk' },
  hasty: { up: 'spe', down: 'def' },
  serious: {},
  jolly: { up: 'spe', down: 'spa' },
  naive: { up: 'spe', down: 'spd' },
  modest: { up: 'spa', down: 'atk' },
  mild: { up: 'spa', down: 'def' },
  quiet: { up: 'spa', down: 'spe' },
  bashful: {},
  rash: { up: 'spa', down: 'spd' },
  calm: { up: 'spd', down: 'atk' },
  gentle: { up: 'spd', down: 'def' },
  sassy: { up: 'spd', down: 'spe' },
  careful: { up: 'spd', down: 'spa' },
  quirky: {},
};
