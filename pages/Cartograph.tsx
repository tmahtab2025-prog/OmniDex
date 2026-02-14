import React, { useState } from 'react';
import { Search, MapPin, Navigation } from 'lucide-react';
import { fetchPokemonDetails, fetchPokemonEncounters } from '../services/pokeapi';
import { PokemonBase } from '../types';

interface Encounter {
  location_area: { name: string; url: string };
  version_details: Array<{
    max_chance: number;
    version: { name: string };
    encounter_details: Array<{
       min_level: number;
       max_level: number;
       method: { name: string };
       chance: number;
    }>;
  }>;
}

const Cartograph = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedMon, setSelectedMon] = useState<PokemonBase | null>(null);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setError('');
    setSelectedMon(null);
    setEncounters([]);

    try {
      const mon = await fetchPokemonDetails(query.toLowerCase());
      setSelectedMon(mon);

      const encounterData = await fetchPokemonEncounters(mon.id);
      setEncounters(encounterData);
      
      if (encounterData.length === 0) {
         setError(`No wild encounters found for ${mon.name}.`);
      }
    } catch (err) {
      setError('Pokémon not found.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-slate-900">
       
       {/* Background Map */}
       <div className="absolute inset-0 opacity-20 pointer-events-none">
          {/* A generic map placeholder pattern or image */}
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/e/ea/Kanto_region_map.png" 
            alt="Region Map" 
            className="w-full h-full object-cover grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
       </div>

       <div className="relative z-10 p-6 flex flex-col h-full max-w-5xl mx-auto w-full">
          <header className="mb-8 text-white">
             <h1 className="text-3xl font-bold flex items-center gap-3">
                <MapPin className="text-emerald-400" /> Cartograph
             </h1>
             <p className="text-slate-400">Locate Pokémon habitats across the region.</p>
          </header>

          <form onSubmit={handleSearch} className="mb-8 relative z-20">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Find Pokémon Location (e.g. Pikachu)"
                  className="w-full pl-12 pr-4 py-4 bg-slate-800/80 backdrop-blur-md border border-slate-700 text-white rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-xl"
                />
                <button 
                  type="submit"
                  disabled={loading}
                  className="absolute right-2 top-2 bottom-2 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                  {loading ? 'Scanning...' : 'Locate'}
                </button>
             </div>
          </form>

          {error && (
             <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-xl mb-6">
                {error}
             </div>
          )}

          {selectedMon && (
             <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-6">
                
                {/* Result Info */}
                <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 p-6 rounded-2xl md:w-1/3 flex flex-col items-center text-center shadow-xl">
                   <img src={selectedMon.spriteImage} alt={selectedMon.name} className="w-32 h-32 object-contain drop-shadow-2xl" />
                   <h2 className="text-2xl font-bold text-white capitalize mb-1">{selectedMon.name}</h2>
                   <div className="flex gap-2 justify-center mb-4">
                      {selectedMon.types.map(t => (
                         <span key={t} className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-white/10 text-slate-300 border border-white/10">{t}</span>
                      ))}
                   </div>
                   <div className="w-full h-px bg-slate-700 mb-4"></div>
                   <div className="text-left w-full">
                      <p className="text-slate-400 text-sm mb-2">Habitat Analysis:</p>
                      <p className="text-emerald-400 font-mono text-lg">{encounters.length} Areas Found</p>
                   </div>
                </div>

                {/* Locations List */}
                <div className="flex-1 bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-2xl overflow-hidden flex flex-col shadow-xl">
                   <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                      <h3 className="font-bold text-slate-200 flex items-center gap-2">
                         <Navigation size={16} /> Known Locations
                      </h3>
                   </div>
                   <div className="overflow-y-auto p-4 space-y-3 custom-scrollbar">
                      {encounters.length === 0 && !error ? (
                         <div className="text-center py-10 text-slate-500">
                            No wild encounter data available in this database.
                         </div>
                      ) : (
                         encounters.map((enc, i) => (
                            <div key={i} className="p-4 bg-slate-700/50 rounded-xl border border-slate-600 hover:border-emerald-500/50 transition-colors">
                               <h4 className="font-bold text-emerald-300 capitalize text-lg mb-2">
                                  {enc.location_area.name.replace(/-/g, ' ')}
                               </h4>
                               <div className="space-y-2">
                                  {enc.version_details.map((vd, j) => (
                                     <div key={j} className="flex flex-wrap items-center gap-2 text-xs">
                                        <span className="px-2 py-1 bg-slate-900 rounded text-slate-400 capitalize border border-slate-700">
                                           {vd.version.name}
                                        </span>
                                        <span className="text-slate-300">
                                           Chance: <b className="text-white">{vd.max_chance}%</b>
                                        </span>
                                        <span className="text-slate-500 mx-1">•</span>
                                        <div className="flex flex-wrap gap-1">
                                          {vd.encounter_details.slice(0, 3).map((ed, k) => (
                                             <span key={k} className="text-slate-400 italic">
                                                {ed.method.name} (Lvl {ed.min_level}-{ed.max_level})
                                             </span>
                                          ))}
                                        </div>
                                     </div>
                                  ))}
                               </div>
                            </div>
                         ))
                      )}
                   </div>
                </div>

             </div>
          )}
       </div>
    </div>
  );
};

export default Cartograph;
