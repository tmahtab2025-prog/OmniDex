import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Team, TeamMember } from '../types';
import { Plus, Trash2, Edit3, X, Save, Users, Box as BoxIcon, ArrowLeft } from 'lucide-react';
import PokemonCard from '../components/PokemonCard';
import TeamMemberEditor from '../components/TeamMemberEditor';
import { TYPE_COLORS, INITIAL_TEAM_MEMBER_TEMPLATE } from '../constants';

type ViewMode = 'team_list' | 'team_edit' | 'box_view';

interface MemberSlotProps {
  member: TeamMember | null;
  index: number;
  type: 'team' | 'box';
  onClick: () => void;
  onClear: (e: React.MouseEvent) => void;
}

const MemberSlot: React.FC<MemberSlotProps> = ({ member, index, type, onClick, onClear }) => {
   const isEmpty = !member || !member.pokemonData;
   
   return (
     <div 
       className={`
         relative rounded-xl transition-all duration-200 border-2 
         ${isEmpty 
            ? 'border-dashed border-slate-300 bg-slate-50 hover:border-slate-400 cursor-pointer flex items-center justify-center text-slate-400 hover:text-slate-600' 
            : 'border-white bg-white shadow-sm hover:shadow-md cursor-pointer group'}
         ${type === 'box' ? 'aspect-square' : 'aspect-[3/4] md:aspect-auto md:h-64'}
       `}
       onClick={onClick}
     >
        {isEmpty ? (
           <div className="flex flex-col items-center gap-1">
              <Plus size={type === 'box' ? 20 : 32} />
              {type === 'team' && <span className="font-medium">Add</span>}
           </div>
        ) : (
           <div className="p-2 w-full h-full flex flex-col items-center relative">
              <button 
                onClick={onClear}
                className="absolute top-1 right-1 p-1 bg-red-100 text-red-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                 <Trash2 size={14} />
              </button>

              <div className="flex-1 flex items-center justify-center">
                 <img 
                   src={member!.pokemonData!.spriteImage} 
                   className="w-full h-full object-contain drop-shadow-sm"
                   alt={member!.nickname}
                 />
              </div>
              
              {type === 'team' && (
                <div className="w-full mt-2 text-center">
                   <p className="font-bold text-slate-800 text-sm truncate">{member!.nickname}</p>
                   <p className="text-xs text-slate-500">Lvl {member!.level}</p>
                   <div className="flex justify-center gap-1 mt-1">
                      {member!.pokemonData!.types.map(t => (
                         <span key={t} className="w-3 h-3 rounded-full" style={{ backgroundColor: TYPE_COLORS[t] }} />
                      ))}
                   </div>
                </div>
              )}
           </div>
        )}
     </div>
   );
};

