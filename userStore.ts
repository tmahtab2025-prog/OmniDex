import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UserState {
  trainerName: string;
  trainerId: string;
  avatar: string;
  trainerHeight: number; // in cm
  trainerWeight: number; // in kg
  setTrainerName: (name: string) => void;
  setAvatar: (url: string) => void;
  setTrainerStats: (height: number, weight: number) => void;
  generateTrainerId: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      trainerName: 'Trainer',
      trainerId: '000000',
      avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png', // Pikachu default
      trainerHeight: 170,
      trainerWeight: 70,
      
      setTrainerName: (name) => set({ trainerName: name }),
      setAvatar: (avatar) => set({ avatar }),
      setTrainerStats: (height, weight) => set({ trainerHeight: height, trainerWeight: weight }),
      generateTrainerId: () => set({ 
        trainerId: Math.floor(100000 + Math.random() * 900000).toString() 
      }),
    }),
    {
      name: 'poke-companion-user',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
