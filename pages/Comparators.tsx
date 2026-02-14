import React, { useState } from 'react';
import { Search, Ruler, Scale as ScaleIcon } from 'lucide-react';
import { useUserStore } from '../userStore';
import { fetchPokemonDetails } from '../services/pokeapi';
import { PokemonBase } from '../types';

const Comparators = () => {
  const { trainerHeight, trainerWeight, avatar } = useUserStore();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [pokemon, setPokemon] = useState<PokemonBase | null>(null);
  const [mode, setMode] = useState<'height' | 'weight'>('height');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    try {
      const mon = await fetchPokemonDetails(query.toLowerCase());
      setPokemon(mon);
    } catch (err) {
      alert('Pokemon not found');
    } finally {
      setLoading(false);
    }
  };

  // Conversions
  // Pokemon Height: decimeters -> cm
  const monHeightCm = pokemon ? (pokemon.height || 0) * 10 : 0;
  // Pokemon Weight: hectograms -> kg
  const monWeightKg = pokemon ? (pokemon.weight || 0) / 10 : 0;

  // Visualization Logic for Height
  // We normalize to a max height of 400px in the view container
  const maxHeight = Math.max(trainerHeight, monHeightCm, 1);
  const scaleFactor = 300 / maxHeight; // 300px is visual max height
  
  const trainerVisualHeight = trainerHeight * scaleFactor;
  const monVisualHeight = monHeightCm * scaleFactor;

  // Visualization Logic for Weight (Balance Scale)
  const totalWeight = trainerWeight + monWeightKg;
  // Simple rotation logic: heavier side goes down
  // Max rotation 20deg
  let rotation = 0;
  if (totalWeight > 0) {
      const diff = monWeightKg - trainerWeight;
      // if diff is positive (mon heavier), rotate positive (right side down)
      // sigmoid-like clamp
      rotation = Math.max(-20, Math.min(20, diff * 0.5));
  }

  return (
    <div className="p-6 h-full flex flex-col max-w-5xl mx-auto">
      <header className="mb-8">
         <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ScaleIcon className="text-purple-600" /> Comparators
         </h1>
         <p className="text-slate-500 mt-1">Scientific size and mass analysis.</p>
      </header>

      {/* Search & Tabs */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
         <form onSubmit={handleSearch} className="flex-1 relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
             <input 
               type="text" 
               value={query}
               onChange={e => setQuery(e.target.value)}
               placeholder="Compare with..."
               className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none shadow-sm"
             />
         </form>
         <div className="bg-white p-1 rounded-xl border border-slate-200 flex shadow-sm">
            <button 
              onClick={() => setMode('height')}
              className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${mode === 'height' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:text-slate-900'}`}
            >
               <Ruler size={18} /> Height
            </button>
            <button 
              onClick={() => setMode('weight')}
              className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${mode === 'weight' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:text-slate-900'}`}
            >
               <ScaleIcon size={18} /> Weight
            </button>
         </div>
      </div>

      {/* Visualization Area */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col">
         
         <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-50 pointer-events-none"></div>

         <div className="flex-1 flex items-end justify-center gap-12 md:gap-32 pb-12 px-12 relative z-10">
            
            {mode === 'height' ? (
                <>
                   {/* Trainer */}
                   <div className="flex flex-col items-center group">
                      <div className="mb-4 bg-slate-900 text-white px-3 py-1 rounded-full text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                         {(trainerHeight / 100).toFixed(2)}m
                      </div>
                      <div 
                        style={{ height: `${Math.max(20, trainerVisualHeight)}px` }}
                        className="transition-all duration-500 flex items-end"
                      >
                         {/* Simple Silhouette using the avatar image but masked or filter could be used. For now, simple image */}
                         <img 
                           src={avatar} 
                           alt="Trainer" 
                           className="h-full w-auto object-contain brightness-0 opacity-80" 
                         />
                      </div>
                      <div className="mt-4 font-bold text-slate-700">You</div>
                   </div>

                   {/* Pokemon */}
                   {pokemon ? (
                       <div className="flex flex-col items-center group">
                          <div className="mb-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                             {(monHeightCm / 100).toFixed(2)}m
                          </div>
                          <div 
                             style={{ height: `${Math.max(20, monVisualHeight)}px` }}
                             className="transition-all duration-500 flex items-end"
                          >
                             <img 
                               src={pokemon.spriteImage} 
                               alt={pokemon.name} 
                               className="h-full w-auto object-contain drop-shadow-xl" 
                             />
                          </div>
                          <div className="mt-4 font-bold text-slate-700 capitalize">{pokemon.name}</div>
                       </div>
                   ) : (
                       <div className="text-slate-400 flex flex-col items-center justify-center h-40">
                          <span className="text-4xl mb-2">?</span>
                          <span>Select a Pokémon</span>
                       </div>
                   )}
                </>
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                    {/* Balance Scale Visualization */}
                    <div className="relative w-full max-w-lg h-64 mt-20">
                        {/* Pivot Stand */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-32 bg-slate-300 rounded-t-lg"></div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-4 bg-slate-300 rounded-full"></div>

                        {/* Beam Group - Rotates */}
                        <div 
                           className="absolute top-12 left-0 right-0 h-4 bg-slate-800 rounded-full transition-transform duration-1000 ease-in-out origin-center flex justify-between items-center"
                           style={{ transform: `rotate(${rotation}deg)` }}
                        >
                            {/* Left Plate (Trainer) */}
                            <div className="relative -top-8 w-24 h-24 flex flex-col items-center justify-end origin-bottom transition-transform duration-1000" style={{ transform: `rotate(${-rotation}deg)` }}>
                                <div className="absolute bottom-[-20px] w-32 h-1 bg-slate-400"></div>
                                <div className="absolute bottom-[-20px] w-1 h-20 bg-slate-400"></div>
                                <div className="absolute bottom-[-120px] w-32 h-4 bg-slate-800 rounded-b-3xl"></div> {/* The Pan */}
                                
                                <div className="absolute bottom-0 flex flex-col items-center">
                                   <img src={avatar} className="w-16 h-16 object-contain mb-2" />
                                   <span className="bg-slate-900 text-white text-xs px-2 py-1 rounded">{trainerWeight}kg</span>
                                </div>
                            </div>

                            {/* Right Plate (Pokemon) */}
                            <div className="relative -top-8 w-24 h-24 flex flex-col items-center justify-end origin-bottom transition-transform duration-1000" style={{ transform: `rotate(${-rotation}deg)` }}>
                                <div className="absolute bottom-[-20px] w-32 h-1 bg-slate-400"></div>
                                <div className="absolute bottom-[-20px] w-1 h-20 bg-slate-400"></div>
                                <div className="absolute bottom-[-120px] w-32 h-4 bg-slate-800 rounded-b-3xl"></div> {/* The Pan */}

                                {pokemon ? (
                                   <div className="absolute bottom-0 flex flex-col items-center">
                                      <img src={pokemon.spriteImage} className="w-20 h-20 object-contain mb-2" />
                                      <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded">{monWeightKg}kg</span>
                                   </div>
                                ) : (
                                   <div className="absolute bottom-4 text-slate-400">?</div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-24 text-center">
                       {pokemon && (
                          <p className="text-lg font-bold text-slate-700">
                             {monWeightKg > trainerWeight ? 'Heavier' : monWeightKg < trainerWeight ? 'Lighter' : 'Equal Mass'}
                          </p>
                       )}
                    </div>
                </div>
            )}

         </div>

         {/* Ground Line */}
         {mode === 'height' && <div className="h-4 bg-slate-100 w-full border-t border-slate-200"></div>}
      </div>
    </div>
  );
};

export default Comparators;
