import React, { useState, useEffect, useMemo } from 'react';
import { TeamMember, PokemonMove, PokemonStats } from '../types';
import { NATURES, STAT_LABELS } from '../constants';
import { calculateStat } from '../utils';
import { fetchPokemonMoves, fetchPokemonDetails } from '../services/pokeapi';
import { X, Save, ChevronDown, ChevronUp, Zap, Shield, Heart, Swords, Wind, Activity } from 'lucide-react';

interface TeamMemberEditorProps {
  member: TeamMember;
  onSave: (member: TeamMember) => void;
  onClose: () => void;
}

interface StatRowProps {
  stat: keyof PokemonStats;
  iv: number;
  ev: number;
  total: number;
  onIvChange: (val: number) => void;
  onEvChange: (val: number) => void;
}

const StatRow: React.FC<StatRowProps> = ({ stat, iv, ev, total, onIvChange, onEvChange }) => {
   const iconMap: Record<string, any> = {
       hp: Heart, atk: Swords, def: Shield, spa: Zap, spd: Activity, spe: Wind
   };
   const Icon = iconMap[stat];
   
   return (
     <div className="flex items-center gap-4 py-2 border-b border-slate-100 last:border-0">
        <div className="w-24 flex items-center gap-2 text-slate-500 font-medium uppercase text-xs">
           <Icon size={14} /> {stat}
        </div>
        
        <div className="flex-1 grid grid-cols-2 gap-4">
           <div className="flex flex-col">
              <label className="text-[10px] text-slate-400">IV (0-31)</label>
              <input 
                type="range" min="0" max="31" 
                value={iv} 
                onChange={e => onIvChange(Number(e.target.value))}
                className="accent-purple-500 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs font-mono text-right">{iv}</span>
           </div>
           <div className="flex flex-col">
              <label className="text-[10px] text-slate-400">EV (0-252)</label>
              <input 
                type="number" min="0" max="252" 
                value={ev} 
                onChange={e => onEvChange(Math.min(252, Math.max(0, Number(e.target.value))))}
                className="w-full text-xs border border-slate-200 rounded px-1 py-0.5"
              />
           </div>
        </div>
        
        <div className="w-16 text-right font-bold text-slate-800 text-sm">
           {total}
        </div>
     </div>
   );
};

