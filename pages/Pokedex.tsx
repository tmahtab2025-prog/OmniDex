import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Search, Filter, Loader2 } from 'lucide-react';
import { PokemonBase } from '../types';
import { fetchPokemonList } from '../services/pokeapi';
import PokemonCard from '../components/PokemonCard';
import { useAppStore } from '../store';

const Pokedex = () => {
  const { pokedexCache, cacheMultiplePokemon, customPokemon } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 20;
  
  const observerTarget = useRef<HTMLDivElement>(null);

  // Combine Official and Custom Pokemon
  const allPokemon = useMemo(() => {
    const officials = Object.values(pokedexCache);
    return [...customPokemon, ...officials].sort((a, b) => {
        if (typeof a.id === 'string' && typeof b.id === 'number') return -1;
        if (typeof a.id === 'number' && typeof b.id === 'string') return 1;
        if (typeof a.id === 'number' && typeof b.id === 'number') return a.id - b.id;
        return 0;
    });
  }, [pokedexCache, customPokemon]);

  const loadMore = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const newPokemon = await fetchPokemonList(limit, offset);
      cacheMultiplePokemon(newPokemon);
      setOffset(prev => prev + limit);
    } catch (error) {
      console.error("Failed to load pokemon", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial Fetch if empty
  useEffect(() => {
    if (Object.keys(pokedexCache).length === 0) {
      loadMore();
    }
  }, []);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading && search === '') {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [observerTarget, loading, search, offset]); // Dependencies matter here

  const filteredPokemon = allPokemon.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.types.some(t => t.includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 h-full flex flex-col">
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Pokédex</h1>
          <p className="text-slate-500 mt-1">Explore and manage your collection</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
           <div className="relative group flex-1 md:flex-none">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" size={20} />
             <input 
               type="text" 
               placeholder="Search Pokémon or Type..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 w-full md:w-64 transition-all shadow-sm"
             />
           </div>
           <button className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 shadow-sm">
             <Filter size={20} />
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
        {filteredPokemon.map((pokemon) => (
          <PokemonCard key={`${pokemon.id}-${pokemon.name}`} pokemon={pokemon} />
        ))}
        
        {/* Sentinel for Infinite Scroll */}
        {search === '' && (
          <div ref={observerTarget} className="col-span-full h-20 flex items-center justify-center">
            {loading && (
              <div className="flex items-center gap-2 text-slate-500 bg-white px-4 py-2 rounded-full shadow-sm">
                <Loader2 className="animate-spin text-red-500" size={20} />
                <span className="font-medium text-sm">Catching more Pokémon...</span>
              </div>
            )}
          </div>
        )}
        
        {/* End of list message for search */}
        {search !== '' && filteredPokemon.length === 0 && (
           <div className="col-span-full text-center py-10 text-slate-400">
             <p>No Pokémon found matching "{search}"</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default Pokedex;
