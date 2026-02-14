import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Ruler, Weight, Sparkles, ChevronRight, Swords, Activity, Dna, ScrollText } from 'lucide-react';
import { useAppStore } from '../store';
import { fetchPokemonDetails, fetchPokemonSpecies, fetchEvolutionChain, fetchPokemonMoves } from '../services/pokeapi';
import { PokemonBase, PokemonDetailed, EvolutionStage } from '../types';
import { TYPE_COLORS } from '../constants';

const PokemonDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pokedexCache, favorites, toggleFavorite, customPokemon } = useAppStore();
  
  const [pokemon, setPokemon] = useState<PokemonDetailed | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'stats' | 'evolution' | 'moves'>('about');

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setLoading(true);

      try {
        // 1. Check custom pokemon first
        const custom = customPokemon.find(p => p.id.toString() === id);
        if (custom) {
          setPokemon({
            ...custom,
            movesList: [],
            flavorText: custom.pokedexEntry,
          });
          setLoading(false);
          return;
        }

        // 2. Fetch Base Data (or use cache)
        let baseData: PokemonBase = pokedexCache[id];
        if (!baseData) {
          baseData = await fetchPokemonDetails(id);
        }

        // 3. Fetch Extra Data (Species, Evo, Moves)
        // We do this in parallel for speed
        const [speciesData, movesData] = await Promise.all([
          fetchPokemonSpecies(id),
          fetchPokemonMoves(id)
        ]);

        let evolutionChain;
        if (speciesData.evolutionChainUrl) {
           evolutionChain = await fetchEvolutionChain(speciesData.evolutionChainUrl);
        }

        setPokemon({
          ...baseData,
          flavorText: speciesData.flavorText,
          category: speciesData.category,
          evolutionChain,
          movesList: movesData
        });

      } catch (error) {
        console.error("Failed to load pokemon detail", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, pokedexCache, customPokemon]);

  if (loading || !pokemon) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  const isFavorite = favorites.includes(pokemon.id);
  const mainType = pokemon.types[0];
  const themeColor = TYPE_COLORS[mainType] || '#A8A878';

  const EvolutionNode: React.FC<{ stage: EvolutionStage }> = ({ stage }) => (
    <div className="flex flex-col items-center">
      <div 
        onClick={() => navigate(`/pokemon/${stage.speciesId}`)}
        className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-2 border-2 border-white shadow-md cursor-pointer hover:border-blue-400 transition-colors"
      >
        <img src={stage.imageUrl} alt={stage.name} className="w-20 h-20 object-contain" />
      </div>
      <span className="font-bold capitalize text-slate-700">{stage.name}</span>
      {stage.minLevel && <span className="text-xs text-slate-500">Lvl {stage.minLevel}</span>}
      {stage.item && <span className="text-xs text-slate-500 capitalize">{stage.item.replace('-', ' ')}</span>}
      {stage.trigger && stage.trigger !== 'level-up' && <span className="text-xs text-slate-500 capitalize">{stage.trigger.replace('-', ' ')}</span>}
    </div>
  );

  const RecursiveEvolution: React.FC<{ stage: EvolutionStage }> = ({ stage }) => {
    if (!stage.evolvesTo || stage.evolvesTo.length === 0) {
      return <EvolutionNode stage={stage} />;
    }

    return (
      <div className="flex items-center gap-4">
        <EvolutionNode stage={stage} />
        <ChevronRight className="text-slate-300" />
        <div className="flex flex-col gap-8">
          {stage.evolvesTo.map((nextStage, idx) => (
             <RecursiveEvolution key={idx} stage={nextStage} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-slate-50 overflow-y-auto">
      {/* Header / Hero */}
      <div 
        className="relative pb-12 pt-6 px-6 rounded-b-[3rem] shadow-xl overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}CC 100%)` }}
      >
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 text-white/10 -mt-10 -mr-10">
          <Sparkles size={300} strokeWidth={0.5} />
        </div>

        <nav className="relative z-10 flex justify-between items-center mb-6">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-md transition-colors">
            <ArrowLeft size={24} />
          </button>
          <button 
             onClick={() => toggleFavorite(pokemon.id)}
             className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-md transition-colors"
          >
             <Heart size={24} className={isFavorite ? 'fill-red-500 text-red-500' : ''} />
          </button>
        </nav>

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 max-w-4xl mx-auto">
           <div className="relative w-48 h-48 md:w-64 md:h-64">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
              <img 
                src={pokemon.spriteImage} 
                alt={pokemon.name} 
                className="w-full h-full object-contain drop-shadow-2xl relative z-10"
              />
           </div>
           
           <div className="text-center md:text-left text-white">
              <div className="flex items-center justify-center md:justify-start gap-3 opacity-90 font-mono font-bold mb-2">
                 <span>#{typeof pokemon.id === 'number' ? pokemon.id.toString().padStart(3, '0') : 'CUST'}</span>
                 {pokemon.category && <span>• {pokemon.category}</span>}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold capitalize mb-4 drop-shadow-md">{pokemon.name}</h1>
              <div className="flex gap-2 justify-center md:justify-start">
                 {pokemon.types.map(t => (
                   <span 
                     key={t} 
                     className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full font-bold uppercase tracking-wider text-sm border border-white/30 shadow-lg"
                   >
                     {t}
                   </span>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto -mt-8 relative z-20 px-4 pb-20">
         <div className="bg-white rounded-3xl shadow-sm border border-slate-100 min-h-[500px] overflow-hidden">
            
            {/* Tabs */}
            <div className="flex border-b border-slate-100 overflow-x-auto">
               {[
                 { id: 'about', label: 'About', icon: Activity },
                 { id: 'stats', label: 'Base Stats', icon: Activity },
                 { id: 'evolution', label: 'Evolution', icon: Dna },
                 { id: 'moves', label: 'Moves', icon: Swords },
               ].map((tab) => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id as any)}
                   className={`flex-1 py-4 px-6 font-medium text-sm md:text-base flex items-center justify-center gap-2 transition-all whitespace-nowrap
                     ${activeTab === tab.id 
                       ? 'text-slate-800 border-b-2' 
                       : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                   style={{ borderColor: activeTab === tab.id ? themeColor : 'transparent' }}
                 >
                   <tab.icon size={18} /> {tab.label}
                 </button>
               ))}
            </div>

            {/* Tab Panels */}
            <div className="p-6 md:p-8">
               {activeTab === 'about' && (
                 <div className="space-y-8 animate-in fade-in duration-300">
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg mb-3 flex items-center gap-2">
                        <ScrollText className="text-slate-400" size={20} /> Pokedex Entry
                      </h3>
                      <p className="text-slate-600 leading-relaxed text-lg italic">
                        "{pokemon.flavorText}"
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-6 rounded-2xl">
                       <div className="flex flex-col gap-1">
                          <span className="text-slate-400 text-sm font-medium flex items-center gap-2">
                            <Ruler size={16} /> Height
                          </span>
                          <span className="text-slate-800 font-bold text-xl">{(pokemon.height || 0) / 10} m</span>
                       </div>
                       <div className="flex flex-col gap-1">
                          <span className="text-slate-400 text-sm font-medium flex items-center gap-2">
                            <Weight size={16} /> Weight
                          </span>
                          <span className="text-slate-800 font-bold text-xl">{(pokemon.weight || 0) / 10} kg</span>
                       </div>
                    </div>

                    <div>
                       <h3 className="font-bold text-slate-800 text-lg mb-3">Abilities</h3>
                       <div className="flex flex-wrap gap-2">
                         {pokemon.abilities.map(ability => (
                           <div key={ability} className="px-4 py-2 bg-slate-100 rounded-lg text-slate-700 capitalize font-medium border border-slate-200">
                             {ability.replace('-', ' ')}
                           </div>
                         ))}
                       </div>
                    </div>
                 </div>
               )}

               {activeTab === 'stats' && (
                 <div className="space-y-6 animate-in fade-in duration-300">
                    {(Object.entries(pokemon.stats) as [string, number][]).map(([key, val]) => (
                      <div key={key} className="flex items-center gap-4">
                        <span className="w-20 text-sm font-bold text-slate-500 uppercase">{key}</span>
                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                           <div 
                             className="h-full rounded-full"
                             style={{ 
                               width: `${(val / 255) * 100}%`,
                               backgroundColor: val > 100 ? '#22c55e' : val > 60 ? '#eab308' : '#ef4444'
                             }}
                           ></div>
                        </div>
                        <span className="w-10 text-right font-bold text-slate-800">{val}</span>
                      </div>
                    ))}
                    <div className="pt-6 border-t border-slate-100 mt-6">
                       <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
                          <span className="font-bold text-slate-600">Total Base Stats</span>
                          <span className="text-2xl font-bold text-slate-900">
                            {(Object.values(pokemon.stats) as number[]).reduce((a, b) => a + b, 0)}
                          </span>
                       </div>
                    </div>
                 </div>
               )}

               {activeTab === 'evolution' && (
                 <div className="flex flex-col items-center justify-center min-h-[300px] animate-in fade-in duration-300 overflow-x-auto">
                    {pokemon.evolutionChain ? (
                       <RecursiveEvolution stage={pokemon.evolutionChain} />
                    ) : (
                       <p className="text-slate-400">No evolution data available.</p>
                    )}
                 </div>
               )}

               {activeTab === 'moves' && (
                 <div className="animate-in fade-in duration-300">
                    <div className="overflow-hidden rounded-xl border border-slate-200">
                       <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 text-slate-500 font-medium">
                             <tr>
                               <th className="px-4 py-3">Level</th>
                               <th className="px-4 py-3">Move</th>
                               <th className="px-4 py-3">Method</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                             {pokemon.movesList?.slice(0, 50).map((move, i) => (
                               <tr key={i} className="hover:bg-slate-50">
                                 <td className="px-4 py-3 font-mono text-slate-500">
                                   {move.levelLearnedAt === 0 ? '-' : move.levelLearnedAt}
                                 </td>
                                 <td className="px-4 py-3 font-bold text-slate-800 capitalize">
                                   {move.name.replace('-', ' ')}
                                 </td>
                                 <td className="px-4 py-3 text-slate-500 capitalize">
                                   {move.learnMethod.replace('-', ' ')}
                                 </td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                       {pokemon.movesList && pokemon.movesList.length > 50 && (
                          <div className="p-4 text-center text-slate-400 text-xs">
                             Showing first 50 moves.
                          </div>
                       )}
                       {(!pokemon.movesList || pokemon.movesList.length === 0) && (
                          <div className="p-8 text-center text-slate-400">
                             No move data available.
                          </div>
                       )}
                    </div>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default PokemonDetail;