const TeamMemberEditor: React.FC<TeamMemberEditorProps> = ({ member, onSave, onClose }) => {
  const [editedMember, setEditedMember] = useState<TeamMember>(member);
  const [activeTab, setActiveTab] = useState<'profile' | 'stats' | 'moves'>('profile');
  const [availableMoves, setAvailableMoves] = useState<PokemonMove[]>([]);
  const [availableAbilities, setAvailableAbilities] = useState<string[]>([]);
  const [loadingExtra, setLoadingExtra] = useState(false);

  // Fetch moves and abilities if missing
  useEffect(() => {
    const loadExtras = async () => {
      if (!member.pokemonData) return;
      setLoadingExtra(true);
      try {
        const moves = await fetchPokemonMoves(member.pokemonData.id);
        setAvailableMoves(moves);

        // If base data doesn't have detailed info, fetch it (mostly for abilities if needed, though Base has them usually)
        if (member.pokemonData.abilities) {
           setAvailableAbilities(member.pokemonData.abilities);
        } else {
           const details = await fetchPokemonDetails(member.pokemonData.id);
           setAvailableAbilities(details.abilities);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingExtra(false);
      }
    };
    loadExtras();
  }, [member.pokemonData?.id]);

  if (!editedMember.pokemonData) return null;

  const handleStatChange = (type: 'ivs' | 'evs', stat: keyof PokemonStats, val: number) => {
    const newStats = { ...editedMember[type] };
    newStats[stat] = val;
    setEditedMember({ ...editedMember, [type]: newStats });
  };

  const calculatedStats = useMemo(() => {
    const stats = {} as PokemonStats;
    (Object.keys(STAT_LABELS) as Array<keyof PokemonStats>).forEach(key => {
      stats[key] = calculateStat(
        key,
        editedMember.pokemonData!.stats[key],
        editedMember.ivs[key],
        editedMember.evs[key],
        editedMember.level,
        editedMember.nature
      );
    });
    return stats;
  }, [editedMember.pokemonData, editedMember.ivs, editedMember.evs, editedMember.level, editedMember.nature]);

  const totalEvs = (Object.values(editedMember.evs) as number[]).reduce((a: number, b: number) => a + b, 0);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
       <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
          
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-3">
                <img src={editedMember.pokemonData.spriteImage} className="w-12 h-12 bg-white/10 rounded-full" />
                <div>
                   <h2 className="font-bold text-lg">{editedMember.nickname || editedMember.pokemonData.name}</h2>
                   <p className="text-xs text-slate-400">Lvl {editedMember.level} • {editedMember.pokemonData.name}</p>
                </div>
             </div>
             <div className="flex items-center gap-2">
               <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg"><X size={20} /></button>
             </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50 shrink-0">
             {['profile', 'stats', 'moves'].map((t) => (
                <button 
                  key={t}
                  onClick={() => setActiveTab(t as any)}
                  className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors
                    ${activeTab === t ? 'bg-white text-purple-600 border-b-2 border-purple-600' : 'text-slate-500 hover:text-slate-700'}
                  `}
                >
                  {t}
                </button>
             ))}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1">
             
             {activeTab === 'profile' && (
                <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nickname</label>
                         <input 
                           type="text" 
                           value={editedMember.nickname}
                           onChange={e => setEditedMember({...editedMember, nickname: e.target.value})}
                           className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                         />
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Level</label>
                         <input 
                           type="number" min="1" max="100"
                           value={editedMember.level}
                           onChange={e => setEditedMember({...editedMember, level: Number(e.target.value)})}
                           className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                         />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nature</label>
                         <select 
                            value={editedMember.nature}
                            onChange={e => setEditedMember({...editedMember, nature: e.target.value})}
                            className="w-full p-2 border border-slate-200 rounded-lg capitalize focus:ring-2 focus:ring-purple-500 outline-none"
                         >
                            {Object.keys(NATURES).map(n => (
                               <option key={n} value={n}>{n}</option>
                            ))}
                         </select>
                         {NATURES[editedMember.nature.toLowerCase()]?.up && (
                            <p className="text-[10px] text-slate-400 mt-1">
                               +{NATURES[editedMember.nature.toLowerCase()].up} / -{NATURES[editedMember.nature.toLowerCase()].down}
                            </p>
                         )}
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ability</label>
                         <select 
                            value={editedMember.ability}
                            onChange={e => setEditedMember({...editedMember, ability: e.target.value})}
                            className="w-full p-2 border border-slate-200 rounded-lg capitalize focus:ring-2 focus:ring-purple-500 outline-none"
                         >
                            <option value="">Select Ability...</option>
                            {availableAbilities.map(a => (
                               <option key={a} value={a}>{a.replace('-', ' ')}</option>
                            ))}
                         </select>
                      </div>
                   </div>

                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Item</label>
                      <input 
                        type="text" 
                        value={editedMember.item}
                        onChange={e => setEditedMember({...editedMember, item: e.target.value})}
                        className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        placeholder="e.g. Leftovers"
                      />
                   </div>
                </div>
             )}

             {activeTab === 'stats' && (
                <div className="space-y-2">
                   <div className="flex justify-between items-center text-xs text-slate-400 mb-2 px-2">
                      <span>Stat</span>
                      <div className="flex gap-12 mr-8">
                        <span>IVs</span>
                        <span>EVs</span>
                      </div>
                      <span>Total</span>
                   </div>
                   {(Object.keys(STAT_LABELS) as Array<keyof PokemonStats>).map(stat => (
                      <StatRow 
                        key={stat} 
                        stat={stat} 
                        iv={editedMember.ivs[stat]}
                        ev={editedMember.evs[stat]}
                        total={calculatedStats[stat]}
                        onIvChange={(val) => handleStatChange('ivs', stat, val)}
                        onEvChange={(val) => handleStatChange('evs', stat, val)}
                      />
                   ))}
                   <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                      <span className="font-bold text-slate-600">EV Remaining</span>
                      <span className={`font-bold ${totalEvs > 510 ? 'text-red-500' : 'text-green-500'}`}>
                         {510 - totalEvs}
                      </span>
                   </div>
                </div>
             )}

             {activeTab === 'moves' && (
                <div className="space-y-4">
                   {loadingExtra && <p className="text-center text-slate-400 text-sm py-4">Loading moves...</p>}
                   {[0, 1, 2, 3].map(i => (
                      <div key={i}>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Move {i + 1}</label>
                         <select
                           value={editedMember.moves[i]}
                           onChange={e => {
                              const newMoves = [...editedMember.moves] as [string, string, string, string];
                              newMoves[i] = e.target.value;
                              setEditedMember({...editedMember, moves: newMoves});
                           }}
                           className="w-full p-2 border border-slate-200 rounded-lg capitalize focus:ring-2 focus:ring-purple-500 outline-none"
                         >
                            <option value="">(None)</option>
                            {availableMoves.map(m => (
                               <option key={m.name} value={m.name}>
                                 {m.name.replace('-', ' ')}
                               </option>
                            ))}
                         </select>
                      </div>
                   ))}
                </div>
             )}

          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
             <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium">Cancel</button>
             <button 
               onClick={() => onSave(editedMember)}
               className="px-6 py-2 bg-purple-600 text-white rounded-lg font-bold shadow-lg shadow-purple-500/30 hover:bg-purple-700 flex items-center gap-2"
             >
                <Save size={18} /> Save Changes
             </button>
          </div>

       </div>
    </div>
  );
};

export default TeamMemberEditor;