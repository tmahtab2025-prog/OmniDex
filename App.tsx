import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Pokedex from './pages/Pokedex';
import TeamBuilder from './pages/TeamBuilder';
import CustomLab from './pages/CustomLab';
import PokemonDetail from './pages/PokemonDetail';
import Cartograph from './pages/Cartograph';
import Comparators from './pages/Comparators';
import MoveDex from './pages/MoveDex';
import AbilityDex from './pages/AbilityDex';
import Settings from './pages/Settings';
import { useAppStore } from './store';
import { useUserStore } from './userStore';
import PokemonCard from './components/PokemonCard';

const Favorites = () => {
  const { favorites, pokedexCache, customPokemon } = useAppStore();
  const allPokemon = [...Object.values(pokedexCache), ...customPokemon];
  const favPokemon = allPokemon.filter(p => favorites.includes(p.id));

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Favorites</h1>
      {favPokemon.length === 0 ? (
        <p className="text-slate-500">No favorites marked yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {favPokemon.map(p => <PokemonCard key={p.id} pokemon={p} />)}
        </div>
      )}
    </div>
  );
}

const App = () => {
  return (
    <HashRouter>
      <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto w-full pt-16 lg:pt-0">
          <Routes>
            <Route path="/" element={<Pokedex />} />
            <Route path="/pokemon/:id" element={<PokemonDetail />} />
            <Route path="/team-builder" element={<TeamBuilder />} />
            <Route path="/custom-lab" element={<CustomLab />} />
            <Route path="/move-dex" element={<MoveDex />} />
            <Route path="/ability-dex" element={<AbilityDex />} />
            <Route path="/cartograph" element={<Cartograph />} />
            <Route path="/comparators" element={<Comparators />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