const TeamBuilder = () => {
  const { teams, addTeam, updateTeam, deleteTeam, pokedexCache, customPokemon, box, updateBoxSlot } = useAppStore();
  
  const [view, setView] = useState<ViewMode>('team_list');
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  
  // Selection Logic
  const [showSelector, setShowSelector] = useState<{ type: 'team' | 'box', index: number } | null>(null);
  
  // Editor Logic
  const [editingMember, setEditingMember] = useState<{ member: TeamMember, type: 'team' | 'box', index: number } | null>(null);

  // Combine mons for selector
  const allPokemon = [...Object.values(pokedexCache), ...customPokemon];

  const handleCreateTeam = () => {
    const newTeam: Team = {
      id: crypto.randomUUID(),
      name: 'New Team',
      members: Array(6).fill(null).map((_, i) => ({
        ...INITIAL_TEAM_MEMBER_TEMPLATE,
        slotId: i,
        pokemonData: null,
      }))
    };
    setEditingTeam(newTeam);
    setView('team_edit');
  };

  const handleSaveTeam = () => {
    if (editingTeam && editingTeam.name) {
      if (teams.find(t => t.id === editingTeam.id)) {
        updateTeam(editingTeam);
      } else {
        addTeam(editingTeam);
      }
      setView('team_list');
      setEditingTeam(null);
    }
  };

  const handleSelectPokemon = (pokemon: any) => {
    if (!showSelector) return;

    const newMember: TeamMember = {
      ...INITIAL_TEAM_MEMBER_TEMPLATE,
      slotId: showSelector.index,
      pokemonData: pokemon,
      nickname: pokemon.name,
      level: 50,
      moves: ['', '', '', ''],
    };

    if (showSelector.type === 'team' && editingTeam) {
       const newMembers = [...editingTeam.members];
       newMembers[showSelector.index] = newMember;
       setEditingTeam({ ...editingTeam, members: newMembers });
    } else if (showSelector.type === 'box') {
       updateBoxSlot(showSelector.index, newMember);
    }

    setShowSelector(null);
  };

  const handleMemberSave = (updatedMember: TeamMember) => {
    if (!editingMember) return;
    
    if (editingMember.type === 'team' && editingTeam) {
       const newMembers = [...editingTeam.members];
       newMembers[editingMember.index] = updatedMember;
       setEditingTeam({ ...editingTeam, members: newMembers });
    } else if (editingMember.type === 'box') {
       updateBoxSlot(editingMember.index, updatedMember);
    }
    setEditingMember(null);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Selector Modal */}
      {showSelector && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
             <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl animate-in zoom-in duration-200">
                <header className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                  <h2 className="text-xl font-bold text-slate-800">Select Pokémon</h2>
                  <button onClick={() => setShowSelector(null)} className="p-2 hover:bg-slate-200 rounded-lg">
                    <X size={20} />
                  </button>
                </header>
                <div className="p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                   {allPokemon.length === 0 && (
                      <div className="col-span-full text-center py-10 text-slate-400">
                         No Pokémon cached. Visit the Pokédex to load some!
                      </div>
                   )}
                   {allPokemon.slice(0, 150).map(p => (
                     <div key={`${p.id}-${p.name}`} onClick={() => handleSelectPokemon(p)}>
                       <PokemonCard pokemon={p} />
                     </div>
                   ))}
                </div>
             </div>
          </div>
      )}

      {/* Member Editor Modal */}
      {editingMember && (
         <TeamMemberEditor 
            member={editingMember.member}
            onSave={handleMemberSave}
            onClose={() => setEditingMember(null)}
         />
      )}

      {/* Main Navigation Header */}
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
               {view === 'team_edit' ? (
                 <>
                    <button onClick={() => setView('team_list')} className="p-1 hover:bg-slate-200 rounded-lg">
                       <ArrowLeft size={28} />
                    </button>
                    <span>Edit Team</span>
                 </>
               ) : (
                 'Team Manager'
               )}
            </h1>
            <p className="text-slate-500 mt-1">Organize your collection and build competitive teams.</p>
         </div>

         {view !== 'team_edit' && (
           <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-200">
              <button 
                 onClick={() => setView('team_list')}
                 className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${view === 'team_list' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:text-slate-900'}`}
              >
                 <Users size={16} /> Teams
              </button>
              <button 
                 onClick={() => setView('box_view')}
                 className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${view === 'box_view' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:text-slate-900'}`}
              >
                 <BoxIcon size={16} /> PC Box
              </button>
           </div>
         )}
      </header>

      {/* Views */}
      <div className="flex-1 overflow-y-auto">
         
         {/* Team List View */}
         {view === 'team_list' && (
            <div className="space-y-6">
               <button 
                  onClick={handleCreateTeam}
                  className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 font-bold flex items-center justify-center gap-2 hover:border-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
               >
                  <Plus size={24} /> Create New Team
               </button>

               <div className="grid grid-cols-1 gap-4">
                  {teams.map(team => (
                     <div 
                        key={team.id} 
                        onClick={() => { setEditingTeam(team); setView('team_edit'); }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group"
                     >
                        <div className="flex justify-between items-start mb-4">
                           <h3 className="text-xl font-bold text-slate-800">{team.name}</h3>
                           <button 
                              onClick={(e) => { e.stopPropagation(); deleteTeam(team.id); }}
                              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                           >
                              <Trash2 size={18} />
                           </button>
                        </div>
                        <div className="flex gap-2">
                           {team.members.map((m, i) => (
                              <div key={i} className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                                 {m.pokemonData ? (
                                    <img src={m.pokemonData.spriteImage} className="w-10 h-10 object-contain" />
                                 ) : (
                                    <div className="w-2 h-2 rounded-full bg-slate-200" />
                                 )}
                              </div>
                           ))}
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {/* Team Edit View */}
         {view === 'team_edit' && editingTeam && (
            <div className="h-full flex flex-col">
               <div className="flex justify-between items-center mb-6">
                  <input 
                     type="text" 
                     value={editingTeam.name}
                     onChange={e => setEditingTeam({ ...editingTeam, name: e.target.value })}
                     className="text-2xl font-bold bg-transparent border-b border-transparent hover:border-slate-300 focus:border-purple-500 outline-none transition-colors"
                  />
                  <button 
                     onClick={handleSaveTeam}
                     className="px-6 py-2 bg-purple-600 text-white rounded-xl shadow-lg shadow-purple-500/30 font-bold hover:bg-purple-700 transition-all flex items-center gap-2"
                  >
                     <Save size={18} /> Save Team
                  </button>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {editingTeam.members.map((member, i) => (
                     <MemberSlot 
                        key={i} 
                        index={i} 
                        member={member.pokemonData ? member : null} 
                        type="team"
                        onClick={() => {
                          if (!member.pokemonData) {
                            setShowSelector({ type: 'team', index: i });
                          } else {
                            setEditingMember({ member, type: 'team', index: i });
                          }
                        }}
                        onClear={(e) => {
                          e.stopPropagation();
                          const newMems = [...editingTeam.members];
                          newMems[i] = { ...INITIAL_TEAM_MEMBER_TEMPLATE, slotId: i, pokemonData: null };
                          setEditingTeam({ ...editingTeam, members: newMems });
                        }}
                     />
                  ))}
               </div>
            </div>
         )}

         {/* Box View */}
         {view === 'box_view' && (
            <div className="bg-slate-200/50 p-6 rounded-3xl min-h-full">
               <h3 className="font-bold text-slate-500 mb-4 uppercase tracking-wider text-sm">Storage System 1</h3>
               <div className="grid grid-cols-5 sm:grid-cols-6 gap-3">
                  {box.map((member, i) => (
                     <MemberSlot 
                        key={i} 
                        index={i} 
                        member={member} 
                        type="box"
                        onClick={() => {
                          if (!member) {
                            setShowSelector({ type: 'box', index: i });
                          } else {
                            setEditingMember({ member, type: 'box', index: i });
                          }
                        }}
                        onClear={(e) => {
                          e.stopPropagation();
                          updateBoxSlot(i, null);
                        }}
                     />
                  ))}
               </div>
            </div>
         )}
      </div>
    </div>
  );
};

export default TeamBuilder;