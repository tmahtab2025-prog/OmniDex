import { PokemonBase, PokeApiResponse, PokemonDetailed, EvolutionStage, PokemonMove, MoveDetailed, AbilityDetailed } from '../types';

const BASE_URL = 'https://pokeapi.co/api/v2';

export const fetchPokemonList = async (limit = 50, offset = 0): Promise<PokemonBase[]> => {
  const response = await fetch(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
  const data = await response.json();
  
  const promises = data.results.map(async (result: { name: string; url: string }) => {
    const res = await fetch(result.url);
    const json: PokeApiResponse = await res.json();
    return transformApiPokemon(json);
  });

  return Promise.all(promises);
};

export const fetchPokemonDetails = async (id: number | string): Promise<PokemonBase> => {
  const response = await fetch(`${BASE_URL}/pokemon/${id}`);
  const json: PokeApiResponse = await response.json();
  return transformApiPokemon(json);
};

export const fetchPokemonSpecies = async (id: number | string): Promise<{ flavorText: string; evolutionChainUrl: string; category: string }> => {
  const response = await fetch(`${BASE_URL}/pokemon-species/${id}`);
  const data = await response.json();
  
  const flavorTextEntry = data.flavor_text_entries.find((entry: any) => entry.language.name === 'en');
  const generaEntry = data.genera.find((entry: any) => entry.language.name === 'en');

  return {
    flavorText: flavorTextEntry ? flavorTextEntry.flavor_text.replace(/\f/g, ' ') : 'No description available.',
    evolutionChainUrl: data.evolution_chain.url,
    category: generaEntry ? generaEntry.genus : 'Pokemon',
  };
};

export const fetchEvolutionChain = async (url: string): Promise<EvolutionStage> => {
  const response = await fetch(url);
  const data = await response.json();
  return parseEvolutionChain(data.chain);
};

export const fetchPokemonMoves = async (id: number | string): Promise<PokemonMove[]> => {
    const response = await fetch(`${BASE_URL}/pokemon/${id}`);
    const data: PokeApiResponse = await response.json();
    
    if (!data.moves) return [];

    return data.moves.map(m => ({
        name: m.move.name,
        levelLearnedAt: m.version_group_details[0].level_learned_at,
        learnMethod: m.version_group_details[0].move_learn_method.name,
    })).sort((a, b) => a.levelLearnedAt - b.levelLearnedAt);
}

export const fetchPokemonEncounters = async (id: number | string): Promise<any[]> => {
  const response = await fetch(`${BASE_URL}/pokemon/${id}/encounters`);
  return response.json();
};

// --- Moves ---

export const fetchMovesByDamageClass = async (damageClassId: number): Promise<{name: string, url: string}[]> => {
  // 1: status, 2: physical, 3: special
  const response = await fetch(`${BASE_URL}/move-damage-class/${damageClassId}`);
  const data = await response.json();
  return data.moves;
};

export const fetchMoveDetails = async (name: string): Promise<MoveDetailed> => {
  const response = await fetch(`${BASE_URL}/move/${name}`);
  const data = await response.json();
  
  const flavorText = data.flavor_text_entries.find((e: any) => e.language.name === 'en')?.flavor_text || '';

  return {
    id: data.id,
    name: data.name,
    type: data.type.name,
    power: data.power,
    accuracy: data.accuracy,
    pp: data.pp,
    damageClass: data.damage_class.name,
    flavorText: flavorText.replace(/\n/g, ' '),
  };
};

// --- Abilities ---

export const fetchAbilitiesList = async (limit = 50, offset = 0): Promise<{name: string, url: string}[]> => {
  const response = await fetch(`${BASE_URL}/ability?limit=${limit}&offset=${offset}`);
  const data = await response.json();
  return data.results;
};

export const fetchAbilityDetails = async (name: string): Promise<AbilityDetailed> => {
  const response = await fetch(`${BASE_URL}/ability/${name}`);
  const data = await response.json();
  
  const effectEntry = data.effect_entries.find((e: any) => e.language.name === 'en');
  
  return {
    id: data.id,
    name: data.name,
    effect: effectEntry ? effectEntry.short_effect : 'No description.',
    pokemonCount: data.pokemon.length,
  };
};


const parseEvolutionChain = (chain: any): EvolutionStage => {
  const speciesUrl = chain.species.url;
  const speciesId = speciesUrl.split('/').filter(Boolean).pop();
  
  return {
    speciesId,
    name: chain.species.name,
    imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${speciesId}.png`,
    minLevel: chain.evolution_details?.[0]?.min_level,
    trigger: chain.evolution_details?.[0]?.trigger?.name,
    item: chain.evolution_details?.[0]?.item?.name,
    evolvesTo: chain.evolves_to.map(parseEvolutionChain),
  };
};

const transformApiPokemon = (apiMon: PokeApiResponse): PokemonBase => {
  return {
    id: apiMon.id,
    name: apiMon.name,
    types: apiMon.types.map(t => t.type.name),
    stats: {
      hp: apiMon.stats.find(s => s.stat.name === 'hp')?.base_stat || 0,
      atk: apiMon.stats.find(s => s.stat.name === 'attack')?.base_stat || 0,
      def: apiMon.stats.find(s => s.stat.name === 'defense')?.base_stat || 0,
      spa: apiMon.stats.find(s => s.stat.name === 'special-attack')?.base_stat || 0,
      spd: apiMon.stats.find(s => s.stat.name === 'special-defense')?.base_stat || 0,
      spe: apiMon.stats.find(s => s.stat.name === 'speed')?.base_stat || 0,
    },
    abilities: apiMon.abilities.map(a => a.ability.name),
    spriteImage: apiMon.sprites.other['official-artwork'].front_default || apiMon.sprites.front_default,
    height: apiMon.height,
    weight: apiMon.weight,
  };
};
