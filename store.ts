import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CustomPokemon, Team, PokemonBase, TeamMember } from './types';

interface AppState {
  favorites: (number | string)[]; // IDs
  customPokemon: CustomPokemon[];
  teams: Team[];
  box: (TeamMember | null)[]; // Array of 30 slots
  pokedexCache: Record<string, PokemonBase>; // Cache fetched mons
  
  toggleFavorite: (id: number | string) => void;
  addCustomPokemon: (mon: CustomPokemon) => void;
  deleteCustomPokemon: (id: string) => void;
  addTeam: (team: Team) => void;
  updateTeam: (team: Team) => void;
  deleteTeam: (id: string) => void;
  updateBoxSlot: (slotId: number, member: TeamMember | null) => void;
  cachePokemon: (pokemon: PokemonBase) => void;
  cacheMultiplePokemon: (pokemonList: PokemonBase[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      favorites: [],
      customPokemon: [],
      teams: [],
      box: Array(30).fill(null),
      pokedexCache: {},

      toggleFavorite: (id) => set((state) => {
        const isFav = state.favorites.includes(id);
        return {
          favorites: isFav 
            ? state.favorites.filter(favId => favId !== id)
            : [...state.favorites, id]
        };
      }),

      addCustomPokemon: (mon) => set((state) => ({
        customPokemon: [...state.customPokemon, mon]
      })),

      deleteCustomPokemon: (id) => set((state) => ({
        customPokemon: state.customPokemon.filter(p => p.id !== id)
      })),

      addTeam: (team) => set((state) => ({
        teams: [...state.teams, team]
      })),

      updateTeam: (team) => set((state) => ({
        teams: state.teams.map(t => t.id === team.id ? team : t)
      })),

      deleteTeam: (id) => set((state) => ({
        teams: state.teams.filter(t => t.id !== id)
      })),

      updateBoxSlot: (slotId, member) => set((state) => {
        const newBox = [...state.box];
        if (slotId >= 0 && slotId < 30) {
          newBox[slotId] = member;
        }
        return { box: newBox };
      }),

      cachePokemon: (pokemon) => set((state) => ({
        pokedexCache: { ...state.pokedexCache, [pokemon.id]: pokemon }
      })),

      cacheMultiplePokemon: (pokemonList) => set((state) => {
        const newCache = { ...state.pokedexCache };
        pokemonList.forEach(p => {
          newCache[p.id] = p;
        });
        return { pokedexCache: newCache };
      }),
    }),
    {
      name: 'poke-companion-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
