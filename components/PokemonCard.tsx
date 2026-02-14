import React from 'react';
import { PokemonBase } from '../types';
import { TYPE_COLORS } from '../constants';
import { Heart, Plus } from 'lucide-react';
import { useAppStore } from '../store';
import { useNavigate } from 'react-router-dom';

interface PokemonCardProps {
  pokemon: PokemonBase;
  onAdd?: (pokemon: PokemonBase) => void;
  showAdd?: boolean;
}

const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon, onAdd, showAdd = false }) => {
  const { favorites, toggleFavorite } = useAppStore();
  const navigate = useNavigate();
  const isFavorite = favorites.includes(pokemon.id);
  
  const mainType = pokemon.types[0];
  const color = TYPE_COLORS[mainType] || '#A8A878';

  const handleCardClick = () => {
    if (!showAdd) {
       navigate(`/pokemon/${pokemon.id}`);
    } else if (onAdd) {
       onAdd(pokemon);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="relative rounded-2xl p-4 shadow-md bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group overflow-hidden border border-slate-100"
    >
       {/* Background Decoration */}
      <div 
        className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full opacity-10"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-center gap-4">
        {/* Left: Sprite */}
        <div className="relative w-20 h-20 flex-shrink-0">
          <div className="absolute inset-0 bg-slate-100 rounded-full scale-90 group-hover:scale-100 transition-transform duration-300" style={{ backgroundColor: `${color}20` }}></div>
          <img 
            src={pokemon.spriteImage} 
            alt={pokemon.name} 
            className="w-full h-full object-contain relative z-10 drop-shadow-sm"
            loading="lazy"
          />
        </div>

        {/* Middle: Name & ID */}
        <div className="flex-1 min-w-0">
          <span className="text-xs font-bold text-slate-400 font-mono">
            #{typeof pokemon.id === 'number' ? pokemon.id.toString().padStart(3, '0') : 'CUST'}
          </span>
          <h3 className="text-lg font-bold text-slate-800 capitalize truncate leading-tight">
            {pokemon.name}
          </h3>
          <div className="mt-1 flex gap-2">
             {/* Action Buttons for Team Builder context */}
             {showAdd && onAdd && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onAdd(pokemon); }}
                  className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100"
                >
                  <Plus size={14} /> Add
                </button>
             )}
          </div>
        </div>

        {/* Right: Types */}
        <div className="flex flex-col gap-1 items-end">
           {pokemon.types.map(t => (
             <span 
               key={t}
               className="px-2 py-0.5 text-[10px] uppercase font-bold text-white rounded-md tracking-wider shadow-sm"
               style={{ backgroundColor: TYPE_COLORS[t] || '#777' }}
             >
               {t}
             </span>
           ))}
           
           <button 
              onClick={(e) => { e.stopPropagation(); toggleFavorite(pokemon.id); }}
              className="mt-1 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            >
              <Heart 
                size={18} 
                className={isFavorite ? 'fill-red-500 text-red-500' : ''} 
              />
           </button>
        </div>
      </div>
    </div>
  );
};

export default PokemonCard;
