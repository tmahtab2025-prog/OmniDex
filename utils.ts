import { NATURES } from './constants';
import { PokemonStats } from './types';

export const calculateStat = (
  statName: keyof PokemonStats,
  base: number,
  iv: number,
  ev: number,
  level: number,
  natureName: string
): number => {
  if (statName === 'hp') {
    // Standard HP Formula: ((2 * Base + IV + (EV/4)) * Level / 100) + Level + 10
    // Note: Shedinja is an exception (HP always 1), but we use the standard formula here for simplicity unless base is 1.
    if (base === 1) return 1;
    return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
  }

  // Other Stats Formula: ((2 * Base + IV + (EV/4)) * Level / 100 + 5) * Nature
  let stat = Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5;

  const nature = NATURES[natureName.toLowerCase()];
  if (nature) {
    if (nature.up === statName) stat = Math.floor(stat * 1.1);
    if (nature.down === statName) stat = Math.floor(stat * 0.9);
  }

  return stat;
};
