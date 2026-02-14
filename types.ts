
export interface PokemonStats {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

export interface PokemonBase {
  id: number | string; // Number for API, UUID string for Custom
  name: string;
  types: string[];
  stats: PokemonStats;
  abilities: string[];
  spriteImage: string;
  height?: number;
  weight?: number;
}

export interface PokemonMove {
  name: string;
  levelLearnedAt: number;
  learnMethod: string;
  type?: string;
  accuracy?: number;
  power?: number;
}

export interface MoveDetailed {
  id: number;
  name: string;
  type: string;
  power: number | null;
  accuracy: number | null;
  pp: number;
  damageClass: string;
  flavorText: string;
}

export interface AbilityDetailed {
  id: number;
  name: string;
  effect: string;
  pokemonCount: number;
}

export interface EvolutionStage {
  speciesId: string;
  name: string;
  imageUrl: string;
  minLevel?: number;
  trigger?: string;
  item?: string;
  evolvesTo: EvolutionStage[];
}

export interface PokemonDetailed extends PokemonBase {
  movesList: PokemonMove[];
  flavorText: string;
  evolutionChain?: EvolutionStage;
  category?: string;
}

export interface CustomPokemon extends PokemonBase {
  isCustom: true;
  derivedFrom?: number;
  category: string;
  pokedexEntry: string;
  moves: string[];
}

export interface TeamMember {
  slotId: number; // 0-5
  pokemonData: PokemonBase | CustomPokemon | null;
  nickname: string;
  level: number;
  item: string;
  ability: string;
  moves: [string, string, string, string];
  ivs: PokemonStats;
  evs: PokemonStats;
  nature: string;
}

export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
}

export interface PokeApiResponse {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
  types: Array<{ type: { name: string } }>;
  stats: Array<{ base_stat: number; stat: { name: string } }>;
  abilities: Array<{ ability: { name: string } }>;
  height: number;
  weight: number;
  moves?: Array<{
    move: { name: string; url: string };
    version_group_details: Array<{
      level_learned_at: number;
      move_learn_method: { name: string };
    }>;
  }>;
}

export type TypeName = 
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice'
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug'
  | 'rock' | 'ghost' | 'dragon' | 'steel' | 'dark' | 'fairy';
