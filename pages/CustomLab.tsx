import React, { useState, useRef } from 'react';
import { useAppStore } from '../store';
import { CustomPokemon, PokemonStats, PokemonBase } from '../types';
import { TYPE_COLORS, STAT_LABELS } from '../constants';
import { Save, RefreshCw, Upload, Search, X, Import, Image as ImageIcon } from 'lucide-react';
import { fetchPokemonDetails } from '../services/pokeapi';

const CustomLab = () => {
  const { addCustomPokemon } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<CustomPokemon>>({
    name: '',
    types: ['normal'],
    stats: { hp: 50, atk: 50, def: 50, spa: 50, spd: 50, spe: 50 },
    abilities: [],
    spriteImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/132.png', // Ditto default
    category: '',
    pokedexEntry: '',
    moves: [],
  });

  const [notification, setNotification] = useState('');
  const [importSearch, setImportSearch] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [abilityInput, setAbilityInput] = useState('');

  const handleStatChange = (stat: keyof PokemonStats, value: number) => {
    setFormData(prev => ({
      ...prev,
      stats: { ...prev.stats!, [stat]: Number(value) }
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, spriteImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImportBase = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!importSearch) return;

    setImportLoading(true);
    try {
      const baseMon = await fetchPokemonDetails(importSearch.toLowerCase());
      setFormData(prev => ({
        ...prev,
        types: baseMon.types,
        stats: baseMon.stats,
        abilities: baseMon.abilities,
        spriteImage: baseMon.spriteImage,
        derivedFrom: typeof baseMon.id === 'number' ? baseMon.id : undefined,
        // We don't overwrite name usually, unless empty
        name: prev.name || baseMon.name, 
      }));
      setNotification(`Imported data from ${baseMon.name}!`);
      setTimeout(() => setNotification(''), 3000);
    } catch (error) {
      setNotification('Could not find Pokémon with that name/ID.');
      setTimeout(() => setNotification(''), 3000);
    } finally {
      setImportLoading(false);
    }
  };

  const handleAddAbility = () => {
    if (abilityInput && !formData.abilities?.includes(abilityInput)) {
      setFormData(prev => ({
        ...prev,
        abilities: [...(prev.abilities || []), abilityInput]
      }));
      setAbilityInput('');
    }
  };

  const handleRemoveAbility = (ability: string) => {
    setFormData(prev => ({
      ...prev,
      abilities: prev.abilities?.filter(a => a !== ability)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newMon: CustomPokemon = {
      ...formData as CustomPokemon,
      id: crypto.randomUUID(),
      isCustom: true,
      moves: [], // Moves would be handled in a more complex UI, empty for now
    };

    addCustomPokemon(newMon);
    setNotification(`Successfully created ${newMon.name}!`);
    setTimeout(() => setNotification(''), 3000);
    
    // Reset Form
    setFormData({
      name: '',
      types: ['normal'],
      stats: { hp: 50, atk: 50, def: 50, spa: 50, spd: 50, spe: 50 },
      abilities: [],
      spriteImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/132.png',
      category: '',
      pokedexEntry: '',
      moves: [],
    });
  };

  const statTotal: number = (Object.values(formData.stats || {}) as number[]).reduce((a: number, b) => a + Number(b), 0);
  const mainType = formData.types?.[0] || 'normal';

  return (
    <div className="p-6 max-w-6xl mx-auto">
       <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
             <span className="bg-purple-600 text-white p-2 rounded-lg text-xl">🧬</span>
             Custom Lab
          </h1>
          <p className="text-slate-500 mt-1">Synthesize new Pokémon data structures or modify existing genetic codes.</p>
        </header>

        {notification && (
          <div className={`mb-6 p-4 rounded-xl border animate-bounce-in flex items-center justify-between
            ${notification.includes('Could not') ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200'}`}>
            <span>{notification}</span>
            <button onClick={() => setNotification('')}><X size={16} /></button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Input Form */}
          <div className="lg:col-span-2 space-y-6">
             
             {/* Import Section */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                   <Import size={16} /> Import Base Data
                </h3>
                <form onSubmit={handleImportBase} className="flex gap-2">
                   <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        value={importSearch}
                        onChange={(e) => setImportSearch(e.target.value)}
                        placeholder="Enter Pokémon Name (e.g. Charizard)"
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                   </div>
                   <button 
                     type="submit" 
                     disabled={importLoading}
                     className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-medium disabled:opacity-50"
                   >
                     {importLoading ? 'Fetching...' : 'Import'}
                   </button>
                </form>
             </div>

             {/* Main Form */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                   
                   {/* Basic Info */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Name</label>
                       <input 
                         type="text" 
                         required
                         value={formData.name}
                         onChange={e => setFormData({...formData, name: e.target.value})}
                         className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                         placeholder="e.g. Mecha Pikachu"
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Types</label>
                       <div className="flex gap-2">
                          <select 
                            value={formData.types?.[0]}
                            onChange={e => setFormData({...formData, types: [e.target.value, formData.types?.[1] || '']})}
                            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none capitalize"
                          >
                            {Object.keys(TYPE_COLORS).map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                          {/* Optional Secondary Type - Simplified for demo to just primary or add more UI later */}
                       </div>
                     </div>
                   </div>

                   {/* Image Picker */}
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Sprite Appearance</label>
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="flex-1 w-full">
                           <div className="flex gap-2 mb-2">
                             <input 
                               type="text" 
                               value={formData.spriteImage}
                               onChange={e => setFormData({...formData, spriteImage: e.target.value})}
                               className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-xs"
                               placeholder="Image URL..."
                             />
                           </div>
                           <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">OR</span>
                              <input 
                                 type="file" 
                                 accept="image/*"
                                 ref={fileInputRef}
                                 onChange={handleImageUpload}
                                 className="hidden"
                              />
                              <button 
                                type="button" 
                                onClick={() => fileInputRef.current?.click()}
                                className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 text-xs font-bold flex items-center gap-2"
                              >
                                 <Upload size={14} /> Upload Image
                              </button>
                           </div>
                        </div>
                      </div>
                   </div>
                   
                   {/* Abilities */}
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Abilities</label>
                      <div className="flex gap-2 mb-3">
                         <input 
                           type="text"
                           value={abilityInput}
                           onChange={e => setAbilityInput(e.target.value)}
                           className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                           placeholder="Add Ability..."
                           onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddAbility())}
                         />
                         <button 
                           type="button" 
                           onClick={handleAddAbility}
                           className="px-4 py-2 bg-slate-800 text-white rounded-lg"
                         >
                            <Save size={16} />
                         </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                         {formData.abilities?.map(a => (
                            <span key={a} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium flex items-center gap-2">
                               {a}
                               <button type="button" onClick={() => handleRemoveAbility(a)} className="text-slate-400 hover:text-red-500">
                                  <X size={14} />
                               </button>
                            </span>
                         ))}
                         {(!formData.abilities || formData.abilities.length === 0) && (
                            <span className="text-sm text-slate-400 italic">No abilities added.</span>
                         )}
                      </div>
                   </div>

                   {/* Stats */}
                   <div>
                      <div className="flex justify-between items-end mb-4">
                         <label className="text-xs font-bold text-slate-500 uppercase">Base Stats</label>
                         <span className={`text-sm font-bold ${statTotal > 600 ? 'text-purple-600' : 'text-slate-400'}`}>
                           BST: {statTotal}
                         </span>
                      </div>
                      
                      <div className="space-y-4">
                        {(Object.keys(formData.stats!) as Array<keyof PokemonStats>).map(stat => (
                          <div key={stat} className="flex items-center gap-4">
                            <span className="w-12 text-xs font-bold text-slate-500 uppercase">{stat}</span>
                            <div className="flex-1 flex items-center gap-3">
                               <input 
                                  type="range" 
                                  min="1" max="255" 
                                  value={formData.stats![stat]}
                                  onChange={(e) => handleStatChange(stat, Number(e.target.value))}
                                  className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                               />
                               <input 
                                  type="number"
                                  min="1" max="255"
                                  value={formData.stats![stat]}
                                  onChange={(e) => handleStatChange(stat, Number(e.target.value))}
                                  className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-right font-mono text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                               />
                            </div>
                          </div>
                        ))}
                      </div>
                   </div>

                   {/* Flavor Text */}
                   <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Pokédex Entry</label>
                       <textarea 
                         rows={3}
                         value={formData.pokedexEntry}
                         onChange={e => setFormData({...formData, pokedexEntry: e.target.value})}
                         className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                         placeholder="A rare synthesized Pokémon..."
                       ></textarea>
                   </div>

                   <button 
                     type="submit"
                     className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all mt-4"
                   >
                     <Save size={20} />
                     Save to Laboratory
                   </button>
                </form>
             </div>
          </div>

          {/* Right Column: Preview */}
          <div className="lg:col-span-1">
             <div className="sticky top-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Live Preview</h3>
                <div 
                  className="rounded-3xl p-8 shadow-2xl relative overflow-hidden transition-all duration-500"
                  style={{ 
                    background: `linear-gradient(135deg, ${TYPE_COLORS[mainType]} 0%, ${TYPE_COLORS[mainType]}CC 100%)`,
                  }}
                >
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10"></div>
                    
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-48 h-48 relative mb-4">
                           <div className="absolute inset-0 bg-white/30 rounded-full blur-xl scale-75 animate-pulse"></div>
                           <img 
                             src={formData.spriteImage} 
                             alt="Preview" 
                             className="w-full h-full object-contain drop-shadow-2xl relative z-10"
                           />
                        </div>
                        
                        <h2 className="text-3xl font-bold text-white mb-2 text-center leading-tight drop-shadow-md">
                           {formData.name || '???'}
                        </h2>
                        
                        <div className="flex gap-2 mb-6">
                           {formData.types?.filter(Boolean).map(t => (
                              <span key={t} className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold backdrop-blur-md uppercase tracking-wide border border-white/20">
                                 {t}
                              </span>
                           ))}
                        </div>

                        <div className="w-full bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-lg">
                           <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3 tracking-wider">Base Stats</h4>
                           <div className="space-y-2">
                              {Object.entries(formData.stats!).map(([key, val]) => (
                                <div key={key} className="flex items-center gap-3 text-xs">
                                   <span className="w-8 uppercase font-bold text-slate-500">{key}</span>
                                   <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{ 
                                          width: `${Math.min(100, (Number(val) / 255) * 100)}%`,
                                          backgroundColor: TYPE_COLORS[mainType] || '#777'
                                        }}
                                      ></div>
                                   </div>
                                   <span className="w-6 text-right font-bold text-slate-700">{val}</span>
                                </div>
                              ))}
                           </div>
                        </div>

                        {formData.derivedFrom && (
                           <div className="mt-4 px-3 py-1 bg-black/20 rounded-full text-[10px] text-white/80 font-medium">
                              DNA Derived from ID: #{formData.derivedFrom}
                           </div>
                        )}
                    </div>
                </div>
             </div>
          </div>
        </div>
    </div>
  );
};

export default CustomLab;